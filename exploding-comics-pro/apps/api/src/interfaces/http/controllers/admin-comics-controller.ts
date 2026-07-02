import type { Request, RequestHandler } from "express";
import { z } from "zod";

import type { ArchiveAdminComic } from "../../../application/comics/use-cases/archive-admin-comic";
import type { CreateAdminComic } from "../../../application/comics/use-cases/create-admin-comic";
import type { CreateAdminComicAsset } from "../../../application/comics/use-cases/create-admin-comic-asset";
import type { CreateAdminComicTranslation } from "../../../application/comics/use-cases/create-admin-comic-translation";
import type { GetAdminComicById } from "../../../application/comics/use-cases/get-admin-comic-by-id";
import type { ListAdminComics } from "../../../application/comics/use-cases/list-admin-comics";
import type { PublishAdminComic } from "../../../application/comics/use-cases/publish-admin-comic";
import type { UpdateAdminComicMetadata } from "../../../application/comics/use-cases/update-admin-comic-metadata";
import type { UpdateAdminComicTranslation } from "../../../application/comics/use-cases/update-admin-comic-translation";
import type { UnpublishAdminComic } from "../../../application/comics/use-cases/unpublish-admin-comic";
import type { UpsertAdminComicShareMetadata } from "../../../application/comics/use-cases/upsert-admin-comic-share-metadata";
import { assetTypes } from "../../../domain/comics/constants/asset-types";
import { comicStatuses } from "../../../domain/comics/constants/comic-status";
import { locales } from "../../../domain/comics/constants/locales";
import { mapAdminComicDetailToHttpResponse } from "../mappers/map-admin-comic-detail-to-http-response";
import { mapAdminComicSummaryToHttpResponse } from "../mappers/map-admin-comic-summary-to-http-response";

type ListAdminComicsUseCase = Pick<ListAdminComics, "execute">;
type GetAdminComicByIdUseCase = Pick<GetAdminComicById, "execute">;
type ArchiveAdminComicUseCase = Pick<ArchiveAdminComic, "execute">;
type CreateAdminComicUseCase = Pick<CreateAdminComic, "execute">;
type UpdateAdminComicMetadataUseCase = Pick<UpdateAdminComicMetadata, "execute">;
type CreateAdminComicTranslationUseCase = Pick<CreateAdminComicTranslation, "execute">;
type UpdateAdminComicTranslationUseCase = Pick<UpdateAdminComicTranslation, "execute">;
type CreateAdminComicAssetUseCase = Pick<CreateAdminComicAsset, "execute">;
type UpsertAdminComicShareMetadataUseCase = Pick<
  UpsertAdminComicShareMetadata,
  "execute"
>;
type PublishAdminComicUseCase = Pick<PublishAdminComic, "execute">;
type UnpublishAdminComicUseCase = Pick<UnpublishAdminComic, "execute">;

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const comicIdParamsSchema = z.object({
  comicId: z.coerce.number().int().positive(),
});

const localeParamsSchema = comicIdParamsSchema.extend({
  locale: z.enum(locales),
});

