import { ApplicationError } from "../../shared/errors/application-error";
import type {
  AdminComicCommandRepository,
  AdminComicDetail,
} from "../contracts/admin-comic-command-repository";

export interface ArchiveAdminComicInput {
  comicId: number;
  actorAdminUserId?: number | null;
}

export class ArchiveAdminComic {
  constructor(private readonly adminComicCommandRepository: AdminComicCommandRepository) {}

  async execute(input: ArchiveAdminComicInput): Promise<AdminComicDetail> {
    const comic = await this.adminComicCommandRepository.findComicById(input.comicId);

    if (!comic) {
      throw new ApplicationError({
        code: "ADMIN_COMIC_NOT_FOUND",
        message: `Comic ${input.comicId} was not found.`,
        statusCode: 404,
      });
    }

    if (comic.status === "archived") {
      throw new ApplicationError({
        code: "INVALID_COMIC_STATUS_TRANSITION",
        message: `Comic ${input.comicId} is already archived.`,
        statusCode: 409,
      });
    }

    return this.adminComicCommandRepository.archiveComic(input.comicId, {
      actorAdminUserId: input.actorAdminUserId ?? null,
    });
  }
}
