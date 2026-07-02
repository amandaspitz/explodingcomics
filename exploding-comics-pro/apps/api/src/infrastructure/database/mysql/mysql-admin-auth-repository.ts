import type { Pool } from "mysql2/promise";

import type {
  AdminAuthRepository,
  AdminAuthUser,
} from "../../../application/admin-auth/contracts/admin-auth-repository";

interface AdminAuthUserRow {
  id: number;
  email: string;
  password_hash: string;
  status: string;
}

export class MySqlAdminAuthRepository implements AdminAuthRepository {
  constructor(private readonly mySqlPool: Pool) {}

  async findAdminUserByEmail(email: string): Promise<AdminAuthUser | null> {
    const [rowsRaw] = await this.mySqlPool.execute(
      `
        SELECT
          id,
          email,
          password_hash,
          status
        FROM admin_users
        WHERE email = ?
        LIMIT 1
      `,
      [email]
    );
    const rows = rowsRaw as AdminAuthUserRow[];

    return mapAdminAuthUser(rows[0]);
  }

  async findAdminUserById(id: number): Promise<AdminAuthUser | null> {
    const [rowsRaw] = await this.mySqlPool.execute(
      `
        SELECT
          id,
          email,
          password_hash,
          status
        FROM admin_users
        WHERE id = ?
        LIMIT 1
      `,
      [id]
    );
    const rows = rowsRaw as AdminAuthUserRow[];

    return mapAdminAuthUser(rows[0]);
  }
}

function mapAdminAuthUser(row: AdminAuthUserRow | undefined): AdminAuthUser | null {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    status: row.status,
  };
}
