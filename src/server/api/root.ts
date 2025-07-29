import { aiRouter } from "./routers/ai";
import { databaseRouter } from "./routers/database";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { utilRouter } from "./routers/util";
import { stripeRouter } from "./routers/stripe";
import { r2Router } from "./routers/r2";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  stripe: stripeRouter,
  database: databaseRouter,
  ai: aiRouter,
  util: utilRouter,
  r2: r2Router,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
