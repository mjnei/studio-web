import {
  SUPPORTED_MIME_TYPES,
  VOICE_NAME_ADJECTIVES,
  VOICE_NAME_NOUNS,
} from "./constants";
import type { TranslateFn } from "./types";

export function getSupportedMimeType(): string {
  for (const type of SUPPORTED_MIME_TYPES) {
    if (MediaRecorder.isTypeSupported(type)) return type;
  }
  return "";
}

export function generateRandomVoiceName(random = Math.random): string {
  const adj = VOICE_NAME_ADJECTIVES[Math.floor(random() * VOICE_NAME_ADJECTIVES.length)];
  const noun = VOICE_NAME_NOUNS[Math.floor(random() * VOICE_NAME_NOUNS.length)];
  const num = Math.floor(random() * 100);

  return `${noun}-${adj}-${num}`;
}

export function formatRecordingTime(seconds: number): string {
  const clamped = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(clamped / 60);
  const secs = clamped % 60;
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
}

export function mapMicrophoneStartError(error: unknown, t: TranslateFn): string {
  if (error instanceof DOMException) {
    if (error.name === "NotAllowedError") {
      return t("voices.recording.errors.permissionDenied");
    }
    if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
      return t("voices.recording.errors.notFound");
    }
    if (error.name === "NotReadableError") {
      return t("voices.recording.errors.inUse");
    }
    if (error.name === "SecurityError") {
      return t("voices.recording.errors.securityBlocked");
    }
  }

  return t("voices.recording.errors.startFailed");
}
