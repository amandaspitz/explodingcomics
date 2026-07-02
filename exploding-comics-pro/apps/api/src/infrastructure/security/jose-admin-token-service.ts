import { createSecretKey } from "node:crypto";

import { SignJWT, jwtVerify } from "jose";

import type { AppEnv } from "../../config/env";
import type {
  AdminTokenPayload,
  AdminTokenService,
  VerifiedAdminTokenPayload,
} from "../../application/admin-auth/contracts/admin-token-service";
import { ApplicationError } from "../../application/shared/errors/application-error";

export class JoseAdminTokenService implements AdminTokenService {
  private readonly secretKey;

  constructor(private readonly env: AppEnv) {
    this.secretKey = createSecretKey(Buffer.from(this.env.ADMIN_JWT_SECRET, "utf8"));
  }

  async issueAccessToken(payload: AdminTokenPayload): Promise<string> {
    return new SignJWT({
      email: payload.email,
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setIssuer(this.env.ADMIN_JWT_ISSUER)
      .setAudience(this.env.ADMIN_JWT_AUDIENCE)
      .setSubject(String(payload.adminUserId))
      .setIssuedAt()
      .setExpirationTime(this.env.ADMIN_JWT_EXPIRES_IN)
      .sign(this.secretKey);
  }

  async verifyAccessToken(token: string): Promise<VerifiedAdminTokenPayload> {
    try {
      const result = await jwtVerify(token, this.secretKey, {
        issuer: this.env.ADMIN_JWT_ISSUER,
        audience: this.env.ADMIN_JWT_AUDIENCE,
      });
      const adminUserId = Number(result.payload.sub);
      const email =
        typeof result.payload.email === "string" ? result.payload.email : undefined;
      const expiresAt =
        typeof result.payload.exp === "number"
          ? new Date(result.payload.exp * 1000).toISOString()
          : undefined;

      if (!Number.isInteger(adminUserId) || adminUserId <= 0 || !email || !expiresAt) {
        throw new ApplicationError({
          code: "ADMIN_AUTHENTICATION_REQUIRED",
          message: "A valid admin access token is required.",
          statusCode: 401,
        });
      }

      return {
        adminUserId,
        email,
        expiresAt,
      };
    } catch (error) {
      if (error instanceof ApplicationError) {
        throw error;
      }

      throw new ApplicationError({
        code: "ADMIN_AUTHENTICATION_REQUIRED",
        message: "A valid admin access token is required.",
        statusCode: 401,
        cause: error,
      });
    }
  }
}
