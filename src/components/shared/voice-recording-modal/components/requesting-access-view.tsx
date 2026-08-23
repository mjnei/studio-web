import { Mic } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import type { TranslateFn } from "../types";

interface RequestingAccessViewProps {
  translate: TranslateFn;
}

export function RequestingAccessView({ translate: t }: RequestingAccessViewProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-8">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <Spinner className="h-16 w-16 text-accent-cyan" />
        <Mic className="absolute h-7 w-7 text-accent-cyan" aria-hidden />
      </div>
      <p className="text-sm text-text-secondary">{t("voices.recording.requestingAccess")}</p>
    </div>
  );
}
