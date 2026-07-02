import type {
  ComicReadRepository,
  PublishedComicDetail,
} from "../contracts/comic-read-repository";

export type PublishedComicIdentifier =
  | { issueNumber: number; slug?: never }
  | { slug: string; issueNumber?: never };

export class GetPublishedComicByIdentifier {
  constructor(private readonly comicReadRepository: ComicReadRepository) {}

  async execute(identifier: PublishedComicIdentifier): Promise<PublishedComicDetail | null> {
    if ("issueNumber" in identifier) {
      return this.comicReadRepository.findPublishedComicByIssueNumber(identifier.issueNumber);
    }

    return this.comicReadRepository.findPublishedComicBySlug(identifier.slug);
  }
}
