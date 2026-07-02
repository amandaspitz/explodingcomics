import type { PublishedComicDetail } from "../../../application/comics/contracts/comic-read-repository";

export function mapPublishedComicDetailToHttpResponse(comic: PublishedComicDetail) {
  return {
    id: comic.id,
    issueNumber: comic.issueNumber,
    slug: comic.slug,
    status: comic.status,
    publishedAt: comic.publishedAt,
    translations: comic.translations.map((translation) => ({
      locale: translation.locale,
      title: translation.title,
      bodyMarkdown: translation.bodyMarkdown,
      excerpt: translation.excerpt,
      seoTitle: translation.seoTitle,
      seoDescription: translation.seoDescription,
    })),
    assets: comic.assets.map((asset) => ({
      locale: asset.locale,
      assetType: asset.assetType,
      path: asset.path,
      mimeType: asset.mimeType,
      width: asset.width,
      height: asset.height,
      sortOrder: asset.sortOrder,
    })),
    shareMetadata: comic.shareMetadata.map((shareMetadata) => ({
      locale: shareMetadata.locale,
      shareTitle: shareMetadata.shareTitle,
      shareDescription: shareMetadata.shareDescription,
      previewImagePath: shareMetadata.previewImagePath,
    })),
  };
}
