import { describe, expect, it } from "vitest";

import { ApplicationError } from "../../../../../src/application/shared/errors/application-error";
import { GetReadinessStatus } from "../../../../../src/application/shared/use-cases/get-readiness-status";

describe("GetReadinessStatus", () => {
  it("returns readiness data with dependency statuses", async () => {
    const useCase = new GetReadinessStatus({
      appName: "exploding-comics-pro-api",
      environment: "test",
      dependencyCheckers: [
        {
          async check() {
            return {
              name: "mysql",
              status: "up" as const,
              details: {
                database: "exploding_comics_pro_test",
              },
            };
          },
        },
      ],
    });

    const result = await useCase.execute(new Date("2026-07-02T12:00:00.000Z"));

    expect(result).toEqual({
      status: "ready",
      service: "exploding-comics-pro-api",
      environment: "test",
      timestamp: "2026-07-02T12:00:00.000Z",
      dependencies: [
        {
          name: "mysql",
          status: "up",
          details: {
            database: "exploding_comics_pro_test",
          },
        },
      ],
    });
  });

  it("propagates dependency failures", async () => {
    const useCase = new GetReadinessStatus({
      appName: "exploding-comics-pro-api",
      environment: "test",
      dependencyCheckers: [
        {
          async check() {
            throw new ApplicationError({
              code: "DATABASE_NOT_READY",
              message: "MySQL is not ready to accept connections.",
              statusCode: 503,
            });
          },
        },
      ],
    });

    await expect(useCase.execute()).rejects.toThrow(ApplicationError);
  });
});
