import { ApplicationError } from "../../shared/errors/application-error";
import type {
  AdminComicCommandRepository,
  AdminComicDetail,
} from "../contracts/admin-comic-command-repository";
import type { Locale } from "../../../domain/comics/constants/locales";

export interface UpdateAdminComicTranslationInput {
  comicId: number;
  locale: Locale;
  title: string;
  bodyMarkdown: string;
  excerpt?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  actorAdminUserId?: number | null;
}

export class UpdateAdminComicTranslation {
  constructor(private readonly adminComicCommandRepository: AdminComicCommandRepository) {}

  async execute(input: UpdateAdminComicTranslationInput): Promise<AdminComicDetail> {
    const comic = await this.adminComicCommandRepository.findComicById(input.comicId);

    if (!comic) {
      throw new ApplicationError({
        code: "ADMIN_COMIC_NOT_FOUND",
        message: `Comic ${input.comicId} was not found.`,
        statusCode: 404,
      });
    }

    if (!comic.translations.some((translation) => translation.locale === input.locale)) {
      throw new ApplicationError({
        code: "COMIC_TRANSLATION_NOT_FOUND",
        message: `Comic ${input.comicId} does not have a translation for locale "${input.locale}".`,
        statusCode: 404,
      });
    }

    return this.adminComicCommandRepository.updateComicTranslation(input.comicId, input.locale, {
      locale: input.locale,
      title: input.title.trim(),
      bodyMarkdown: input.bodyMarkdown.trim(),
      excerpt: input.excerpt?.trim() || null,
      seoTitle: input.seoTitle?.trim() || null,
      seoDescription: input.seoDescription?.trim() || null,
      actorAdminUserId: input.actorAdminUserId ?? null,
    });
  }
}
