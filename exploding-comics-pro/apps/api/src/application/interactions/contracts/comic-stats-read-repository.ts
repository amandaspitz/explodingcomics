export interface PublicComicStats {
  comicId: number;
  likesCount: number;
  viewsCount: number;
  likedByVisitor: boolean | null;
}

export interface GetPublicComicStatsRepositoryInput {
  comicId: number;
  visitorId?: string;
}

export interface ComicStatsReadRepository {
  getPublicStatsByComicId(
    input: GetPublicComicStatsRepositoryInput
  ): Promise<PublicComicStats>;
}
