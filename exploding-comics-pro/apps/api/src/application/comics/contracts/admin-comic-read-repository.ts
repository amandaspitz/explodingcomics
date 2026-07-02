import type { ComicStatus } from "../../../domain/comics/constants/comic-status";
import type { Locale } from "../../../domain/comics/constants/locales";
import type { AdminComicDetail } from "./admin-comic-command-repository";

export interface AdminComicSummary {
  id: number;
  issueNumber: number | null;
  slug: string | null;
  status: ComicStatus;
  publishedAt: string | null;
  updatedAt: string;
  translationLocales: Locale[];
  assetLocales: Locale[];
  shareLocales: Locale[];
}

export interface ListAdminComicsRepositoryInput {
  status?: ComicStatus;
  limit: number;
  offset: number;
}

export interface AdminComicReadRepository {
  listComics(input: ListAdminComicsRepositoryInput): Promise<AdminComicSummary[]>;
  findComicById(comicId: number): Promise<AdminComicDetail | null>;
}
