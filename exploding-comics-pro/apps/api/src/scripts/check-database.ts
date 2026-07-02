import { getEnv } from "../config/env";
import { createMySqlPool } from "../infrastructure/database/mysql/create-mysql-pool";
import { MySqlDatabaseHealthChecker } from "../infrastructure/database/mysql/mysql-database-health-checker";
import { createLogger } from "../infrastructure/logging/create-logger";

async function main(): Promise<void> {
  const env = getEnv();
  const logger = createLogger(env);
  const pool = createMySqlPool(env);
  const healthChecker = new MySqlDatabaseHealthChecker(pool, env.DB_NAME);

  try {
    const status = await healthChecker.check();

    logger.info(status, "database_ready");
  } finally {
    await pool.end();
  }
}

void main();
