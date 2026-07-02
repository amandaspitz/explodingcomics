import type { ErrorRequestHandler } from "express";
import type { Logger } from "pino";

import { mapErrorToHttpResponse } from "../mappers/map-error-to-http-response";

export function createErrorHandler(logger: Logger): ErrorRequestHandler {
  return (error, request, response, next) => {
    void next;

    const httpError = mapErrorToHttpResponse(error);

    logger.error(
      {
        requestId: request.requestId,
        method: request.method,
        path: request.originalUrl,
        error,
      },
      "request_failed"
    );

    response.status(httpError.statusCode).json(httpError.body);
  };
}
