export const locales = ["en", "zh-CN", "zh-TW", "ja", "ko", "de", "fr", "es"] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, { name: string; flag: string }> = {
  en: { name: "English", flag: "🇺🇸" },
  "zh-CN": { name: "简体中文", flag: "🇨🇳" },
  "zh-TW": { name: "繁體中文", flag: "🇹🇼" },
  ja: { name: "日本語", flag: "🇯🇵" },
  ko: { name: "한국어", flag: "🇰🇷" },
  de: { name: "Deutsch", flag: "🇩🇪" },
  fr: { name: "Français", flag: "🇫🇷" },
  es: { name: "Español", flag: "🇪🇸" },
};

export const defaultLocale: Locale = "en";

/** voices.languages.* translation key suffix for each locale. */
export const voiceLanguageLabelKey: Record<Locale, string> = {
  en: "en",
  "zh-CN": "zhCN",
  "zh-TW": "zhTW",
  ja: "ja",
  ko: "ko",
  de: "de",
  fr: "fr",
  es: "es",
};

/** Locale → BCP 47 tag for `Intl` / `toLocaleDateString`. */
export const localeToDateLocale: Record<Locale, string> = {
  en: "en-US",
  "zh-CN": "zh-CN",
  "zh-TW": "zh-TW",
  ja: "ja-JP",
  ko: "ko-KR",
  de: "de-DE",
  fr: "fr-FR",
  es: "es-ES",
};

const VOICE_LANGUAGE_ALIASES: Record<string, Locale> = {
  chs: "zh-CN",
  cht: "zh-TW",
  zh: "zh-CN",
  "zh-hans": "zh-CN",
  "zh-hant": "zh-TW",
};

/** Normalize any language input to a supported locale code. */
export function normalizeVoiceLanguage(language: string | null | undefined): Locale | null {
  if (!language) return null;
  if (locales.includes(language as Locale)) return language as Locale;
  const lower = language.toLowerCase().replace("_", "-");
  if (locales.includes(lower as Locale)) return lower as Locale;
  return VOICE_LANGUAGE_ALIASES[lower] ?? null;
}

/** Translation key for a voice language code (supports legacy DB values). */
export function getVoiceLanguageTranslationKey(language: string | null | undefined): string | null {
  if (!language) return null;

  const voiceLocale = normalizeVoiceLanguage(language);
  if (voiceLocale) {
    return `voices.languages.${voiceLanguageLabelKey[voiceLocale]}`;
  }

  const legacyKeys: Record<string, string> = {
    it: "voices.languages.it",
    pt: "voices.languages.pt",
    ru: "voices.languages.ru",
    zh: "voices.languages.zh",
    ar: "voices.languages.ar",
    hi: "voices.languages.hi",
  };

  return legacyKeys[language] ?? null;
}

export function getDateLocale(locale: Locale): string {
  return localeToDateLocale[locale] ?? "en-US";
}
