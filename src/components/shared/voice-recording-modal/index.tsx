"use client";

import { X } from "lucide-react";
import { Heading } from "@/components/ui/heading";
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="mx-auto max-w-md w-full m-4 rounded-2xl border border-border-default bg-gradient-to-b from-surface-panel to-surface-raised p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <Heading variant="subsection" as="h2" className="text-text-primary">
            {modal.t("voices.recording.title")}
          </Heading>
          <button
            onClick={onClose}
            disabled={modal.isSaving || modal.state === "recording"}
            className="p-2 rounded-lg hover:bg-surface-raised transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={20} className="text-text-muted" />
          </button>
        </div>

        {modal.error && (
          <RecordingErrorBanner error={modal.error} translate={modal.t} />
        )}

        {modal.state === "requesting" && <RequestingAccessView translate={modal.t} />}

        {modal.state === "idle" && (
          <IdleRecordingView
            maxDurationLabel={maxDurationLabel}
            onStart={modal.startRecording}
            translate={modal.t}
          />
        )}

        {modal.state === "recording" && (
          <ActiveRecordingView
            duration={modal.duration}
            maxDurationLabel={maxDurationLabel}
            onStop={modal.stopRecording}
            translate={modal.t}
          />
        )}

        {modal.state === "recorded" && (
          <RecordedPlaybackView
            duration={modal.duration}
            maxReached={modal.maxReached}
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

        {modal.state === "naming" && (
          <VoiceNamingForm
            voiceName={modal.voiceName}
            language={modal.language}
            nameError={modal.nameError}
            languageError={modal.languageError}
            isSaving={modal.isSaving}
            onVoiceNameChange={(value) => {
              modal.setVoiceName(value);
              if (modal.nameError) modal.setNameError(false);
            }}
            onLanguageChange={(value) => {
              modal.setLanguage(value);
              if (modal.languageError) modal.setLanguageError(false);
            }}
            onGenerateName={modal.generateName}
            onBack={() => modal.setState("recorded")}
            onSave={modal.saveRecording}
            translate={modal.t}
          />
        )}
      </div>
    </div>
  );
}

export type { VoiceRecordingModalProps } from "./types";
