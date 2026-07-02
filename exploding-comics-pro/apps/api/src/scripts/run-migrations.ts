import path from "node:path";

import { getEnv } from "../config/env";
import { FileSystemMigrationSource } from "../infrastructure/database/migrations/file-system-migration-source";
import { MySqlMigrationRunner } from "../infrastructure/database/migrations/mysql-migration-runner";
import { createMySqlPool } from "../infrastructure/database/mysql/create-mysql-pool";
import { createLogger } from "../infrastructure/logging/create-logger";

async function main(): Promise<void> {
  const env = getEnv();
  const logger = createLogger(env);
  const pool = createMySqlPool(env, {
    multipleStatements: true,
  });
  const migrationSource = new FileSystemMigrationSource(path.resolve(process.cwd(), "migrations"));
  const migrationRunner = new MySqlMigrationRunner(pool, migrationSource, logger);

  try {
    const result = await migrationRunner.run();

    logger.info(result, "migrations_completed");
  } finally {
    await pool.end();
  }
}

void main();
