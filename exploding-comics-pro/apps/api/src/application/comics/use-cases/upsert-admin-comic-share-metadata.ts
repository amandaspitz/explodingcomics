import { ApplicationError } from "../../shared/errors/application-error";
import type {
  AdminComicCommandRepository,
  AdminComicDetail,
} from "../contracts/admin-comic-command-repository";
import type { Locale } from "../../../domain/comics/constants/locales";

export interface UpsertAdminComicShareMetadataInput {
  comicId: number;
  locale: Locale;
  shareTitle: string;
  shareDescription: string;
  previewImagePath: string;
  actorAdminUserId?: number | null;
}

export class UpsertAdminComicShareMetadata {
  constructor(private readonly adminComicCommandRepository: AdminComicCommandRepository) {}

  async execute(input: UpsertAdminComicShareMetadataInput): Promise<AdminComicDetail> {
    const comic = await this.adminComicCommandRepository.findComicById(input.comicId);

    if (!comic) {
      throw new ApplicationError({
        code: "ADMIN_COMIC_NOT_FOUND",
        message: `Comic ${input.comicId} was not found.`,
        statusCode: 404,
      });
    }

    return this.adminComicCommandRepository.upsertComicShareMetadata(input.comicId, {
      locale: input.locale,
      shareTitle: input.shareTitle.trim(),
      shareDescription: input.shareDescription.trim(),
      previewImagePath: input.previewImagePath.trim(),
      actorAdminUserId: input.actorAdminUserId ?? null,
    });
  }
}
