import { index, int, json, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const topics = mysqlTable("topics", {
  id: varchar("id", { length: 80 }).primaryKey(),
  number: int("number").notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  level: mysqlEnum("level", ["Inicio", "Intermedio", "Reto"]).notNull(),
  description: text("description").notNull(),
  content: json("content").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({ numberIdx: uniqueIndex("topics_number_idx").on(table.number) }));

export const exercises = mysqlTable("exercises", {
  id: varchar("id", { length: 100 }).primaryKey(),
  topicId: varchar("topicId", { length: 80 }).notNull(),
  difficulty: mysqlEnum("difficulty", ["Básico", "Intermedio", "Reto"]).notNull(),
  prompt: text("prompt").notNull(),
  type: mysqlEnum("type", ["choice", "text"]).notNull(),
  options: json("options").$type<string[] | null>(),
  answer: text("answer").notNull(),
  socraticHints: json("socratic_hints").$type<[string, string, string]>().notNull(),
  explanation: text("explanation").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({ topicIdx: index("exercises_topic_idx").on(table.topicId) }));

export const userProgress = mysqlTable("user_progress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  topicId: varchar("topicId", { length: 80 }).notNull(),
  mastery: int("mastery").default(0).notNull(),
  streak: int("streak").default(0).notNull(),
  difficulty: mysqlEnum("difficulty", ["Básico", "Intermedio", "Reto"]).default("Básico").notNull(),
  attempts: int("attempts").default(0).notNull(),
  correct: int("correct").default(0).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({ userTopicIdx: uniqueIndex("user_progress_user_topic_idx").on(table.userId, table.topicId), userIdx: index("user_progress_user_idx").on(table.userId) }));

export type Topic = typeof topics.$inferSelect;
export type InsertTopic = typeof topics.$inferInsert;
export type Exercise = typeof exercises.$inferSelect;
export type InsertExercise = typeof exercises.$inferInsert;
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = typeof userProgress.$inferInsert;
