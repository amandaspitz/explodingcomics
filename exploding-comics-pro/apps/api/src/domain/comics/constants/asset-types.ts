export const assetTypes = ["comic_page", "share_preview", "cover"] as const;

export type AssetType = (typeof assetTypes)[number];
