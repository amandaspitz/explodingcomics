import { Router } from "express";

import type { AdminAuthController } from "../controllers/admin-auth-controller";
import { requireAdminAuth } from "../middleware/require-admin-auth";

export function createAdminAuthRoutes(adminAuthController: AdminAuthController): Router {
  const router = Router();

  router.post("/admin/auth/login", adminAuthController.login);
  router.get("/admin/auth/me", requireAdminAuth, adminAuthController.me);

  return router;
}
