import { access, readFile } from "node:fs/promises";
import path from "node:path";
import vm from "node:vm";

import type { PoolConnection, ResultSetHeader, RowDataPacket } from "mysql2/promise";

import { ApplicationError } from "../application/shared/errors/application-error";
import { getEnv } from "../config/env";
import { createMySqlPool } from "../infrastructure/database/mysql/create-mysql-pool";
import { createLogger } from "../infrastructure/logging/create-logger";

interface LegacyComicEntry {
  issueNumber: number;
  issueTitle: string;
  url: string;
  text: string;
}

interface ImportedIssueResult {
  issueNumber: number;
  status: "published" | "draft" | "skipped";
  reasons: string[];
}

interface LegacyComicImportSummary {
  importedCount: number;
  publishedCount: number;
  draftCount: number;
  skippedCount: number;
  issues: ImportedIssueResult[];
}

interface ComicIdRow extends RowDataPacket {
  id: number;
}

async function main(): Promise<void> {
  const env = getEnv();
  const logger = createLogger(env);
  const pool = createMySqlPool(env);

  try {
    const projectRoot = path.resolve(process.cwd(), "../../..");
    const englishComics = await loadLegacyComicEntries(
      path.join(projectRoot, "js", "localEng.js"),
      "imagesEng"
    );
    const portugueseComics = await loadLegacyComicEntries(
      path.join(projectRoot, "js", "localPt.js"),
      "imagesPor"
    );
    const connection = await pool.getConnection();

    try {
      const summary = await importLegacyComics({
        connection,
        englishComics,
        portugueseComics,
        projectRoot,
      });

      logger.info(summary, "legacy_comic_import_completed");
    } finally {
      connection.release();
    }
  } finally {
    await pool.end();
  }
}

