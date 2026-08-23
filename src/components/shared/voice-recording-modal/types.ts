import type { VoiceResponse } from "@/lib/types/api";

export type RecorderState = "idle" | "requesting" | "recording" | "recorded" | "naming";

export interface VoiceRecordingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (recording: VoiceResponse) => void;
}

export type TranslateFn = (key: string, params?: Record<string, string | number>) => string;
