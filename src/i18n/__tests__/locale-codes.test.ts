import { describe, expect, it } from "vitest";
import {
  getVoiceLanguageTranslationKey,
  locales,
  normalizeLocale,
  normalizeVoiceLanguage,
  resolveStoredLocale,
  resolveTtsLanguage,
  voiceLanguageLabelKey,
} from "../config";

describe("locale codes", () => {
  it("defines exactly 3 supported locales", () => {
    expect(locales).toHaveLength(3);
    expect(locales).toEqual(["en", "zh-CN", "zh-TW"]);
  });

  it("normalizes locale aliases to canonical BCP-47 codes", () => {
    expect(normalizeLocale("zh-CN")).toBe("zh-CN");
    expect(normalizeLocale("zh-TW")).toBe("zh-TW");
    expect(normalizeLocale("zh-cn")).toBe("zh-CN");
    expect(normalizeLocale("zh-tw")).toBe("zh-TW");
    expect(normalizeLocale("zh_CN")).toBe("zh-CN");
    expect(normalizeLocale("zh_TW")).toBe("zh-TW");
    expect(normalizeLocale("chs")).toBeNull();
    expect(normalizeLocale("cht")).toBeNull();
    expect(normalizeLocale("zh")).toBe("zh-CN");
    expect(normalizeLocale("zh-Hans")).toBeNull();
    expect(normalizeLocale("zh-Hant")).toBeNull();
    expect(normalizeLocale("en-US")).toBe("en");
    expect(normalizeLocale("ja")).toBeNull();
    expect(normalizeLocale("de")).toBeNull();
  });

  it("normalizes voice language aliases the same as UI locales", () => {
    expect(normalizeVoiceLanguage("zh-CN")).toBe("zh-CN");
    expect(normalizeVoiceLanguage("zh-TW")).toBe("zh-TW");
    expect(normalizeVoiceLanguage("chs")).toBeNull();
    expect(normalizeVoiceLanguage("cht")).toBeNull();
    expect(normalizeVoiceLanguage("zh-Hans")).toBeNull();
    expect(normalizeVoiceLanguage("zh-Hant")).toBeNull();
    expect(normalizeVoiceLanguage("ja")).toBeNull();
    expect(normalizeVoiceLanguage("ja-JP")).toBeNull();
    expect(normalizeVoiceLanguage("de")).toBeNull();
  });

  it("maps locales to voice translation keys", () => {
    expect(voiceLanguageLabelKey["zh-CN"]).toBe("zhCN");
    expect(voiceLanguageLabelKey["zh-TW"]).toBe("zhTW");
    expect(getVoiceLanguageTranslationKey("zh-CN")).toBe("voices.languages.zhCN");
    expect(getVoiceLanguageTranslationKey("zh-TW")).toBe("voices.languages.zhTW");
    expect(getVoiceLanguageTranslationKey("zh")).toBe("voices.languages.zhCN");
    expect(getVoiceLanguageTranslationKey("zh-Hans")).toBeNull();
    expect(getVoiceLanguageTranslationKey("ja")).toBeNull();
    expect(getVoiceLanguageTranslationKey("chs")).toBeNull();
    expect(getVoiceLanguageTranslationKey("it")).toBeNull();
  });

  it("resolves stored locale from BCP-47 values", () => {
    expect(resolveStoredLocale("chs")).toBeNull();
    expect(resolveStoredLocale("cht")).toBeNull();
    expect(resolveStoredLocale("zh-CN")).toBe("zh-CN");
    expect(resolveStoredLocale("zh-cn")).toBe("zh-CN");
    expect(resolveStoredLocale("zh_CN")).toBe("zh-CN");
    expect(resolveStoredLocale("zh")).toBe("zh-CN");
    expect(resolveStoredLocale("zh-Hans")).toBeNull();
    expect(resolveStoredLocale("zh-Hant")).toBeNull();
    expect(resolveStoredLocale("zh-TW")).toBe("zh-TW");
    expect(resolveStoredLocale("zh-tw")).toBe("zh-TW");
    expect(resolveStoredLocale("en")).toBe("en");
    expect(resolveStoredLocale("ja")).toBeNull();
    expect(resolveStoredLocale("invalid")).toBeNull();
    expect(resolveStoredLocale(null)).toBeNull();
  });

  it("resolveTtsLanguage prefers voice language over UI locale", () => {
    expect(resolveTtsLanguage("zh-CN", "en")).toBe("zh-CN");
    expect(resolveTtsLanguage("chs", "en")).toBe("en");
    expect(resolveTtsLanguage("zh-Hans", "zh-CN")).toBe("zh-CN");
    expect(resolveTtsLanguage(null, "zh-CN")).toBe("zh-CN");
    expect(resolveTtsLanguage("ja", "en")).toBe("en");
    expect(resolveTtsLanguage(undefined, "zh-TW")).toBe("zh-TW");
  });
});
