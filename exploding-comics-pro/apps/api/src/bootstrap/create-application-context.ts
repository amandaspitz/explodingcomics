import type { Pool } from "mysql2/promise";
import type { Logger } from "pino";

import { GetAuthenticatedAdminUser } from "../application/admin-auth/use-cases/get-authenticated-admin-user";
import { LoginAdminUser } from "../application/admin-auth/use-cases/login-admin-user";
import { ArchiveAdminComic } from "../application/comics/use-cases/archive-admin-comic";
import { CreateAdminComic } from "../application/comics/use-cases/create-admin-comic";
import { CreateAdminComicAsset } from "../application/comics/use-cases/create-admin-comic-asset";
import { CreateAdminComicTranslation } from "../application/comics/use-cases/create-admin-comic-translation";
import { GetAdminComicById } from "../application/comics/use-cases/get-admin-comic-by-id";
import { GetPublishedComicByIdentifier } from "../application/comics/use-cases/get-published-comic-by-identifier";
import { ListAdminComics } from "../application/comics/use-cases/list-admin-comics";
import { ListPublishedComics } from "../application/comics/use-cases/list-published-comics";
import { PublishAdminComic } from "../application/comics/use-cases/publish-admin-comic";
import { UpdateAdminComicMetadata } from "../application/comics/use-cases/update-admin-comic-metadata";
import { UpdateAdminComicTranslation } from "../application/comics/use-cases/update-admin-comic-translation";
import { UnpublishAdminComic } from "../application/comics/use-cases/unpublish-admin-comic";
import { UpsertAdminComicShareMetadata } from "../application/comics/use-cases/upsert-admin-comic-share-metadata";
import { GetPublicComicStats } from "../application/interactions/use-cases/get-public-comic-stats";
import { LikeComic } from "../application/interactions/use-cases/like-comic";
import { RegisterComicView } from "../application/interactions/use-cases/register-comic-view";
import { UnlikeComic } from "../application/interactions/use-cases/unlike-comic";
import { GetReadinessStatus } from "../application/shared/use-cases/get-readiness-status";
import { getEnv, type AppEnv } from "../config/env";
import { MySqlAdminAuthRepository } from "../infrastructure/database/mysql/mysql-admin-auth-repository";
import { MySqlAdminComicCommandRepository } from "../infrastructure/database/mysql/mysql-admin-comic-command-repository";
import { MySqlAdminComicReadRepository } from "../infrastructure/database/mysql/mysql-admin-comic-read-repository";
import { createMySqlPool } from "../infrastructure/database/mysql/create-mysql-pool";
import { MySqlDatabaseHealthChecker } from "../infrastructure/database/mysql/mysql-database-health-checker";
import { MySqlComicInteractionRepository } from "../infrastructure/database/mysql/mysql-comic-interaction-repository";
import { MySqlComicReadRepository } from "../infrastructure/database/mysql/mysql-comic-read-repository";
import { MySqlComicStatsReadRepository } from "../infrastructure/database/mysql/mysql-comic-stats-read-repository";
import { MySqlPoolQueryExecutor } from "../infrastructure/database/mysql/mysql-pool-query-executor";
import { createLogger } from "../infrastructure/logging/create-logger";
import { JoseAdminTokenService } from "../infrastructure/security/jose-admin-token-service";
import { ScryptPasswordHasher } from "../infrastructure/security/scrypt-password-hasher";

