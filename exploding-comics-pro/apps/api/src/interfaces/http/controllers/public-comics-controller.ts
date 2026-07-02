import type { RequestHandler } from "express";
import { z } from "zod";

import type { GetPublishedComicByIdentifier } from "../../../application/comics/use-cases/get-published-comic-by-identifier";
import type { ListPublishedComics } from "../../../application/comics/use-cases/list-published-comics";
import type { GetPublicComicStats } from "../../../application/interactions/use-cases/get-public-comic-stats";
import type { LikeComic } from "../../../application/interactions/use-cases/like-comic";
import type { RegisterComicView } from "../../../application/interactions/use-cases/register-comic-view";
import type { UnlikeComic } from "../../../application/interactions/use-cases/unlike-comic";
import { ApplicationError } from "../../../application/shared/errors/application-error";
import { locales } from "../../../domain/comics/constants/locales";
import type { PublishedComicIdentifier } from "../../../application/comics/use-cases/get-published-comic-by-identifier";
import { mapPublicComicStatsToHttpResponse } from "../mappers/map-public-comic-stats-to-http-response";
import { mapPublishedComicDetailToHttpResponse } from "../mappers/map-published-comic-detail-to-http-response";
import { mapPublishedComicSummaryToHttpResponse } from "../mappers/map-published-comic-summary-to-http-response";

type ListPublishedComicsUseCase = Pick<ListPublishedComics, "execute">;
type GetPublishedComicByIdentifierUseCase = Pick<GetPublishedComicByIdentifier, "execute">;
type GetPublicComicStatsUseCase = Pick<GetPublicComicStats, "execute">;
type RegisterComicViewUseCase = Pick<RegisterComicView, "execute">;
type LikeComicUseCase = Pick<LikeComic, "execute">;
type UnlikeComicUseCase = Pick<UnlikeComic, "execute">;

