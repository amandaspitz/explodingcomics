import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { ApplicationError } from "../../../../../src/application/shared/errors/application-error";
import { FileSystemMigrationSource } from "../../../../../src/infrastructure/database/migrations/file-system-migration-source";

const temporaryDirectories: string[] = [];

async function createTemporaryDirectory(): Promise<string> {
  const temporaryDirectory = await mkdtemp(path.join(os.tmpdir(), "ecp-migrations-"));
  temporaryDirectories.push(temporaryDirectory);
  return temporaryDirectory;
}

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((temporaryDirectory) =>
      rm(temporaryDirectory, {
        recursive: true,
        force: true,
      })
    )
  );
});

describe("FileSystemMigrationSource", () => {
  it("loads and sorts valid migration files", async () => {
    const migrationsDirectory = await createTemporaryDirectory();

    await writeFile(path.join(migrationsDirectory, "0002_seed_data.sql"), "SELECT 2;");
    await writeFile(path.join(migrationsDirectory, "0001_initial_schema.sql"), "SELECT 1;");
    await writeFile(path.join(migrationsDirectory, "README.md"), "ignore me");

    const source = new FileSystemMigrationSource(migrationsDirectory);

    const migrations = await source.getMigrations();

    expect(migrations.map((migration) => migration.filename)).toEqual([
      "0001_initial_schema.sql",
      "0002_seed_data.sql",
    ]);
    expect(migrations[0]?.version).toBe("0001");
    expect(migrations[0]?.name).toBe("initial_schema");
  });

  it("throws when a migration filename is invalid", async () => {
    const migrationsDirectory = await createTemporaryDirectory();

    await writeFile(path.join(migrationsDirectory, "bad-file-name.sql"), "SELECT 1;");

    const source = new FileSystemMigrationSource(migrationsDirectory);

    await expect(source.getMigrations()).rejects.toThrow(ApplicationError);
  });
});
