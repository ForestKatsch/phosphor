import { STATUS_CODES } from "node:http";
import z, { ZodError } from "zod";

type ErrorContext = string;

export class HttpError extends Error {
  public readonly status: number;
  public readonly context: ErrorContext | null;

  constructor(status: number, message?: string, context?: ErrorContext) {
    super(message ?? STATUS_CODES[status] ?? "Unknown Error");

    this.status = status;
    this.context = context ?? null;
  }

  toJson() {
    return {
      status: this.status,
      message: this.message ?? undefined,
      context: this.context ?? undefined,
    };
  }

  override toString() {
    return JSON.stringify(this.toJson());
  }
}

export class NotFoundError extends HttpError {
  constructor(message?: string, context?: ErrorContext) {
    super(404, message, context);
  }
}

export class BadRequestError extends HttpError {
  constructor(message?: string, context?: ErrorContext) {
    super(400, message, context);
  }
}

/** Intentionally does not ever return the message to the client. */
export class InternalServerError extends HttpError {
  public readonly internalOnlyMessage: string | null;

  constructor(internalOnlyMessage?: string) {
    super(400);

    this.internalOnlyMessage = internalOnlyMessage ?? null;
  }
}

export class ValidationError extends HttpError {
  public readonly zodError: ZodError | null;

  constructor(message?: string, zodError?: ZodError) {
    super(400, message);

    this.zodError = zodError ?? null;
  }

  override toJson() {
    return {
      ...super.toJson(),
      validationErrors: this.zodError ? z.treeifyError(this.zodError) : null
    };
  }
}