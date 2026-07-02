import type { AssetType } from "../../../domain/comics/constants/asset-types";
import type { Locale } from "../../../domain/comics/constants/locales";
import type { AdminComicDetail } from "../contracts/admin-comic-command-repository";

export interface PublishabilityIssue {
  code: string;
  message: string;
  locale?: Locale;
  field?: string;
}

export interface PublishabilityValidationResult {
  isPublishable: boolean;
  issues: PublishabilityIssue[];
}

const requiredPublicationLocales: readonly Locale[] = ["eng", "pt"];
const requiredAssetType: AssetType = "comic_page";

export function validateComicForPublication(
  comic: AdminComicDetail
): PublishabilityValidationResult {
  const issues: PublishabilityIssue[] = [];

  if (comic.issueNumber === null) {
    issues.push({
      code: "MISSING_ISSUE_NUMBER",
      field: "issueNumber",
      message: "A published comic must have an issue number.",
    });
  }

  if (!comic.slug?.trim()) {
    issues.push({
      code: "MISSING_SLUG",
      field: "slug",
      message: "A published comic must have a slug.",
    });
  }

  for (const locale of requiredPublicationLocales) {
    const translation = comic.translations.find((entry) => entry.locale === locale);

    if (!translation) {
      issues.push({
        code: "MISSING_TRANSLATION",
        locale,
        field: "translations",
        message: `A published comic must include a ${locale} translation.`,
      });
      continue;
    }

    if (!translation.title.trim()) {
      issues.push({
        code: "EMPTY_TRANSLATION_TITLE",
        locale,
        field: `translations.${locale}.title`,
        message: `The ${locale} translation title must not be empty.`,
      });
    }

    if (!translation.bodyMarkdown.trim()) {
      issues.push({
        code: "EMPTY_TRANSLATION_BODY",
        locale,
        field: `translations.${locale}.bodyMarkdown`,
        message: `The ${locale} translation body must not be empty.`,
      });
    }
  }

  for (const locale of requiredPublicationLocales) {
    const hasRequiredAsset = comic.assets.some(
      (asset) => asset.locale === locale && asset.assetType === requiredAssetType
    );

    if (!hasRequiredAsset) {
      issues.push({
        code: "MISSING_COMIC_PAGE_ASSET",
        locale,
        field: "assets",
        message: `A published comic must include at least one ${requiredAssetType} asset for ${locale}.`,
      });
    }
  }

  for (const locale of requiredPublicationLocales) {
    const shareMetadata = comic.shareMetadata.find((entry) => entry.locale === locale);

    if (!shareMetadata) {
      issues.push({
        code: "MISSING_SHARE_METADATA",
        locale,
        field: "shareMetadata",
        message: `A published comic must include share metadata for ${locale}.`,
      });
      continue;
    }

    if (!shareMetadata.shareTitle.trim()) {
      issues.push({
        code: "EMPTY_SHARE_TITLE",
        locale,
        field: `shareMetadata.${locale}.shareTitle`,
        message: `The ${locale} share title must not be empty.`,
      });
    }

    if (!shareMetadata.shareDescription.trim()) {
      issues.push({
        code: "EMPTY_SHARE_DESCRIPTION",
        locale,
        field: `shareMetadata.${locale}.shareDescription`,
        message: `The ${locale} share description must not be empty.`,
      });
    }

    if (!shareMetadata.previewImagePath.trim()) {
      issues.push({
        code: "EMPTY_SHARE_PREVIEW_PATH",
        locale,
        field: `shareMetadata.${locale}.previewImagePath`,
        message: `The ${locale} share preview image path must not be empty.`,
      });
    }
  }

  return {
    isPublishable: issues.length === 0,
    issues,
  };
}
