import type { Pool } from "mysql2/promise";

import type {
  AdminComicReadRepository,
  AdminComicSummary,
  ListAdminComicsRepositoryInput,
} from "../../../application/comics/contracts/admin-comic-read-repository";
import type { ComicStatus } from "../../../domain/comics/constants/comic-status";
import type { Locale } from "../../../domain/comics/constants/locales";
import type { AdminComicDetail } from "../../../application/comics/contracts/admin-comic-command-repository";

interface AdminComicListRow {
  id: number;
  issue_number: number | null;
  slug: string | null;
  status: ComicStatus;
  published_at: string | null;
  updated_at: string;
  translation_locale: Locale | null;
  asset_locale: Locale | null;
  share_locale: Locale | null;
}

interface AdminComicBaseRow {
  id: number;
  issue_number: number | null;
  slug: string | null;
  status: ComicStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

interface AdminComicTranslationRow {
  locale: Locale;
  title: string;
  body_markdown: string;
  excerpt: string | null;
  seo_title: string | null;
  seo_description: string | null;
}

interface AdminComicAssetRow {
  id: number;
  locale: Locale;
  asset_type: "comic_page" | "share_preview" | "cover";
  path: string;
  mime_type: string;
  width: number | null;
  height: number | null;
  sort_order: number;
}

interface AdminComicShareMetadataRow {
  locale: Locale;
  share_title: string;
  share_description: string;
  preview_image_path: string;
}

export class MySqlAdminComicReadRepository implements AdminComicReadRepository {
  constructor(private readonly mySqlPool: Pool) {}

  async listComics(input: ListAdminComicsRepositoryInput): Promise<AdminComicSummary[]> {
    const whereClause = input.status ? "WHERE c.status = ?" : "";
    const queryParameters = input.status
      ? [input.status, input.limit, input.offset]
      : [input.limit, input.offset];
    const [rowsRaw] = await this.mySqlPool.query(
      `
        SELECT
          paged_comics.id,
          paged_comics.issue_number,
          paged_comics.slug,
          paged_comics.status,
          paged_comics.published_at,
          paged_comics.updated_at,
          t.locale AS translation_locale,
          a.locale AS asset_locale,
          sm.locale AS share_locale
        FROM (
          SELECT
            c.id,
            c.issue_number,
            c.slug,
            c.status,
            c.published_at,
            c.updated_at
          FROM comics c
          ${whereClause}
          ORDER BY c.updated_at DESC, c.id DESC
          LIMIT ? OFFSET ?
        ) paged_comics
        LEFT JOIN comic_translations t
          ON t.comic_id = paged_comics.id
        LEFT JOIN comic_assets a
          ON a.comic_id = paged_comics.id
        LEFT JOIN comic_share_metadata sm
          ON sm.comic_id = paged_comics.id
        ORDER BY paged_comics.updated_at DESC, paged_comics.id DESC
      `,
      queryParameters
    );
    const rows = rowsRaw as AdminComicListRow[];
    const comicMap = new Map<number, AdminComicSummary>();

    for (const row of rows) {
      let comic = comicMap.get(row.id);

      if (!comic) {
        comic = {
          id: row.id,
          issueNumber: row.issue_number,
          slug: row.slug,
          status: row.status,
          publishedAt: row.published_at,
          updatedAt: row.updated_at,
          translationLocales: [],
          assetLocales: [],
          shareLocales: [],
        };
        comicMap.set(row.id, comic);
      }

      pushUniqueLocale(comic.translationLocales, row.translation_locale);
      pushUniqueLocale(comic.assetLocales, row.asset_locale);
      pushUniqueLocale(comic.shareLocales, row.share_locale);
    }

    return [...comicMap.values()];
  }

  async findComicById(comicId: number): Promise<AdminComicDetail | null> {
    const [baseRowsRaw] = await this.mySqlPool.execute(
      `
        SELECT
          c.id,
          c.issue_number,
          c.slug,
          c.status,
          c.published_at,
          c.created_at,
          c.updated_at
        FROM comics c
        WHERE c.id = ?
        LIMIT 1
      `,
      [comicId]
    );
    const baseRows = baseRowsRaw as AdminComicBaseRow[];
    const comic = baseRows[0];

    if (!comic) {
      return null;
    }

    const [translationRowsRaw] = await this.mySqlPool.execute(
      `
        SELECT
          locale,
          title,
          body_markdown,
          excerpt,
          seo_title,
          seo_description
        FROM comic_translations
        WHERE comic_id = ?
        ORDER BY locale ASC
      `,
      [comicId]
    );
    const [assetRowsRaw] = await this.mySqlPool.execute(
      `
        SELECT
          id,
          locale,
          asset_type,
          path,
          mime_type,
          width,
          height,
          sort_order
        FROM comic_assets
        WHERE comic_id = ?
        ORDER BY locale ASC, asset_type ASC, sort_order ASC
      `,
      [comicId]
    );
    const [shareRowsRaw] = await this.mySqlPool.execute(
      `
        SELECT
          locale,
          share_title,
          share_description,
          preview_image_path
        FROM comic_share_metadata
        WHERE comic_id = ?
        ORDER BY locale ASC
      `,
      [comicId]
    );
    const translations = translationRowsRaw as AdminComicTranslationRow[];
    const assets = assetRowsRaw as AdminComicAssetRow[];
    const shareMetadata = shareRowsRaw as AdminComicShareMetadataRow[];

    return {
      id: comic.id,
      issueNumber: comic.issue_number,
      slug: comic.slug,
      status: comic.status,
      publishedAt: comic.published_at,
      createdAt: comic.created_at,
      updatedAt: comic.updated_at,
      translations: translations.map((translation) => ({
        locale: translation.locale,
        title: translation.title,
        bodyMarkdown: translation.body_markdown,
        excerpt: translation.excerpt,
        seoTitle: translation.seo_title,
        seoDescription: translation.seo_description,
      })),
      assets: assets.map((asset) => ({
        id: asset.id,
        locale: asset.locale,
        assetType: asset.asset_type,
        path: asset.path,
        mimeType: asset.mime_type,
        width: asset.width,
        height: asset.height,
        sortOrder: asset.sort_order,
      })),
      shareMetadata: shareMetadata.map((share) => ({
        locale: share.locale,
        shareTitle: share.share_title,
        shareDescription: share.share_description,
        previewImagePath: share.preview_image_path,
      })),
    };
  }
}

function pushUniqueLocale(target: Locale[], locale: Locale | null): void {
  if (!locale || target.includes(locale)) {
    return;
  }

  target.push(locale);
}
