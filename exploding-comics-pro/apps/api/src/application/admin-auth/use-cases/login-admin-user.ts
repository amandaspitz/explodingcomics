import { ApplicationError } from "../../shared/errors/application-error";
import type { AdminAuthRepository } from "../contracts/admin-auth-repository";
import type { AdminTokenService } from "../contracts/admin-token-service";
import type { PasswordHasher } from "../contracts/password-hasher";

export interface LoginAdminUserInput {
  email: string;
  password: string;
}

export interface LoginAdminUserResult {
  accessToken: string;
  adminUser: {
    id: number;
    email: string;
    status: string;
  };
}

export class LoginAdminUser {
  constructor(
    private readonly adminAuthRepository: AdminAuthRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly adminTokenService: AdminTokenService
  ) {}

  async execute(input: LoginAdminUserInput): Promise<LoginAdminUserResult> {
    const adminUser = await this.adminAuthRepository.findAdminUserByEmail(
      input.email.trim().toLowerCase()
    );

    if (!adminUser) {
      throw new ApplicationError({
        code: "INVALID_ADMIN_CREDENTIALS",
        message: "The provided admin credentials are invalid.",
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

    const isValidPassword = await this.passwordHasher.verify(
      input.password,
      adminUser.passwordHash
    );

    if (!isValidPassword) {
      throw new ApplicationError({
        code: "INVALID_ADMIN_CREDENTIALS",
        message: "The provided admin credentials are invalid.",
        statusCode: 401,
      });
    }

    const accessToken = await this.adminTokenService.issueAccessToken({
      adminUserId: adminUser.id,
      email: adminUser.email,
    });

    return {
      accessToken,
      adminUser: {
        id: adminUser.id,
        email: adminUser.email,
        status: adminUser.status,
      },
    };
  }
}
