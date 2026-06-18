export function WaveformTrackRow({ label, muted = false }: { label: string; muted?: boolean }) {
  return (
    <div className="flex items-center gap-2 md:gap-3">
      <span className="w-20 shrink-0 truncate text-xs text-text-muted md:w-28">{label}</span>
      <button
        aria-label={muted ? "Unmute" : "Mute"}
        className="rounded p-1 text-text-muted hover:bg-surface-hover hover:text-text-secondary"
      >
        {muted ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
        )}
      </button>
      <div className="h-8 flex-1 rounded bg-accent-cyan/10" />
    </div>
  );
}
