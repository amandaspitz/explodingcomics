import { describe, expect, it } from "vitest";

import type { DatabaseQueryExecutor } from "../../../../../src/infrastructure/database/mysql/database-query-executor";
import { MySqlComicReadRepository } from "../../../../../src/infrastructure/database/mysql/mysql-comic-read-repository";

class FakeDatabaseQueryExecutor implements DatabaseQueryExecutor {
  readonly calls: Array<{
    sql: string;
    parameters: readonly (string | number | boolean | Date | null)[];
  }> = [];

  private readonly queuedResults: object[][] = [];

  queueResult(rows: object[]): void {
    this.queuedResults.push(rows);
  }

  async query<T extends object>(
    sql: string,
    parameters: readonly (string | number | boolean | Date | null)[] = []
  ): Promise<T[]> {
    this.calls.push({
      sql,
      parameters,
    });

    const nextResult = this.queuedResults.shift();

    if (!nextResult) {
      throw new Error("No query result queued for test.");
    }

    return nextResult as T[];
  }
}

describe("MySqlComicReadRepository", () => {
  it("maps a list of published comics grouped by comic", async () => {
    const databaseQueryExecutor = new FakeDatabaseQueryExecutor();
    const repository = new MySqlComicReadRepository(databaseQueryExecutor);

    databaseQueryExecutor.queueResult([
      {
        comic_id: 10,
        issue_number: 24,
        slug: "2024",
        published_at: "2026-07-01T00:00:00.000Z",
        translation_locale: "eng",
        translation_title: "2024",
        translation_excerpt: "English excerpt",
        share_title: "Share title EN",
        share_description: "Share description EN",
        preview_image_path: "/assets/share/eng/24.jpg",
      },
      {
        comic_id: 10,
        issue_number: 24,
        slug: "2024",
        published_at: "2026-07-01T00:00:00.000Z",
        translation_locale: "pt",
        translation_title: "2024",
        translation_excerpt: "Resumo PT",
        share_title: "Share title PT",
        share_description: "Share description PT",
        preview_image_path: "/assets/share/pt/24.jpg",
      },
    ]);

    const result = await repository.listPublishedComics({
      limit: 20,
      offset: 0,
    });

    expect(result).toEqual([
      {
        id: 10,
        issueNumber: 24,
        slug: "2024",
        publishedAt: "2026-07-01T00:00:00.000Z",
        translations: [
          {
            locale: "eng",
            title: "2024",
            excerpt: "English excerpt",
          },
          {
            locale: "pt",
            title: "2024",
            excerpt: "Resumo PT",
          },
        ],
        shareMetadata: [
          {
            locale: "eng",
            shareTitle: "Share title EN",
            shareDescription: "Share description EN",
            previewImagePath: "/assets/share/eng/24.jpg",
          },
          {
            locale: "pt",
            shareTitle: "Share title PT",
            shareDescription: "Share description PT",
            previewImagePath: "/assets/share/pt/24.jpg",
          },
        ],
      },
    ]);
    expect(databaseQueryExecutor.calls[0]?.parameters).toEqual([
      null,
      null,
      20,
      0,
      null,
      null,
    ]);
    expect(databaseQueryExecutor.calls[0]?.sql).toContain("FROM (");
    expect(databaseQueryExecutor.calls[0]?.sql).toContain("LIMIT ? OFFSET ?");
  });

  it("maps a published comic detail by issue number", async () => {
    const databaseQueryExecutor = new FakeDatabaseQueryExecutor();
    const repository = new MySqlComicReadRepository(databaseQueryExecutor);

    databaseQueryExecutor.queueResult([
      {
        id: 10,
        issue_number: 24,
        slug: "2024",
        status: "published",
        published_at: "2026-07-01T00:00:00.000Z",
      },
    ]);
    databaseQueryExecutor.queueResult([
      {
        locale: "eng",
        title: "2024",
        body_markdown: "English body",
        excerpt: "English excerpt",
        seo_title: "SEO EN",
        seo_description: "Description EN",
      },
      {
        locale: "pt",
        title: "2024",
        body_markdown: "Corpo PT",
        excerpt: "Resumo PT",
        seo_title: "SEO PT",
        seo_description: "Descricao PT",
      },
    ]);
    databaseQueryExecutor.queueResult([
      {
        locale: "eng",
        asset_type: "comic_page",
        path: "assets/comics/eng/0024.jpg",
        mime_type: "image/jpeg",
        width: 1200,
        height: 1800,
        sort_order: 1,
      },
      {
        locale: "pt",
        asset_type: "comic_page",
        path: "assets/comics/pt/0024-pt.jpg",
        mime_type: "image/jpeg",
        width: 1200,
        height: 1800,
        sort_order: 1,
      },
    ]);
    databaseQueryExecutor.queueResult([
      {
        locale: "eng",
        share_title: "Share title EN",
        share_description: "Share description EN",
        preview_image_path: "/assets/share/eng/24.jpg",
      },
      {
        locale: "pt",
        share_title: "Share title PT",
        share_description: "Share description PT",
        preview_image_path: "/assets/share/pt/24.jpg",
      },
    ]);

    const result = await repository.findPublishedComicByIssueNumber(24);

    expect(result).toEqual({
      id: 10,
      issueNumber: 24,
      slug: "2024",
      status: "published",
      publishedAt: "2026-07-01T00:00:00.000Z",
      translations: [
        {
          locale: "eng",
          title: "2024",
          bodyMarkdown: "English body",
          excerpt: "English excerpt",
          seoTitle: "SEO EN",
          seoDescription: "Description EN",
        },
        {
          locale: "pt",
          title: "2024",
          bodyMarkdown: "Corpo PT",
          excerpt: "Resumo PT",
          seoTitle: "SEO PT",
          seoDescription: "Descricao PT",
        },
      ],
      assets: [
        {
          locale: "eng",
          assetType: "comic_page",
          path: "assets/comics/eng/0024.jpg",
          mimeType: "image/jpeg",
          width: 1200,
          height: 1800,
          sortOrder: 1,
        },
        {
          locale: "pt",
          assetType: "comic_page",
          path: "assets/comics/pt/0024-pt.jpg",
          mimeType: "image/jpeg",
          width: 1200,
          height: 1800,
          sortOrder: 1,
        },
      ],
      shareMetadata: [
        {
          locale: "eng",
          shareTitle: "Share title EN",
          shareDescription: "Share description EN",
          previewImagePath: "/assets/share/eng/24.jpg",
        },
        {
          locale: "pt",
          shareTitle: "Share title PT",
          shareDescription: "Share description PT",
          previewImagePath: "/assets/share/pt/24.jpg",
        },
      ],
    });
    expect(databaseQueryExecutor.calls).toHaveLength(4);
  });
});
