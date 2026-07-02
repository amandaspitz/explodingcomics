import { Router } from "express";

import type { PublicComicsController } from "../controllers/public-comics-controller";

export function createPublicComicRoutes(publicComicsController: PublicComicsController): Router {
  const router = Router();

  router.get("/comics", publicComicsController.listPublished);
  router.get("/comics/:issueOrSlug/stats", publicComicsController.getStatsByIdentifier);
  router.post("/comics/:issueOrSlug/views", publicComicsController.registerViewByIdentifier);
  router.post("/comics/:issueOrSlug/likes", publicComicsController.likeByIdentifier);
  router.delete(
    "/comics/:issueOrSlug/likes/:visitorId",
    publicComicsController.unlikeByIdentifier
  );
  router.get("/comics/:issueOrSlug", publicComicsController.getByIdentifier);

  return router;
}
