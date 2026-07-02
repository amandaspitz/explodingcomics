import { ApplicationError } from "../../shared/errors/application-error";
import type {
  AdminComicCommandRepository,
  AdminComicDetail,
} from "../contracts/admin-comic-command-repository";

export interface CreateAdminComicInput {
  issueNumber?: number | null;
  slug?: string | null;
  actorAdminUserId?: number | null;
}

export class CreateAdminComic {
  constructor(private readonly adminComicCommandRepository: AdminComicCommandRepository) {}

  async execute(input: CreateAdminComicInput): Promise<AdminComicDetail> {
    if (input.issueNumber === undefined && input.slug === undefined) {
      return this.adminComicCommandRepository.createDraftComic({
        issueNumber: null,
        slug: null,
        actorAdminUserId: input.actorAdminUserId ?? null,
      });
    }

    if (input.issueNumber === null && input.slug && !input.slug.trim()) {
      throw new ApplicationError({
        code: "INVALID_COMIC_SLUG",
        message: "Comic slug must not be blank.",
        statusCode: 400,
      });
    }

    return this.adminComicCommandRepository.createDraftComic({
      issueNumber: input.issueNumber ?? null,
      slug: input.slug?.trim() ?? null,
      actorAdminUserId: input.actorAdminUserId ?? null,
    });
  }
}
