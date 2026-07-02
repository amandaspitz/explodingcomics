export interface RegisterComicViewInput {
  comicId: number;
  visitorId: string;
  viewDateBucket: string;
}

export interface LikeComicInput {
  comicId: number;
  visitorId: string;
}

export interface UnlikeComicInput {
  comicId: number;
  visitorId: string;
}

export interface ComicInteractionRepository {
  registerView(input: RegisterComicViewInput): Promise<void>;
  likeComic(input: LikeComicInput): Promise<void>;
  unlikeComic(input: UnlikeComicInput): Promise<void>;
}
