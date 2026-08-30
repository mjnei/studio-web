"use client";

import { Heading } from "@/components/ui/heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { AlertCircle, Clock, RotateCcw } from "lucide-react";
import type { VideoGenerationResponse } from "@/lib/credit-client";
import { useI18n } from "@/i18n";

type TranslateFn = (key: string, params?: Record<string, string | number>) => string;

function ProcessingTelemetryList({
  videos,
  getStatusLabel,
  t,
}: {
  videos: VideoGenerationResponse[];
  getStatusLabel: (status: string) => string;
  t: TranslateFn;
}) {
  if (videos.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {videos.map((video) => (
        <div
          key={video.id}
          className="space-y-3 rounded-xl border border-accent-primary/30 bg-surface-raised p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Spinner className="h-5 w-5 shrink-0 text-accent-primary" />
              <div>
                <p className="text-body font-semibold text-text-primary">
                  {t("project.export.versionOption", { n: video.generation_attempt })}
                </p>
                <p className="text-caption text-text-muted">
                  {video.status === "queued"
                    ? t("project.export.queuedStatus")
                    : t("project.export.stitchingStatus")}
                </p>
              </div>
            </div>
            <Badge variant="primary" size="sm">
              {getStatusLabel(video.status)}
            </Badge>
          </div>

          <div className="grid grid-cols-3 gap-2 border-t border-border-default pt-2 text-center text-micro font-medium">
            <div className="rounded bg-accent-primary/10 p-1.5 text-accent-primary">
              {t("project.export.stepQueue")}
            </div>
            <div
              className={`rounded p-1.5 ${video.status === "processing" ? "animate-pulse bg-accent-primary/20 text-accent-primary" : "bg-surface-panel text-text-muted"}`}
            >
              {t("project.export.stepStitch")}
            </div>
            <div className="rounded bg-surface-panel p-1.5 text-text-muted">
              {t("project.export.stepEncode")}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function RenderStuckBanner({ onRefresh }: { onRefresh: () => void }) {
  const { t } = useI18n();

  return (
    <div
      role="alert"
      className="flex flex-col items-center gap-3 rounded-xl border border-error-border/30 bg-surface-panel p-4 text-center sm:flex-row sm:text-left"
    >
      <AlertCircle className="h-5 w-5 shrink-0 text-error-text" aria-hidden />
      <div className="flex-1">
        <p className="text-body font-semibold text-text-primary">
          {t("project.export.processingTimedOut")}
        </p>
        <p className="text-caption text-text-secondary">
          {t("project.export.processingTimedOutDesc")}
        </p>
      </div>
      <Button
        variant="secondary"
        size="sm"
        leftIcon={<RotateCcw className="h-4 w-4" aria-hidden />}
        onClick={onRefresh}
        className="shrink-0"
      >
        {t("project.export.refreshStatus")}
      </Button>
    </div>
  );
}

export type VideoRenderTelemetryProps = {
  variant: "hero" | "banner";
  videos: VideoGenerationResponse[];
  getStatusLabel: (status: string) => string;
  showStuckBanner?: boolean;
  onRefresh?: () => void;
};

export function VideoRenderTelemetry({
  variant,
  videos,
  getStatusLabel,
  showStuckBanner = false,
  onRefresh,
}: VideoRenderTelemetryProps) {
  const { t } = useI18n();

  const telemetryList = (
    <ProcessingTelemetryList videos={videos} getStatusLabel={getStatusLabel} t={t} />
  );

  const stuckBanner =
    showStuckBanner && onRefresh ? <RenderStuckBanner onRefresh={onRefresh} /> : null;

  if (variant === "banner") {
    return (
      <div className="mt-6 space-y-3 rounded-xl border border-accent-primary/30 bg-surface-raised p-4">
        <Heading variant="label" as="h3" className="flex items-center gap-2 text-text-primary">
          <Clock className="h-4 w-4 text-accent-primary" />
          {t("project.export.liveTelemetry")}
        </Heading>
        {telemetryList}
        {stuckBanner}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3 text-center">
        <div className="flex justify-center">
          <Spinner className="h-10 w-10 text-accent-primary" />
        </div>
        <Heading variant="section" as="h2" className="text-text-primary">
          {t("project.export.liveTelemetry")}
        </Heading>
        <p className="text-body text-text-secondary">{t("project.export.generationStartedDesc")}</p>
      </div>
      {telemetryList}
      {stuckBanner}
    </div>
  );
}
