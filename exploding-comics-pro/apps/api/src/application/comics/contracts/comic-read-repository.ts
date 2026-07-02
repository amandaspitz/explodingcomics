import type { AssetType } from "../../../domain/comics/constants/asset-types";
import type { ComicStatus } from "../../../domain/comics/constants/comic-status";
import type { Locale } from "../../../domain/comics/constants/locales";

export interface ComicTranslationSummary {
  locale: Locale;
  title: string;
  excerpt: string | null;
}

export interface ComicTranslationDetail extends ComicTranslationSummary {
  bodyMarkdown: string;
  seoTitle: string | null;
  seoDescription: string | null;
}

export interface ComicAssetRecord {
  locale: Locale;
  assetType: AssetType;
  path: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  sortOrder: number;
}

export interface ComicShareMetadataRecord {
  locale: Locale;
  shareTitle: string;
  shareDescription: string;
  previewImagePath: string;
}

export interface PublishedComicSummary {
  id: number;
  issueNumber: number;
  slug: string;
  publishedAt: string | null;
  translations: ComicTranslationSummary[];
  shareMetadata: ComicShareMetadataRecord[];
}

export interface PublishedComicDetail extends PublishedComicSummary {
  status: ComicStatus;
  translations: ComicTranslationDetail[];
  assets: ComicAssetRecord[];
}

export interface ListPublishedComicsRepositoryInput {
  locale?: Locale;
  limit: number;
  offset: number;
}

export interface ComicReadRepository {
  listPublishedComics(input: ListPublishedComicsRepositoryInput): Promise<PublishedComicSummary[]>;
  findPublishedComicByIssueNumber(issueNumber: number): Promise<PublishedComicDetail | null>;
  findPublishedComicBySlug(slug: string): Promise<PublishedComicDetail | null>;
}
