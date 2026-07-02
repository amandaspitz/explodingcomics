import type { AdminComicDetail } from "../../../application/comics/contracts/admin-comic-command-repository";

export function mapAdminComicDetailToHttpResponse(comic: AdminComicDetail) {
  return {
    id: comic.id,
    issueNumber: comic.issueNumber,
    slug: comic.slug,
    status: comic.status,
    publishedAt: comic.publishedAt,
    createdAt: comic.createdAt,
    updatedAt: comic.updatedAt,
    translations: comic.translations.map((translation) => ({
      locale: translation.locale,
      title: translation.title,
      bodyMarkdown: translation.bodyMarkdown,
      excerpt: translation.excerpt,
      seoTitle: translation.seoTitle,
      seoDescription: translation.seoDescription,
    })),
    assets: comic.assets.map((asset) => ({
      id: asset.id,
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
