import type { ComicInteractionRepository } from "../contracts/comic-interaction-repository";

export interface UnlikeComicInput {
  comicId: number;
  visitorId: string;
}

export class UnlikeComic {
  constructor(private readonly comicInteractionRepository: ComicInteractionRepository) {}

  async execute(input: UnlikeComicInput): Promise<void> {
    await this.comicInteractionRepository.unlikeComic(input);
  }
}
