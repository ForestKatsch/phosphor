import { z } from "zod";
import { type ParsePath, type PathSegment, parsePath } from "./path";
import { Trie, type TrieEntry } from "./trie";
import type {
	Handler,
	HandlerEntry,
	HandlerSchemas,
	IntrospectedMethod,
	IntrospectedRoute,
	MatchHandlerResult,
	MethodName,
	RouterMethods,
} from "./types";

export class Router<TPath extends PathSegment[] = []>
	implements RouterMethods<TPath>
{
	private readonly path: PathSegment[];
	private readonly trie: Trie<Map<string, HandlerEntry>>;

	constructor(path: PathSegment[] = [], parent?: Router<PathSegment[]>) {
		this.path = path;
		this.trie = parent?.trie ?? new Trie();
	}

	route<Path extends string>(
		path: Path,
	): Router<[...TPath, ...ParsePath<Path>]> {
		const fullPath = [...this.path, ...parsePath(path)];
		return new Router(fullPath, this);
	}

	handle<
		TBody extends z.ZodType | undefined,
		TQuery extends z.ZodType,
		TResponse extends z.ZodType | undefined,
	>(
		method: string,
		handler: Handler<TPath, TBody, TQuery, TResponse>,
		schemas?: HandlerSchemas<TBody, TQuery, TResponse>,
	): this {
		const mergedSchemas = { ...schemas };
		const entry: HandlerEntry = { handler: handler as HandlerEntry["handler"] };
		if (mergedSchemas.body) {
			entry.body = mergedSchemas.body;
		}
		if (mergedSchemas.query) {
			entry.query = mergedSchemas.query;
		}
		if (mergedSchemas.response) {
			entry.response = mergedSchemas.response;
		}

		const methods =
			this.trie.getValue(this.path) ?? new Map<string, HandlerEntry>();
		methods.set(method.toUpperCase(), entry);
		this.trie.insert(this.path, methods);
		return this;
	}

	get<
		TBody extends z.ZodType | undefined,
		TQuery extends z.ZodType,
		TResponse extends z.ZodType | undefined,
	>(
		handler: Handler<TPath, TBody, TQuery, TResponse>,
		schemas?: HandlerSchemas<TBody, TQuery, TResponse>,
	): this {
		return this.handle("GET", handler, schemas);
	}

	post<
		TBody extends z.ZodType | undefined,
		TQuery extends z.ZodType,
		TResponse extends z.ZodType | undefined,
	>(
		handler: Handler<TPath, TBody, TQuery, TResponse>,
		schemas?: HandlerSchemas<TBody, TQuery, TResponse>,
	): this {
		return this.handle("POST", handler, schemas);
	}

	put<
		TBody extends z.ZodType | undefined,
		TQuery extends z.ZodType,
		TResponse extends z.ZodType | undefined,
	>(
		handler: Handler<TPath, TBody, TQuery, TResponse>,
		schemas?: HandlerSchemas<TBody, TQuery, TResponse>,
	): this {
		return this.handle("PUT", handler, schemas);
	}

	patch<
		TBody extends z.ZodType | undefined,
		TQuery extends z.ZodType,
		TResponse extends z.ZodType | undefined,
	>(
		handler: Handler<TPath, TBody, TQuery, TResponse>,
		schemas?: HandlerSchemas<TBody, TQuery, TResponse>,
	): this {
		return this.handle("PATCH", handler, schemas);
	}

	delete<
		TBody extends z.ZodType | undefined,
		TQuery extends z.ZodType,
		TResponse extends z.ZodType | undefined,
	>(
		handler: Handler<TPath, TBody, TQuery, TResponse>,
		schemas?: HandlerSchemas<TBody, TQuery, TResponse>,
	): this {
		return this.handle("DELETE", handler, schemas);
	}

	options<
		TBody extends z.ZodType | undefined,
		TQuery extends z.ZodType,
		TResponse extends z.ZodType | undefined,
	>(
		handler: Handler<TPath, TBody, TQuery, TResponse>,
		schemas?: HandlerSchemas<TBody, TQuery, TResponse>,
	): this {
		return this.handle("OPTIONS", handler, schemas);
	}

	head<
		TBody extends z.ZodType | undefined,
		TQuery extends z.ZodType,
		TResponse extends z.ZodType | undefined,
	>(
		handler: Handler<TPath, TBody, TQuery, TResponse>,
		schemas?: HandlerSchemas<TBody, TQuery, TResponse>,
	): this {
		return this.handle("HEAD", handler, schemas);
	}

	match(method: string, path: string): MatchHandlerResult | null {
		const match = this.trie.match(parsePath(path));
		if (!match) {
			return null;
		}

		const entry = match.value.get(method.toUpperCase());
		if (!entry) {
			return null;
		}

		if (match.wildcard) {
			return { handler: entry, params: match.params, wildcard: match.wildcard };
		}

		return { handler: entry, params: match.params };
	}

	introspect(): IntrospectedRoute[] {
		return this.trie.entries().map((entry) => this.describeEntry(entry));
	}

	private describeEntry(
		entry: TrieEntry<Map<string, HandlerEntry>>,
	): IntrospectedRoute {
		const methods: IntrospectedMethod[] = [];
		entry.value.forEach((handler, method) => {
			const methodEntry: IntrospectedMethod = {
				method: method.toLowerCase() as MethodName,
			};
			if (handler.body) {
				methodEntry.body = handler.body;
			}
			if (handler.query && handler.query instanceof z.ZodObject) {
				methodEntry.query = handler.query;
			}
			if (handler.response) {
				methodEntry.response = handler.response;
			}
			methods.push(methodEntry);
		});

		return {
			path: this.formatPath(entry.path),
			params: this.paramsSchema(entry.path),
			methods,
		};
	}

	private paramsSchema(path: PathSegment[]): z.ZodObject<z.ZodRawShape> {
		const shape: Record<string, z.ZodType> = {};
		for (const segment of path) {
			if (segment.type === "variable") {
				shape[segment.value] = z.string();
			}
		}
		return z.object(shape);
	}

	private formatPath(path: PathSegment[]): string {
		if (path.length === 0) {
			return "/";
		}

		return `/${path
			.map((segment) => {
				if (segment.type === "literal") {
					return segment.value;
				}
				if (segment.type === "variable") {
					return `{${segment.value}}`;
				}
				return "*";
			})
			.join("/")}`;
	}
}

export type {
	GenericHandler,
	Handler,
	HandlerSchemas,
	IntrospectedMethod,
	IntrospectedRoute,
	MatchHandlerResult,
	MethodName,
	RouterMethods,
} from "./types";
