import { ApplicationError } from "../../shared/errors/application-error";
import type {
  AdminComicCommandRepository,
  AdminComicDetail,
} from "../contracts/admin-comic-command-repository";
import { validateComicForPublication } from "../services/validate-comic-for-publication";

export interface PublishAdminComicInput {
  comicId: number;
  actorAdminUserId?: number | null;
}

export class PublishAdminComic {
  constructor(private readonly adminComicCommandRepository: AdminComicCommandRepository) {}

  async execute(input: PublishAdminComicInput): Promise<AdminComicDetail> {
    const comic = await this.adminComicCommandRepository.findComicById(input.comicId);

    if (!comic) {
      throw new ApplicationError({
        code: "ADMIN_COMIC_NOT_FOUND",
        message: `Comic ${input.comicId} was not found.`,
        statusCode: 404,
      });
    }

    if (comic.status === "published") {
      throw new ApplicationError({
        code: "COMIC_ALREADY_PUBLISHED",
        message: `Comic ${input.comicId} is already published.`,
        statusCode: 409,
      });
    }

    if (comic.status === "archived") {
      throw new ApplicationError({
        code: "INVALID_COMIC_STATUS_TRANSITION",
        message: `Archived comic ${input.comicId} must return to draft before publishing.`,
        statusCode: 409,
      });
    }

    const validation = validateComicForPublication(comic);

    if (!validation.isPublishable) {
      throw new ApplicationError({
        code: "COMIC_NOT_PUBLISHABLE",
        message: `Comic ${input.comicId} does not satisfy publication rules.`,
        statusCode: 409,
        details: validation.issues,
      });
    }

    return this.adminComicCommandRepository.publishComic(input.comicId, {
      actorAdminUserId: input.actorAdminUserId ?? null,
      publishedAt: new Date(),
    });
  }
}
