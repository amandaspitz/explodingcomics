import { describe, expect, it } from "vitest";

import { ApplicationError } from "../../../src/application/shared/errors/application-error";
import { parseEnv } from "../../../src/config/env";

describe("parseEnv", () => {
  it("returns defaults when optional values are omitted", () => {
    const env = parseEnv({
      DB_HOST: "127.0.0.1",
      DB_NAME: "exploding_comics_pro_test",
      DB_USER: "root",
      ADMIN_JWT_SECRET: "test-admin-jwt-secret-at-least-32-chars",
    });

    expect(env.NODE_ENV).toBe("development");
    expect(env.PORT).toBe(3000);
    expect(env.APP_NAME).toBe("exploding-comics-pro-api");
    expect(env.DB_PORT).toBe(3306);
  });

  it("throws a typed error when configuration is invalid", () => {
    expect(() =>
      parseEnv({
        DB_HOST: "127.0.0.1",
        DB_NAME: "exploding_comics_pro_test",
        DB_USER: "root",
        ADMIN_JWT_SECRET: "test-admin-jwt-secret-at-least-32-chars",
        PORT: "0",
      })
    ).toThrow(ApplicationError);
  });

  it("throws when required database configuration is missing", () => {
    expect(() => parseEnv({})).toThrow(ApplicationError);
  });
});
