import { createMySqlPool } from "../infrastructure/database/mysql/create-mysql-pool";
import { getEnv } from "../config/env";
import { ScryptPasswordHasher } from "../infrastructure/security/scrypt-password-hasher";

async function main(): Promise<void> {
  const [emailArgument, passwordArgument, statusArgument] = process.argv.slice(2);

  if (!emailArgument || !passwordArgument) {
    throw new Error(
      "Usage: npm run create:admin-user -- <email> <password> [active|disabled]"
    );
  }

  const env = getEnv();
  const mySqlPool = createMySqlPool(env);
  const passwordHasher = new ScryptPasswordHasher();
  const email = emailArgument.trim().toLowerCase();
  const passwordHash = await passwordHasher.hash(passwordArgument);
  const status = statusArgument?.trim().toLowerCase() === "disabled" ? "disabled" : "active";

  try {
    await mySqlPool.execute(
      `
        INSERT INTO admin_users (email, password_hash, status)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
          password_hash = VALUES(password_hash),
          status = VALUES(status),
          updated_at = CURRENT_TIMESTAMP
      `,
      [email, passwordHash, status]
    );

    process.stdout.write(
      `${JSON.stringify({
        email,
        status,
        message: "Admin user created or updated successfully.",
      })}\n`
    );
  } finally {
    await mySqlPool.end();
  }
}

void main().catch((error) => {
  process.stderr.write(`${String(error)}\n`);
  process.exit(1);
});
