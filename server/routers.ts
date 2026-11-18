import { COOKIE_NAME } from "@shared/const";
import { createInfiniteExercise } from "./routes/exerciseGenerator";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { getExercisesForTopic, getUserProgress, saveUserProgress } from "./db";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  exercises: router({
    byTopic: publicProcedure.input(z.object({ topicId: z.string().min(1).max(80) })).query(({ input }) => getExercisesForTopic(input.topicId)),
    infinite: publicProcedure.input(z.object({ topicId: z.string().min(1).max(80), round: z.number().int().min(0), difficulty: z.enum(["Básico", "Intermedio", "Reto"]) })).query(({ input }) => createInfiniteExercise(input.topicId, input.round, input.difficulty)),
  }),

  progress: router({
    list: protectedProcedure.query(({ ctx }) => getUserProgress(ctx.user.id)),
    save: protectedProcedure.input(z.object({
      topicId: z.string().min(1).max(80),
      mastery: z.number().int().min(0).max(100),
      streak: z.number().int().min(0),
      difficulty: z.enum(["Básico", "Intermedio", "Reto"]),
      attempts: z.number().int().min(0),
      correct: z.number().int().min(0),
    })).mutation(({ ctx, input }) => saveUserProgress({ ...input, userId: ctx.user.id })),
  }),
});

export type AppRouter = typeof appRouter;
