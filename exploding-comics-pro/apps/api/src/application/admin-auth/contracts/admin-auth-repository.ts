export interface AdminAuthUser {
  id: number;
  email: string;
  passwordHash: string;
  status: string;
}

export interface AdminAuthRepository {
  findAdminUserByEmail(email: string): Promise<AdminAuthUser | null>;
  findAdminUserById(id: number): Promise<AdminAuthUser | null>;
}
