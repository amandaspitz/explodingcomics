import type {
  AdminComicReadRepository,
  AdminComicSummary,
} from "../contracts/admin-comic-read-repository";
import type { ComicStatus } from "../../../domain/comics/constants/comic-status";

export interface ListAdminComicsInput {
  status?: ComicStatus;
  limit?: number;
  offset?: number;
}

export class ListAdminComics {
  constructor(private readonly adminComicReadRepository: AdminComicReadRepository) {}

  async execute(input: ListAdminComicsInput = {}): Promise<AdminComicSummary[]> {
    return this.adminComicReadRepository.listComics({
      limit: input.limit ?? 20,
      offset: input.offset ?? 0,
      ...(input.status ? { status: input.status } : {}),
    });
  }
}
