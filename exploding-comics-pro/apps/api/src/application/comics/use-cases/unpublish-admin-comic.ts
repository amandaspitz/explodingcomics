import { ApplicationError } from "../../shared/errors/application-error";
import type {
  AdminComicCommandRepository,
  AdminComicDetail,
} from "../contracts/admin-comic-command-repository";

export interface UnpublishAdminComicInput {
  comicId: number;
  actorAdminUserId?: number | null;
}

export class UnpublishAdminComic {
  constructor(private readonly adminComicCommandRepository: AdminComicCommandRepository) {}

  async execute(input: UnpublishAdminComicInput): Promise<AdminComicDetail> {
    const comic = await this.adminComicCommandRepository.findComicById(input.comicId);

    if (!comic) {
      throw new ApplicationError({
        code: "ADMIN_COMIC_NOT_FOUND",
        message: `Comic ${input.comicId} was not found.`,
        statusCode: 404,
      });
    }

    if (comic.status !== "published") {
      throw new ApplicationError({
        code: "INVALID_COMIC_STATUS_TRANSITION",
        message: `Only published comics can be unpublished back to draft.`,
        statusCode: 409,
      });
    }

    return this.adminComicCommandRepository.unpublishComic(input.comicId, {
      actorAdminUserId: input.actorAdminUserId ?? null,
    });
  }
}
