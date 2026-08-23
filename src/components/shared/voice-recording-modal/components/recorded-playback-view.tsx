import { Check, Pause, Play, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { formatRecordingTime } from "../utils";
import type { TranslateFn } from "../types";

interface RecordedPlaybackViewProps {
  duration: number;
  maxReached: boolean;
  isPlaying: boolean;
  playbackProgress: number;
  playbackTime: number;
  isSaving: boolean;
  onTogglePlayback: () => void;
  onSeek: (fraction: number) => void;
  onDiscard: () => void;
  onContinue: () => void;
  translate: TranslateFn;
}

export function RecordedPlaybackView({
  duration,
  maxReached,
  isPlaying,
  playbackProgress,
  playbackTime,
  isSaving,
  onTogglePlayback,
  onSeek,
  onDiscard,
  onContinue,
  translate: t,
}: RecordedPlaybackViewProps) {
  return (
    <div className="flex flex-col gap-5 py-4">
      {maxReached && (
        <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-2">
          <p className="text-xs text-amber-300">{t("voices.recording.maxReached")}</p>
        </div>
      )}

      <div className="flex flex-col items-center gap-3">
        <div className="rounded-full bg-green-500/10 p-4">
          <Check size={32} className="text-green-400" />
        </div>
        <div className="text-center">
          <Heading variant="subsection" as="h3" className="text-text-primary mb-1">
            {t("voices.recording.completeTitle")}
          </Heading>
          <p className="text-sm text-text-muted">
            {t("voices.recording.completeHint", { time: formatRecordingTime(duration) })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 rounded-xl bg-surface-base p-3 shadow-inner">
        <button
          onClick={onTogglePlayback}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-accent-cyan to-blue-500 text-white shadow-lg transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent-cyan focus:ring-offset-2 focus:ring-offset-surface-base active:scale-95"
          title={isPlaying ? t("voices.recording.pause") : t("voices.recording.play")}
        >
          {isPlaying ? (
            <Pause size={20} className="fill-current" />
          ) : (
            <Play size={20} className="ml-0.5 fill-current" />
          )}
        </button>
        <button
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            onSeek(x / rect.width);
          }}
          className="relative flex h-10 flex-1 cursor-pointer items-center rounded-full bg-surface-raised px-2 overflow-hidden"
          title={t("voices.recording.seek")}
        >
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-accent-cyan to-blue-500 transition-all"
            style={{ width: `${Math.max(playbackProgress * 100, 0)}%` }}
          />
          <div className="relative flex items-center justify-end w-full pr-2">
            <span className="text-xs font-mono text-text-muted tabular-nums">
              {formatRecordingTime(isPlaying || playbackProgress > 0 ? playbackTime : duration)}
            </span>
          </div>
        </button>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="md"
          onClick={onDiscard}
          disabled={isSaving}
          className="flex-1"
        >
          <RotateCcw size={16} className="mr-2" />
          {t("voices.recording.reRecord")}
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={onContinue}
          disabled={isSaving}
          className="flex-1"
        >
          {t("voices.recording.continue")}
        </Button>
      </div>
    </div>
  );
}
