import type { Pool, RowDataPacket } from "mysql2/promise";

import type {
  DatabaseQueryExecutor,
  DatabaseQueryParameter,
} from "./database-query-executor";

export class MySqlPoolQueryExecutor implements DatabaseQueryExecutor {
  constructor(private readonly pool: Pool) {}

  async query<T extends object>(
    sql: string,
    parameters: readonly DatabaseQueryParameter[] = []
  ): Promise<T[]> {
    const [rows] = await this.pool.query<RowDataPacket[]>(sql, [...parameters]);

    return rows as unknown as T[];
  }
}
