import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import type { Logger } from "pino";

import type { GetAuthenticatedAdminUser } from "./application/admin-auth/use-cases/get-authenticated-admin-user";
import type { LoginAdminUser } from "./application/admin-auth/use-cases/login-admin-user";
import type { ArchiveAdminComic } from "./application/comics/use-cases/archive-admin-comic";
import type { CreateAdminComic } from "./application/comics/use-cases/create-admin-comic";
import type { CreateAdminComicAsset } from "./application/comics/use-cases/create-admin-comic-asset";
import type { CreateAdminComicTranslation } from "./application/comics/use-cases/create-admin-comic-translation";
import type { GetAdminComicById } from "./application/comics/use-cases/get-admin-comic-by-id";
import type { GetPublishedComicByIdentifier } from "./application/comics/use-cases/get-published-comic-by-identifier";
import type { ListAdminComics } from "./application/comics/use-cases/list-admin-comics";
import type { ListPublishedComics } from "./application/comics/use-cases/list-published-comics";
import type { PublishAdminComic } from "./application/comics/use-cases/publish-admin-comic";
import type { UpdateAdminComicMetadata } from "./application/comics/use-cases/update-admin-comic-metadata";
import type { UpdateAdminComicTranslation } from "./application/comics/use-cases/update-admin-comic-translation";
import type { UnpublishAdminComic } from "./application/comics/use-cases/unpublish-admin-comic";
import type { UpsertAdminComicShareMetadata } from "./application/comics/use-cases/upsert-admin-comic-share-metadata";
import type { GetPublicComicStats } from "./application/interactions/use-cases/get-public-comic-stats";
import type { LikeComic } from "./application/interactions/use-cases/like-comic";
import type { RegisterComicView } from "./application/interactions/use-cases/register-comic-view";
import type { UnlikeComic } from "./application/interactions/use-cases/unlike-comic";
import type { GetReadinessStatus } from "./application/shared/use-cases/get-readiness-status";
import type { AppEnv } from "./config/env";
import { GetHealthStatus } from "./application/shared/use-cases/get-health-status";
import { AdminAuthController } from "./interfaces/http/controllers/admin-auth-controller";
import { AdminComicsController } from "./interfaces/http/controllers/admin-comics-controller";
import { HealthController } from "./interfaces/http/controllers/health-controller";
import { PublicComicsController } from "./interfaces/http/controllers/public-comics-controller";
import { createErrorHandler } from "./interfaces/http/middleware/error-handler";
import { createHttpRequestLogger } from "./interfaces/http/middleware/http-request-logger";
import { notFoundHandler } from "./interfaces/http/middleware/not-found-handler";
import { configureAdminAuth, requireAdminAuth } from "./interfaces/http/middleware/require-admin-auth";
import { attachRequestContext } from "./interfaces/http/middleware/request-context";
import { createAdminAuthRoutes } from "./interfaces/http/routes/admin-auth-routes";
import { createAdminComicRoutes } from "./interfaces/http/routes/admin-comic-routes";
import { createPublicComicRoutes } from "./interfaces/http/routes/public-comic-routes";
import { createSystemRoutes } from "./interfaces/http/routes/system-routes";

type LoginAdminUserUseCase = Pick<LoginAdminUser, "execute">;
type GetAuthenticatedAdminUserUseCase = Pick<GetAuthenticatedAdminUser, "execute">;
type ListAdminComicsUseCase = Pick<ListAdminComics, "execute">;
type GetAdminComicByIdUseCase = Pick<GetAdminComicById, "execute">;
type ArchiveAdminComicUseCase = Pick<ArchiveAdminComic, "execute">;
type CreateAdminComicUseCase = Pick<CreateAdminComic, "execute">;
type UpdateAdminComicMetadataUseCase = Pick<UpdateAdminComicMetadata, "execute">;
type CreateAdminComicTranslationUseCase = Pick<CreateAdminComicTranslation, "execute">;
type UpdateAdminComicTranslationUseCase = Pick<UpdateAdminComicTranslation, "execute">;
type CreateAdminComicAssetUseCase = Pick<CreateAdminComicAsset, "execute">;
type UpsertAdminComicShareMetadataUseCase = Pick<
  UpsertAdminComicShareMetadata,
  "execute"
