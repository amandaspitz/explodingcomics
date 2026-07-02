import type { RequestHandler } from "express";

import type { GetHealthStatus } from "../../../application/shared/use-cases/get-health-status";
import type { GetReadinessStatus } from "../../../application/shared/use-cases/get-readiness-status";

export class HealthController {
  constructor(
    private readonly getHealthStatus: GetHealthStatus,
    private readonly getReadinessStatus: GetReadinessStatus
  ) {}

  readonly getHealth: RequestHandler = (request, response) => {
    response.status(200).json({
      data: this.getHealthStatus.execute(),
      meta: {
        requestId: request.requestId,
      },
    });
  };

  readonly getReadiness: RequestHandler = async (request, response) => {
    response.status(200).json({
      data: await this.getReadinessStatus.execute(),
      meta: {
        requestId: request.requestId,
      },
    });
  };
}
