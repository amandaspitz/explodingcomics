import { Router } from "express";

import type { HealthController } from "../controllers/health-controller";

export function createSystemRoutes(healthController: HealthController): Router {
  const router = Router();

  router.get("/health", healthController.getHealth);
  router.get("/ready", healthController.getReadiness);

  return router;
}
