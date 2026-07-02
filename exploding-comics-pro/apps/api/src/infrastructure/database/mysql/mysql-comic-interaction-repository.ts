import type { DatabaseQueryExecutor } from "./database-query-executor";
import type {
  ComicInteractionRepository,
  LikeComicInput,
  RegisterComicViewInput,
  UnlikeComicInput,
} from "../../../application/interactions/contracts/comic-interaction-repository";

export class MySqlComicInteractionRepository implements ComicInteractionRepository {
  constructor(private readonly databaseQueryExecutor: DatabaseQueryExecutor) {}

  async registerView(input: RegisterComicViewInput): Promise<void> {
    await this.databaseQueryExecutor.query(
      `
        INSERT INTO comic_views
          (comic_id, visitor_id, view_date_bucket)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
          viewed_at = viewed_at
      `,
      [input.comicId, input.visitorId, input.viewDateBucket]
    );
  }

  async likeComic(input: LikeComicInput): Promise<void> {
    await this.databaseQueryExecutor.query(
      `
        INSERT INTO comic_likes
          (comic_id, visitor_id)
        VALUES (?, ?)
        ON DUPLICATE KEY UPDATE
          visitor_id = visitor_id
      `,
      [input.comicId, input.visitorId]
    );
  }

  async unlikeComic(input: UnlikeComicInput): Promise<void> {
    await this.databaseQueryExecutor.query(
      `
        DELETE FROM comic_likes
        WHERE comic_id = ?
          AND visitor_id = ?
      `,
      [input.comicId, input.visitorId]
    );
  }
}
