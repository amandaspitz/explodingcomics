import "dotenv/config";

import { z } from "zod";

import { ApplicationError } from "../application/shared/errors/application-error";

const logLevels = ["fatal", "error", "warn", "info", "debug", "trace", "silent"] as const;

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  APP_NAME: z.string().trim().min(1).default("exploding-comics-pro-api"),
  API_BASE_PATH: z.string().trim().min(1).default("/api/v1"),
  CORS_ORIGIN: z.string().trim().min(1).default("*"),
  LOG_LEVEL: z.enum(logLevels).default("info"),
  DB_HOST: z.string().trim().min(1),
  DB_PORT: z.coerce.number().int().min(1).max(65535).default(3306),
  DB_NAME: z.string().trim().min(1),
  DB_USER: z.string().trim().min(1),
  DB_PASSWORD: z.string().default(""),
  DB_CONNECTION_LIMIT: z.coerce.number().int().min(1).max(100).default(10),
  DB_CONNECT_TIMEOUT_MS: z.coerce.number().int().min(1000).max(60000).default(10000),
  ADMIN_JWT_SECRET: z.string().trim().min(32),
  ADMIN_JWT_ISSUER: z.string().trim().min(1).default("exploding-comics-pro-api"),
  ADMIN_JWT_AUDIENCE: z.string().trim().min(1).default("exploding-comics-pro-admin"),
  ADMIN_JWT_EXPIRES_IN: z.string().trim().min(1).default("12h"),
});

export type AppEnv = z.infer<typeof envSchema>;

let cachedEnv: AppEnv | null = null;

export function parseEnv(rawEnv: Record<string, string | undefined> = process.env): AppEnv {
  const result = envSchema.safeParse(rawEnv);

  if (!result.success) {
    throw new ApplicationError({
      code: "INVALID_ENVIRONMENT_CONFIGURATION",
      message: "Environment configuration is invalid.",
      statusCode: 500,
      details: result.error.flatten(),
    });
  }

  return result.data;
}

export function getEnv(): AppEnv {
  if (!cachedEnv) {
    cachedEnv = parseEnv();
  }

  return cachedEnv;
}
