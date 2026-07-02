import type { Pool, PoolConnection, ResultSetHeader } from "mysql2/promise";

import {
  ApplicationError,
} from "../../../application/shared/errors/application-error";
import type {
  ArchiveAdminComicRepositoryInput,
  AdminComicAssetRecord,
  AdminComicCommandRepository,
  AdminComicDetail,
  AdminComicShareMetadataRecord,
  AdminComicTranslationRecord,
  CreateAdminComicAssetInput,
  CreateAdminComicInput,
  CreateAdminComicTranslationInput,
  PublishAdminComicInput,
  UpdateAdminComicMetadataInput,
  UpdateAdminComicTranslationInput,
  UnpublishAdminComicRepositoryInput,
  UpsertAdminComicShareMetadataInput,
} from "../../../application/comics/contracts/admin-comic-command-repository";
import type { ComicStatus } from "../../../domain/comics/constants/comic-status";
import type { Locale } from "../../../domain/comics/constants/locales";

interface AdminComicBaseRow {
  id: number;
  issue_number: number | null;
  slug: string | null;
  status: ComicStatus;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

interface AdminComicTranslationRow {
  locale: Locale;
  title: string;
  body_markdown: string;
  excerpt: string | null;
  seo_title: string | null;
  seo_description: string | null;
}

interface AdminComicAssetRow {
  id: number;
  locale: Locale;
  asset_type: AdminComicAssetRecord["assetType"];
  path: string;
  mime_type: string;
  width: number | null;
  height: number | null;
  sort_order: number;
}

interface AdminComicShareMetadataRow {
  locale: Locale;
  share_title: string;
  share_description: string;
  preview_image_path: string;
}

type Queryable = Pick<Pool, "execute">;

export class MySqlAdminComicCommandRepository implements AdminComicCommandRepository {
  constructor(private readonly mySqlPool: Pool) {}

  async findComicById(comicId: number): Promise<AdminComicDetail | null> {
    return this.findComicByIdUsing(this.mySqlPool, comicId);
  }

  async createDraftComic(input: CreateAdminComicInput): Promise<AdminComicDetail> {
    return this.runInTransaction(async (connection) => {
      const [result] = (await connection.execute(
        `
          INSERT INTO comics (issue_number, slug, status, published_at)
          VALUES (?, ?, 'draft', NULL)
        `,
        [input.issueNumber, input.slug]
      )) as [ResultSetHeader, unknown];
      const comicId = Number(result.insertId);

      await this.insertAuditLog(connection, {
        actorAdminUserId: input.actorAdminUserId,
        action: "comic.created",
        entityType: "comic",
        entityId: comicId,
        payloadJson: {
          issueNumber: input.issueNumber,
          slug: input.slug,
          status: "draft",
        },
      });

      const comic = await this.findComicByIdUsing(connection, comicId);

      if (!comic) {
        throw new ApplicationError({
          code: "ADMIN_COMIC_NOT_FOUND",
          message: `Comic ${comicId} was not found after creation.`,
        });
      }

      return comic;
    });
  }

  async updateComicMetadata(
    comicId: number,
    input: UpdateAdminComicMetadataInput
  ): Promise<AdminComicDetail | null> {
    return this.runInTransaction(async (connection) => {
      const updates: string[] = [];
      const parameters: Array<number | string | null> = [];

      if (input.issueNumber !== undefined) {
        updates.push("issue_number = ?");
        parameters.push(input.issueNumber);
      }

      if (input.slug !== undefined) {
        updates.push("slug = ?");
        parameters.push(input.slug);
      }

      if (updates.length === 0) {
        return this.findComicByIdUsing(connection, comicId);
      }

      parameters.push(comicId);

      await connection.execute(
        `
          UPDATE comics
          SET ${updates.join(", ")}
          WHERE id = ?
        `,
        parameters
      );

      await this.insertAuditLog(connection, {
        actorAdminUserId: input.actorAdminUserId,
        action: "comic.metadata_updated",
        entityType: "comic",
        entityId: comicId,
        payloadJson: {
          issueNumber: input.issueNumber,
          slug: input.slug,
        },
      });

      return this.findComicByIdUsing(connection, comicId);
    });
  }

