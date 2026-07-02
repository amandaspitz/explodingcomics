import { createApp } from "./app";
import { createApplicationContext } from "./bootstrap/create-application-context";

const applicationContext = createApplicationContext();
const { env, logger } = applicationContext;
const app = createApp({
  env,
  logger,
  getReadinessStatus: applicationContext.useCases.getReadinessStatus,
  loginAdminUser: applicationContext.useCases.loginAdminUser,
  getAuthenticatedAdminUser: applicationContext.useCases.getAuthenticatedAdminUser,
  listAdminComics: applicationContext.useCases.listAdminComics,
  getAdminComicById: applicationContext.useCases.getAdminComicById,
  listPublishedComics: applicationContext.useCases.listPublishedComics,
  getPublishedComicByIdentifier: applicationContext.useCases.getPublishedComicByIdentifier,
  getPublicComicStats: applicationContext.useCases.getPublicComicStats,
  registerComicView: applicationContext.useCases.registerComicView,
  likeComic: applicationContext.useCases.likeComic,
  unlikeComic: applicationContext.useCases.unlikeComic,
  createAdminComic: applicationContext.useCases.createAdminComic,
  updateAdminComicMetadata: applicationContext.useCases.updateAdminComicMetadata,
  createAdminComicTranslation: applicationContext.useCases.createAdminComicTranslation,
  updateAdminComicTranslation: applicationContext.useCases.updateAdminComicTranslation,
  createAdminComicAsset: applicationContext.useCases.createAdminComicAsset,
  upsertAdminComicShareMetadata: applicationContext.useCases.upsertAdminComicShareMetadata,
  publishAdminComic: applicationContext.useCases.publishAdminComic,
  archiveAdminComic: applicationContext.useCases.archiveAdminComic,
  unpublishAdminComic: applicationContext.useCases.unpublishAdminComic,
});

const server = app.listen(env.PORT, () => {
  logger.info(
    {
      environment: env.NODE_ENV,
      port: env.PORT,
    },
    "server_started"
  );
});

function shutdown(signal: string): void {
  logger.info({ signal }, "server_shutdown_started");

  server.close(async (error?: Error) => {
    if (error) {
      logger.error({ error, signal }, "server_shutdown_failed");
      process.exitCode = 1;
      return;
    }

    await applicationContext.shutdown();
    logger.info({ signal }, "server_shutdown_completed");
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
