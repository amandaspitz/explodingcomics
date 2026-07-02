import request from "supertest";
import { describe, expect, it } from "vitest";

import { ApplicationError } from "../../src/application/shared/errors/application-error";
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
      return [];
    },
  };
  const getPublishedComicByIdentifier = {
    async execute() {
      return null;
    },
  };
  const getPublicComicStats = {
    async execute(input: { comicId: number }) {
      return {
        comicId: input.comicId,
        likesCount: 0,
        viewsCount: 0,
        likedByVisitor: null,
      };
    },
  };
  const loginAdminUser = {
    async execute() {
      return {
        accessToken: "test-access-token",
        adminUser: {
          id: 1,
          email: "admin@example.com",
          status: "active",
        },
      };
    },
  };
  const getAuthenticatedAdminUser = {
    async execute(accessToken: string) {
      if (accessToken !== "test-access-token") {
        throw new ApplicationError({
          code: "ADMIN_AUTHENTICATION_REQUIRED",
          message: "A valid admin access token is required.",
          statusCode: 401,
        });
      }

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
      return [
        {
          id: 101,
          issueNumber: 24,
          slug: "24-2024",
          status: "draft" as const,
          publishedAt: null,
          updatedAt: "2026-07-02T17:00:00.000Z",
          translationLocales: ["eng" as const],
          assetLocales: ["eng" as const],
          shareLocales: ["eng" as const],
        },
      ];
    },
  };
  const getAdminComicById = {
    async execute() {
      return buildComicDetail({
        id: 101,
        issueNumber: 24,
        slug: "24-2024",
        status: "draft",
      });
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
      return buildComicDetail({
        id: 101,
        issueNumber: null,
        slug: null,
        status: "draft",
      });
    },
  };
  const updateAdminComicMetadata = {
    async execute() {
      return buildComicDetail({
        id: 101,
        issueNumber: 24,
        slug: "24-2024",
        status: "draft",
      });
    },
  };
  const createAdminComicTranslation = {
    async execute() {
      return buildComicDetail({
        id: 101,
        issueNumber: 24,
        slug: "24-2024",
        status: "draft",
        translations: [
          {
            locale: "eng",
            title: "2024",
            bodyMarkdown: "English body",
            excerpt: "English excerpt",
            seoTitle: null,
            seoDescription: null,
          },
        ],
      });
    },
  };
  const updateAdminComicTranslation = {
    async execute() {
      return buildComicDetail({
        id: 101,
        issueNumber: 24,
        slug: "24-2024",
        status: "draft",
        translations: [
          {
            locale: "eng",
            title: "Updated title",
            bodyMarkdown: "Updated body",
            excerpt: null,
            seoTitle: null,
            seoDescription: null,
          },
        ],
      });
    },
  };
  const createAdminComicAsset = {
    async execute() {
      return buildComicDetail({
        id: 101,
        issueNumber: 24,
        slug: "24-2024",
        status: "draft",
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
        ],
      });
    },
  };
  const upsertAdminComicShareMetadata = {
    async execute() {
      return buildComicDetail({
        id: 101,
        issueNumber: 24,
        slug: "24-2024",
        status: "draft",
        shareMetadata: [
          {
            locale: "eng",
            shareTitle: "Share title",
            shareDescription: "Share description",
            previewImagePath: "assets/share/eng/24.jpg",
          },
        ],
      });
    },
  };
  const publishAdminComic = {
    async execute(input: { comicId: number }) {
      if (input.comicId === 404) {
        throw new ApplicationError({
          code: "COMIC_NOT_PUBLISHABLE",
          message: "Comic 404 does not satisfy publication rules.",
          statusCode: 409,
          details: [{ code: "MISSING_TRANSLATION", locale: "pt" }],
        });
      }

      return buildComicDetail({
        id: 101,
        issueNumber: 24,
        slug: "24-2024",
        status: "published",
        publishedAt: "2026-07-02T17:10:00.000Z",
      });
    },
  };
  const archiveAdminComic = {
    async execute() {
      return buildComicDetail({
        id: 101,
        issueNumber: 24,
        slug: "24-2024",
        status: "archived",
      });
    },
  };
  const unpublishAdminComic = {
    async execute() {
      return buildComicDetail({
        id: 101,
        issueNumber: 24,
        slug: "24-2024",
        status: "draft",
      });
    },
  };

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
    archiveAdminComic,
    unpublishAdminComic,
  });
}

