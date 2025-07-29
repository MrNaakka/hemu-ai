// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { freeTokenLimit } from "@/lib/utils";
import { relations } from "drizzle-orm";
import { pgTableCreator } from "drizzle-orm/pg-core";

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
  userId: d
    .text()
    .notNull()
    .references(() => users.userId, { onDelete: "cascade" }),
}));

export const exercises = createTable("exercises", (d) => ({
  exerciseId: d.uuid().primaryKey().defaultRandom(),
  userId: d
    .text()
    .notNull()
    .references(() => users.userId, { onDelete: "cascade" }),
  date: d.timestamp().defaultNow().notNull(),
  exerciseName: d.text().notNull().default("exercise"),
  folderId: d
    .uuid()
    .references(() => folders.folderId, { onDelete: "cascade" }),
}));

export const problems = createTable("problems", (d) => ({
  problemId: d.serial().primaryKey(),
  problemContent: d
    .text()
    .default(
      `{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": []
    }
  ]
}`,
    )
    .notNull(),
  exerciseId: d
    .uuid()
    .notNull()
    .unique()
    .references(() => exercises.exerciseId, { onDelete: "cascade" }),
}));

export const users = createTable("users", (d) => ({
  userId: d.text().primaryKey().notNull(),
  createdAt: d.timestamp().defaultNow().notNull(),
  tier: d.text().notNull(), // "free" | "standard" | "custom"
  tokenLimit: d.integer().notNull().default(freeTokenLimit), // 10 000, 2 000 000, custom amount
  usedTokens: d.integer().notNull().default(0),
  status: d.text().notNull(), // "active" | "inactive" | "canceled"
  stripeCustomerId: d.text(),
}));

export const solves = createTable("solves", (d) => ({
  solveId: d.serial().primaryKey(),
  solveContent: d
    .text()
    .default(
      `{
  "type": "doc",
  "content": [
    {
      "type": "paragraph",
      "content": []
    }
  ]
}`,
    )
    .notNull(),
  exerciseId: d
    .uuid()
    .notNull()
    .unique()
    .references(() => exercises.exerciseId, { onDelete: "cascade" }),
}));

export const chats = createTable("chats", (d) => ({
  chatId: d.serial().primaryKey(),
  chatContent: d.text().notNull(),
  sender: d.text().$type<"ai" | "user">().notNull(),
  date: d.timestamp().defaultNow().notNull(),
  exerciseId: d
    .uuid()
    .notNull()
    .references(() => exercises.exerciseId, { onDelete: "cascade" }),
}));

export const uploadedFiles = createTable("uploaded_files", (d) => ({
  fileId: d.serial().primaryKey(),
  exerciseId: d
    .uuid()
    .notNull()
    .references(() => exercises.exerciseId, { onDelete: "cascade" }),
  key: d.uuid().notNull(),
  date: d.timestamp().defaultNow().notNull(),
}));

export const customMessages = createTable("custom_message", (d) => ({
  id: d.serial().primaryKey(),
  content: d.text().notNull(),
  userId: d
    .text()
    .notNull()
    .references(() => users.userId, { onDelete: "cascade" }),
  date: d.timestamp().defaultNow().notNull(),
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
  files: many(uploadedFiles),

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

export const fileRelations = relations(uploadedFiles, ({ one }) => ({
  exercise: one(exercises, {
    fields: [uploadedFiles.exerciseId],
    references: [exercises.exerciseId],
  }),
}));
