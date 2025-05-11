import { eq } from "drizzle-orm";
import { z } from "zod";

import { todo } from "../db/schema/todo";
import { publicProcedure } from "../lib/orpc";

export const todoRouter = {
  getAll: publicProcedure.handler(async ({ context }) => {
    return await context.db.select().from(todo);
  }),

  create: publicProcedure
    .input(z.object({ text: z.string().min(1) }))
    .handler(async ({ input, context }) => {
      const result = await context.db
        .insert(todo)
        .values({
          text: input.text,
        })
        .returning();
      return result[0];
    }),

  toggle: publicProcedure
    .input(z.object({ id: z.number(), completed: z.boolean() }))
    .handler(async ({ input, context }) => {
      await context.db
        .update(todo)
        .set({ completed: input.completed })
        .where(eq(todo.id, input.id));
      return { success: true };
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .handler(async ({ input, context }) => {
      await context.db.delete(todo).where(eq(todo.id, input.id));
      return { success: true };
    }),
};
