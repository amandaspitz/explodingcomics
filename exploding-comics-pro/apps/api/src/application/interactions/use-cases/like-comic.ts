import type { ComicInteractionRepository } from "../contracts/comic-interaction-repository";

export interface LikeComicInput {
  comicId: number;
  visitorId: string;
}

export class LikeComic {
  constructor(private readonly comicInteractionRepository: ComicInteractionRepository) {}

  async execute(input: LikeComicInput): Promise<void> {
    await this.comicInteractionRepository.likeComic(input);
  }
}
