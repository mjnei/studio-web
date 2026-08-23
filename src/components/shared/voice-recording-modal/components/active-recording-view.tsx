import { Mic, Square } from "lucide-react";
import { Heading } from "@/components/ui/heading";
import { MAX_DURATION_S } from "../constants";
import { formatRecordingTime } from "../utils";
import type { TranslateFn } from "../types";

interface ActiveRecordingViewProps {
  duration: number;
  maxDurationLabel: string;
  onStop: () => void;
  translate: TranslateFn;
}

export function ActiveRecordingView({
  duration,
  maxDurationLabel,
  onStop,
  translate: t,
}: ActiveRecordingViewProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-30" />
          <div className="relative rounded-full bg-gradient-to-br from-red-500 to-red-600 p-6 shadow-lg">
            <Mic className="h-10 w-10 text-white" aria-hidden />
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500" />
            </span>
            <Heading variant="metric" as="span" className="font-mono text-text-primary">
              {formatRecordingTime(duration)}
            </Heading>
          </div>
          <p className="text-xs text-text-muted">
            {t("voices.recording.ofMax", { time: maxDurationLabel })}
          </p>
        </div>
      </div>
      <div className="w-full max-w-xs">
        <div className="h-2 rounded-full bg-surface-base overflow-hidden shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-600 transition-all shadow-sm"
            style={{ width: `${Math.min((duration / MAX_DURATION_S) * 100, 100)}%` }}
          />
        </div>
      </div>
      <button
        onClick={onStop}
        className="flex h-20 w-20 items-center justify-center rounded-2xl bg-surface-raised shadow-xl transition-all hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-text-muted/30 active:scale-95"
        aria-label={t("voices.recording.stopRecording")}
      >
        <Square className="h-9 w-9 fill-red-500 text-red-500" aria-hidden />
      </button>
      <p className="text-sm text-text-secondary animate-pulse">
        {t("voices.recording.recordingTap")}
      </p>
    </div>
  );
}
