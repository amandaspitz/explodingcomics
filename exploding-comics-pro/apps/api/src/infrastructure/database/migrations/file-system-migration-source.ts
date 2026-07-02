import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

import { ApplicationError } from "../../../application/shared/errors/application-error";

export interface MigrationDefinition {
  version: string;
  name: string;
  filename: string;
  sql: string;
}

const migrationFilenamePattern = /^(\d+)_([a-z0-9_]+)\.sql$/;

export class FileSystemMigrationSource {
  constructor(private readonly migrationsDirectory: string) {}

  async getMigrations(): Promise<MigrationDefinition[]> {
    const filenames = await readdir(this.migrationsDirectory);
    const migrationFilenames = filenames.filter((filename) => filename.endsWith(".sql")).sort();

    return Promise.all(
      migrationFilenames.map(async (filename) => {
        const match = migrationFilenamePattern.exec(filename);

        if (!match) {
          throw new ApplicationError({
            code: "INVALID_MIGRATION_FILENAME",
            message: `Migration filename "${filename}" does not match the expected format.`,
            statusCode: 500,
          });
        }

        const [, version, name] = match;

        if (!version || !name) {
          throw new ApplicationError({
            code: "INVALID_MIGRATION_FILENAME",
            message: `Migration filename "${filename}" could not be parsed safely.`,
            statusCode: 500,
          });
        }

        const sql = await readFile(path.join(this.migrationsDirectory, filename), "utf8");

        return {
          version,
          name,
          filename,
          sql,
        };
      })
    );
  }
}
