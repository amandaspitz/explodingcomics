import type {
  ComicAssetRecord,
  ComicReadRepository,
  ComicShareMetadataRecord,
  ComicTranslationDetail,
  ComicTranslationSummary,
  ListPublishedComicsRepositoryInput,
  PublishedComicDetail,
  PublishedComicSummary,
} from "../../../application/comics/contracts/comic-read-repository";
import type { ComicStatus } from "../../../domain/comics/constants/comic-status";
import type { Locale } from "../../../domain/comics/constants/locales";
import type { DatabaseQueryExecutor } from "./database-query-executor";

interface PublishedComicListRow {
  comic_id: number;
  issue_number: number;
  slug: string;
  published_at: string | null;
  translation_locale: Locale;
  translation_title: string;
  translation_excerpt: string | null;
  share_title: string | null;
  share_description: string | null;
  preview_image_path: string | null;
}

interface PublishedComicBaseRow {
  id: number;
  issue_number: number;
  slug: string;
  status: ComicStatus;
  published_at: string | null;
}

interface PublishedComicTranslationRow {
  locale: Locale;
  title: string;
  body_markdown: string;
  excerpt: string | null;
  seo_title: string | null;
  seo_description: string | null;
}

interface PublishedComicAssetRow {
  locale: Locale;
  asset_type: ComicAssetRecord["assetType"];
  path: string;
  mime_type: string;
  width: number | null;
  height: number | null;
  sort_order: number;
}

interface PublishedComicShareMetadataRow {
  locale: Locale;
  share_title: string;
  share_description: string;
  preview_image_path: string;
}

export class MySqlComicReadRepository implements ComicReadRepository {
  constructor(private readonly databaseQueryExecutor: DatabaseQueryExecutor) {}

  async listPublishedComics(
    input: ListPublishedComicsRepositoryInput
  ): Promise<PublishedComicSummary[]> {
    const rows = await this.databaseQueryExecutor.query<PublishedComicListRow>(
      `
        SELECT
          paged_comics.id AS comic_id,
          paged_comics.issue_number,
          paged_comics.slug,
          paged_comics.published_at,
          t.locale AS translation_locale,
          t.title AS translation_title,
          t.excerpt AS translation_excerpt,
          sm.share_title,
          sm.share_description,
          sm.preview_image_path
        FROM (
          SELECT
            c.id,
            c.issue_number,
            c.slug,
            c.published_at
          FROM comics c
          WHERE c.status = 'published'
            AND (
              ? IS NULL
              OR EXISTS (
                SELECT 1
                FROM comic_translations ct
                WHERE ct.comic_id = c.id
                  AND ct.locale = ?
              )
            )
          ORDER BY c.issue_number DESC
          LIMIT ? OFFSET ?
        ) paged_comics
        INNER JOIN comic_translations t
          ON t.comic_id = paged_comics.id
        LEFT JOIN comic_share_metadata sm
          ON sm.comic_id = paged_comics.id
         AND sm.locale = t.locale
        WHERE ? IS NULL OR t.locale = ?
        ORDER BY paged_comics.issue_number DESC, t.locale ASC
      `,
      [
        input.locale ?? null,
        input.locale ?? null,
        input.limit,
        input.offset,
        input.locale ?? null,
        input.locale ?? null,
      ]
    );

    const comicMap = new Map<number, PublishedComicSummary>();

    for (const row of rows) {
      const existingComic = comicMap.get(row.comic_id);
      const translation: ComicTranslationSummary = {
        locale: row.translation_locale,
        title: row.translation_title,
        excerpt: row.translation_excerpt,
      };

      if (!existingComic) {
        comicMap.set(row.comic_id, {
          id: row.comic_id,
          issueNumber: row.issue_number,
          slug: row.slug,
          publishedAt: row.published_at,
          translations: [translation],
          shareMetadata: this.mapOptionalShareMetadata(row),
        });

        continue;
      }

      existingComic.translations.push(translation);

      if (row.preview_image_path) {
        existingComic.shareMetadata.push({
          locale: row.translation_locale,
          shareTitle: row.share_title ?? translation.title,
          shareDescription: row.share_description ?? translation.excerpt ?? "",
          previewImagePath: row.preview_image_path,
        });
      }
    }

    return [...comicMap.values()];
  }

  async findPublishedComicByIssueNumber(
    issueNumber: number
  ): Promise<PublishedComicDetail | null> {
    return this.findPublishedComic({
      clause: "c.issue_number = ?",
      parameters: [issueNumber],
    });
  }

  async findPublishedComicBySlug(slug: string): Promise<PublishedComicDetail | null> {
    return this.findPublishedComic({
      clause: "c.slug = ?",
      parameters: [slug],
    });
  }

  private async findPublishedComic(input: {
    clause: string;
    parameters: readonly (string | number)[];
  }): Promise<PublishedComicDetail | null> {
    const baseRows = await this.databaseQueryExecutor.query<PublishedComicBaseRow>(
      `
        SELECT
          c.id,
          c.issue_number,
          c.slug,
          c.status,
          c.published_at
        FROM comics c
        WHERE c.status = 'published'
          AND ${input.clause}
        LIMIT 1
      `,
      input.parameters
    );
    const comic = baseRows[0];

    if (!comic) {
      return null;
    }

    const translations = await this.databaseQueryExecutor.query<PublishedComicTranslationRow>(
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
      [comic.id]
    );
    const assets = await this.databaseQueryExecutor.query<PublishedComicAssetRow>(
      `
        SELECT
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
      [comic.id]
    );
    const shareMetadata = await this.databaseQueryExecutor.query<PublishedComicShareMetadataRow>(
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
      [comic.id]
    );

    return {
      id: comic.id,
      issueNumber: comic.issue_number,
      slug: comic.slug,
      status: comic.status,
      publishedAt: comic.published_at,
      translations: translations.map<ComicTranslationDetail>((translation) => ({
        locale: translation.locale,
        title: translation.title,
        bodyMarkdown: translation.body_markdown,
        excerpt: translation.excerpt,
        seoTitle: translation.seo_title,
        seoDescription: translation.seo_description,
      })),
      assets: assets.map<ComicAssetRecord>((asset) => ({
        locale: asset.locale,
        assetType: asset.asset_type,
        path: asset.path,
        mimeType: asset.mime_type,
        width: asset.width,
        height: asset.height,
        sortOrder: asset.sort_order,
      })),
      shareMetadata: shareMetadata.map<ComicShareMetadataRecord>((share) => ({
        locale: share.locale,
        shareTitle: share.share_title,
        shareDescription: share.share_description,
        previewImagePath: share.preview_image_path,
      })),
    };
  }

  private mapOptionalShareMetadata(
    row: PublishedComicListRow
  ): ComicShareMetadataRecord[] {
    if (!row.preview_image_path) {
      return [];
    }

    return [
      {
        locale: row.translation_locale,
        shareTitle: row.share_title ?? row.translation_title,
        shareDescription: row.share_description ?? row.translation_excerpt ?? "",
        previewImagePath: row.preview_image_path,
      },
    ];
  }
}
