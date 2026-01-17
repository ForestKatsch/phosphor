import { authRouter } from "@/app/auth/router";
import { HttpError } from "@/web/error";
import { handleOpenApi } from "@/web/router/openapi";
import { Server } from "@/web/server";
import { z } from "zod";

export async function app() {
	const server = new Server({
		port: 3000,
		host: "0.0.0.0",
	});

	authRouter(server.router.route("/auth"));

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
		},
	);

	server.router.route("/openapi.json").get(handleOpenApi, {
		response: z.any(),
	});

	await server.start();
}
