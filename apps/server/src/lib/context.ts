import type { Db } from "../db";
import type { Auth } from "@/lib/auth";
import type { Context as ElysiaContext } from "elysia";

export type CreateContextOptions = {
  context: ElysiaContext & {
    db: Db;
    auth: Auth;
  };
};

export async function createContext({
  context,
}: {
  context: ElysiaContext & {
    db: Db;
    auth: Auth;
  };
}) {
  const session = await context.auth.api.getSession({
    headers: context.request.headers,
  });

  return {
    db: context.db,
    auth: context.auth,
    session,
  };
}

export type Context = Awaited<ReturnType<typeof createContext>>;
