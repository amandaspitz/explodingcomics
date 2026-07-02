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
    dependencyCheckers: [
      {
        async check() {
          return {
            name: "mysql",
            status: "up",
            details: {
              database: env.DB_NAME,
            },
          };
        },
      },
    ],
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

describe("system routes", () => {
  it("returns application health for GET /health", async () => {
    const app = buildTestApp();

    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.headers["x-request-id"]).toBeTypeOf("string");
    expect(response.body.data.status).toBe("ok");
    expect(response.body.data.service).toBe("exploding-comics-pro-api-test");
    expect(response.body.meta.requestId).toBe(response.headers["x-request-id"]);
  });

  it("returns readiness for GET /ready", async () => {
    const app = buildTestApp();

    const response = await request(app).get("/ready");

    expect(response.status).toBe(200);
    expect(response.body.data.status).toBe("ready");
    expect(response.body.data.dependencies).toEqual([
      {
        name: "mysql",
        status: "up",
        details: {
          database: "exploding_comics_pro_test",
        },
      },
    ]);
  });

  it("returns a consistent error envelope for unknown routes", async () => {
    const app = buildTestApp();

    const response = await request(app).get("/missing-route");

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe("ROUTE_NOT_FOUND");
  });
});
