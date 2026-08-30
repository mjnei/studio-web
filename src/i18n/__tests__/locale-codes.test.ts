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
  it("defines 8 BCP-47 locales", () => {
    expect(locales).toHaveLength(8);
    expect(locales).toContain("zh-CN");
    expect(locales).toContain("zh-TW");
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
    expect(normalizeLocale("zh-Hans")).toBe("zh-CN");
    expect(normalizeLocale("zh-Hant")).toBe("zh-TW");
    expect(normalizeLocale("en-US")).toBe("en");
  });

  it("normalizes voice language aliases to canonical locale codes", () => {
    expect(normalizeVoiceLanguage("zh-CN")).toBe("zh-CN");
    expect(normalizeVoiceLanguage("zh-TW")).toBe("zh-TW");
    expect(normalizeVoiceLanguage("chs")).toBeNull();
    expect(normalizeVoiceLanguage("cht")).toBeNull();
    expect(normalizeVoiceLanguage("zh-Hans")).toBe("zh-CN");
    expect(normalizeVoiceLanguage("zh-Hant")).toBe("zh-TW");
  });

  it("maps locales to voice translation keys", () => {
    expect(voiceLanguageLabelKey["zh-CN"]).toBe("zhCN");
    expect(voiceLanguageLabelKey["zh-TW"]).toBe("zhTW");
    expect(getVoiceLanguageTranslationKey("zh-CN")).toBe("voices.languages.zhCN");
    expect(getVoiceLanguageTranslationKey("zh-TW")).toBe("voices.languages.zhTW");
    expect(getVoiceLanguageTranslationKey("zh")).toBe("voices.languages.zhCN");
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
    expect(resolveStoredLocale("zh-Hans")).toBe("zh-CN");
    expect(resolveStoredLocale("zh-TW")).toBe("zh-TW");
    expect(resolveStoredLocale("zh-tw")).toBe("zh-TW");
    expect(resolveStoredLocale("en")).toBe("en");
    expect(resolveStoredLocale("invalid")).toBeNull();
    expect(resolveStoredLocale(null)).toBeNull();
  });

  it("resolveTtsLanguage prefers voice language over UI locale", () => {
    expect(resolveTtsLanguage("zh-CN", "en")).toBe("zh-CN");
    expect(resolveTtsLanguage("chs", "en")).toBe("en");
    expect(resolveTtsLanguage(null, "ja")).toBe("ja");
    expect(resolveTtsLanguage(undefined, "de")).toBe("de");
  });
});
