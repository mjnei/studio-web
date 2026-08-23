import { X } from "lucide-react";
import type { TranslateFn } from "../types";

interface RecordingErrorBannerProps {
  error: string;
  translate: TranslateFn;
}

export function RecordingErrorBanner({ error, translate: t }: RecordingErrorBannerProps) {
  const showHttpsTip = error === t("voices.recording.errors.securityBlocked");

  return (
    <div className="mb-4 flex items-start gap-2 rounded-xl bg-red-500/10 px-4 py-3 border border-red-500/20">
      <X size={18} className="mt-0.5 shrink-0 text-red-400" />
      <div className="text-sm text-red-300">
        <p>{error}</p>
        {showHttpsTip && (
          <p className="mt-1 text-xs text-red-400">{t("voices.recording.httpsTip")}</p>
        )}
      </div>
    </div>
  );
}
