import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { getUserProgress, saveUserProgress } from "./db";
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
