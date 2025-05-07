import { z } from "zod";
import { desc, isNull, eq, and } from "drizzle-orm";

import { authProcedure, createTRPCRouter } from "@/server/api/trpc";
import {
  chats,
  exercises,
  folders,
  problems,
  solves,
} from "@/server/db/schema";

export const databaseRouter = createTRPCRouter({
  latestExercises: authProcedure.query(async ({ ctx }) => {
    const userId = ctx.auth.userId;
    const exrcisesInFolders = await ctx.db.query.folders.findMany({
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
          orderBy: [desc(exercises.exerciseName)],
        },
      },
    });

    const restOfExercises = await ctx.db

      .select({
        exerciseId: exercises.exerciseId,
        exerciseName: exercises.exerciseName,
      })
      .from(exercises)
      .where(and(eq(exercises.userId, userId), isNull(exercises.folderId)))
      .orderBy(exercises.exerciseName);
    return { folders: exrcisesInFolders, exercises: restOfExercises }!;
  }),

  addNewFolder: authProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;
      await ctx.db
        .insert(folders)
        .values({ folderName: input.name, userId: userId });
    }),
  addNewExercise: authProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;

      const result = await ctx.db.transaction(async (x) => {
        const [e] = await x
          .insert(exercises)
          .values({
            exerciseName: input.name,
            userId: userId,
          })
          .returning({ eId: exercises.exerciseId });
        if (!e) throw new Error("failed to insert exercise");

        await x.insert(problems).values({ exerciseId: e.eId });

        await x.insert(solves).values({ exerciseId: e.eId });
        return e;
      });
      return result;
    }),
  addNewExerciseWithFolder: authProcedure
    .input(z.object({ name: z.string().min(1), folderId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.auth.userId;
      const result = await ctx.db.transaction(async (x) => {
        const [e] = await x
          .insert(exercises)
          .values({
            exerciseName: input.name,
            userId: userId,
            folderId: input.folderId,
          })
          .returning({ eId: exercises.exerciseId });
        if (!e) throw new Error("failed to insert exercise");

        await x.insert(problems).values({ exerciseId: e.eId });

        await x.insert(solves).values({ exerciseId: e.eId });
        return e;
      });
      return result;
    }),
  renameFolder: authProcedure
    .input(z.object({ name: z.string().min(1), folderId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(folders)
        .set({ folderName: input.name })
        .where(eq(folders.folderId, input.folderId));
    }),
  renameExercise: authProcedure
    .input(z.object({ name: z.string().min(1), exerciseId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(exercises)
        .set({ exerciseName: input.name })
        .where(eq(exercises.exerciseId, input.exerciseId));
    }),
  deleteFolder: authProcedure
    .input(z.object({ folderId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(folders).where(eq(folders.folderId, input.folderId));
    }),
  deleteExercise: authProcedure
    .input(z.object({ exerciseId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(exercises)
        .where(eq(exercises.exerciseId, input.exerciseId));
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