  async createComicTranslation(
    comicId: number,
    input: CreateAdminComicTranslationInput
  ): Promise<AdminComicDetail> {
    return this.runInTransaction(async (connection) => {
      await connection.execute(
        `
          INSERT INTO comic_translations
            (comic_id, locale, title, body_markdown, excerpt, seo_title, seo_description)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          comicId,
          input.locale,
          input.title,
          input.bodyMarkdown,
          input.excerpt,
          input.seoTitle,
          input.seoDescription,
        ]
      );

      await this.insertAuditLog(connection, {
        actorAdminUserId: input.actorAdminUserId,
        action: "comic.translation_created",
        entityType: "comic_translation",
        entityId: comicId,
        payloadJson: {
          locale: input.locale,
          title: input.title,
        },
      });

      const comic = await this.findComicByIdUsing(connection, comicId);

      if (!comic) {
        throw new ApplicationError({
          code: "ADMIN_COMIC_NOT_FOUND",
          message: `Comic ${comicId} was not found after translation creation.`,
        });
      }

      return comic;
    });
  }

  async updateComicTranslation(
    comicId: number,
    locale: Locale,
    input: UpdateAdminComicTranslationInput
  ): Promise<AdminComicDetail> {
    return this.runInTransaction(async (connection) => {
      await connection.execute(
        `
          UPDATE comic_translations
          SET
            title = ?,
            body_markdown = ?,
            excerpt = ?,
            seo_title = ?,
            seo_description = ?
          WHERE comic_id = ?
            AND locale = ?
        `,
        [
          input.title,
          input.bodyMarkdown,
          input.excerpt,
          input.seoTitle,
          input.seoDescription,
          comicId,
          locale,
        ]
      );

      await this.insertAuditLog(connection, {
        actorAdminUserId: input.actorAdminUserId,
        action: "comic.translation_updated",
        entityType: "comic_translation",
        entityId: comicId,
        payloadJson: {
          locale,
          title: input.title,
        },
      });

      const comic = await this.findComicByIdUsing(connection, comicId);

      if (!comic) {
        throw new ApplicationError({
          code: "ADMIN_COMIC_NOT_FOUND",
          message: `Comic ${comicId} was not found after translation update.`,
        });
      }

      return comic;
    });
  }

  async createComicAsset(
    comicId: number,
    input: CreateAdminComicAssetInput
  ): Promise<AdminComicDetail> {
    return this.runInTransaction(async (connection) => {
      await connection.execute(
        `
          INSERT INTO comic_assets
            (comic_id, locale, asset_type, path, mime_type, width, height, sort_order)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          comicId,
          input.locale,
          input.assetType,
          input.path,
          input.mimeType,
          input.width,
          input.height,
          input.sortOrder,
        ]
      );

      await this.insertAuditLog(connection, {
        actorAdminUserId: input.actorAdminUserId,
        action: "comic.asset_created",
        entityType: "comic_asset",
        entityId: comicId,
        payloadJson: {
          locale: input.locale,
          assetType: input.assetType,
          path: input.path,
          sortOrder: input.sortOrder,
        },
      });

      const comic = await this.findComicByIdUsing(connection, comicId);

      if (!comic) {
        throw new ApplicationError({
          code: "ADMIN_COMIC_NOT_FOUND",
          message: `Comic ${comicId} was not found after asset creation.`,
        });
      }

      return comic;
    });
  }

