import { IncomingMessage } from "node:http";
import { z } from "zod";
import type { Router } from "./router/router";

type BodyField<TBody extends z.ZodType | undefined> = TBody extends z.ZodType
  ? { body: z.infer<TBody> }
  : { body?: unknown };

export type Request<
  TBody extends z.ZodType | undefined = undefined,
  TQuery extends z.ZodType = z.ZodType,
  TParams extends Record<string, string> = Record<string, string>
> = {
  _original: IncomingMessage;
  router: Router;
  params: TParams;
  query: z.infer<TQuery>;
} & BodyField<TBody>;