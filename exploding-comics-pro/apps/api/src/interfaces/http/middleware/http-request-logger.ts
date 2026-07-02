import type { RequestHandler } from "express";
import type { Logger } from "pino";

export function createHttpRequestLogger(logger: Logger): RequestHandler {
  return (request, response, next) => {
    const start = process.hrtime.bigint();

    response.on("finish", () => {
      const durationMs = Number(process.hrtime.bigint() - start) / 1_000_000;

      logger.info(
        {
          requestId: request.requestId,
          method: request.method,
          path: request.originalUrl,
          statusCode: response.statusCode,
          durationMs: Number(durationMs.toFixed(2)),
        },
        "request_completed"
      );
    });

    next();
  };
}
