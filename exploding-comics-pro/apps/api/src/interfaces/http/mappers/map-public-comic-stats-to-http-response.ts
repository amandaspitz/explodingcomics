export interface MapPublicComicStatsToHttpResponseInput {
  comicId: number;
  issueNumber: number;
  slug: string;
  likesCount: number;
  viewsCount: number;
  likedByVisitor: boolean | null;
}

export function mapPublicComicStatsToHttpResponse(
  input: MapPublicComicStatsToHttpResponseInput
) {
  return {
    comicId: input.comicId,
    issueNumber: input.issueNumber,
    slug: input.slug,
    likesCount: input.likesCount,
    viewsCount: input.viewsCount,
    likedByVisitor: input.likedByVisitor,
  };
}
