import { z } from "zod";
import { HttpError } from "./web/error";
import { Server } from "./web/server";
import { handleOpenApi } from "./web/router/openapi";

async function main() {
  const server = new Server({
    port: 3000,
    host: "0.0.0.0",
  });

  server.router.get(
    () => {
      return Promise.resolve({
        message: "Hello, world!",
      });
    },
    {
      response: z.object({
        message: z.string(),
      }),
    }
  );

  server.router.route("/status").get(
    ({ query }) => {
      return Promise.resolve({
        status: "ok",
        num: query.foo,
        bar: query.bar,
      });
    },
    {
      query: z.object({
        foo: z.coerce.number().optional(),
        bar: z.string().optional(),
      }),
      response: z.object({
        status: z.string(),
        num: z.number().optional(),
        bar: z.string().optional(),
      }),
    }
  );

  server.router.route("/openapi.json").get(handleOpenApi, {
    response: z.any(),
  });

  server.router.route("/user").route(":userId").get(
    ({ params }) => {
      if (params.userId != "admin") {
        throw new HttpError(403);
      }

      return Promise.resolve({
        userId: params.userId,
      });
    },
    {
      response: z.object({
        userId: z.string(),
      }),
    }
  );

  await server.start();
}

main();
