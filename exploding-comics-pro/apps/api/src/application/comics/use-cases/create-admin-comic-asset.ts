import { ApplicationError } from "../../shared/errors/application-error";
import type {
  AdminComicCommandRepository,
  AdminComicDetail,
} from "../contracts/admin-comic-command-repository";
import type { AssetType } from "../../../domain/comics/constants/asset-types";
import type { Locale } from "../../../domain/comics/constants/locales";

export interface CreateAdminComicAssetInput {
  comicId: number;
  locale: Locale;
  assetType: AssetType;
  path: string;
  mimeType: string;
  width?: number | null;
  height?: number | null;
  sortOrder: number;
  actorAdminUserId?: number | null;
}

export class CreateAdminComicAsset {
  constructor(private readonly adminComicCommandRepository: AdminComicCommandRepository) {}

  async execute(input: CreateAdminComicAssetInput): Promise<AdminComicDetail> {
    const comic = await this.adminComicCommandRepository.findComicById(input.comicId);

    if (!comic) {
      throw new ApplicationError({
        code: "ADMIN_COMIC_NOT_FOUND",
        message: `Comic ${input.comicId} was not found.`,
        statusCode: 404,
      });
    }

    return this.adminComicCommandRepository.createComicAsset(input.comicId, {
      locale: input.locale,
      assetType: input.assetType,
      path: input.path.trim(),
      mimeType: input.mimeType.trim(),
      width: input.width ?? null,
      height: input.height ?? null,
      sortOrder: input.sortOrder,
      actorAdminUserId: input.actorAdminUserId ?? null,
    });
  }
}
