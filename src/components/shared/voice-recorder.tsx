"use client";

import { useState } from "react";
import { VoiceRecordingModal } from "./voice-recording-modal";
import type { VoiceResponse } from "@/lib/types/api";

/**
 * @deprecated Use VoiceRecordingModal directly instead
 *
 * This component is kept for backward compatibility but should be replaced
 * with VoiceRecordingModal in all new code.
 */
export function VoiceRecorder({
  onRecorded,
  onSaved,
}: {
  onRecorded?: (blob: Blob) => void;
  onSaved?: (recording: VoiceResponse) => void;
}) {
  const [isModalOpen, setIsModalOpen] = useState(true);

  return (
    <VoiceRecordingModal
      isOpen={isModalOpen}
      onClose={() => setIsModalOpen(false)}
      onSaved={(recording) => {
        onSaved?.(recording);
        setIsModalOpen(false);
      }}
    />
  );
}
