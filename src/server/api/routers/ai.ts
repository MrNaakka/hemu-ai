import { string, z, type ZodTypeAny } from "zod";
import { authProcedure, createTRPCRouter } from "@/server/api/trpc";
import { env } from "@/env";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";

import { nextstepMessage, solverestMessage } from "@/lib/aiMessages";
import { chats } from "@/server/db/schema";
import TeXToSVG from "tex-to-svg";

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
        ]),
      }),
    )
    .use(async ({ ctx, next, input }) => {
      const openAiResponse = new OpenAI({ apiKey: env.OPENAI_API_KEY });

      const completion = await openAiResponse.beta.chat.completions.parse({
        model: "gpt-4.1",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: [
              { type: "text", text: `The problem: ${input.problem}` },
              { type: "text", text: `The attemped solution: ${input.solve}` },
              {
                type: "text",
                text: `Additional specifications: ${input.specifications}`,
              },
            ],
          },
        ],
        max_completion_tokens: 5000,

        response_format: zodResponseFormat(ResponseSchema, "data"),
      });
      const data = completion.choices[0]!.message.parsed!;

      await ctx.db.insert(chats).values([
        {
          sender: "user",
          chatContent: `${input.databaseMessage} ${input.specifications}`,
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
});
