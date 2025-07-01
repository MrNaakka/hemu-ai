import { z, type ZodTypeAny } from "zod";
import { authProcedure, createTRPCRouter } from "@/server/api/trpc";
import { env } from "@/env";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";

import {
  justChatMessage,
  nextstepMessage,
  solverestMessage,
} from "@/lib/aiMessages";
import { chats } from "@/server/db/schema";
import TeXToSVG from "tex-to-svg";

async function getAiResponse<Schema extends ZodTypeAny>(
  systemPrompt: string,
  problem: string,
  solve: string,
  specifications: string,
  responseSchema: Schema,
) {
  const openAiResponse = new OpenAI({ apiKey: env.OPENAI_API_KEY });

  const completion = await openAiResponse.chat.completions.parse({
    model: "gpt-4.1",
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
    max_completion_tokens: 500,

    response_format: zodResponseFormat(responseSchema, "data"),
  });
  const data = completion.choices[0]!.message.parsed!;
  return data;
}

const aiMessageProcedure = <Schema extends ZodTypeAny>(
  systemPrompt: string,
  ResponseSchema: Schema,
) => {
  return authProcedure
    .input(
      z.object({
        problem: z.string().nonempty(),
        solve: z.string().nonempty(),
        specifications: z.string(),
        exerciseId: z.string().uuid(),
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

type CustomImage = {
  type: "custom-image";
  attrs: {
    src: string;
    id: string;
    latex: string;
  };
};
type Text = {
  type: "text";
  text: string;
};
type Paragraphs = {
  type: "paragraph";
  content: (CustomImage | Text)[];
}[];

export const aiRouter = createTRPCRouter({
  nextstep: aiMessageProcedure(
    nextstepMessage,
    z.object({
      latex: z.string(),
      explanation: z.string(),
    }),
  ).mutation(({ ctx }) => {
    const svg = TeXToSVG(ctx.aiData.latex).replace(
      /fill="currentColor"/g,
      'fill="white"',
    );

    const parsedData: Paragraphs = [
      {
        type: "paragraph",
        content: [
          {
            type: "custom-image",
            attrs: {
              src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
              latex: ctx.aiData.latex,
              id: crypto.randomUUID(),
            },
          },
        ],
      },
    ];
    return { explanation: ctx.aiData.explanation, parsedData: parsedData };
  }),

  solverest: aiMessageProcedure(
    solverestMessage,
    z.object({
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
    }),
  ).mutation(({ ctx }) => {
    const parsedData: Paragraphs = ctx.aiData.content.newline.map((x) => ({
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
              src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
                svg,
              )}`,
            },
          };
        }
        return {
          type: "text",
          text: y.data,
        };
      }),
    }));
    return { explanation: ctx.aiData.explanation, parsedData: parsedData };
  }),
  justChat: authProcedure
    .input(
      z.object({
        problem: z.string(),
        solve: z.string(),
        specifications: z.string(),
        exerciseId: z.string().uuid(),
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
});