const listPublishedComicsQuerySchema = z.object({
  locale: z.enum(locales).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

const getPublishedComicByIdentifierParamsSchema = z.object({
  issueOrSlug: z.string().trim().min(1),
});

const visitorIdSchema = z.uuid();

const publicComicStatsQuerySchema = z.object({
  visitorId: visitorIdSchema.optional(),
});

const viewerBodySchema = z
  .object({
    visitorId: visitorIdSchema,
  })
  .strict();

const unlikeComicParamsSchema = getPublishedComicByIdentifierParamsSchema.extend({
  visitorId: visitorIdSchema,
});

export class PublicComicsController {
  constructor(
    private readonly listPublishedComics: ListPublishedComicsUseCase,
    private readonly getPublishedComicByIdentifier: GetPublishedComicByIdentifierUseCase,
    private readonly getPublicComicStats: GetPublicComicStatsUseCase,
    private readonly registerComicView: RegisterComicViewUseCase,
    private readonly likeComic: LikeComicUseCase,
    private readonly unlikeComic: UnlikeComicUseCase
  ) {}

  readonly listPublished: RequestHandler = async (request, response) => {
    const query = listPublishedComicsQuerySchema.parse(request.query);
    const useCaseInput = {
      limit: query.limit,
      offset: query.offset,
      ...(query.locale ? { locale: query.locale } : {}),
    };
    const comics = await this.listPublishedComics.execute(useCaseInput);

    response.status(200).json({
      data: comics.map(mapPublishedComicSummaryToHttpResponse),
      meta: {
        requestId: request.requestId,
        count: comics.length,
        limit: query.limit,
        offset: query.offset,
      },
    });
  };

  readonly getByIdentifier: RequestHandler = async (request, response) => {
    const { issueOrSlug } = getPublishedComicByIdentifierParamsSchema.parse(request.params);
    const identifier = parsePublishedComicIdentifier(issueOrSlug);
    const comic = await this.getPublishedComicByIdentifier.execute(identifier);

    if (!comic) {
      throw createComicNotFoundError(issueOrSlug);
    }

    response.status(200).json({
      data: mapPublishedComicDetailToHttpResponse(comic),
      meta: {
        requestId: request.requestId,
      },
    });
  };

  readonly getStatsByIdentifier: RequestHandler = async (request, response) => {
    const { issueOrSlug } = getPublishedComicByIdentifierParamsSchema.parse(request.params);
    const query = publicComicStatsQuerySchema.parse(request.query);
    const identifier = parsePublishedComicIdentifier(issueOrSlug);
    const comic = await this.getPublishedComicByIdentifier.execute(identifier);

    if (!comic) {
      throw createComicNotFoundError(issueOrSlug);
    }

    const stats = await this.getPublicComicStats.execute({
      comicId: comic.id,
      ...(query.visitorId ? { visitorId: query.visitorId } : {}),
    });

    response.status(200).json({
      data: mapPublicComicStatsToHttpResponse({
        comicId: comic.id,
        issueNumber: comic.issueNumber,
        slug: comic.slug,
        likesCount: stats.likesCount,
        viewsCount: stats.viewsCount,
        likedByVisitor: stats.likedByVisitor,
      }),
      meta: {
        requestId: request.requestId,
      },
    });
  };

  readonly registerViewByIdentifier: RequestHandler = async (request, response) => {
    const { issueOrSlug } = getPublishedComicByIdentifierParamsSchema.parse(request.params);
    const body = viewerBodySchema.parse(request.body ?? {});
    const comic = await this.resolvePublishedComicOrThrow(issueOrSlug);

    await this.registerComicView.execute({
      comicId: comic.id,
      visitorId: body.visitorId,
    });

    const stats = await this.getPublicComicStats.execute({
      comicId: comic.id,
      visitorId: body.visitorId,
    });

    response.status(200).json({
      data: mapPublicComicStatsToHttpResponse({
        comicId: comic.id,
        issueNumber: comic.issueNumber,
        slug: comic.slug,
        likesCount: stats.likesCount,
        viewsCount: stats.viewsCount,
        likedByVisitor: stats.likedByVisitor,
      }),
      meta: {
        requestId: request.requestId,
      },
    });
  };

  readonly likeByIdentifier: RequestHandler = async (request, response) => {
    const { issueOrSlug } = getPublishedComicByIdentifierParamsSchema.parse(request.params);
    const body = viewerBodySchema.parse(request.body ?? {});
    const comic = await this.resolvePublishedComicOrThrow(issueOrSlug);

    await this.likeComic.execute({
      comicId: comic.id,
      visitorId: body.visitorId,
    });

    const stats = await this.getPublicComicStats.execute({
      comicId: comic.id,
      visitorId: body.visitorId,
    });

    response.status(200).json({
      data: mapPublicComicStatsToHttpResponse({
        comicId: comic.id,
        issueNumber: comic.issueNumber,
        slug: comic.slug,
        likesCount: stats.likesCount,
        viewsCount: stats.viewsCount,
        likedByVisitor: stats.likedByVisitor,
      }),
      meta: {
        requestId: request.requestId,
      },
    });
  };

  readonly unlikeByIdentifier: RequestHandler = async (request, response) => {
    const { issueOrSlug, visitorId } = unlikeComicParamsSchema.parse(request.params);
    const comic = await this.resolvePublishedComicOrThrow(issueOrSlug);

    await this.unlikeComic.execute({
      comicId: comic.id,
      visitorId,
    });

    const stats = await this.getPublicComicStats.execute({
      comicId: comic.id,
      visitorId,
    });

    response.status(200).json({
      data: mapPublicComicStatsToHttpResponse({
        comicId: comic.id,
        issueNumber: comic.issueNumber,
        slug: comic.slug,
        likesCount: stats.likesCount,
        viewsCount: stats.viewsCount,
        likedByVisitor: stats.likedByVisitor,
      }),
      meta: {
        requestId: request.requestId,
      },
    });
  };

  private async resolvePublishedComicOrThrow(issueOrSlug: string) {
    const comic = await this.getPublishedComicByIdentifier.execute(
      parsePublishedComicIdentifier(issueOrSlug)
    );

    if (!comic) {
      throw createComicNotFoundError(issueOrSlug);
    }

    return comic;
  }
}

function parsePublishedComicIdentifier(issueOrSlug: string): PublishedComicIdentifier {
  return /^\d+$/.test(issueOrSlug)
    ? { issueNumber: Number(issueOrSlug) }
    : { slug: issueOrSlug };
}

function createComicNotFoundError(issueOrSlug: string): ApplicationError {
  return new ApplicationError({
    code: "COMIC_NOT_FOUND",
    message: `Published comic "${issueOrSlug}" was not found.`,
    statusCode: 404,
  });
}
