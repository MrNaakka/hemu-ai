import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const utilRouter = createTRPCRouter({
  checkIfLoggedIn: publicProcedure.query((props) => {
    const userId = props.ctx.auth.userId;
    return userId ? true : false;
  }),
});