async function importLegacyComics(input: {
  connection: PoolConnection;
  englishComics: LegacyComicEntry[];
  portugueseComics: LegacyComicEntry[];
  projectRoot: string;
}): Promise<LegacyComicImportSummary> {
  const englishByIssue = new Map(input.englishComics.map((comic) => [comic.issueNumber, comic]));
  const portugueseByIssue = new Map(input.portugueseComics.map((comic) => [comic.issueNumber, comic]));
  const issueNumbers = [...new Set([...englishByIssue.keys(), ...portugueseByIssue.keys()])].sort(
    (left, right) => left - right
  );
  const issueResults: ImportedIssueResult[] = [];

  await input.connection.beginTransaction();

  try {
    for (const issueNumber of issueNumbers) {
      const englishComic = englishByIssue.get(issueNumber);
      const portugueseComic = portugueseByIssue.get(issueNumber);
      const reasons: string[] = [];

      if (!englishComic || !portugueseComic) {
        issueResults.push({
          issueNumber,
          status: "skipped",
          reasons: [
            !englishComic ? "missing_english_translation" : "",
            !portugueseComic ? "missing_portuguese_translation" : "",
          ].filter(Boolean),
        });

        continue;
      }

      const englishAssetPath = `assets/comics/eng/${englishComic.url}`;
      const portugueseAssetPath = `assets/comics/pt/${portugueseComic.url}`;
      const englishAssetExists = await pathExists(path.join(input.projectRoot, englishAssetPath));
      const portugueseAssetExists = await pathExists(path.join(input.projectRoot, portugueseAssetPath));

      if (!englishAssetExists) {
        reasons.push("missing_english_asset");
      }

      if (!portugueseAssetExists) {
        reasons.push("missing_portuguese_asset");
      }

      const comicStatus = reasons.length === 0 ? "published" : "draft";
      const slug = `${issueNumber}-${slugify(repairMojibake(englishComic.issueTitle))}`;
      const publishedAt = comicStatus === "published" ? new Date() : null;

      await input.connection.execute<ResultSetHeader>(
        `
          INSERT INTO comics (issue_number, slug, status, published_at)
          VALUES (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            slug = VALUES(slug),
            status = VALUES(status),
            published_at = VALUES(published_at),
            updated_at = CURRENT_TIMESTAMP
        `,
        [issueNumber, slug, comicStatus, publishedAt]
      );

      const [comicIdRows] = await input.connection.execute<ComicIdRow[]>(
        "SELECT id FROM comics WHERE issue_number = ? LIMIT 1",
        [issueNumber]
      );
      const comicId = comicIdRows[0]?.id;

      if (!comicId) {
        throw new ApplicationError({
          code: "LEGACY_COMIC_IMPORT_FAILED",
          message: `Could not resolve comic id after upsert for issue ${issueNumber}.`,
          statusCode: 500,
        });
      }

      await input.connection.execute("DELETE FROM comic_translations WHERE comic_id = ?", [comicId]);
      await input.connection.execute("DELETE FROM comic_assets WHERE comic_id = ?", [comicId]);
      await input.connection.execute("DELETE FROM comic_share_metadata WHERE comic_id = ?", [comicId]);

      const englishText = repairMojibake(englishComic.text);
      const portugueseTitle = repairMojibake(portugueseComic.issueTitle);
      const portugueseText = repairMojibake(portugueseComic.text);

      await input.connection.execute(
        `
          INSERT INTO comic_translations
            (comic_id, locale, title, body_markdown, excerpt, seo_title, seo_description)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          comicId,
          "eng",
          repairMojibake(englishComic.issueTitle),
          englishText,
          buildExcerpt(englishText),
          repairMojibake(englishComic.issueTitle),
          buildExcerpt(englishText, 155),
        ]
      );
      await input.connection.execute(
        `
          INSERT INTO comic_translations
            (comic_id, locale, title, body_markdown, excerpt, seo_title, seo_description)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          comicId,
          "pt",
          portugueseTitle,
          portugueseText,
          buildExcerpt(portugueseText),
          portugueseTitle,
          buildExcerpt(portugueseText, 155),
        ]
      );

      if (englishAssetExists) {
        await input.connection.execute(
          `
            INSERT INTO comic_assets
              (comic_id, locale, asset_type, path, mime_type, width, height, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [comicId, "eng", "comic_page", englishAssetPath, "image/jpeg", null, null, 1]
        );
      }

      if (portugueseAssetExists) {
        await input.connection.execute(
          `
            INSERT INTO comic_assets
              (comic_id, locale, asset_type, path, mime_type, width, height, sort_order)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `,
          [comicId, "pt", "comic_page", portugueseAssetPath, "image/jpeg", null, null, 1]
        );
      }

      const englishSharePreviewPath = await resolveSharePreviewPath(input.projectRoot, "eng", issueNumber);
      const portugueseSharePreviewPath = await resolveSharePreviewPath(input.projectRoot, "pt", issueNumber);

      await input.connection.execute(
        `
          INSERT INTO comic_share_metadata
            (comic_id, locale, share_title, share_description, preview_image_path)
          VALUES (?, ?, ?, ?, ?)
        `,
        [
          comicId,
          "eng",
          repairMojibake(englishComic.issueTitle),
          buildExcerpt(englishText, 155),
          englishSharePreviewPath,
        ]
      );
      await input.connection.execute(
        `
          INSERT INTO comic_share_metadata
            (comic_id, locale, share_title, share_description, preview_image_path)
          VALUES (?, ?, ?, ?, ?)
        `,
        [
          comicId,
          "pt",
          portugueseTitle,
          buildExcerpt(portugueseText, 155),
          portugueseSharePreviewPath,
        ]
      );

      issueResults.push({
        issueNumber,
        status: comicStatus,
        reasons,
      });
    }

    await input.connection.commit();
  } catch (error) {
    await input.connection.rollback();
    throw error;
  }

  return {
    importedCount: issueResults.filter((issue) => issue.status !== "skipped").length,
    publishedCount: issueResults.filter((issue) => issue.status === "published").length,
    draftCount: issueResults.filter((issue) => issue.status === "draft").length,
    skippedCount: issueResults.filter((issue) => issue.status === "skipped").length,
    issues: issueResults,
  };
}

async function loadLegacyComicEntries(
  filePath: string,
  declarationName: string
): Promise<LegacyComicEntry[]> {
  const fileContents = await readFile(filePath, "utf8");
  const declarationMatch = new RegExp(
    `const\\s+${declarationName}\\s*=\\s*(\\[[\\s\\S]*?\\]);`,
    "m"
  ).exec(fileContents);

  if (!declarationMatch?.[1]) {
    throw new ApplicationError({
      code: "LEGACY_COMIC_SOURCE_PARSE_FAILED",
      message: `Could not parse declaration "${declarationName}" from "${filePath}".`,
      statusCode: 500,
    });
  }

  const parsedValue = vm.runInNewContext(declarationMatch[1]);

  if (!Array.isArray(parsedValue)) {
    throw new ApplicationError({
      code: "LEGACY_COMIC_SOURCE_PARSE_FAILED",
      message: `Declaration "${declarationName}" in "${filePath}" did not evaluate to an array.`,
      statusCode: 500,
    });
  }

  return parsedValue as LegacyComicEntry[];
}

function slugify(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function buildExcerpt(value: string, maxLength = 180): string {
  const normalized = value.replace(/\s+/g, " ").trim();

  if (normalized.length <= maxLength) {
    return normalized;
  }

  const shortened = normalized.slice(0, maxLength).trim();
  const lastSpaceIndex = shortened.lastIndexOf(" ");

  if (lastSpaceIndex <= 0) {
    return `${shortened}...`;
  }

  return `${shortened.slice(0, lastSpaceIndex)}...`;
}

function repairMojibake(value: string): string {
  if (!/[Ãâ€]/.test(value)) {
    return value;
  }

  try {
    return Buffer.from(value, "latin1").toString("utf8");
  } catch {
    return value;
  }
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function resolveSharePreviewPath(
  projectRoot: string,
  locale: "eng" | "pt",
  issueNumber: number
): Promise<string> {
  const preferredPath = `assets/share/${locale}/${issueNumber}.jpg`;
  const fullPreferredPath = path.join(projectRoot, preferredPath);

  if (await pathExists(fullPreferredPath)) {
    return preferredPath;
  }

  return "assets/share/site-default.jpg";
}

void main();
