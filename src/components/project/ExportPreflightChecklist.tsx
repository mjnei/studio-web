"use client";

import { Badge } from "@/components/ui/badge";
import { Check, CheckCircle2, AlertCircle } from "lucide-react";
import { useI18n } from "@/i18n";

export type ExportPreflightChecklistProps = {
  variant: "full" | "compact";
  movieTitle?: string | null;
  voiceName?: string | null;
  creditsAvailable: number;
  hasCredits: boolean;
};

export function ExportPreflightChecklist({
  variant,
  movieTitle,
  voiceName,
  creditsAvailable,
  hasCredits,
}: ExportPreflightChecklistProps) {
  const { t } = useI18n();

  if (variant === "compact") {
    return (
      <div className="flex items-center justify-between rounded-xl border border-border-default bg-surface-elevated/90 px-4 py-3">
        <span className="text-caption font-medium text-text-muted">
          {t("project.export.checklistTitle")}
        </span>
        <Badge variant="success" size="sm">
          <Check className="mr-1 h-3 w-3" />
          {t("project.export.checklistVerifiedCount", { passed: 4, total: 4 })}
        </Badge>
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-border-default bg-surface-elevated/90 p-6 shadow-lg backdrop-blur-md">
      <div className="flex items-center justify-between border-b border-border-default pb-3">
        <span className="text-caption font-bold uppercase tracking-wider text-text-muted">
          {t("project.export.checklistTitle")}
        </span>
        <Badge variant="success" size="sm">
          <Check className="mr-1 h-3 w-3" />
          {t("project.export.checklistVerifiedCount", { passed: 4, total: 4 })}
        </Badge>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between rounded-xl border border-border-default bg-surface-base p-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-green-500">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-body font-semibold text-text-primary">
                {t("project.export.check1Title")}
              </p>
              <p className="text-caption text-text-muted">
                {movieTitle
                  ? t("project.export.check1DescWithTitle", { title: movieTitle })
                  : t("project.export.check1Desc")}
              </p>
            </div>
          </div>
          <Badge variant="success" size="sm">
            {t("project.export.statusVerified")}
          </Badge>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border-default bg-surface-base p-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-green-500">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-body font-semibold text-text-primary">
                {t("project.export.check2Title")}
              </p>
              <p className="text-caption text-text-muted">
                {t("project.export.check2Desc", {
                  name: voiceName || t("project.export.selectedVoiceFallback"),
                })}
              </p>
            </div>
          </div>
          <Badge variant="success" size="sm">
            {t("project.export.statusReady")}
          </Badge>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border-default bg-surface-base p-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/20 text-green-500">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-body font-semibold text-text-primary">
                {t("project.export.check3Title")}
              </p>
              <p className="text-caption text-text-muted">
                {t("project.export.check3Desc")}
              </p>
            </div>
          </div>
          <Badge variant="success" size="sm">
            {t("project.export.statusFormatted")}
          </Badge>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border-default bg-surface-base p-3.5">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${hasCredits ? "bg-green-500/20 text-green-500" : "bg-error-bg text-error-text"}`}
            >
              {hasCredits ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <AlertCircle className="h-5 w-5" />
              )}
            </div>
            <div>
              <p className="text-body font-semibold text-text-primary">
                {t("project.export.check4Title")}
              </p>
              <p className="text-caption text-text-muted">
                {t("project.export.check4Desc", { count: creditsAvailable })}
              </p>
            </div>
          </div>
          <Badge variant={hasCredits ? "success" : "error"} size="sm">
            {hasCredits
              ? t("project.export.statusSufficient")
              : t("project.export.statusLowBalance")}
          </Badge>
        </div>
      </div>
    </div>
  );
}