  async upsertComicShareMetadata(
    comicId: number,
    input: UpsertAdminComicShareMetadataInput
  ): Promise<AdminComicDetail> {
    return this.runInTransaction(async (connection) => {
      await connection.execute(
        `
          INSERT INTO comic_share_metadata
            (comic_id, locale, share_title, share_description, preview_image_path)
          VALUES (?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            share_title = VALUES(share_title),
            share_description = VALUES(share_description),
            preview_image_path = VALUES(preview_image_path)
        `,
        [
          comicId,
          input.locale,
          input.shareTitle,
          input.shareDescription,
          input.previewImagePath,
        ]
      );

      await this.insertAuditLog(connection, {
        actorAdminUserId: input.actorAdminUserId,
        action: "comic.share_metadata_upserted",
        entityType: "comic_share_metadata",
        entityId: comicId,
        payloadJson: {
          locale: input.locale,
          shareTitle: input.shareTitle,
          previewImagePath: input.previewImagePath,
        },
      });

      const comic = await this.findComicByIdUsing(connection, comicId);

      if (!comic) {
        throw new ApplicationError({
          code: "ADMIN_COMIC_NOT_FOUND",
          message: `Comic ${comicId} was not found after share metadata upsert.`,
        });
      }

      return comic;
    });
  }

  async publishComic(comicId: number, input: PublishAdminComicInput): Promise<AdminComicDetail> {
    return this.runInTransaction(async (connection) => {
      await connection.execute(
        `
          UPDATE comics
          SET
            status = 'published',
            published_at = ?,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `,
        [input.publishedAt, comicId]
      );

      await this.insertAuditLog(connection, {
        actorAdminUserId: input.actorAdminUserId,
        action: "comic.published",
        entityType: "comic",
        entityId: comicId,
        payloadJson: {
          status: "published",
          publishedAt: input.publishedAt.toISOString(),
        },
      });

      const comic = await this.findComicByIdUsing(connection, comicId);

      if (!comic) {
        throw new ApplicationError({
          code: "ADMIN_COMIC_NOT_FOUND",
          message: `Comic ${comicId} was not found after publication.`,
        });
      }

      return comic;
    });
  }

  async archiveComic(
    comicId: number,
    input: ArchiveAdminComicRepositoryInput
  ): Promise<AdminComicDetail> {
    return this.runInTransaction(async (connection) => {
      await connection.execute(
        `
          UPDATE comics
          SET
            status = 'archived',
            published_at = NULL,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `,
        [comicId]
      );

      await this.insertAuditLog(connection, {
        actorAdminUserId: input.actorAdminUserId,
        action: "comic.archived",
        entityType: "comic",
        entityId: comicId,
        payloadJson: {
          status: "archived",
        },
      });

      const comic = await this.findComicByIdUsing(connection, comicId);

      if (!comic) {
        throw new ApplicationError({
          code: "ADMIN_COMIC_NOT_FOUND",
          message: `Comic ${comicId} was not found after archive.`,
        });
      }

      return comic;
    });
  }

  async unpublishComic(
    comicId: number,
    input: UnpublishAdminComicRepositoryInput
  ): Promise<AdminComicDetail> {
    return this.runInTransaction(async (connection) => {
      await connection.execute(
        `
          UPDATE comics
          SET
            status = 'draft',
            published_at = NULL,
            updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `,
        [comicId]
      );

      await this.insertAuditLog(connection, {
        actorAdminUserId: input.actorAdminUserId,
        action: "comic.unpublished",
        entityType: "comic",
        entityId: comicId,
        payloadJson: {
          status: "draft",
        },
      });

      const comic = await this.findComicByIdUsing(connection, comicId);

      if (!comic) {
        throw new ApplicationError({
          code: "ADMIN_COMIC_NOT_FOUND",
          message: `Comic ${comicId} was not found after unpublish.`,
        });
      }

      return comic;
    });
  }

