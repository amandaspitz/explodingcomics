import type { Pool } from "mysql2/promise";

import type {
  ReadinessDependencyChecker,
  ReadinessDependencyStatus,
} from "../../../application/shared/contracts/readiness-dependency-checker";
import { ApplicationError } from "../../../application/shared/errors/application-error";

export class MySqlDatabaseHealthChecker implements ReadinessDependencyChecker {
  constructor(
    private readonly pool: Pool,
    private readonly databaseName: string
  ) {}

  async check(): Promise<ReadinessDependencyStatus> {
    try {
      await this.pool.query("SELECT 1 AS is_alive");

      return {
        name: "mysql",
        status: "up",
        details: {
          database: this.databaseName,
        },
      };
    } catch (error) {
      throw new ApplicationError({
        code: "DATABASE_NOT_READY",
        message: "MySQL is not ready to accept connections.",
        statusCode: 503,
        cause: error,
      });
    }
  }
}
