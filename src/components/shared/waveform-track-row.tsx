import { Volume2, VolumeX } from "lucide-react";

export function WaveformTrackRow({ label, muted = false }: { label: string; muted?: boolean }) {
  return (
    <div className="flex items-center gap-2 md:gap-3">
      <span className="w-20 shrink-0 truncate text-caption text-text-muted md:w-28">{label}</span>
      <button
        aria-label={muted ? "Unmute" : "Mute"}
        className="rounded p-1 text-text-muted hover:bg-surface-hover hover:text-text-secondary"
      >
        {muted ? (
          <VolumeX className="h-3.5 w-3.5" aria-hidden />
        ) : (
          <Volume2 className="h-3.5 w-3.5" aria-hidden />
        )}
      </button>
      <div className="h-8 flex-1 rounded bg-accent-cyan/10" />
    </div>
  );
}
