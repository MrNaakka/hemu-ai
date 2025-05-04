import { string, z } from "zod";
import { authProcedure, createTRPCRouter } from "@/server/api/trpc";
import { env } from "@/env";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";

import { nextstepMessage } from "@/lib/aiMessages";
import { chats } from "@/server/db/schema";
export const aiRouter = createTRPCRouter({
  nextstep: authProcedure
    .input(
      z.object({
        problem: z.string(),
        solve: z.string(),
        message: z.string(),
        exerciseId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const openAiResponse = new OpenAI({ apiKey: env.OPENAI_API_KEY });
      const ResponseSchema = z.object({
        latex: z.string(),
        explanation: z.string(),
      });
      const completion = await openAiResponse.beta.chat.completions.parse({
        model: "gpt-4.1",
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
              {
                type: "text",
                text: `Additional specifications: ${input.message}`,
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
          chatContent: `Solve the nextstep for me!${input.message}`,
          exerciseId: input.exerciseId,
        },
        {
          sender: "ai",
          chatContent: data.explanation,
          exerciseId: input.exerciseId,
        },
      ]);
      return data;
    }),
});
