"use client";

import { Card } from "@/components/ui/card";
import type { VideoGenerationResponse } from "@/lib/credit-client";
import { ExportPreflightChecklist } from "@/components/project/ExportPreflightChecklist";
import { VideoRenderTelemetry } from "@/components/project/VideoRenderTelemetry";

export type ExportRenderingHeroProps = {
  processingVideos: VideoGenerationResponse[];
  getStatusLabel: (status: string) => string;
  movieTitle?: string | null;
  voiceName?: string | null;
  creditsAvailable: number;
  hasCredits: boolean;
  showStuckBanner?: boolean;
  onRefresh?: () => void;
};

export function ExportRenderingHero({
  processingVideos,
  getStatusLabel,
  movieTitle,
  voiceName,
  creditsAvailable,
  hasCredits,
  showStuckBanner = false,
  onRefresh,
}: ExportRenderingHeroProps) {
  return (
    <Card variant="elevated" padding="lg" className="border-accent-primary/30 shadow-xl">
      <div className="mx-auto max-w-2xl space-y-6 py-4">
        <ExportPreflightChecklist
          variant="compact"
          movieTitle={movieTitle}
          voiceName={voiceName}
          creditsAvailable={creditsAvailable}
          hasCredits={hasCredits}
        />
        <VideoRenderTelemetry
          variant="hero"
          videos={processingVideos}
          getStatusLabel={getStatusLabel}
          showStuckBanner={showStuckBanner}
          onRefresh={onRefresh}
        />
      </div>
    </Card>
  );
}
