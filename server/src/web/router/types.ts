import type { z } from "zod";
import type { Simplify } from "../../util/types";
import type { Request } from "../request";
import type { ParamsFromSegments, ParsePath, PathSegment } from "./path";
import type { Router } from "./router";

export type PathInput = PathSegment[] | string;

type PathSegments<TPath extends PathInput> = TPath extends string
	? ParsePath<TPath>
	: TPath;

export type ParamsForPath<TPath extends PathInput> = Simplify<
	ParamsFromSegments<PathSegments<TPath>>
> &
	Record<string, string>;

export type Handler<
	TPath extends PathInput = PathSegment[],
	TBody extends z.ZodType | undefined = undefined,
	TQuery extends z.ZodType = z.ZodType,
	TResponse extends z.ZodType | undefined = undefined,
> = (
	req: Request<TBody, TQuery, ParamsForPath<TPath>>,
) => Promise<TResponse extends z.ZodType ? z.infer<TResponse> : void>;

export type GenericHandler<
	TResponse extends z.ZodType | undefined = undefined,
> = Handler<PathSegment[], z.ZodType, z.ZodType, TResponse>;

export type HandlerSchemas<
	TBody extends z.ZodType | undefined,
	TQuery extends z.ZodType,
	TResponse extends z.ZodType | undefined,
> = {
	body?: TBody;
	query?: TQuery;
	response?: TResponse;
};

export type IntrospectedMethod = {
	method: MethodName;
	body?: z.ZodType;
	query?: z.ZodObject<z.ZodRawShape>;
	response?: z.ZodType;
};

export type IntrospectedRoute = {
	path: string;
	params: z.ZodObject<z.ZodRawShape>;
	methods: IntrospectedMethod[];
};

export type HandlerEntry = {
	handler: (
		req: Request<z.ZodType | undefined, z.ZodType, Record<string, string>>,
	) => Promise<unknown>;
	body?: z.ZodType;
	query?: z.ZodType;
	response?: z.ZodType;
};

export type MatchHandlerResult = {
	handler: HandlerEntry;
	params: Record<string, string>;
	wildcard?: string[];
};

export type Method =
	| "GET"
	| "POST"
	| "PUT"
	| "PATCH"
	| "DELETE"
	| "OPTIONS"
	| "HEAD";
export type MethodName = Lowercase<Method>;

export type MethodBuilder<TPath extends PathInput> = <
	TBody extends z.ZodType | undefined = undefined,
	TQuery extends z.ZodType = z.ZodType,
	TResponse extends z.ZodType | undefined = undefined,
>(
	handler: Handler<TPath, TBody, TQuery, TResponse>,
	schemas?: HandlerSchemas<TBody, TQuery, TResponse>,
) => Router<TPath>;

export type RouterMethods<TPath extends PathInput> = {
	[K in MethodName]: MethodBuilder<TPath>;
};
