import { protectedProcedure, publicProcedure } from "../lib/orpc";
import { todoRouter } from "./todo";

export const appRouter = {
  healthCheck: publicProcedure.handler(() => {
    return "OK";
  }),
  privateData: protectedProcedure.handler(({ context }) => {
    return {
      message: "This is private",
      user: context.session?.user,
    };
  }),
  todo: todoRouter,
  test: {
    nested1: {
      nested2: {
        nested3: publicProcedure.handler(async () => {
          return { success: true };
        }),
      },
    },
    nested4: publicProcedure.handler(async () => {
      return { success: true };
    }),
  },
};
export type AppRouter = typeof appRouter;
