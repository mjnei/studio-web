import { describe, expect, it, vi } from "vitest";
import { formatRecordingTime, generateRandomVoiceName, mapMicrophoneStartError } from "./utils";

describe("formatRecordingTime", () => {
  it("formats seconds as m:ss", () => {
    expect(formatRecordingTime(0)).toBe("0:00");
    expect(formatRecordingTime(5)).toBe("0:05");
    expect(formatRecordingTime(65)).toBe("1:05");
    expect(formatRecordingTime(3599)).toBe("59:59");
  });

  it("clamps negative values to zero", () => {
    expect(formatRecordingTime(-12)).toBe("0:00");
  });

  it("floors fractional seconds", () => {
    expect(formatRecordingTime(12.9)).toBe("0:12");
  });
});

describe("generateRandomVoiceName", () => {
  it("returns noun-adjective-number pattern", () => {
    const random = vi.fn().mockReturnValueOnce(0).mockReturnValueOnce(0).mockReturnValueOnce(0.42);

    expect(generateRandomVoiceName(random)).toBe("dolphin-amber-42");
  });
});

describe("mapMicrophoneStartError", () => {
  const t = (key: string) => key;

  it("maps permission denied", () => {
    expect(mapMicrophoneStartError(new DOMException("", "NotAllowedError"), t)).toBe(
      "voices.recording.errors.permissionDenied"
    );
  });

  it("maps device not found", () => {
    expect(mapMicrophoneStartError(new DOMException("", "NotFoundError"), t)).toBe(
      "voices.recording.errors.notFound"
    );
  });

  it("maps security blocked", () => {
    expect(mapMicrophoneStartError(new DOMException("", "SecurityError"), t)).toBe(
      "voices.recording.errors.securityBlocked"
    );
  });

  it("falls back to generic start failure", () => {
    expect(mapMicrophoneStartError(new Error("unknown"), t)).toBe(
      "voices.recording.errors.startFailed"
    );
  });
});
