import { z, type ZodTypeAny } from "zod";
import { createTRPCRouter, exerciseProcedure } from "@/server/api/trpc";
import { env } from "@/env";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";

import {
  customMessagePrefix,
  justChatMessage,
  nextstepMessage,
  solverestMessage,
} from "@/lib/aiMessages";
import { chats, customMessages, uploadedFiles } from "@/server/db/schema";
import {
  contentAndExplanationSchema,
  explanation,
  type MathModeVariants,
} from "@/lib/utils";
import EventEmitter, { on } from "node:events";
import { TRPCError } from "@trpc/server";
import {
  makeContentAndExplanationParser,
  makeJustChatParser,
} from "@/lib/aiResponse/parsers";
import {
  makeContentAndExplanationDB,
  makeJustChatDatabase,
} from "@/lib/aiResponse/database";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2 } from "@/lib/r2";
import { eq } from "drizzle-orm";

async function getAiResponse<Schema extends ZodTypeAny>(
  systemPrompt: string,
  problem: string,
  solve: string,
  responseSchema: Schema,
  emit: (data: unknown) => void,
  iterator: NodeJS.AsyncIterator<any[], any, any>,
  urls: string[],
  specifications?: string,
) {
  const openAiResponse = new OpenAI({ apiKey: env.OPENAI_API_KEY });

  let usage: number = 0;
  const urlContent = urls.map((url) => {
    return {
      type: "image_url" as const,
      image_url: {
        url: url,
      },
    };
  });
  const stream = openAiResponse.chat.completions
    .stream({
      model: "gpt-4.1-mini",
      stream_options: {
        include_usage: true,
      },
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: [
            { type: "text", text: `The problem: ${problem}` },
            ...urlContent,

            {
              type: "text",
              text: `The attemped solution: ${solve}`,
            },
            {
              type: "text",
              text: `Additional specifications: ${specifications ?? ""}`,
            },
          ],
        },
      ],
      max_completion_tokens: 1000,
      response_format: zodResponseFormat(responseSchema, "data"),
    })
    .on("content.delta", ({ parsed }) => {
      emit(parsed);
    })
    .on("content.done", () => {
      if (iterator.return) {
        iterator.return();
      } else {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "no return function on iterator",
        });
      }
    })
    .on("totalUsage", (u) => {
      console.log("tokens:");
      console.log(u.prompt_tokens, u.completion_tokens, u.total_tokens);
      usage = u.total_tokens.valueOf();
    });
  await stream.done();
  return usage;
}

const aiMessageSubscription = <Schema extends ZodTypeAny, T>(
  systemPrompt: string,
  ResponseSchema: Schema,
  parserFactory: () => (data: unknown) => T | undefined,
  database: (
    totalUsage: number,
    data: T,
    userId: string,
    exerciseId: string,
    specifications?: string,
  ) => Promise<void>,
  messagePrefix?: MathModeVariants,
) => {
  return exerciseProcedure
    .input(
      z.object({
        problem: z.string(),
        solve: z.string(),
        specifications: z.string().optional(),
      }),
    )
    .subscription(async function* ({ input, signal, ctx }) {
      const ee = new EventEmitter();
      const rawIterator = on(ee, "raw", { signal: signal });
      const parser = parserFactory();
      const keys = await ctx.db
        .select({ key: uploadedFiles.key })
        .from(uploadedFiles)
        .where(eq(uploadedFiles.exerciseId, input.exerciseId))
        .orderBy(uploadedFiles.date);
      const urls = await Promise.all(
        keys.map(async ({ key }) => {
          const object = new GetObjectCommand({
            Key: key,
            Bucket: env.R2_BUCKET,
          });
          const url = await getSignedUrl(r2, object, { expiresIn: 7200 }); // 2 h
          return url;
        }),
      );

      const result = getAiResponse(
        systemPrompt,
        input.problem,
        input.solve,
        ResponseSchema,
        (data) => {
          ee.emit("raw", data);
        },
        rawIterator,
        urls,
        input.specifications,
      );
      let latestData: T | undefined;
      for await (const [data] of rawIterator) {
        const result = parser(data);
        if (!result) continue;
        latestData = result;
        yield result;
      }

      const totalUsage = await result;
      if (!latestData) {
        return;
      }
      const userId = ctx.auth.userId;
      const exerciseId = input.exerciseId;

      await database(
        totalUsage,
        latestData,
        userId,
        exerciseId,
        input.specifications,
      );
    });
};

export const aiRouter = createTRPCRouter({
  nextstep: aiMessageSubscription(
    nextstepMessage,
    contentAndExplanationSchema,
    () => makeContentAndExplanationParser(),
    makeContentAndExplanationDB("Solve the nextstep for me!"),
    "Solve the nextstep for me!",
  ),
  solverest: aiMessageSubscription(
    solverestMessage,
    contentAndExplanationSchema,
    () => makeContentAndExplanationParser(),
    makeContentAndExplanationDB("Solve the rest for me!"),
    "Solve the rest for me!",
  ),

  customMessage: aiMessageSubscription(
    customMessagePrefix,
    contentAndExplanationSchema,
    () => makeContentAndExplanationParser(),
    makeContentAndExplanationDB("Custom message:"),
    "Custom message:",
  ),

  justChat: aiMessageSubscription(
    justChatMessage,
    explanation,
    () => makeJustChatParser(),
    makeJustChatDatabase(),
  ),
});
