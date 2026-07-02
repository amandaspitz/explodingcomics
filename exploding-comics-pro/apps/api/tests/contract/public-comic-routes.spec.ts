import request from "supertest";
import { describe, expect, it } from "vitest";

import { GetReadinessStatus } from "../../src/application/shared/use-cases/get-readiness-status";
import { createApp } from "../../src/app";
import { parseEnv } from "../../src/config/env";
import { createLogger } from "../../src/infrastructure/logging/create-logger";

function buildTestApp() {
  const env = parseEnv({
    NODE_ENV: "test",
    PORT: "3001",
    APP_NAME: "exploding-comics-pro-api-test",
    API_BASE_PATH: "/api/v1",
    CORS_ORIGIN: "*",
    LOG_LEVEL: "silent",
    DB_HOST: "127.0.0.1",
    DB_PORT: "3306",
    DB_NAME: "exploding_comics_pro_test",
    DB_USER: "root",
    DB_PASSWORD: "",
    DB_CONNECTION_LIMIT: "5",
    DB_CONNECT_TIMEOUT_MS: "1000",
    ADMIN_JWT_SECRET: "test-admin-jwt-secret-at-least-32-chars",
  });

  const logger = createLogger(env);
  const getReadinessStatus = new GetReadinessStatus({
    appName: env.APP_NAME,
    environment: env.NODE_ENV,
  });
  const listPublishedComics = {
    async execute() {
      return [
        {
          id: 24,
          issueNumber: 24,
          slug: "24-2024",
          publishedAt: "2026-07-02T16:00:00.000Z",
          translations: [
            {
              locale: "eng" as const,
              title: "2024",
              excerpt: "English excerpt",
            },
          ],
          shareMetadata: [
            {
              locale: "eng" as const,
              shareTitle: "2024",
              shareDescription: "English excerpt",
              previewImagePath: "assets/share/eng/24.jpg",
            },
          ],
        },
      ];
    },
  };
  const getPublishedComicByIdentifier = {
    async execute(identifier: { issueNumber?: number; slug?: string }) {
      const issueNumber = "issueNumber" in identifier ? identifier.issueNumber : undefined;
      const slug = "slug" in identifier ? identifier.slug : undefined;

      if (issueNumber !== 24) {
        if (slug !== "24-2024") {
          return null;
        }
      }

      return {
        id: 24,
        issueNumber: 24,
        slug: "24-2024",
        status: "published" as const,
        publishedAt: "2026-07-02T16:00:00.000Z",
        translations: [
          {
            locale: "eng" as const,
            title: "2024",
            bodyMarkdown: "English body",
            excerpt: "English excerpt",
            seoTitle: "SEO EN",
            seoDescription: "Description EN",
          },
        ],
        assets: [
          {
            locale: "eng" as const,
            assetType: "comic_page" as const,
            path: "assets/comics/eng/0024.jpg",
            mimeType: "image/jpeg",
            width: null,
            height: null,
            sortOrder: 1,
          },
        ],
        shareMetadata: [
          {
            locale: "eng" as const,
            shareTitle: "2024",
            shareDescription: "English excerpt",
            previewImagePath: "assets/share/eng/24.jpg",
          },
        ],
      };
    },
  };
  const getPublicComicStats = {
    async execute(input: { comicId: number; visitorId?: string }) {
      return {
        comicId: input.comicId,
        likesCount: 12,
        viewsCount: 48,
        likedByVisitor: input.visitorId ? true : null,
      };
    },
  };
  const loginAdminUser = {
    async execute() {
      throw new Error("not used in this test");
    },
  };
  const getAuthenticatedAdminUser = {
    async execute() {
      return {
        id: 1,
        email: "admin@example.com",
        status: "active",
        token: {
          adminUserId: 1,
          email: "admin@example.com",
          expiresAt: "2026-07-02T20:00:00.000Z",
        },
      };
    },
  };
  const listAdminComics = {
    async execute() {
      return [];
    },
  };
  const getAdminComicById = {
    async execute() {
      throw new Error("not used in this test");
    },
  };
  const registerComicView = {
    async execute() {
      return;
    },
  };
  const likeComic = registerComicView;
  const unlikeComic = registerComicView;
  const createAdminComic = {
    async execute() {
      throw new Error("not used in this test");
    },
  };
  const updateAdminComicMetadata = createAdminComic;
  const createAdminComicTranslation = createAdminComic;
  const updateAdminComicTranslation = createAdminComic;
  const createAdminComicAsset = createAdminComic;
  const upsertAdminComicShareMetadata = createAdminComic;
  const publishAdminComic = createAdminComic;

  return createApp({
    env,
    logger,
    getReadinessStatus,
    loginAdminUser,
    getAuthenticatedAdminUser,
    listAdminComics,
    getAdminComicById,
    listPublishedComics,
    getPublishedComicByIdentifier,
    getPublicComicStats,
    registerComicView,
    likeComic,
    unlikeComic,
    createAdminComic,
    updateAdminComicMetadata,
    createAdminComicTranslation,
    updateAdminComicTranslation,
    createAdminComicAsset,
    upsertAdminComicShareMetadata,
    publishAdminComic,
    archiveAdminComic: createAdminComic,
    unpublishAdminComic: createAdminComic,
  });
}

describe("public comic routes", () => {
  it("returns published comics for GET /api/v1/comics", async () => {
    const app = buildTestApp();

    const response = await request(app).get("/api/v1/comics?locale=eng&limit=10&offset=0");

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0]).toMatchObject({
      issueNumber: 24,
      slug: "24-2024",
    });
    expect(response.body.meta.limit).toBe(10);
  });

  it("returns a published comic detail for GET /api/v1/comics/:issueOrSlug", async () => {
    const app = buildTestApp();

    const response = await request(app).get("/api/v1/comics/24");

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      issueNumber: 24,
      slug: "24-2024",
      status: "published",
    });
  });

  it("returns public stats for GET /api/v1/comics/:issueOrSlug/stats", async () => {
    const app = buildTestApp();

    const response = await request(app).get(
      "/api/v1/comics/24/stats?visitorId=835f619f-f8ca-4d2b-b9aa-f1b3d92ca1e0"
    );

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      comicId: 24,
      issueNumber: 24,
      slug: "24-2024",
      likesCount: 12,
      viewsCount: 48,
      likedByVisitor: true,
    });
  });

  it("registers a view for POST /api/v1/comics/:issueOrSlug/views", async () => {
    const app = buildTestApp();

    const response = await request(app)
      .post("/api/v1/comics/24/views")
      .send({ visitorId: "835f619f-f8ca-4d2b-b9aa-f1b3d92ca1e0" });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      likesCount: 12,
      viewsCount: 48,
      likedByVisitor: true,
    });
  });

  it("registers a like for POST /api/v1/comics/:issueOrSlug/likes", async () => {
    const app = buildTestApp();

    const response = await request(app)
      .post("/api/v1/comics/24/likes")
      .send({ visitorId: "835f619f-f8ca-4d2b-b9aa-f1b3d92ca1e0" });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      likesCount: 12,
      likedByVisitor: true,
    });
  });

  it("returns 404 when a published comic is not found", async () => {
    const app = buildTestApp();

    const response = await request(app).get("/api/v1/comics/999");

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("COMIC_NOT_FOUND");
  });
});