  private async findComicByIdUsing(
    queryable: Queryable,
    comicId: number
  ): Promise<AdminComicDetail | null> {
    const [baseRowsRaw] = await queryable.execute(
      `
        SELECT
          c.id,
          c.issue_number,
          c.slug,
          c.status,
          c.published_at,
          c.created_at,
          c.updated_at
        FROM comics c
        WHERE c.id = ?
        LIMIT 1
      `,
      [comicId]
    );
    const baseRows = baseRowsRaw as AdminComicBaseRow[];
    const comic = baseRows[0];

    if (!comic) {
      return null;
    }

    const [translationRowsRaw] = await queryable.execute(
      `
        SELECT
          locale,
          title,
          body_markdown,
          excerpt,
          seo_title,
          seo_description
        FROM comic_translations
        WHERE comic_id = ?
        ORDER BY locale ASC
      `,
      [comicId]
    );
    const [assetRowsRaw] = await queryable.execute(
      `
        SELECT
          id,
          locale,
          asset_type,
          path,
          mime_type,
          width,
          height,
          sort_order
        FROM comic_assets
        WHERE comic_id = ?
        ORDER BY locale ASC, asset_type ASC, sort_order ASC
      `,
      [comicId]
    );
    const [shareRowsRaw] = await queryable.execute(
      `
        SELECT
          locale,
          share_title,
          share_description,
          preview_image_path
        FROM comic_share_metadata
        WHERE comic_id = ?
        ORDER BY locale ASC
      `,
      [comicId]
    );
    const translationRows = translationRowsRaw as AdminComicTranslationRow[];
    const assetRows = assetRowsRaw as AdminComicAssetRow[];
    const shareRows = shareRowsRaw as AdminComicShareMetadataRow[];

    return {
      id: comic.id,
      issueNumber: comic.issue_number,
      slug: comic.slug,
      status: comic.status,
      publishedAt: comic.published_at,
      createdAt: comic.created_at,
      updatedAt: comic.updated_at,
      translations: translationRows.map<AdminComicTranslationRecord>((translation) => ({
        locale: translation.locale,
        title: translation.title,
        bodyMarkdown: translation.body_markdown,
        excerpt: translation.excerpt,
        seoTitle: translation.seo_title,
        seoDescription: translation.seo_description,
      })),
      assets: assetRows.map<AdminComicAssetRecord>((asset) => ({
        id: asset.id,
        locale: asset.locale,
        assetType: asset.asset_type,
        path: asset.path,
        mimeType: asset.mime_type,
        width: asset.width,
        height: asset.height,
        sortOrder: asset.sort_order,
      })),
      shareMetadata: shareRows.map<AdminComicShareMetadataRecord>((share) => ({
        locale: share.locale,
        shareTitle: share.share_title,
        shareDescription: share.share_description,
        previewImagePath: share.preview_image_path,
      })),
    };
  }

  private async insertAuditLog(
    connection: PoolConnection,
    input: {
      actorAdminUserId: number | null;
      action: string;
      entityType: string;
      entityId: number;
      payloadJson: unknown;
    }
  ): Promise<void> {
    await connection.execute(
      `
        INSERT INTO audit_logs
          (actor_admin_user_id, action, entity_type, entity_id, payload_json)
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        input.actorAdminUserId,
        input.action,
        input.entityType,
        input.entityId,
        JSON.stringify(input.payloadJson),
      ]
    );
  }

  private async runInTransaction<T>(work: (connection: PoolConnection) => Promise<T>): Promise<T> {
    const connection = await this.mySqlPool.getConnection();

    try {
      await connection.beginTransaction();
      const result = await work(connection);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw this.mapMutationError(error);
    } finally {
      connection.release();
    }
  }

  private mapMutationError(error: unknown): unknown {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      typeof error.code === "string" &&
      error.code === "ER_DUP_ENTRY"
    ) {
      const message = "message" in error && typeof error.message === "string" ? error.message : "";

      if (message.includes("uq_comics_issue_number")) {
        return new ApplicationError({
          code: "COMIC_ISSUE_NUMBER_CONFLICT",
          message: "Another comic already uses this issue number.",
          statusCode: 409,
        });
      }

      if (message.includes("uq_comics_slug")) {
        return new ApplicationError({
          code: "COMIC_SLUG_CONFLICT",
          message: "Another comic already uses this slug.",
          statusCode: 409,
        });
      }

      if (message.includes("uq_comic_translation_comic_locale")) {
        return new ApplicationError({
          code: "COMIC_TRANSLATION_CONFLICT",
          message: "This comic already has a translation for the provided locale.",
          statusCode: 409,
        });
      }

      if (message.includes("uq_comic_asset_scope")) {
        return new ApplicationError({
          code: "COMIC_ASSET_CONFLICT",
          message: "This comic already has an asset for the provided locale, type, and sort order.",
          statusCode: 409,
        });
      }
    }

    return error;
  }
}
