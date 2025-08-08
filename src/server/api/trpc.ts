/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { z, ZodError } from "zod";

import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { exercises, folders } from "../db/schema";
import { eq } from "drizzle-orm";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  return {
    db,
    ...opts,
    auth: await auth(),
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

export const authProcedure = publicProcedure.use(({ ctx, next }) => {
  const userId = ctx.auth.userId;
  if (!userId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You are unauthrozied",
    });
  }

  return next({
    ctx: {
      auth: ctx.auth,
    },
  });
});

export const exerciseProcedure = authProcedure
  .input(z.object({ exerciseId: z.string().uuid() }))
  .use(async ({ ctx, next, input }) => {
    const userId = ctx.auth.userId;

    const result = await ctx.db
      .select({ userId: exercises.userId })
      .from(exercises)
      .where(eq(exercises.exerciseId, input.exerciseId));

    if (result.length !== 1) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message:
          "Problem with exerciseId and database. Please investigate further.",
      });
    }
    if (result[0]!.userId !== userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are unauthrozied. This is not your exercise.",
      });
    }
    return next();
  });

export const folderProcedure = authProcedure
  .input(
    z.object({ folderId: z.union([z.string().uuid(), z.literal("root")]) }),
  )
  .use(async ({ ctx, next, input }) => {
    const userId = ctx.auth.userId;
    const result = await ctx.db
      .select({ userId: folders.userId })
      .from(folders)
      .where(eq(folders.folderId, input.folderId));
    if (result.length !== 1) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message:
          "Problem with folderId and database. Please investigate further.",
      });
    }
    if (result[0]!.userId !== userId) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are unauthrozied. This is not your folder.",
      });
    }
    return next();
  });

export const exerciseAndFolderProcedure = authProcedure
  .input(
    z.object({
      exerciseId: z.string().uuid(),
      folderId: z.union([z.string().uuid(), z.literal("root")]),
    }),
  )
  .use(async ({ ctx, next, input }) => {
    const userId = ctx.auth.userId;
    const result = await ctx.db.transaction(async (x) => {
      let folderUserId: {
        userId: string;
      }[];
      if (input.folderId === "root") {
        folderUserId = [{ userId: userId }];
      } else {
        folderUserId = await x
          .select({ userId: folders.userId })
          .from(folders)
          .where(eq(folders.folderId, input.folderId));
      }
      const exerciseUserId = await x
        .select({ userId: exercises.userId })
        .from(exercises)
        .where(eq(exercises.exerciseId, input.exerciseId));
      return { folderUserId, exerciseUserId };
    });

    if (
      result.folderUserId.length !== 1 ||
      result.exerciseUserId.length !== 1
    ) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message:
          "Problem with folderId or exerciseId and database. Please investigate further.",
      });
    }
    if (
      result.exerciseUserId[0]!.userId !== userId ||
      result.folderUserId[0]!.userId !== userId
    ) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You are unauthrozied. This is not your folder or exercise.",
      });
    }
    return next();
  });
