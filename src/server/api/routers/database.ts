import { z } from "zod";
import { isNull, eq, and, type ExtractTablesWithRelations } from "drizzle-orm";

import { authProcedure, createTRPCRouter } from "@/server/api/trpc";
import {
  chats,
  exercises,
  folders,
  problems,
  solves,
} from "@/server/db/schema";
import { TRPCError } from "@trpc/server";
import type { PostgresJsQueryResultHKT } from "drizzle-orm/postgres-js";
import type { PgTransaction } from "drizzle-orm/pg-core";
import type { dbType } from "@/server/db";

type UserTransaction = {
  x: PgTransaction<
    PostgresJsQueryResultHKT,
    dbType,
    ExtractTablesWithRelations<dbType>
  >;
  userId: string;
};

async function getFolders({ x, userId }: UserTransaction) {
  const exercisesInFolders = await x.query.folders.findMany({
    where: eq(folders.userId, userId),
    columns: {
      folderId: true,
      folderName: true,
    },
    orderBy: [folders.folderName],
    with: {
      exercises: {
        columns: {
          exerciseId: true,
          exerciseName: true,
        },
        orderBy: [exercises.exerciseName],
      },
    },
  });
  return exercisesInFolders;
}

async function getExercises({ x, userId }: UserTransaction) {
  const restOfExercises = await x
    .select({
      exerciseId: exercises.exerciseId,
      exerciseName: exercises.exerciseName,
    })
    .from(exercises)
    .where(and(eq(exercises.userId, userId), isNull(exercises.folderId)))
    .orderBy(exercises.exerciseName);
  return restOfExercises;
}

export const databaseRouter = createTRPCRouter({
  latestExercises: authProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.userId;
    const { exercisesInFolders, restOfExercises } = await ctx.db.transaction(
      async (x) => {
        const exercisesInFolders = await getFolders({ x, userId });
        const restOfExercises = await getExercises({ x, userId });
        return { exercisesInFolders, restOfExercises };
      },
    );

    return { folders: exercisesInFolders, exercises: restOfExercises }!;
  }),

  addNewFolder: authProcedure
    .input(
      z.object({
        name: z.string().min(1),
        folderId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;
      await ctx.db.insert(folders).values({
        folderName: input.name,
        userId: userId,
        folderId: input.folderId,
      });
    }),
  addNewExercise: authProcedure
    .input(z.object({ name: z.string().min(1), exerciseId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;
      const { e } = await ctx.db.transaction(async (x) => {
        const [e] = await x
          .insert(exercises)
          .values({
            exerciseName: input.name,
            userId: userId,
            exerciseId: input.exerciseId,
          })
          .returning({
            eId: exercises.exerciseId,
          });
        if (!e)
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "failed to insert exercise",
          });

        await x.insert(problems).values({ exerciseId: e.eId });

        await x.insert(solves).values({ exerciseId: e.eId });

        return { e };
      });
      return e;
    }),
  addNewExerciseWithFolder: authProcedure
    .input(
      z.object({
        name: z.string().min(1),
        exerciseId: z.string().uuid(),
        folderId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;
      const { e } = await ctx.db.transaction(async (x) => {
        const [e] = await x
          .insert(exercises)
          .values({
            exerciseName: input.name,
            userId: userId,
            exerciseId: input.exerciseId,
            folderId: input.folderId,
          })
          .returning({ eId: exercises.exerciseId });
        if (!e) throw new Error("failed to insert exercise");

        await x.insert(problems).values({ exerciseId: e.eId });

        await x.insert(solves).values({ exerciseId: e.eId });

        const exercisesInFolders = await getFolders({ x, userId });
        return { exercisesInFolders, e };
      });
      return e;
    }),
  renameFolder: authProcedure
    .input(z.object({ name: z.string().min(1), folderId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;
      const allFolders = await ctx.db.transaction(async (x) => {
        await x
          .update(folders)
          .set({ folderName: input.name })
          .where(eq(folders.folderId, input.folderId));

        const allFolders = await getFolders({ x, userId });
        return allFolders;
      });
      return allFolders;
    }),
  renameExercise: authProcedure
    .input(z.object({ name: z.string().min(1), exerciseId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;
      const { allFolders, allExercises } = await ctx.db.transaction(
        async (x) => {
          await x
            .update(exercises)
            .set({ exerciseName: input.name })
            .where(eq(exercises.exerciseId, input.exerciseId));
          const allFolders = await getFolders({ x, userId });
          const allExercises = await getExercises({ x, userId });
          return { allFolders, allExercises };
        },
      );
      return { allFolders, allExercises };
    }),
  deleteFolder: authProcedure
    .input(z.object({ folderId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;
      const { allFolders } = await ctx.db.transaction(async (x) => {
        await x.delete(folders).where(eq(folders.folderId, input.folderId));
        const allFolders = await getFolders({ x, userId });
        return { allFolders };
      });
      return allFolders;
    }),
  deleteExercise: authProcedure
    .input(z.object({ exerciseId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;
      const { allFolders, allExercises } = await ctx.db.transaction(
        async (x) => {
          await x
            .delete(exercises)
            .where(eq(exercises.exerciseId, input.exerciseId));
          const allFolders = await getFolders({ x, userId });
          const allExercises = await getExercises({ x, userId });
          return { allFolders, allExercises };
        },
      );
      return { allFolders, allExercises };
    }),

  getEditorsContent: authProcedure
    .input(z.object({ exerciseId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db.query.exercises.findFirst({
        where: eq(exercises.exerciseId, input.exerciseId),
        columns: {},
        with: {
          problem: {
            columns: {
              problemContent: true,
            },
          },
          solve: {
            columns: {
              solveContent: true,
            },
          },
        },
      });
      return result;
    }),
  getMessages: authProcedure
    .input(z.object({ exerciseId: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db.query.chats.findMany({
        where: eq(chats.exerciseId, input.exerciseId),
        columns: {
          chatContent: true,
          sender: true,
          chatId: true,
        },
      });
      return result;
    }),
  updateExerciseContent: authProcedure
    .input(
      z.object({
        exercisesId: z.string().uuid(),
        editor: z.enum(["solve", "problem"]),
        newContent: z.string().nonempty(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.editor === "problem") {
        await ctx.db
          .update(problems)
          .set({ problemContent: input.newContent })
          .where(eq(problems.exerciseId, input.exercisesId));
        return;
      }
      await ctx.db
        .update(solves)
        .set({ solveContent: input.newContent })
        .where(eq(solves.exerciseId, input.exercisesId));
      return;
    }),
  exerciseChangeFolder: authProcedure
    .input(z.object({ exerciseId: z.string().uuid(), folderId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (input.folderId === "root") {
        await ctx.db
          .update(exercises)
          .set({ folderId: null })
          .where(eq(exercises.exerciseId, input.exerciseId));
        return;
      }

      await ctx.db
        .update(exercises)
        .set({ folderId: input.folderId })
        .where(eq(exercises.exerciseId, input.exerciseId));
      return;
    }),
});
