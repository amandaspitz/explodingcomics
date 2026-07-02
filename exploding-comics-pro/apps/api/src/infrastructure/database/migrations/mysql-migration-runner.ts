import type { Pool, RowDataPacket } from "mysql2/promise";
import type { Logger } from "pino";

import { ApplicationError } from "../../../application/shared/errors/application-error";
import type { MigrationDefinition } from "./file-system-migration-source";

export interface MigrationSource {
  getMigrations(): Promise<MigrationDefinition[]>;
}

export interface MigrationRunResult {
  totalDiscovered: number;
  totalPending: number;
  appliedVersions: string[];
}

interface AppliedMigrationRow extends RowDataPacket {
  version: string;
}

export class MySqlMigrationRunner {
  constructor(
    private readonly pool: Pool,
    private readonly migrationSource: MigrationSource,
    private readonly logger: Logger
  ) {}

  async run(): Promise<MigrationRunResult> {
    const migrations = await this.migrationSource.getMigrations();
    const connection = await this.pool.getConnection();

    try {
      await connection.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          version VARCHAR(255) NOT NULL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);

      const [appliedRows] = await connection.query<AppliedMigrationRow[]>(
        "SELECT version FROM schema_migrations ORDER BY version ASC"
      );
      const appliedVersions = new Set(appliedRows.map((row) => row.version));
      const pendingMigrations = migrations.filter((migration) => !appliedVersions.has(migration.version));
      const newlyAppliedVersions: string[] = [];

      for (const migration of pendingMigrations) {
        this.logger.info(
          {
            version: migration.version,
            name: migration.name,
          },
          "migration_started"
        );

        await connection.beginTransaction();

        try {
          await connection.query(migration.sql);
          await connection.query(
            "INSERT INTO schema_migrations (version, name, applied_at) VALUES (?, ?, CURRENT_TIMESTAMP)",
            [migration.version, migration.name]
          );
          await connection.commit();
          newlyAppliedVersions.push(migration.version);

          this.logger.info(
            {
              version: migration.version,
              name: migration.name,
            },
            "migration_completed"
          );
        } catch (error) {
          await connection.rollback();

          throw new ApplicationError({
            code: "MIGRATION_EXECUTION_FAILED",
            message: `Migration ${migration.filename} failed.`,
            statusCode: 500,
            cause: error,
          });
        }
      }

      return {
        totalDiscovered: migrations.length,
        totalPending: pendingMigrations.length,
        appliedVersions: newlyAppliedVersions,
      };
    } finally {
      connection.release();
    }
  }
}
