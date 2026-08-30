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

/** Transitional input shorthands — remove in Phase 6. */
const LEGACY_INPUT_SHORTHAND: Record<string, Locale> = {
  chs: "zh-CN",
  cht: "zh-TW",
};

const LOCALE_BY_LOWER = new Map<string, Locale>(
  locales.map((locale) => [locale.toLowerCase(), locale])
);

/**
 * Normalize any locale input to a supported BCP-47 code.
 * Mirrors backend `normalize_locale()` but returns null when unrecognized.
 */
export function normalizeLocale(input: string | null | undefined): Locale | null {
  if (!input?.trim()) return null;

  const normalized = input.trim().replace(/_/g, "-");
  if (locales.includes(normalized as Locale)) {
    return normalized as Locale;
  }

  const lower = normalized.toLowerCase();

  if (lower in LEGACY_INPUT_SHORTHAND) {
    return LEGACY_INPUT_SHORTHAND[lower];
  }

  const caseMatch = LOCALE_BY_LOWER.get(lower);
  if (caseMatch) {
    return caseMatch;
  }

  if (lower.startsWith("zh")) {
    if (lower.includes("hant") || lower === "zh-tw" || lower === "cht") {
      return "zh-TW";
    }
    return "zh-CN";
  }

  const language = lower.split("-")[0];
  for (const locale of locales) {
    if (locale.split("-")[0].toLowerCase() === language) {
      return locale;
    }
  }

  return null;
}

/** Resolve a raw localStorage locale value to a supported locale (with legacy migration). */
export function resolveStoredLocale(raw: string | null | undefined): Locale | null {
  return normalizeLocale(raw);
}

/** Normalize any language input to a supported locale code. */
export function normalizeVoiceLanguage(language: string | null | undefined): Locale | null {
  return normalizeLocale(language);
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
