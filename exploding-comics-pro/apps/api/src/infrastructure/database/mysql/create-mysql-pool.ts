import { createPool, type Pool, type PoolOptions } from "mysql2/promise";

import type { AppEnv } from "../../../config/env";

export interface MySqlPoolOverrides {
  multipleStatements?: boolean;
}

export function createMySqlPool(env: AppEnv, overrides: MySqlPoolOverrides = {}): Pool {
  const poolOptions: PoolOptions = {
    host: env.DB_HOST,
    port: env.DB_PORT,
    database: env.DB_NAME,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: env.DB_CONNECTION_LIMIT,
    connectTimeout: env.DB_CONNECT_TIMEOUT_MS,
    timezone: "Z",
    dateStrings: true,
    multipleStatements: overrides.multipleStatements ?? false,
  };

  return createPool(poolOptions);
}
