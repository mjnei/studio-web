"use client";

import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { Video } from "lucide-react";
import type { CreditStatus } from "@/lib/credit-client";
import { CreditUsageIndicator } from "@/components/credits/CreditUsageIndicator";
import { ExportPreflightChecklist } from "@/components/project/ExportPreflightChecklist";
import { useI18n } from "@/i18n";

export type ExportPreflightHeroProps = {
  movieTitle?: string | null;
  voiceName?: string | null;
  creditsAvailable: number;
  hasCredits: boolean;
  creditStatus: CreditStatus | null;
  onGenerate: () => void;
};

export function ExportPreflightHero({
  movieTitle,
  voiceName,
  creditsAvailable,
  hasCredits,
  creditStatus,
  onGenerate,
}: ExportPreflightHeroProps) {
  const { t } = useI18n();

  return (
    <Card
      variant="elevated"
      padding="lg"
      className="border-2 border-accent-primary/40 bg-gradient-to-br from-accent-primary/15 via-surface-panel to-surface-panel shadow-2xl"
    >
      <div className="mx-auto max-w-2xl space-y-8 py-4">
        <div className="space-y-2 text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent-primary/20 text-accent-primary shadow-glow">
              <Video className="h-8 w-8" />
            </div>
          </div>
          <Heading variant="section" as="h2" className="text-text-primary">
            {t("project.export.preflightHeading")}
          </Heading>
          <p className="mx-auto max-w-lg text-body text-text-secondary">
            {t("project.export.preflightIntro")}
          </p>
        </div>

        <ExportPreflightChecklist
          variant="full"
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
            leftIcon={<Video className="h-5 w-5" />}
            onClick={onGenerate}
            disabled={!hasCredits}
            className="mx-auto w-full max-w-md py-4 text-body font-semibold shadow-glow-hover"
          >
            {`🎬 ${t("project.export.startGenerationCta")}`}
          </Button>

          {!hasCredits && (
            <p className="text-caption text-error-text">{t("project.export.insufficientCredits")}</p>
          )}
        </div>
      </div>
    </Card>
  );
}
