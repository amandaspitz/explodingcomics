import { describe, expect, it } from "vitest";

import type { DatabaseQueryExecutor } from "../../../../../src/infrastructure/database/mysql/database-query-executor";
import { MySqlComicStatsReadRepository } from "../../../../../src/infrastructure/database/mysql/mysql-comic-stats-read-repository";

class FakeDatabaseQueryExecutor implements DatabaseQueryExecutor {
  readonly calls: Array<{
    sql: string;
    parameters: readonly (string | number | boolean | Date | null)[];
  }> = [];

  private readonly queuedResults: object[][] = [];

  queueResult(rows: object[]): void {
    this.queuedResults.push(rows);
  }

  async query<T extends object>(
    sql: string,
    parameters: readonly (string | number | boolean | Date | null)[] = []
  ): Promise<T[]> {
    this.calls.push({
      sql,
      parameters,
    });

    const nextResult = this.queuedResults.shift();

    if (!nextResult) {
      throw new Error("No query result queued for test.");
    }

    return nextResult as T[];
  }
}

describe("MySqlComicStatsReadRepository", () => {
  it("maps public stats counts for a comic", async () => {
    const databaseQueryExecutor = new FakeDatabaseQueryExecutor();
    const repository = new MySqlComicStatsReadRepository(databaseQueryExecutor);

    databaseQueryExecutor.queueResult([
      {
        likes_count: "12",
        views_count: "48",
        liked_by_visitor: 1,
      },
    ]);

    const result = await repository.getPublicStatsByComicId({
      comicId: 24,
      visitorId: "835f619f-f8ca-4d2b-b9aa-f1b3d92ca1e0",
    });

    expect(result).toEqual({
      comicId: 24,
      likesCount: 12,
      viewsCount: 48,
      likedByVisitor: true,
    });
    expect(databaseQueryExecutor.calls[0]?.parameters).toEqual([
      24,
      24,
      "835f619f-f8ca-4d2b-b9aa-f1b3d92ca1e0",
      24,
      "835f619f-f8ca-4d2b-b9aa-f1b3d92ca1e0",
    ]);
    expect(databaseQueryExecutor.calls[0]?.sql).toContain("comic_likes");
    expect(databaseQueryExecutor.calls[0]?.sql).toContain("comic_views");
  });
});
