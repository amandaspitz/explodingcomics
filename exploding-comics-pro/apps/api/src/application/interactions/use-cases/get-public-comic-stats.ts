import type {
  ComicStatsReadRepository,
  PublicComicStats,
} from "../contracts/comic-stats-read-repository";

export interface GetPublicComicStatsInput {
  comicId: number;
  visitorId?: string;
}

export class GetPublicComicStats {
  constructor(private readonly comicStatsReadRepository: ComicStatsReadRepository) {}

  async execute(input: GetPublicComicStatsInput): Promise<PublicComicStats> {
    return this.comicStatsReadRepository.getPublicStatsByComicId(input);
  }
}
