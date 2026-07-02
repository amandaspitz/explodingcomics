import type { RequestHandler } from "express";
import { z } from "zod";

import type { GetAuthenticatedAdminUser } from "../../../application/admin-auth/use-cases/get-authenticated-admin-user";
import type { LoginAdminUser } from "../../../application/admin-auth/use-cases/login-admin-user";

const loginBodySchema = z
  .object({
    email: z.string().trim().email(),
    password: z.string().min(1),
  })
  .strict();

type LoginAdminUserUseCase = Pick<LoginAdminUser, "execute">;
type GetAuthenticatedAdminUserUseCase = Pick<GetAuthenticatedAdminUser, "execute">;

export class AdminAuthController {
  constructor(
    private readonly loginAdminUser: LoginAdminUserUseCase,
    private readonly getAuthenticatedAdminUser: GetAuthenticatedAdminUserUseCase
  ) {}

  readonly login: RequestHandler = async (request, response) => {
    const body = loginBodySchema.parse(request.body ?? {});
    const result = await this.loginAdminUser.execute({
      email: body.email,
      password: body.password,
    });

    response.status(200).json({
      data: result,
      meta: {
        requestId: request.requestId,
      },
    });
  };

  readonly me: RequestHandler = async (request, response) => {
    const accessToken = extractBearerToken(request.header("authorization"));
    const adminUser = await this.getAuthenticatedAdminUser.execute(accessToken);

    response.status(200).json({
      data: {
        id: adminUser.id,
        email: adminUser.email,
        status: adminUser.status,
        tokenExpiresAt: adminUser.token.expiresAt,
      },
      meta: {
        requestId: request.requestId,
      },
    });
  };
}

function extractBearerToken(authorizationHeader: string | undefined): string {
  if (!authorizationHeader?.startsWith("Bearer ")) {
    return "";
  }

  return authorizationHeader.slice("Bearer ".length).trim();
}
