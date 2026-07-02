import type { AssetType } from "../../../domain/comics/constants/asset-types";
import type { ComicStatus } from "../../../domain/comics/constants/comic-status";
import type { Locale } from "../../../domain/comics/constants/locales";

export interface AdminComicTranslationRecord {
  locale: Locale;
  title: string;
  bodyMarkdown: string;
  excerpt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
}

export interface AdminComicAssetRecord {
  id: number;
  locale: Locale;
  assetType: AssetType;
  path: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  sortOrder: number;
}

export interface AdminComicShareMetadataRecord {
  locale: Locale;
  shareTitle: string;
  shareDescription: string;
  previewImagePath: string;
}

export interface AdminComicDetail {
  id: number;
  issueNumber: number | null;
  slug: string | null;
  status: ComicStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  translations: AdminComicTranslationRecord[];
  assets: AdminComicAssetRecord[];
  shareMetadata: AdminComicShareMetadataRecord[];
}

export interface CreateAdminComicInput {
  issueNumber: number | null;
  slug: string | null;
  actorAdminUserId: number | null;
}

export interface UpdateAdminComicMetadataInput {
  issueNumber?: number | null;
  slug?: string | null;
  actorAdminUserId: number | null;
}

export interface CreateAdminComicTranslationInput {
  locale: Locale;
  title: string;
  bodyMarkdown: string;
  excerpt: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  actorAdminUserId: number | null;
}

export type UpdateAdminComicTranslationInput = CreateAdminComicTranslationInput;

export interface CreateAdminComicAssetInput {
  locale: Locale;
  assetType: AssetType;
  path: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  sortOrder: number;
  actorAdminUserId: number | null;
}

export interface UpsertAdminComicShareMetadataInput {
  locale: Locale;
  shareTitle: string;
  shareDescription: string;
  previewImagePath: string;
  actorAdminUserId: number | null;
}

export interface PublishAdminComicInput {
  actorAdminUserId: number | null;
  publishedAt: Date;
}

export interface ArchiveAdminComicRepositoryInput {
  actorAdminUserId: number | null;
}

export interface UnpublishAdminComicRepositoryInput {
  actorAdminUserId: number | null;
}

export interface AdminComicCommandRepository {
  findComicById(comicId: number): Promise<AdminComicDetail | null>;
  createDraftComic(input: CreateAdminComicInput): Promise<AdminComicDetail>;
  updateComicMetadata(
    comicId: number,
    input: UpdateAdminComicMetadataInput
  ): Promise<AdminComicDetail | null>;
  createComicTranslation(
    comicId: number,
    input: CreateAdminComicTranslationInput
  ): Promise<AdminComicDetail>;
  updateComicTranslation(
    comicId: number,
    locale: Locale,
    input: UpdateAdminComicTranslationInput
  ): Promise<AdminComicDetail>;
  createComicAsset(
    comicId: number,
    input: CreateAdminComicAssetInput
  ): Promise<AdminComicDetail>;
  upsertComicShareMetadata(
    comicId: number,
    input: UpsertAdminComicShareMetadataInput
  ): Promise<AdminComicDetail>;
  publishComic(comicId: number, input: PublishAdminComicInput): Promise<AdminComicDetail>;
  archiveComic(
    comicId: number,
    input: ArchiveAdminComicRepositoryInput
  ): Promise<AdminComicDetail>;
  unpublishComic(
    comicId: number,
    input: UnpublishAdminComicRepositoryInput
  ): Promise<AdminComicDetail>;
}
