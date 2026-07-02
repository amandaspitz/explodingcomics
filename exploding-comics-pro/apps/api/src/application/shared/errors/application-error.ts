export interface ApplicationErrorOptions {
  code: string;
  message: string;
  statusCode?: number;
  details?: unknown;
  cause?: unknown;
}

export class ApplicationError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly details?: unknown;

  constructor(options: ApplicationErrorOptions) {
    super(options.message, { cause: options.cause });

    this.name = "ApplicationError";
    this.code = options.code;
    this.statusCode = options.statusCode ?? 500;
    this.details = options.details;
  }
}
