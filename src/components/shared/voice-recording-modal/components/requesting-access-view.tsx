import { Mic } from "lucide-react";
import type { TranslateFn } from "../types";

interface RequestingAccessViewProps {
  translate: TranslateFn;
}

export function RequestingAccessView({ translate: t }: RequestingAccessViewProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="relative">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-accent-cyan/30 border-t-accent-cyan" />
        <Mic
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-accent-cyan"
          size={28}
        />
      </div>
      <p className="text-sm text-text-secondary">{t("voices.recording.requestingAccess")}</p>
    </div>
  );
}
