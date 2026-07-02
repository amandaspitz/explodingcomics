import type { RequestHandler } from "express";

import type { GetAuthenticatedAdminUser } from "../../../application/admin-auth/use-cases/get-authenticated-admin-user";
import { ApplicationError } from "../../../application/shared/errors/application-error";

type GetAuthenticatedAdminUserUseCase = Pick<GetAuthenticatedAdminUser, "execute">;

let getAuthenticatedAdminUser:
  | GetAuthenticatedAdminUserUseCase
  | null = null;

export function configureAdminAuth(dependencies: {
  getAuthenticatedAdminUser: GetAuthenticatedAdminUserUseCase;
}): void {
  getAuthenticatedAdminUser = dependencies.getAuthenticatedAdminUser;
}

export const requireAdminAuth: RequestHandler = async (request, _response, next) => {
  if (!getAuthenticatedAdminUser) {
    return next(
      new ApplicationError({
        code: "ADMIN_AUTH_NOT_CONFIGURED",
        message: "Admin authentication dependencies are not configured.",
      })
    );
  }

  const authorizationHeader = request.header("authorization");

  if (!authorizationHeader?.startsWith("Bearer ")) {
    return next(
      new ApplicationError({
        code: "ADMIN_AUTHENTICATION_REQUIRED",
        message: "A valid admin access token is required.",
        statusCode: 401,
      })
    );
  }

  try {
    const adminUser = await getAuthenticatedAdminUser.execute(
      authorizationHeader.slice("Bearer ".length).trim()
    );
    request.adminUser = {
      id: adminUser.id,
      email: adminUser.email,
      status: adminUser.status,
      tokenExpiresAt: adminUser.token.expiresAt,
    };

    return next();
  } catch (error) {
    return next(error);
  }
};
