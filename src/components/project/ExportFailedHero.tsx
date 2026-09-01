"use client";

import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, RotateCcw, Sliders } from "lucide-react";
import type { CreditStatus, VideoGenerationResponse } from "@/lib/credit-client";
import { CreditUsageIndicator } from "@/components/credits/CreditUsageIndicator";
import { ExportPreflightChecklist } from "@/components/project/ExportPreflightChecklist";
import { useI18n } from "@/i18n";

export type ExportFailedHeroProps = {
  latestFailedVideo: VideoGenerationResponse;
  failedCount: number;
  movieTitle?: string | null;
  voiceName?: string | null;
  creditsAvailable: number;
  hasCredits: boolean;
  canStartGeneration: boolean;
  creditStatus: CreditStatus | null;
  onRetry: () => void;
  onOpenDiagnostics: () => void;
};

export function ExportFailedHero({
  latestFailedVideo,
  failedCount,
  movieTitle,
  voiceName,
  creditsAvailable,
  hasCredits,
  canStartGeneration,
  creditStatus,
  onRetry,
  onOpenDiagnostics,
}: ExportFailedHeroProps) {
  const { t } = useI18n();

  return (
    <Card
      variant="elevated"
      padding="lg"
      className="border-2 border-error-border/40 bg-gradient-to-br from-error-bg/20 via-surface-panel to-surface-panel shadow-2xl"
    >
      <div className="mx-auto max-w-2xl space-y-8 py-4">
        <div className="space-y-3 text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-error-bg text-error-text shadow-lg">
              <AlertCircle className="h-8 w-8" />
            </div>
          </div>
          <Heading variant="section" as="h2" className="text-text-primary">
            {t("project.export.generationFailedTitle")}
          </Heading>
        </div>

        <div className="space-y-3 rounded-2xl border border-error-border/30 bg-surface-elevated/90 p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Heading variant="label" as="h3" className="text-error-text">
              {t("project.export.failedGenerationsCount", { count: failedCount })}
            </Heading>
            <Badge variant="error" size="sm">
              {t("project.export.attemptLabel", { n: latestFailedVideo.generation_attempt })}
            </Badge>
          </div>
          <p className="text-body text-text-primary">
            {latestFailedVideo.error_message || t("project.export.renderFailed")}
          </p>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Sliders className="h-4 w-4" />}
            onClick={onOpenDiagnostics}
            className="text-text-secondary"
          >
            {t("project.export.diagnosticsButton")}
          </Button>
        </div>

        <ExportPreflightChecklist
          variant="compact"
          movieTitle={movieTitle}
          voiceName={voiceName}
          creditsAvailable={creditsAvailable}
          hasCredits={hasCredits}
        />

        <div className="space-y-4 text-center">
          {creditStatus && (
            <div className="flex justify-center">
              <CreditUsageIndicator cost={1} remainingCredits={creditStatus.credits_remaining} />
            </div>
          )}

          <Button
            variant="primary"
            size="lg"
            leftIcon={<RotateCcw className="h-5 w-5" />}
            onClick={onRetry}
            disabled={!canStartGeneration}
            className="mx-auto w-full max-w-md py-4 text-body font-semibold shadow-glow-hover"
          >
            {t("project.preview.retryGeneration")}
          </Button>

          {!hasCredits && (
            <p className="text-caption text-error-text">
              {t("project.export.insufficientCredits")}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
