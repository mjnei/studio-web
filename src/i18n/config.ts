export const locales = ["en", "chs", "cht", "ja", "ko", "de", "fr", "es"] as const;
export type Locale = (typeof locales)[number];

/** BCP-47 catalog codes — canonical for user.locale, TMDB, notifications. */
export const apiLocales = ["en", "zh-CN", "zh-TW", "ja", "ko", "de", "fr", "es"] as const;
export type ApiLocale = (typeof apiLocales)[number];

/** Voice / UI shorthand — matches public/locales/* folder names and voice.language. */
export const voiceLocales = locales;
export type VoiceLocale = Locale;

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

/** UI/voice shorthand → API/catalog locale. */
export const localeToApiLocale: Record<Locale, ApiLocale> = {
  en: "en",
  chs: "zh-CN",
  cht: "zh-TW",
  ja: "ja",
  ko: "ko",
  de: "de",
  fr: "fr",
  es: "es",
};

/** API/catalog locale → UI/voice shorthand. */
export const apiLocaleToUiLocale: Record<ApiLocale, Locale> = {
  en: "en",
  "zh-CN": "chs",
  "zh-TW": "cht",
  ja: "ja",
  ko: "ko",
  de: "de",
  fr: "fr",
  es: "es",
};

/** voices.languages.* translation key suffix for each voice locale. */
export const voiceLanguageLabelKey: Record<VoiceLocale, string> = {
  en: "en",
  chs: "zhCN",
  cht: "zhTW",
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

export function getApiLocale(locale: Locale): ApiLocale {
  return localeToApiLocale[locale] ?? "en";
}

/** Backend / TMDB locale (e.g. zh-CN) → UI locale (e.g. chs). */
export function getUiLocaleFromApi(apiLocale: string | null | undefined): Locale | null {
  if (!apiLocale) return null;
  if (apiLocale in apiLocaleToUiLocale) {
    return apiLocaleToUiLocale[apiLocale as ApiLocale];
  }
  const lower = apiLocale.toLowerCase().replace("_", "-");
  if (lower in localeToApiLocale) return lower as Locale;
  if (lower === "zh-cn" || lower === "zh-hans" || lower === "zh") return "chs";
  if (lower === "zh-tw" || lower === "zh-hant") return "cht";
  return null;
}

/** Normalize any language input to a supported voice/UI shorthand code. */
export function normalizeVoiceLanguage(language: string | null | undefined): VoiceLocale | null {
  if (!language) return null;
  const lower = language.toLowerCase().replace("_", "-");
  if (locales.includes(lower as Locale)) return lower as Locale;
  const ui = getUiLocaleFromApi(language);
  if (ui) return ui;
  return null;
}

/** Translation key for a voice language code (supports legacy DB values). */
export function getVoiceLanguageTranslationKey(
  language: string | null | undefined
): string | null {
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