>;
type PublishAdminComicUseCase = Pick<PublishAdminComic, "execute">;
type UnpublishAdminComicUseCase = Pick<UnpublishAdminComic, "execute">;
type ListPublishedComicsUseCase = Pick<ListPublishedComics, "execute">;
type GetPublishedComicByIdentifierUseCase = Pick<GetPublishedComicByIdentifier, "execute">;
type GetPublicComicStatsUseCase = Pick<GetPublicComicStats, "execute">;
type RegisterComicViewUseCase = Pick<RegisterComicView, "execute">;
type LikeComicUseCase = Pick<LikeComic, "execute">;
type UnlikeComicUseCase = Pick<UnlikeComic, "execute">;

export interface CreateAppDependencies {
  env: AppEnv;
  logger: Logger;
  getReadinessStatus: GetReadinessStatus;
  loginAdminUser: LoginAdminUserUseCase;
  getAuthenticatedAdminUser: GetAuthenticatedAdminUserUseCase;
  listAdminComics: ListAdminComicsUseCase;
  getAdminComicById: GetAdminComicByIdUseCase;
  listPublishedComics: ListPublishedComicsUseCase;
  getPublishedComicByIdentifier: GetPublishedComicByIdentifierUseCase;
  getPublicComicStats: GetPublicComicStatsUseCase;
  registerComicView: RegisterComicViewUseCase;
  likeComic: LikeComicUseCase;
  unlikeComic: UnlikeComicUseCase;
  createAdminComic: CreateAdminComicUseCase;
  updateAdminComicMetadata: UpdateAdminComicMetadataUseCase;
  createAdminComicTranslation: CreateAdminComicTranslationUseCase;
  updateAdminComicTranslation: UpdateAdminComicTranslationUseCase;
  createAdminComicAsset: CreateAdminComicAssetUseCase;
  upsertAdminComicShareMetadata: UpsertAdminComicShareMetadataUseCase;
  publishAdminComic: PublishAdminComicUseCase;
  archiveAdminComic: ArchiveAdminComicUseCase;
  unpublishAdminComic: UnpublishAdminComicUseCase;
}

export function createApp({
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
}: CreateAppDependencies): Express {
  const app = express();
  const getHealthStatus = new GetHealthStatus({
    appName: env.APP_NAME,
    environment: env.NODE_ENV,
  });
  const healthController = new HealthController(getHealthStatus, getReadinessStatus);
  const adminAuthController = new AdminAuthController(
    loginAdminUser,
    getAuthenticatedAdminUser
  );
  const publicComicsController = new PublicComicsController(
    listPublishedComics,
    getPublishedComicByIdentifier,
    getPublicComicStats,
    registerComicView,
    likeComic,
    unlikeComic
  );
  const adminComicsController = new AdminComicsController(
    listAdminComics,
    getAdminComicById,
    createAdminComic,
    updateAdminComicMetadata,
    createAdminComicTranslation,
    updateAdminComicTranslation,
    createAdminComicAsset,
    upsertAdminComicShareMetadata,
    publishAdminComic,
    archiveAdminComic,
    unpublishAdminComic
  );
  configureAdminAuth({
    getAuthenticatedAdminUser,
  });
  const corsOrigin = env.CORS_ORIGIN === "*" ? true : env.CORS_ORIGIN.split(",").map((origin) => origin.trim());

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(cors({ origin: corsOrigin }));
  app.use(express.json({ limit: "1mb" }));
  app.use(attachRequestContext);
  app.use(createHttpRequestLogger(logger));
  app.use(createSystemRoutes(healthController));
  app.use(env.API_BASE_PATH, createAdminAuthRoutes(adminAuthController));
  app.use(env.API_BASE_PATH, createPublicComicRoutes(publicComicsController));
  app.use(env.API_BASE_PATH, requireAdminAuth, createAdminComicRoutes(adminComicsController));
  app.use(notFoundHandler);
  app.use(createErrorHandler(logger));

  return app;
}
