import { describe, expect, it } from "vitest";
import {
  apiLocales,
  getApiLocale,
  getUiLocaleFromApi,
  getVoiceLanguageTranslationKey,
  locales,
  normalizeVoiceLanguage,
  voiceLanguageLabelKey,
} from "../config";

describe("locale codes", () => {
  it("defines 8 UI locales and 8 API locales", () => {
    expect(locales).toHaveLength(8);
    expect(apiLocales).toHaveLength(8);
  });

  it("maps UI ↔ API for all 8 locales", () => {
    for (const uiLocale of locales) {
      const api = getApiLocale(uiLocale);
      expect(getUiLocaleFromApi(api)).toBe(uiLocale);
    }
  });

  it("normalizes voice language aliases", () => {
    expect(normalizeVoiceLanguage("chs")).toBe("chs");
    expect(normalizeVoiceLanguage("zh-CN")).toBe("chs");
    expect(normalizeVoiceLanguage("cht")).toBe("cht");
    expect(normalizeVoiceLanguage("zh-TW")).toBe("cht");
  });

  it("maps voice locales to translation keys", () => {
    expect(voiceLanguageLabelKey.chs).toBe("zhCN");
    expect(voiceLanguageLabelKey.cht).toBe("zhTW");
    expect(getVoiceLanguageTranslationKey("chs")).toBe("voices.languages.zhCN");
    expect(getVoiceLanguageTranslationKey("zh-TW")).toBe("voices.languages.zhTW");
  });
});
