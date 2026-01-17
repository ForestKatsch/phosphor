import {
	type IncomingMessage,
	type Server as NodeServer,
	type ServerResponse,
	createServer,
} from "node:http";
import { z } from "zod";
import {
	BadRequestError,
	HttpError,
	InternalServerError,
	NotFoundError,
	ValidationError,
} from "./error";
import type { Request } from "./request";
import { Router } from "./router/router";

export const ServerConfig = z.object({
	port: z.number().default(3000),
	host: z.string().default("0.0.0.0"),
});

export class Server {
	private readonly config: z.infer<typeof ServerConfig>;
	private server: NodeServer;

	router = new Router();

	constructor(config: z.infer<typeof ServerConfig>) {
		this.config = config;
		this.server = createServer(this.listener.bind(this));
	}

	listener(_req: IncomingMessage, res: ServerResponse) {
		const method = _req.method ?? "GET";
		const url = new URL(_req.url ?? "/", "http://localhost");
		const match = this.router.match(method, url.pathname);

		if (!match) {
			res.statusCode = 404;
			res.setHeader("content-type", "application/json");
			res.end(new NotFoundError().toString());
			return;
		}

		const request = {
			_original: _req,
			router: this.router,
			params: match.params,
			query: Object.fromEntries(url.searchParams.entries()),
		} as Request<z.ZodType | undefined, z.ZodType, Record<string, string>>;

		const run = async () => {
			if (match.handler.query) {
				const queryResult = match.handler.query.safeParse(request.query);
				if (!queryResult.success) {
					throw new ValidationError("query_parse_error", queryResult.error);
				}
				request.query = queryResult.data;
			}

			if (match.handler.body) {
				let parsedBody: unknown;
				try {
					parsedBody = await this.readJsonBody(_req);
				} catch {
					throw new BadRequestError("body_parse_error");
				}

				const bodyResult = match.handler.body.safeParse(parsedBody);
				if (!bodyResult.success) {
					throw new ValidationError("body_parse_error", bodyResult.error);
				}

				request.body = bodyResult.data;
			}

			let result: unknown;

			result = await match.handler.handler(request);

			if (match.handler.response) {
				const responseResult = match.handler.response.safeParse(result);
				if (!responseResult.success) {
					throw new InternalServerError(
						"Unable to safely parse and validate response body",
					);
				}
				result = responseResult.data;
			}

			if (result === undefined) {
				res.statusCode = 204;
				res.end();
				return;
			}

			res.setHeader("content-type", "application/json");
			res.end(JSON.stringify(result));
		};

		run().catch((error) => {
			const resolvedError =
				error instanceof HttpError
					? error
					: new HttpError(500, "Internal Server Error");

			if (!(error instanceof HttpError)) {
				console.error(
					`uncaught exception serving ${method} ${url.pathname}: ${error.message}`,
				);
				console.trace(error);
			}

			res.statusCode = resolvedError.status;
			res.setHeader("content-type", "application/json");
			res.end(JSON.stringify(resolvedError.toJson()));
			return;
		});
	}

	private async readJsonBody(req: IncomingMessage): Promise<unknown> {
		const chunks: Buffer[] = [];
		for await (const chunk of req) {
			chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
		}

		if (chunks.length === 0) {
			return undefined;
		}

		const raw = Buffer.concat(chunks).toString("utf8").trim();
		if (!raw) {
			return undefined;
		}

		return JSON.parse(raw);
	}

	async start() {
		this.server.listen(this.config.port, this.config.host);
		console.log(
			`Server is running on http://${this.config.host}:${this.config.port}`,
		);
	}
}
