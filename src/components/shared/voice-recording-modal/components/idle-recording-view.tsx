import { Circle, Mic } from "lucide-react";
import { Heading } from "@/components/ui/heading";
import type { TranslateFn } from "../types";

interface IdleRecordingViewProps {
  maxDurationLabel: string;
  onStart: () => void;
  translate: TranslateFn;
}

export function IdleRecordingView({
  maxDurationLabel,
  onStart,
  translate: t,
}: IdleRecordingViewProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-8">
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-full bg-surface-raised p-6 shadow-inner">
          <Mic className="h-12 w-12 text-text-muted" aria-hidden />
        </div>
        <div className="text-center">
          <Heading variant="subsection" as="h3" className="text-text-primary mb-1">
            {t("voices.recording.readyTitle")}
          </Heading>
          <p className="text-body text-text-muted">{t("voices.recording.readyHint")}</p>
        </div>
      </div>
      <button
        onClick={onStart}
        className="group relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-600 shadow-xl transition-all hover:scale-105 hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-red-400/50 active:scale-95"
        aria-label={t("voices.recording.startRecording")}
      >
        <div className="absolute inset-0 rounded-full bg-red-400 opacity-0 group-hover:opacity-20 transition-opacity" />
        <Circle className="h-8 w-8 fill-white text-white" aria-hidden />
      </button>
      <p className="text-caption text-center text-text-muted">
        {t("voices.recording.maxDuration", { time: maxDurationLabel })}
      </p>
    </div>
  );
}
