import type { PublishedComicSummary } from "../../../application/comics/contracts/comic-read-repository";

export function mapPublishedComicSummaryToHttpResponse(comic: PublishedComicSummary) {
  return {
    id: comic.id,
    issueNumber: comic.issueNumber,
    slug: comic.slug,
    publishedAt: comic.publishedAt,
    translations: comic.translations.map((translation) => ({
      locale: translation.locale,
      title: translation.title,
      excerpt: translation.excerpt,
    })),
    shareMetadata: comic.shareMetadata.map((shareMetadata) => ({
      locale: shareMetadata.locale,
      shareTitle: shareMetadata.shareTitle,
      shareDescription: shareMetadata.shareDescription,
      previewImagePath: shareMetadata.previewImagePath,
    })),
  };
}
