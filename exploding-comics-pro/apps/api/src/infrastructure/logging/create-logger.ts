import pino, { type Logger } from "pino";

import type { AppEnv } from "../../config/env";

export function createLogger(env: AppEnv): Logger {
  return pino({
    name: env.APP_NAME,
    level: env.LOG_LEVEL,
    base: null,
    timestamp: pino.stdTimeFunctions.isoTime,
  });
}
