export const locales = ["en", "chs", "cht", "ja", "ko", "de", "fr", "es"] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, { name: string; flag: string }> = {
  en: { name: "English", flag: "🇺🇸" },
  chs: { name: "简体中文", flag: "🇨🇳" },
  cht: { name: "繁體中文", flag: "🇹🇼" },
  ja: { name: "日本語", flag: "🇯🇵" },
  ko: { name: "한국어", flag: "🇰🇷" },
  de: { name: "Deutsch", flag: "🇩🇪" },
  fr: { name: "Français", flag: "🇫🇷" },
  es: { name: "Español", flag: "🇪🇸" },
};

export const defaultLocale: Locale = "en";

/**
 * UI locale → TMDB / movie API locale.
 * Matches backend catalog locales: en, zh-CN, zh-TW, ja, ko, de, fr, es.
 */
export const localeToApiLocale: Record<Locale, string> = {
  en: "en",
  chs: "zh-CN",
  cht: "zh-TW",
  ja: "ja",
  ko: "ko",
  de: "de",
  fr: "fr",
  es: "es",
};

/** UI locale → BCP 47 tag for `Intl` / `toLocaleDateString`. */
export const localeToDateLocale: Record<Locale, string> = {
  en: "en-US",
  chs: "zh-CN",
  cht: "zh-TW",
  ja: "ja-JP",
  ko: "ko-KR",
  de: "de-DE",
  fr: "fr-FR",
  es: "es-ES",
};

export function getApiLocale(locale: Locale): string {
  return localeToApiLocale[locale] ?? "en";
}

export function getDateLocale(locale: Locale): string {
  return localeToDateLocale[locale] ?? "en-US";
}
