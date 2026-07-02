export interface AdminTokenPayload {
  adminUserId: number;
  email: string;
}

export interface VerifiedAdminTokenPayload extends AdminTokenPayload {
  expiresAt: string;
}

export interface AdminTokenService {
  issueAccessToken(payload: AdminTokenPayload): Promise<string>;
  verifyAccessToken(token: string): Promise<VerifiedAdminTokenPayload>;
}
