import { ApplicationError } from "../../shared/errors/application-error";
import type {
  AdminComicCommandRepository,
  AdminComicDetail,
  UpdateAdminComicMetadataInput as RepositoryInput,
} from "../contracts/admin-comic-command-repository";

export interface UpdateAdminComicMetadataInput {
  comicId: number;
  issueNumber?: number | null;
  slug?: string | null;
  actorAdminUserId?: number | null;
}

export class UpdateAdminComicMetadata {
  constructor(private readonly adminComicCommandRepository: AdminComicCommandRepository) {}

  async execute(input: UpdateAdminComicMetadataInput): Promise<AdminComicDetail> {
    if (input.issueNumber === undefined && input.slug === undefined) {
      throw new ApplicationError({
        code: "EMPTY_METADATA_UPDATE",
        message: "At least one metadata field must be provided for update.",
        statusCode: 400,
      });
    }

    const comic = await this.adminComicCommandRepository.findComicById(input.comicId);

    if (!comic) {
      throw new ApplicationError({
        code: "ADMIN_COMIC_NOT_FOUND",
        message: `Comic ${input.comicId} was not found.`,
        statusCode: 404,
      });
    }

    const repositoryInput: RepositoryInput = {
      actorAdminUserId: input.actorAdminUserId ?? null,
      ...(input.issueNumber !== undefined ? { issueNumber: input.issueNumber } : {}),
      ...(input.slug !== undefined ? { slug: input.slug?.trim() ?? null } : {}),
    };
    const updatedComic = await this.adminComicCommandRepository.updateComicMetadata(
      input.comicId,
      repositoryInput
    );

    if (!updatedComic) {
      throw new ApplicationError({
        code: "ADMIN_COMIC_NOT_FOUND",
        message: `Comic ${input.comicId} was not found.`,
        statusCode: 404,
      });
    }

    return updatedComic;
  }
}
