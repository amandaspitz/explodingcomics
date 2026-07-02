import type { DatabaseQueryExecutor } from "./database-query-executor";
import type {
  ComicStatsReadRepository,
  GetPublicComicStatsRepositoryInput,
  PublicComicStats,
} from "../../../application/interactions/contracts/comic-stats-read-repository";

interface PublicComicStatsRow {
  likes_count: number | string;
  views_count: number | string;
  liked_by_visitor: number | boolean | null;
}

export class MySqlComicStatsReadRepository implements ComicStatsReadRepository {
  constructor(private readonly databaseQueryExecutor: DatabaseQueryExecutor) {}

  async getPublicStatsByComicId(
    input: GetPublicComicStatsRepositoryInput
  ): Promise<PublicComicStats> {
    const rows = await this.databaseQueryExecutor.query<PublicComicStatsRow>(
      `
        SELECT
          (SELECT COUNT(*) FROM comic_likes WHERE comic_id = ?) AS likes_count,
          (SELECT COUNT(*) FROM comic_views WHERE comic_id = ?) AS views_count,
          (
            CASE
              WHEN ? IS NULL THEN NULL
              WHEN EXISTS (
                SELECT 1
                FROM comic_likes
                WHERE comic_id = ?
                  AND visitor_id = ?
              ) THEN TRUE
              ELSE FALSE
            END
          ) AS liked_by_visitor
      `,
      [
        input.comicId,
        input.comicId,
        input.visitorId ?? null,
        input.comicId,
        input.visitorId ?? null,
      ]
    );
    const row = rows[0];

    return {
      comicId: input.comicId,
      likesCount: row ? Number(row.likes_count) : 0,
      viewsCount: row ? Number(row.views_count) : 0,
      likedByVisitor:
        row?.liked_by_visitor === null || row?.liked_by_visitor === undefined
          ? null
          : Boolean(row.liked_by_visitor),
    };
  }
}
