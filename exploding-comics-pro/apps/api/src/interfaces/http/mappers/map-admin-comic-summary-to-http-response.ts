import type { AdminComicSummary } from "../../../application/comics/contracts/admin-comic-read-repository";

export function mapAdminComicSummaryToHttpResponse(comic: AdminComicSummary) {
  return {
    id: comic.id,
    issueNumber: comic.issueNumber,
    slug: comic.slug,
    status: comic.status,
    publishedAt: comic.publishedAt,
    updatedAt: comic.updatedAt,
    translationLocales: comic.translationLocales,
    assetLocales: comic.assetLocales,
    shareLocales: comic.shareLocales,
  };
}
