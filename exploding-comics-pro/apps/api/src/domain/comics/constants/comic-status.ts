export const comicStatuses = ["draft", "scheduled", "published", "archived"] as const;

export type ComicStatus = (typeof comicStatuses)[number];
