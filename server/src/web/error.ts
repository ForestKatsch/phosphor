import { STATUS_CODES } from "node:http";
import z, { type ZodError } from "zod";

type ErrorContext = string;

const ERROR_MESSAGES = Object.fromEntries(
	Object.entries(STATUS_CODES).map(([code, message]) => [
		code,
		message?.toLowerCase() ?? "unknown_error",
	]),
);

export const ErrorResponse = z.object({
	status: z.number(),
	message: z.string(),
	context: z.string().optional(),
});

export class HttpError extends Error {
	public readonly status: number;
	public readonly context: ErrorContext | null;

	constructor(status: number, message?: string, context?: ErrorContext) {
		super(message ?? ERROR_MESSAGES[status] ?? "unknown_error");

		this.status = status;
		this.context = context ?? null;
	}

	toJson() {
		return {
			status: this.status,
			message: this.message,
			context: this.context ?? undefined,
		};
	}

	override toString() {
		return JSON.stringify(this.toJson());
	}
}

export class NotFoundError extends HttpError {
	constructor(message?: string, context?: ErrorContext) {
		super(404, message ?? "not_found", context);
	}
}

export class BadRequestError extends HttpError {
	constructor(message?: string, context?: ErrorContext) {
		super(400, message ?? "bad_request", context);
	}
}

/** Intentionally does not ever return the message to the client. */
export class InternalServerError extends HttpError {
	public readonly internalOnlyMessage: string | null;

	constructor(internalOnlyMessage?: string) {
		super(400, "internal_server_error");

		this.internalOnlyMessage = internalOnlyMessage ?? null;
	}
}

export class ValidationError extends HttpError {
	public readonly zodError: ZodError | null;

	constructor(message?: string, zodError?: ZodError) {
		super(400, message ?? "validation_error");

		this.zodError = zodError ?? null;
	}

	override toJson() {
		return {
			...super.toJson(),
			validationErrors: this.zodError ? z.treeifyError(this.zodError) : null,
		};
	}
}
