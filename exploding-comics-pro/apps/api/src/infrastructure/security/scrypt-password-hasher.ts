import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

import type { PasswordHasher } from "../../application/admin-auth/contracts/password-hasher";

const scrypt = promisify(scryptCallback);
const delimiter = "$";
const version = "scrypt";
const saltByteLength = 16;
const derivedKeyLength = 64;

export class ScryptPasswordHasher implements PasswordHasher {
  async hash(plainText: string): Promise<string> {
    const salt = randomBytes(saltByteLength).toString("hex");
    const derivedKey = (await scrypt(plainText, salt, derivedKeyLength)) as Buffer;

    return [version, salt, derivedKey.toString("hex")].join(delimiter);
  }

  async verify(plainText: string, passwordHash: string): Promise<boolean> {
    const [storedVersion, salt, storedHash] = passwordHash.split(delimiter);

    if (storedVersion !== version || !salt || !storedHash) {
      return false;
    }

    const derivedKey = (await scrypt(plainText, salt, derivedKeyLength)) as Buffer;
    const storedHashBuffer = Buffer.from(storedHash, "hex");

    if (storedHashBuffer.length !== derivedKey.length) {
      return false;
    }

    return timingSafeEqual(derivedKey, storedHashBuffer);
  }
}
