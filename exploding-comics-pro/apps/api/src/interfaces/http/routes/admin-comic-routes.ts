import { Router } from "express";

import type { AdminComicsController } from "../controllers/admin-comics-controller";

export function createAdminComicRoutes(adminComicsController: AdminComicsController): Router {
  const router = Router();

  router.get("/admin/comics", adminComicsController.list);
  router.get("/admin/comics/:comicId", adminComicsController.getById);
  router.post("/admin/comics", adminComicsController.createDraft);
  router.put("/admin/comics/:comicId", adminComicsController.updateMetadata);
  router.post("/admin/comics/:comicId/translations", adminComicsController.createTranslation);
  router.put(
    "/admin/comics/:comicId/translations/:locale",
    adminComicsController.updateTranslation
  );
  router.post("/admin/comics/:comicId/assets", adminComicsController.createAsset);
  router.post(
    "/admin/comics/:comicId/share-metadata",
    adminComicsController.upsertShareMetadata
  );
  router.post("/admin/comics/:comicId/publish", adminComicsController.publish);
  router.post("/admin/comics/:comicId/archive", adminComicsController.archive);
  router.post("/admin/comics/:comicId/unpublish", adminComicsController.unpublish);

  return router;
}
