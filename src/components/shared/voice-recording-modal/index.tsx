"use client";

import { Modal } from "@/components/ui/modal";
import { MAX_DURATION_S } from "./constants";
import { ActiveRecordingView } from "./components/active-recording-view";
import { IdleRecordingView } from "./components/idle-recording-view";
import { RecordedPlaybackView } from "./components/recorded-playback-view";
import { RecordingErrorBanner } from "./components/recording-error-banner";
import { RequestingAccessView } from "./components/requesting-access-view";
import { VoiceNamingForm } from "./components/voice-naming-form";
import { useVoiceRecordingModal } from "./hooks/use-voice-recording-modal";
import { formatRecordingTime } from "./utils";
import type { VoiceRecordingModalProps } from "./types";

export function VoiceRecordingModal({ isOpen, onClose, onSaved }: VoiceRecordingModalProps) {
  const modal = useVoiceRecordingModal({ isOpen, onClose, onSaved });
  const maxDurationLabel = formatRecordingTime(MAX_DURATION_S);
  const isCloseBlocked = modal.isSaving || modal.phase === "recording";

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={modal.t("voices.recording.title")}
      size="md"
      closeOnOverlayClick={false}
      closeOnEscape={!isCloseBlocked}
      closeButtonDisabled={isCloseBlocked}
      className="bg-gradient-to-b from-surface-panel to-surface-raised"
      contentClassName="!pt-0"
    >
      {modal.error && <RecordingErrorBanner error={modal.error} translate={modal.t} />}

      {modal.phase === "requesting" && <RequestingAccessView translate={modal.t} />}

      {modal.phase === "idle" && (
        <IdleRecordingView
          maxDurationLabel={maxDurationLabel}
          onStart={modal.startRecording}
          translate={modal.t}
        />
      )}

      {modal.phase === "recording" && (
        <ActiveRecordingView
          duration={modal.elapsed}
          maxDurationLabel={maxDurationLabel}
          onStop={modal.stopRecording}
          translate={modal.t}
        />
      )}

      {modal.phase === "recorded" && modal.recording && (
        <RecordedPlaybackView
          duration={modal.recording.duration}
          maxReached={modal.recording.maxReached}
          isPlaying={modal.isPlaying}
          playbackProgress={modal.playbackProgress}
          playbackTime={modal.playbackTime}
          isSaving={modal.isSaving}
          onTogglePlayback={modal.togglePlayback}
          onSeek={modal.seekPlayback}
          onDiscard={modal.discardRecording}
          onContinue={modal.proceedToNaming}
          translate={modal.t}
        />
      )}

      {modal.phase === "naming" && (
        <VoiceNamingForm
          voiceName={modal.voiceName}
          language={modal.language}
          nameError={modal.nameError}
          isSaving={modal.isSaving}
          onVoiceNameChange={(value) => {
            modal.setVoiceName(value);
            if (modal.nameError) modal.setNameError(false);
          }}
          onLanguageChange={modal.setLanguage}
          onGenerateName={modal.generateName}
          onBack={() => modal.setPhase("recorded")}
          onSave={modal.saveRecording}
          translate={modal.t}
        />
      )}
    </Modal>
  );
}

export type { VoiceRecordingModalProps } from "./types";