const listAdminComicsQuerySchema = z.object({
  status: z.enum(comicStatuses).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

const createAdminComicBodySchema = z
  .object({
    issueNumber: z.coerce.number().int().positive().nullable().optional(),
    slug: z.string().trim().regex(slugPattern).nullable().optional(),
  })
  .strict();

const updateAdminComicMetadataBodySchema = z
  .object({
    issueNumber: z.coerce.number().int().positive().nullable().optional(),
    slug: z.string().trim().regex(slugPattern).nullable().optional(),
  })
  .strict()
  .refine((value) => value.issueNumber !== undefined || value.slug !== undefined, {
    message: "At least one metadata field must be provided.",
  });

const translationBodySchema = z
  .object({
    title: z.string().trim().min(1),
    bodyMarkdown: z.string().trim().min(1),
    excerpt: z.string().trim().nullable().optional(),
    seoTitle: z.string().trim().nullable().optional(),
    seoDescription: z.string().trim().nullable().optional(),
  })
  .strict();

const createTranslationBodySchema = translationBodySchema.extend({
  locale: z.enum(locales),
});

const createAssetBodySchema = z
  .object({
    locale: z.enum(locales),
    assetType: z.enum(assetTypes),
    path: z.string().trim().min(1),
    mimeType: z.string().trim().min(1),
    width: z.coerce.number().int().positive().nullable().optional(),
    height: z.coerce.number().int().positive().nullable().optional(),
    sortOrder: z.coerce.number().int().min(0),
  })
  .strict();

const upsertShareMetadataBodySchema = z
  .object({
    locale: z.enum(locales),
    shareTitle: z.string().trim().min(1),
    shareDescription: z.string().trim().min(1),
    previewImagePath: z.string().trim().min(1),
  })
  .strict();

export class AdminComicsController {
  constructor(
    private readonly listAdminComics: ListAdminComicsUseCase,
    private readonly getAdminComicById: GetAdminComicByIdUseCase,
    private readonly createAdminComic: CreateAdminComicUseCase,
    private readonly updateAdminComicMetadata: UpdateAdminComicMetadataUseCase,
    private readonly createAdminComicTranslation: CreateAdminComicTranslationUseCase,
    private readonly updateAdminComicTranslation: UpdateAdminComicTranslationUseCase,
    private readonly createAdminComicAsset: CreateAdminComicAssetUseCase,
    private readonly upsertAdminComicShareMetadata: UpsertAdminComicShareMetadataUseCase,
    private readonly publishAdminComic: PublishAdminComicUseCase,
    private readonly archiveAdminComic: ArchiveAdminComicUseCase,
    private readonly unpublishAdminComic: UnpublishAdminComicUseCase
  ) {}

  readonly list: RequestHandler = async (request, response) => {
    const query = listAdminComicsQuerySchema.parse(request.query);
    const comics = await this.listAdminComics.execute({
      limit: query.limit,
      offset: query.offset,
      ...(query.status ? { status: query.status } : {}),
    });

    response.status(200).json({
      data: comics.map(mapAdminComicSummaryToHttpResponse),
      meta: {
        requestId: request.requestId,
        count: comics.length,
        limit: query.limit,
        offset: query.offset,
      },
    });
  };

  readonly getById: RequestHandler = async (request, response) => {
    const { comicId } = comicIdParamsSchema.parse(request.params);
    const comic = await this.getAdminComicById.execute(comicId);

    response.status(200).json({
      data: mapAdminComicDetailToHttpResponse(comic),
      meta: {
        requestId: request.requestId,
      },
    });
  };

  readonly createDraft: RequestHandler = async (request, response) => {
    const body = createAdminComicBodySchema.parse(request.body ?? {});
    const comic = await this.createAdminComic.execute({
      ...(body.issueNumber !== undefined ? { issueNumber: body.issueNumber } : {}),
      ...(body.slug !== undefined ? { slug: body.slug } : {}),
      actorAdminUserId: getActorAdminUserId(request),
    });

    response.status(201).json({
      data: mapAdminComicDetailToHttpResponse(comic),
      meta: {
        requestId: request.requestId,
      },
    });
  };

  readonly updateMetadata: RequestHandler = async (request, response) => {
    const { comicId } = comicIdParamsSchema.parse(request.params);
    const body = updateAdminComicMetadataBodySchema.parse(request.body ?? {});
    const comic = await this.updateAdminComicMetadata.execute({
      comicId,
      ...(body.issueNumber !== undefined ? { issueNumber: body.issueNumber } : {}),
      ...(body.slug !== undefined ? { slug: body.slug } : {}),
      actorAdminUserId: getActorAdminUserId(request),
    });

    response.status(200).json({
      data: mapAdminComicDetailToHttpResponse(comic),
      meta: {
        requestId: request.requestId,
      },
    });
  };

  readonly createTranslation: RequestHandler = async (request, response) => {
    const { comicId } = comicIdParamsSchema.parse(request.params);
    const body = createTranslationBodySchema.parse(request.body ?? {});
    const comic = await this.createAdminComicTranslation.execute({
      comicId,
      locale: body.locale,
      title: body.title,
      bodyMarkdown: body.bodyMarkdown,
      ...(body.excerpt !== undefined ? { excerpt: body.excerpt } : {}),
      ...(body.seoTitle !== undefined ? { seoTitle: body.seoTitle } : {}),
      ...(body.seoDescription !== undefined ? { seoDescription: body.seoDescription } : {}),
      actorAdminUserId: getActorAdminUserId(request),
    });

    response.status(201).json({
      data: mapAdminComicDetailToHttpResponse(comic),
      meta: {
        requestId: request.requestId,
      },
    });
  };

  readonly updateTranslation: RequestHandler = async (request, response) => {
    const { comicId, locale } = localeParamsSchema.parse(request.params);
    const body = translationBodySchema.parse(request.body ?? {});
    const comic = await this.updateAdminComicTranslation.execute({
      comicId,
      locale,
      title: body.title,
      bodyMarkdown: body.bodyMarkdown,
      ...(body.excerpt !== undefined ? { excerpt: body.excerpt } : {}),
      ...(body.seoTitle !== undefined ? { seoTitle: body.seoTitle } : {}),
      ...(body.seoDescription !== undefined ? { seoDescription: body.seoDescription } : {}),
      actorAdminUserId: getActorAdminUserId(request),
    });

    response.status(200).json({
      data: mapAdminComicDetailToHttpResponse(comic),
      meta: {
        requestId: request.requestId,
      },
    });
  };

  readonly createAsset: RequestHandler = async (request, response) => {
    const { comicId } = comicIdParamsSchema.parse(request.params);
    const body = createAssetBodySchema.parse(request.body ?? {});
    const comic = await this.createAdminComicAsset.execute({
      comicId,
      locale: body.locale,
      assetType: body.assetType,
      path: body.path,
      mimeType: body.mimeType,
      ...(body.width !== undefined ? { width: body.width } : {}),
      ...(body.height !== undefined ? { height: body.height } : {}),
      sortOrder: body.sortOrder,
      actorAdminUserId: getActorAdminUserId(request),
    });

    response.status(201).json({
      data: mapAdminComicDetailToHttpResponse(comic),
      meta: {
        requestId: request.requestId,
      },
    });
  };

  readonly upsertShareMetadata: RequestHandler = async (request, response) => {
    const { comicId } = comicIdParamsSchema.parse(request.params);
    const body = upsertShareMetadataBodySchema.parse(request.body ?? {});
    const comic = await this.upsertAdminComicShareMetadata.execute({
      comicId,
      locale: body.locale,
      shareTitle: body.shareTitle,
      shareDescription: body.shareDescription,
      previewImagePath: body.previewImagePath,
      actorAdminUserId: getActorAdminUserId(request),
    });

    response.status(200).json({
      data: mapAdminComicDetailToHttpResponse(comic),
      meta: {
        requestId: request.requestId,
      },
    });
  };

  readonly publish: RequestHandler = async (request, response) => {
    const { comicId } = comicIdParamsSchema.parse(request.params);
    const comic = await this.publishAdminComic.execute({
      comicId,
      actorAdminUserId: getActorAdminUserId(request),
    });

    response.status(200).json({
      data: mapAdminComicDetailToHttpResponse(comic),
      meta: {
        requestId: request.requestId,
      },
    });
  };

  readonly archive: RequestHandler = async (request, response) => {
    const { comicId } = comicIdParamsSchema.parse(request.params);
    const comic = await this.archiveAdminComic.execute({
      comicId,
      actorAdminUserId: getActorAdminUserId(request),
    });

    response.status(200).json({
      data: mapAdminComicDetailToHttpResponse(comic),
      meta: {
        requestId: request.requestId,
      },
    });
  };

  readonly unpublish: RequestHandler = async (request, response) => {
    const { comicId } = comicIdParamsSchema.parse(request.params);
    const comic = await this.unpublishAdminComic.execute({
      comicId,
      actorAdminUserId: getActorAdminUserId(request),
    });

    response.status(200).json({
      data: mapAdminComicDetailToHttpResponse(comic),
      meta: {
        requestId: request.requestId,
      },
    });
  };
}

function getActorAdminUserId(request: Request): number | null {
  return request.adminUser?.id ?? null;
}
