import { z, type ZodTypeAny } from "zod";
import {
  authProcedure,
  createTRPCRouter,
  exerciseProcedure,
} from "@/server/api/trpc";
import { env } from "@/env";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";

import {
  customMessagePrefix,
  justChatMessage,
  nextstepMessage,
  solverestMessage,
} from "@/lib/aiMessages";
import { chats, customMessages } from "@/server/db/schema";
import TeXToSVG from "tex-to-svg";
import type { Paragraphs } from "@/lib/utils";

async function getAiResponse<Schema extends ZodTypeAny>(
  systemPrompt: string,
  problem: string,
  solve: string,
  specifications: string,
  responseSchema: Schema,
) {
  const openAiResponse = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  const completion = await openAiResponse.chat.completions.parse({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: systemPrompt,
      },
      {
        role: "user",
        content: [
          { type: "text", text: `The problem: ${problem}` },
          { type: "text", text: `The attemped solution: ${solve}` },
          {
            type: "text",
            text: `Additional specifications: ${specifications}`,
          },
        ],
      },
    ],
    max_completion_tokens: 1000,
    response_format: zodResponseFormat(responseSchema, "data"),
  });
  const data = completion.choices[0]!.message.parsed!;
  console.log(completion.usage);

  return data;
}

const contentAndExplanationSchema = z.object({
  content: z.object({
    newline: z.array(
      z.array(
        z.discriminatedUnion("type", [
          z.object({ type: z.literal("text"), data: z.string() }),
          z.object({ type: z.literal("latex"), data: z.string() }),
        ]),
      ),
    ),
  }),
  explanation: z.string(),
});
type ContentAndExplanation = z.infer<typeof contentAndExplanationSchema>;

function parseContentAndExplenation(data: ContentAndExplanation): Paragraphs {
  const parsedData: Paragraphs = data.content.newline.map((x) => ({
    type: "paragraph",
    content: x.map((y) => {
      if (y.type === "latex") {
        const svg = TeXToSVG(y.data).replace(
          /fill="currentColor"/g,
          'fill="white"',
        );
        return {
          type: "custom-image",
          attrs: {
            id: crypto.randomUUID(),
            latex: y.data,
            src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
          },
        };
      }
      return {
        type: "text",
        text: y.data,
      };
    }),
  }));
  return parsedData;
}

const aiMessageProcedure = <Schema extends ZodTypeAny>(
  systemPrompt: string,
  ResponseSchema: Schema,
) => {
  return exerciseProcedure
    .input(
      z.object({
        problem: z.string().nonempty(),
        solve: z.string().nonempty(),
        specifications: z.string(),
        databaseMessage: z.union([
          z.literal("Solve the nextstep for me!"),
          z.literal("Solve the rest for me!"),
          z.literal(""),
        ]),
      }),
    )
    .use(async ({ ctx, next, input }) => {
      console.log(input.problem);
      const data = await getAiResponse(
        systemPrompt,
        input.problem,
        input.solve,
        input.specifications,
        ResponseSchema,
      );
      await ctx.db.insert(chats).values([
        {
          sender: "user",
          chatContent: `${input.databaseMessage === "" ? "" : input.databaseMessage + " " + input.specifications}`,
          exerciseId: input.exerciseId,
        },
        {
          sender: "ai",
          chatContent: data.explanation,
          exerciseId: input.exerciseId,
        },
      ]);

      return next({
        ctx: { aiData: data },
      });
    });
};

export const aiRouter = createTRPCRouter({
  nextstep: aiMessageProcedure(
    nextstepMessage,
    contentAndExplanationSchema,
  ).mutation(({ ctx }) => {
    const parsedData = parseContentAndExplenation(ctx.aiData);
    return { explanation: ctx.aiData.explanation, parsedData: parsedData };
  }),

  solverest: aiMessageProcedure(
    solverestMessage,
    contentAndExplanationSchema,
  ).mutation(({ ctx }) => {
    const parsedData = parseContentAndExplenation(ctx.aiData);
    return { explanation: ctx.aiData.explanation, parsedData: parsedData };
  }),

  customMessage: exerciseProcedure
    .input(
      z.object({
        problem: z.string(),
        solve: z.string(),
        customMessage: z.string().nonempty(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const data = await getAiResponse(
        customMessagePrefix + input.customMessage,
        input.problem,
        input.solve,
        "",
        contentAndExplanationSchema,
      );
      const userId = ctx.auth.userId;

      await ctx.db.transaction(async (x) => {
        await x.insert(chats).values([
          {
            sender: "user",
            chatContent: `Custom message: ${input.customMessage}`,
            exerciseId: input.exerciseId,
          },
          {
            sender: "ai",
            chatContent: data.explanation,
            exerciseId: input.exerciseId,
          },
        ]);
        await x
          .insert(customMessages)
          .values({ content: input.customMessage, userId: userId });
      });

      const parsedData = parseContentAndExplenation(data);
      return { explanation: data.explanation, parsedData: parsedData };
    }),

  justChat: exerciseProcedure
    .input(
      z.object({
        problem: z.string(),
        solve: z.string(),
        specifications: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const data = await getAiResponse(
        justChatMessage,
        input.problem,
        input.solve,
        input.specifications,
        z.object({ explanation: z.array(z.string()) }),
      );
      const insertData = data.explanation.map((x) => ({
        sender: "ai" as const,
        chatContent: x,
        exerciseId: input.exerciseId,
      }));
      console.log("nyt tulee jeee!");
      console.log(input.specifications);
      console.log("loppu");
      const insertedData = await ctx.db
        .insert(chats)
        .values([
          {
            sender: "user",
            exerciseId: input.exerciseId,
            chatContent: input.specifications,
          },
          ...insertData,
        ])
        .returning({
          chatContent: chats.chatContent,
          chatId: chats.chatId,
          sender: chats.sender,
        });
      return insertedData;
    }),
});