export interface ApplicationContext {
  env: AppEnv;
  logger: Logger;
  mySqlPool: Pool;
  useCases: {
    getReadinessStatus: GetReadinessStatus;
    loginAdminUser: LoginAdminUser;
    getAuthenticatedAdminUser: GetAuthenticatedAdminUser;
    listAdminComics: ListAdminComics;
    getAdminComicById: GetAdminComicById;
    listPublishedComics: ListPublishedComics;
    getPublishedComicByIdentifier: GetPublishedComicByIdentifier;
    getPublicComicStats: GetPublicComicStats;
    registerComicView: RegisterComicView;
    likeComic: LikeComic;
    unlikeComic: UnlikeComic;
    createAdminComic: CreateAdminComic;
    updateAdminComicMetadata: UpdateAdminComicMetadata;
    createAdminComicTranslation: CreateAdminComicTranslation;
    updateAdminComicTranslation: UpdateAdminComicTranslation;
    createAdminComicAsset: CreateAdminComicAsset;
    upsertAdminComicShareMetadata: UpsertAdminComicShareMetadata;
    publishAdminComic: PublishAdminComic;
    archiveAdminComic: ArchiveAdminComic;
    unpublishAdminComic: UnpublishAdminComic;
  };
  shutdown(): Promise<void>;
}

export function createApplicationContext(): ApplicationContext {
  const env = getEnv();
  const logger = createLogger(env);
  const mySqlPool = createMySqlPool(env);
  const queryExecutor = new MySqlPoolQueryExecutor(mySqlPool);
  const databaseHealthChecker = new MySqlDatabaseHealthChecker(mySqlPool, env.DB_NAME);
  const adminAuthRepository = new MySqlAdminAuthRepository(mySqlPool);
  const adminComicReadRepository = new MySqlAdminComicReadRepository(mySqlPool);
  const comicInteractionRepository = new MySqlComicInteractionRepository(queryExecutor);
  const comicReadRepository = new MySqlComicReadRepository(queryExecutor);
  const comicStatsReadRepository = new MySqlComicStatsReadRepository(queryExecutor);
  const adminComicCommandRepository = new MySqlAdminComicCommandRepository(mySqlPool);
  const passwordHasher = new ScryptPasswordHasher();
  const adminTokenService = new JoseAdminTokenService(env);

  return {
    env,
    logger,
    mySqlPool,
    useCases: {
      getReadinessStatus: new GetReadinessStatus({
        appName: env.APP_NAME,
        environment: env.NODE_ENV,
        dependencyCheckers: [databaseHealthChecker],
      }),
      loginAdminUser: new LoginAdminUser(
        adminAuthRepository,
        passwordHasher,
        adminTokenService
      ),
      getAuthenticatedAdminUser: new GetAuthenticatedAdminUser(
        adminTokenService,
        adminAuthRepository
      ),
      listAdminComics: new ListAdminComics(adminComicReadRepository),
      getAdminComicById: new GetAdminComicById(adminComicReadRepository),
      listPublishedComics: new ListPublishedComics(comicReadRepository),
      getPublishedComicByIdentifier: new GetPublishedComicByIdentifier(comicReadRepository),
      getPublicComicStats: new GetPublicComicStats(comicStatsReadRepository),
      registerComicView: new RegisterComicView(comicInteractionRepository),
      likeComic: new LikeComic(comicInteractionRepository),
      unlikeComic: new UnlikeComic(comicInteractionRepository),
      createAdminComic: new CreateAdminComic(adminComicCommandRepository),
      updateAdminComicMetadata: new UpdateAdminComicMetadata(adminComicCommandRepository),
      createAdminComicTranslation: new CreateAdminComicTranslation(adminComicCommandRepository),
      updateAdminComicTranslation: new UpdateAdminComicTranslation(adminComicCommandRepository),
      createAdminComicAsset: new CreateAdminComicAsset(adminComicCommandRepository),
      upsertAdminComicShareMetadata: new UpsertAdminComicShareMetadata(
        adminComicCommandRepository
      ),
      publishAdminComic: new PublishAdminComic(adminComicCommandRepository),
      archiveAdminComic: new ArchiveAdminComic(adminComicCommandRepository),
      unpublishAdminComic: new UnpublishAdminComic(adminComicCommandRepository),
    },
    async shutdown() {
      await mySqlPool.end();
    },
  };
}
