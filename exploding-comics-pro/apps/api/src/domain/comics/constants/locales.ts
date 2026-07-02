export const locales = ["eng", "pt"] as const;

export type Locale = (typeof locales)[number];
