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
import { chats, customMessages } from "@/server/db/schema";
import {
  content,
  contentAndExplanationSchema,
  ContentAndExplenationToParagraphs,
  tipTapContent,
  type Content,
  type ContentAndExplanation,
  type TipTapContent,
} from "@/lib/utils";
import EventEmitter, { on } from "node:events";

const ee = new EventEmitter();

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
          {
            type: "text",
            text: `The attemped solution: ${solve}`,
          },
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

const aiMessageProcedure = <Schema extends ZodTypeAny>(
  systemPrompt: string,
  ResponseSchema: Schema,
) => {
  return exerciseProcedure
    .input(
      z.object({
        problem: z.string(),
        solve: z.string(),
        specifications: z.string(),
        databaseMessage: z.union([
          z.literal("Solve the nextstep for me!"),
          z.literal("Solve the rest for me!"),
          z.literal(""),
        ]),
      }),
    )
    .use(async ({ ctx, next, input }) => {
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
    const parsedData = ContentAndExplenationToParagraphs(ctx.aiData);
    return { explanation: ctx.aiData.explanation, parsedData: parsedData };
  }),

  solverest: aiMessageProcedure(
    solverestMessage,
    contentAndExplanationSchema,
  ).mutation(({ ctx }) => {
    const parsedData = ContentAndExplenationToParagraphs(ctx.aiData);
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

      const parsedData = ContentAndExplenationToParagraphs(data);
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

  testi: exerciseProcedure
    .input(
      z.object({
        problem: z.string().nonempty(),
        solve: z.string().nonempty(),
      }),
    )
    .subscription(async function* ({ input, signal }) {
      const openAiResponse = new OpenAI({ apiKey: env.OPENAI_API_KEY });
      let prevExplanation: string;
      const stream = openAiResponse.chat.completions
        .stream({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: nextstepMessage,
            },
            {
              role: "user",
              content: [
                { type: "text", text: `The problem: ${input.problem}` },
                { type: "text", text: `The attemped solution: ${input.solve}` },
              ],
            },
          ],
          stream: true,
          max_completion_tokens: 1000,
          response_format: zodResponseFormat(
            contentAndExplanationSchema,
            "data",
          ),
        })
        .on("content.delta", ({ parsed }) => {
          const p = parsed as ContentAndExplanation | undefined;

          if (p?.explanation) {
            const e = p.explanation;
            const result = z.string().safeParse(e);
            if (result.success) {
              if (prevExplanation !== result.data) {
                console.log(result.data);
                const emittedData: ContentAndExplanation = {
                  explanation: result.data,
                  content: { newline: [[{ type: "text", data: "" }]] },
                };
                ee.emit("next", emittedData);
                prevExplanation = result.data;
              }
            }
          }
          if (p?.content) {
            const c = p.content;
            const result = content.safeParse(c);

            if (result.success) {
              console.log("newline:", result.data.newline);
              const emittedData: ContentAndExplanation = {
                explanation: prevExplanation,
                content: result.data,
              };
              ee.emit("next", emittedData);
            }
          }
        });
      for await (const [data] of on(ee, "next", { signal: signal })) {
        const content = data as ContentAndExplanation;
        yield content;
      }
      console.log(await stream.done());

      console.log(
        "valmis\nvalmis\nvalmis\nvalmis\nvalmis\nvalmis\nvalmis\nvalmis\n",
      );
    }),
});
