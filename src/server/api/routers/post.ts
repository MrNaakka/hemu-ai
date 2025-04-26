import { z } from "zod";

import {
  authProcedure,
  createTRPCRouter,
  publicProcedure,
} from "@/server/api/trpc";
import { exercises, problems } from "@/server/db/schema";

export const postRouter = createTRPCRouter({
  addProblem: publicProcedure
    .input(z.object({ content: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(problems).values({
        problemContent: input.content,
      });
    }),

  getProblems: publicProcedure.query(async ({ ctx }) => {
    const content = await ctx.db.select().from(problems);
    return content;
  }),
  deleteAllProblems: authProcedure.mutation(async ({ ctx }) => {
    await ctx.db.delete(problems);
    console.log(
      ctx.auth.userId,
      "asdfasdfjöalsdkfjölasdkjfölkasjdflköasdjflköasdjflökasjfkasljf",
    );
    return;
  }),
});
