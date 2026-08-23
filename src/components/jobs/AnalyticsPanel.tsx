"use client";

import React, { useState } from "react";
import { BarChart3, ChevronDown, ChevronUp, Zap, Mic, Clock, ShieldCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { useI18n } from "@/i18n";
import { JobsSummary } from "@/types/jobs";

interface AnalyticsPanelProps {
  summary: JobsSummary;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ summary }) => {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card variant="elevated" padding="none" className="mb-6 border-border-default overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-surface-panel hover:bg-surface-hover transition-colors text-left"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-primary/15 text-accent-primary">
            <BarChart3 className="h-4 w-4" />
          </div>
          <div>
            <Heading variant="label" as="h3" className="text-text-primary">
              {t("jobs.analytics.title")}
            </Heading>
            <Text variant="caption" className="text-text-muted">
              {t("jobs.analytics.monthlyOverview")} • {summary.totalCount}{" "}
              {t("jobs.analytics.totalJobsProcessed")}
            </Text>
          </div>
        </div>
        <div className="flex items-center gap-2 text-text-muted">
          <span className="text-caption font-medium hidden sm:inline">
            {isOpen ? t("jobs.analytics.hideInsights") : t("jobs.analytics.showInsights")}
          </span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 border-t border-border-default bg-surface-base grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in duration-200">
          <div className="p-3 rounded-lg bg-surface-panel border border-border-default flex items-center gap-3">
            <div className="p-2 rounded-md bg-status-success/15 text-status-success">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <Text variant="caption" className="text-text-muted font-medium">
                {t("jobs.analytics.successRate")}
              </Text>
              <Heading variant="subsection" className="text-text-primary">
                {summary.successRate}%
              </Heading>
              <Text variant="micro" className="text-text-muted">
                {summary.completedCount} of {summary.completedCount + summary.failedCount} finished
              </Text>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-surface-panel border border-border-default flex items-center gap-3">
            <div className="p-2 rounded-md bg-accent-secondary/15 text-accent-secondary">
              <Zap className="h-4 w-4" />
            </div>
            <div>
              <Text variant="caption" className="text-text-muted font-medium">
                {t("jobs.analytics.creditsConsumed")}
              </Text>
              <Heading variant="subsection" className="text-text-primary">
                {summary.creditsUsed}
              </Heading>
              <Text variant="micro" className="text-text-muted">
                {t("jobs.analytics.acrossAllAttempts")}
              </Text>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-surface-panel border border-border-default flex items-center gap-3">
            <div className="p-2 rounded-md bg-accent-tertiary/15 text-accent-tertiary">
              <Mic className="h-4 w-4" />
            </div>
            <div>
              <Text variant="caption" className="text-text-muted font-medium">
                {t("jobs.analytics.topVoice")}
              </Text>
              <Heading variant="subsection" className="text-text-primary truncate max-w-[140px]">
                {summary.topVoice}
              </Heading>
              <Text variant="micro" className="text-text-muted">
                {t("jobs.analytics.mostFrequently")}
              </Text>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-surface-panel border border-border-default flex items-center gap-3">
            <div className="p-2 rounded-md bg-blue-500/15 text-blue-400">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <Text variant="caption" className="text-text-muted font-medium">
                {t("jobs.analytics.avgProcessingTime")}
              </Text>
              <Heading variant="subsection" className="text-text-primary">
                ~{summary.avgProcessingTimeMinutes} mins
              </Heading>
              <Text variant="micro" className="text-text-muted">
                {t("jobs.analytics.perVideoRendering")}
              </Text>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
