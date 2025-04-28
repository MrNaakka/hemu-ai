// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql, relations } from "drizzle-orm";
import { index, pgTableCreator } from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `hemu-ai-parempi_${name}`);

export const folders = createTable("folders", (d) => ({
  folderId: d.uuid().primaryKey().defaultRandom(),
  folderName: d.text().notNull().default("folder"),
  userId: d.text().notNull(),
}));

export const exercises = createTable("exercises", (d) => ({
  exerciseId: d.uuid().primaryKey().defaultRandom(),
  userId: d.text().notNull(),
  date: d.timestamp().defaultNow().notNull(),
  exerciseName: d.text().notNull().default("exercise"),
  folderId: d
    .uuid()
    .references(() => folders.folderId, { onDelete: "cascade" }),
}));
export const problems = createTable("problems", (d) => ({
  problemId: d.serial().primaryKey(),
  problemContent: d.text().notNull(),
  exerciseId: d
    .uuid()
    .notNull()
    .unique()
    .references(() => exercises.exerciseId, { onDelete: "cascade" }),
}));

export const solves = createTable("solves", (d) => ({
  solveId: d.serial().primaryKey(),
  solveContent: d.text().notNull(),
  exerciseId: d
    .uuid()
    .notNull()
    .unique()
    .references(() => exercises.exerciseId, { onDelete: "cascade" }),
}));

export const chats = createTable("chats", (d) => ({
  chatId: d.serial().primaryKey(),
  chatContent: d.text(),
  sender: d.text().$type<"ai" | "user">(),
  exerciseId: d
    .uuid()
    .notNull()
    .references(() => exercises.exerciseId),
}));

export const foldersRelations = relations(folders, ({ many }) => ({
  exercises: many(exercises),
}));

export const exercisesRelations = relations(exercises, ({ one, many }) => ({
  folder: one(folders, {
    fields: [exercises.folderId],
    references: [folders.folderId],
  }),
  chats: many(chats),
  problem: one(problems, {
    fields: [exercises.exerciseId],
    references: [problems.exerciseId],
  }),
  solve: one(solves, {
    fields: [exercises.exerciseId],
    references: [solves.exerciseId],
  }),
}));

export const problemsRelations = relations(problems, ({ one }) => ({
  exercise: one(exercises, {
    fields: [problems.exerciseId],
    references: [exercises.exerciseId],
  }),
}));

export const solvesRelations = relations(solves, ({ one }) => ({
  exercise: one(exercises, {
    fields: [solves.exerciseId],
    references: [exercises.exerciseId],
  }),
}));

export const chatsRelations = relations(chats, ({ one }) => ({
  exercise: one(exercises, {
    fields: [chats.exerciseId],
    references: [exercises.exerciseId],
  }),
}));
