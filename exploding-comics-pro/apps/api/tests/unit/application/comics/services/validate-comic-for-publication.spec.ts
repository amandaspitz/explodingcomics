import { describe, expect, it } from "vitest";

import { validateComicForPublication } from "../../../../../src/application/comics/services/validate-comic-for-publication";

describe("validateComicForPublication", () => {
  it("returns publishable when both locales, assets, and share metadata are complete", () => {
    const result = validateComicForPublication({
      id: 24,
      issueNumber: 24,
      slug: "24-2024",
      status: "draft",
      publishedAt: null,
      createdAt: "2026-07-02T17:00:00.000Z",
      updatedAt: "2026-07-02T17:00:00.000Z",
      translations: [
        {
          locale: "eng",
          title: "2024",
          bodyMarkdown: "English body",
          excerpt: null,
          seoTitle: null,
          seoDescription: null,
        },
        {
          locale: "pt",
          title: "2024",
          bodyMarkdown: "Corpo PT",
          excerpt: null,
          seoTitle: null,
          seoDescription: null,
        },
      ],
      assets: [
        {
          id: 1,
          locale: "eng",
          assetType: "comic_page",
          path: "assets/comics/eng/0024.jpg",
          mimeType: "image/jpeg",
          width: null,
          height: null,
          sortOrder: 0,
        },
        {
          id: 2,
          locale: "pt",
          assetType: "comic_page",
          path: "assets/comics/pt/0024-pt.jpg",
          mimeType: "image/jpeg",
          width: null,
          height: null,
          sortOrder: 0,
        },
      ],
      shareMetadata: [
        {
          locale: "eng",
          shareTitle: "Share EN",
          shareDescription: "Description EN",
          previewImagePath: "assets/share/eng/24.jpg",
        },
        {
          locale: "pt",
          shareTitle: "Share PT",
          shareDescription: "Description PT",
          previewImagePath: "assets/share/pt/24.jpg",
        },
      ],
    });

    expect(result.isPublishable).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it("returns explicit issues when publication requirements are missing", () => {
    const result = validateComicForPublication({
      id: 24,
      issueNumber: null,
      slug: null,
      status: "draft",
      publishedAt: null,
      createdAt: "2026-07-02T17:00:00.000Z",
      updatedAt: "2026-07-02T17:00:00.000Z",
      translations: [
        {
          locale: "eng",
          title: "",
          bodyMarkdown: "",
          excerpt: null,
          seoTitle: null,
          seoDescription: null,
        },
      ],
      assets: [],
      shareMetadata: [],
    });

    expect(result.isPublishable).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: "MISSING_ISSUE_NUMBER" }),
        expect.objectContaining({ code: "MISSING_SLUG" }),
        expect.objectContaining({ code: "EMPTY_TRANSLATION_TITLE", locale: "eng" }),
        expect.objectContaining({ code: "EMPTY_TRANSLATION_BODY", locale: "eng" }),
        expect.objectContaining({ code: "MISSING_TRANSLATION", locale: "pt" }),
        expect.objectContaining({ code: "MISSING_COMIC_PAGE_ASSET", locale: "eng" }),
        expect.objectContaining({ code: "MISSING_SHARE_METADATA", locale: "pt" }),
      ])
    );
  });
});
