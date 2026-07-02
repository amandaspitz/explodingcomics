import type { Locale } from "../../../domain/comics/constants/locales";
import type {
  ComicReadRepository,
  PublishedComicSummary,
} from "../contracts/comic-read-repository";

export interface ListPublishedComicsInput {
  locale?: Locale;
  limit?: number;
  offset?: number;
}

export class ListPublishedComics {
  constructor(private readonly comicReadRepository: ComicReadRepository) {}

  async execute(input: ListPublishedComicsInput = {}): Promise<PublishedComicSummary[]> {
    const repositoryInput = {
      limit: input.limit ?? 20,
      offset: input.offset ?? 0,
      ...(input.locale ? { locale: input.locale } : {}),
    };

    return this.comicReadRepository.listPublishedComics({
      ...repositoryInput,
    });
  }
}
