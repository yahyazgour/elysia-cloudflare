import "dotenv/config";
import { createDb } from "@/db";
import { createAuth } from "@/lib/auth";
import { cors } from "@elysiajs/cors";
import { RPCHandler } from "@orpc/server/fetch";
import { Elysia } from "elysia";
import { createContext } from "./lib/context";
import { appRouter } from "./routers";
import { CORSPlugin } from "@orpc/server/plugins";
import type { Context } from "elysia";

export type Env = {
  DATABASE_URL: string;
  DATABASE_AUTH_TOKEN: string;
  CORS_ORIGIN: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
};

export default {
  async fetch(request: Request, env: Env, ctx: Context): Promise<Response> {
    const handler = new RPCHandler(appRouter, {
      plugins: [
        new CORSPlugin({
          origin: (origin) => origin,
          allowMethods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
          allowHeaders: ["Content-Type", "Authorization"],
          credentials: true,
        }),
      ],
    });

    const app = new Elysia({ aot: false, strictPath: false })
      .use(
        cors({
          origin: (request) => {
            const allowedOrigins = [
              "http://localhost:3000",
              "http://localhost:3001",
              env.CORS_ORIGIN,
            ];
            const origin = request.headers.get("Origin") || "";
            return allowedOrigins.includes(origin);
          },
          methods: ["GET", "HEAD", "PUT", "POST", "DELETE", "PATCH"],
          allowedHeaders: ["Content-Type", "Authorization"],
          credentials: true,
          preflight: true,
        })
      )
      .derive(() => {
        const db = createDb(env);
        const auth = createAuth(env, db);

        return {
          db: db,
          auth: auth,
        };
      })
      .all("/api/auth/*", async (context) => {
        const { request, db, auth } = context;
        if (["POST", "GET"].includes(request.method)) {
          return auth.handler(request);
        }
        context.error(405);
      })
      .all("/rpc*", async (context) => {
        const { response } = await handler.handle(context.request, {
          prefix: "/rpc",
          context: await createContext({ context }),
        });
        return response ?? new Response("Not Found", { status: 404 });
      })
      .get("/", () => "OK");

    return await app.fetch(request);
  },
};
