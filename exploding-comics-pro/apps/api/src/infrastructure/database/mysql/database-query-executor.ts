export type DatabaseQueryParameter = string | number | boolean | Date | null;

export interface DatabaseQueryExecutor {
  query<T extends object>(
    sql: string,
    parameters?: readonly DatabaseQueryParameter[]
  ): Promise<T[]>;
}
