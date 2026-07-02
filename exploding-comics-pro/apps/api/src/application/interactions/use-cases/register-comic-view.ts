import type { ComicInteractionRepository } from "../contracts/comic-interaction-repository";

export interface RegisterComicViewInput {
  comicId: number;
  visitorId: string;
  viewedAt?: Date;
}

export class RegisterComicView {
  constructor(private readonly comicInteractionRepository: ComicInteractionRepository) {}

  async execute(input: RegisterComicViewInput): Promise<void> {
    const viewedAt = input.viewedAt ?? new Date();
    const viewDateBucket = viewedAt.toISOString().slice(0, 10);

    await this.comicInteractionRepository.registerView({
      comicId: input.comicId,
      visitorId: input.visitorId,
      viewDateBucket,
    });
  }
}
