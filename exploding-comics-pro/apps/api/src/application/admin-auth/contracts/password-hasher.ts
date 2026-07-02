export interface PasswordHasher {
  hash(plainText: string): Promise<string>;
  verify(plainText: string, passwordHash: string): Promise<boolean>;
}