describe("admin comic routes", () => {
  it("returns a token for POST /api/v1/admin/auth/login", async () => {
    const app = buildTestApp();

    const response = await request(app)
      .post("/api/v1/admin/auth/login")
      .send({ email: "admin@example.com", password: "secret" });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      accessToken: "test-access-token",
      adminUser: {
        email: "admin@example.com",
      },
    });
  });

  it("protects admin routes without a token", async () => {
    const app = buildTestApp();

    const response = await request(app).get("/api/v1/admin/comics");

    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe("ADMIN_AUTHENTICATION_REQUIRED");
  });

  it("lists editorial comics for GET /api/v1/admin/comics", async () => {
    const app = buildTestApp();

    const response = await request(app)
      .get("/api/v1/admin/comics")
      .set("authorization", "Bearer test-access-token");

    expect(response.status).toBe(200);
    expect(response.body.data[0]).toMatchObject({
      id: 101,
      status: "draft",
      translationLocales: ["eng"],
    });
  });

  it("creates a draft comic for POST /api/v1/admin/comics", async () => {
    const app = buildTestApp();

    const response = await request(app)
      .post("/api/v1/admin/comics")
      .set("authorization", "Bearer test-access-token")
      .send({});

    expect(response.status).toBe(201);
    expect(response.body.data).toMatchObject({
      id: 101,
      issueNumber: null,
      slug: null,
      status: "draft",
    });
  });

  it("updates comic metadata for PUT /api/v1/admin/comics/:comicId", async () => {
    const app = buildTestApp();

    const response = await request(app)
      .put("/api/v1/admin/comics/101")
      .set("authorization", "Bearer test-access-token")
      .send({ issueNumber: 24, slug: "24-2024" });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      id: 101,
      issueNumber: 24,
      slug: "24-2024",
      status: "draft",
    });
  });

  it("creates a translation for POST /api/v1/admin/comics/:comicId/translations", async () => {
    const app = buildTestApp();

    const response = await request(app)
      .post("/api/v1/admin/comics/101/translations")
      .set("authorization", "Bearer test-access-token")
      .send({
        locale: "eng",
        title: "2024",
        bodyMarkdown: "English body",
      });

    expect(response.status).toBe(201);
    expect(response.body.data.translations).toEqual([
      expect.objectContaining({
        locale: "eng",
        title: "2024",
      }),
    ]);
  });

  it("publishes a comic for POST /api/v1/admin/comics/:comicId/publish", async () => {
    const app = buildTestApp();

    const response = await request(app)
      .post("/api/v1/admin/comics/101/publish")
      .set("authorization", "Bearer test-access-token")
      .send({});

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      id: 101,
      status: "published",
      issueNumber: 24,
      slug: "24-2024",
    });
  });

  it("returns a domain error when the comic is not publishable", async () => {
    const app = buildTestApp();

    const response = await request(app)
      .post("/api/v1/admin/comics/404/publish")
      .set("authorization", "Bearer test-access-token")
      .send({});

    expect(response.status).toBe(409);
    expect(response.body.error.code).toBe("COMIC_NOT_PUBLISHABLE");
  });

  it("archives a comic for POST /api/v1/admin/comics/:comicId/archive", async () => {
    const app = buildTestApp();

    const response = await request(app)
      .post("/api/v1/admin/comics/101/archive")
      .set("authorization", "Bearer test-access-token")
      .send({});

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe("archived");
  });
});

function buildComicDetail(input: {
  id: number;
  issueNumber: number | null;
  slug: string | null;
  status: "draft" | "published" | "archived";
  publishedAt?: string | null;
  translations?: Array<{
    locale: "eng" | "pt";
    title: string;
    bodyMarkdown: string;
    excerpt: string | null;
    seoTitle: string | null;
    seoDescription: string | null;
  }>;
  assets?: Array<{
    id: number;
    locale: "eng" | "pt";
    assetType: "comic_page" | "share_preview" | "cover";
    path: string;
    mimeType: string;
    width: number | null;
    height: number | null;
    sortOrder: number;
  }>;
  shareMetadata?: Array<{
    locale: "eng" | "pt";
    shareTitle: string;
    shareDescription: string;
    previewImagePath: string;
  }>;
}) {
  return {
    id: input.id,
    issueNumber: input.issueNumber,
    slug: input.slug,
    status: input.status,
    publishedAt: input.publishedAt ?? null,
    createdAt: "2026-07-02T17:00:00.000Z",
    updatedAt: "2026-07-02T17:00:00.000Z",
    translations: input.translations ?? [],
    assets: input.assets ?? [],
    shareMetadata: input.shareMetadata ?? [],
  };
}
