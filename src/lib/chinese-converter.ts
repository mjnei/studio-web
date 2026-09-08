import * as OpenCC from "opencc-js";

let cnToTwConverter: ((text: string) => string) | null = null;
let twToCnConverter: ((text: string) => string) | null = null;

function getCnToTw() {
  if (!cnToTwConverter) {
    cnToTwConverter = OpenCC.Converter({ from: "cn", to: "tw" });
  }
  return cnToTwConverter;
}

function getTwToCn() {
  if (!twToCnConverter) {
    twToCnConverter = OpenCC.Converter({ from: "tw", to: "cn" });
  }
  return twToCnConverter;
}

/**
 * Converts Simplified Chinese (zh-CN) to Traditional Chinese (zh-TW).
 */
export function convertCnToTw(text: string): string {
  if (!text) return "";
  try {
    const converter = getCnToTw();
    return converter(text);
  } catch (error) {
    console.error("Failed to convert CN to TW:", error);
    return text;
  }
}

/**
 * Converts Traditional Chinese (zh-TW) to Simplified Chinese (zh-CN).
 */
export function convertTwToCn(text: string): string {
  if (!text) return "";
  try {
    const converter = getTwToCn();
    return converter(text);
  } catch (error) {
    console.error("Failed to convert TW to CN:", error);
    return text;
  }
}
