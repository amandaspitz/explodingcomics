import { ApplicationError } from "../../shared/errors/application-error";
import type { AdminAuthRepository } from "../contracts/admin-auth-repository";
import type {
  AdminTokenService,
  VerifiedAdminTokenPayload,
} from "../contracts/admin-token-service";

export interface AuthenticatedAdminUser {
  id: number;
  email: string;
  status: string;
  token: VerifiedAdminTokenPayload;
}

export class GetAuthenticatedAdminUser {
  constructor(
    private readonly adminTokenService: AdminTokenService,
    private readonly adminAuthRepository: AdminAuthRepository
  ) {}

  async execute(accessToken: string): Promise<AuthenticatedAdminUser> {
    const token = await this.adminTokenService.verifyAccessToken(accessToken);
    const adminUser = await this.adminAuthRepository.findAdminUserById(token.adminUserId);

    if (!adminUser) {
      throw new ApplicationError({
        code: "ADMIN_AUTHENTICATION_REQUIRED",
        message: "A valid admin access token is required.",
        statusCode: 401,
      });
    }

    if (adminUser.status !== "active") {
      throw new ApplicationError({
        code: "ADMIN_USER_DISABLED",
        message: "This admin user is not active.",
        statusCode: 403,
      });
    }

    return {
      id: adminUser.id,
      email: adminUser.email,
      status: adminUser.status,
      token,
    };
  }
}
