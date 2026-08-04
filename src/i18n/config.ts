export const locales = ["en", "chs"] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, { name: string; flag: string }> = {
  en: { name: "English", flag: "🇺🇸" },
  chs: { name: "简体中文", flag: "简" },
};

export const defaultLocale: Locale = "en";
