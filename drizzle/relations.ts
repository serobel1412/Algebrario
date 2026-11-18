import { relations } from "drizzle-orm";
import { exercises, topics, userProgress, users } from "./schema";

export const topicRelations = relations(topics, ({ many }) => ({
  exercises: many(exercises),
  progress: many(userProgress),
}));

export const exerciseRelations = relations(exercises, ({ one }) => ({
  topic: one(topics, { fields: [exercises.topicId], references: [topics.id] }),
}));

export const progressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, { fields: [userProgress.userId], references: [users.id] }),
  topic: one(topics, { fields: [userProgress.topicId], references: [topics.id] }),
}));

export const userRelations = relations(users, ({ many }) => ({
  progress: many(userProgress),
}));
