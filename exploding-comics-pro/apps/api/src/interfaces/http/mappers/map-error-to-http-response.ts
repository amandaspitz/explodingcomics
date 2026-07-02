import { ZodError } from "zod";

import { ApplicationError } from "../../../application/shared/errors/application-error";

export interface HttpErrorResponse {
  statusCode: number;
  body: {
    error: {
      code: string;
      message: string;
      details?: unknown;
    };
  };
}

export function mapErrorToHttpResponse(error: unknown): HttpErrorResponse {
  if (error instanceof ApplicationError) {
    return {
      statusCode: error.statusCode,
      body: {
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
      },
    };
  }

  if (error instanceof ZodError) {
    return {
      statusCode: 400,
      body: {
        error: {
          code: "VALIDATION_ERROR",
          message: "Request validation failed.",
          details: error.flatten(),
        },
      },
    };
  }

  return {
    statusCode: 500,
    body: {
      error: {
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred.",
      },
    },
  };
}
