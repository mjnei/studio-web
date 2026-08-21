"use client";

import { Loader2, Activity } from "lucide-react";
import { useI18n } from "@/i18n";

export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={`${sizes[size]} animate-spin`}>
      <Loader2 size={sizes[size].split(" ")[0].replace("w-", "").replace("h-", "")} />
    </div>
  );
}

export function LoadingScreen() {
  const { t } = useI18n();

  return (
    <div className="flex h-screen items-center justify-center bg-surface-base">
      <div className="text-center">
        <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-secondary via-accent-primary to-accent-tertiary shadow-lg animate-pulse">
          <Activity size={32} className="text-white" />
        </div>
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-text-secondary">{t("common.loading")}</p>
      </div>
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="rounded-xl border border-border-default bg-surface-panel/80 p-6 animate-pulse">
      <div className="h-4 bg-surface-raised rounded w-3/4 mb-4"></div>
      <div className="h-4 bg-surface-raised rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-surface-raised rounded w-5/6"></div>
    </div>
  );
}
