"use client";

import { useState } from "react";
import { Mic, Plus, Globe, User, AlertCircle, Check } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import type { VoiceResponse, VoiceWithCreator } from "@/lib/types/api";

export interface VoiceSelectionPanelProps {
  ownVoices: VoiceResponse[];
  communityVoices: VoiceWithCreator[];
  selectedVoiceId?: number | null;
  isLoadingVoices?: boolean;
  voicesError?: string | null;
  onVoiceSelect: (voiceId: number) => void;
  onAddVoice?: () => void;
  canAddVoice?: boolean;
  remainingVoiceCount?: number;
}

export function VoiceSelectionPanel({
  ownVoices,
  communityVoices,
  selectedVoiceId,
  isLoadingVoices = false,
  voicesError = null,
  onVoiceSelect,
  onAddVoice,
  canAddVoice = true,
  remainingVoiceCount = 0,
}: VoiceSelectionPanelProps) {
  const { t } = useI18n();
  const [tab, setTab] = useState<"my" | "community">("my");

  return (
    <Card variant="elevated" padding="lg">
      <div className="space-y-4">
        <div className="inline-flex items-center gap-2 rounded-xl bg-surface-panel p-1.5 shadow-sm border border-border-default">
          <button
            onClick={() => setTab("my")}
            className={`relative flex items-center gap-2 rounded-lg px-6 py-2.5 text-body font-semibold transition-all duration-200 ${
              tab === "my"
                ? "bg-gradient-to-r from-accent-primary to-purple-600 text-white shadow-lg shadow-accent-primary/30"
                : "text-text-muted hover:text-text-secondary hover:bg-surface-raised"
            }`}
          >
            <Mic className="h-4 w-4" aria-hidden />
            <span>{t("project.voice.myVoices")}</span>
            {ownVoices.length > 0 && (
              <span
                className={`ml-1 rounded-full px-2 py-0.5 text-caption font-bold ${
                  tab === "my" ? "bg-white/20" : "bg-surface-raised"
                }`}
              >
                {ownVoices.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setTab("community")}
            className={`relative flex items-center gap-2 rounded-lg px-6 py-2.5 text-body font-semibold transition-all duration-200 ${
              tab === "community"
                ? "bg-gradient-to-r from-accent-primary to-purple-600 text-white shadow-lg shadow-accent-primary/30"
                : "text-text-muted hover:text-text-secondary hover:bg-surface-raised"
            }`}
          >
            <Globe className="h-4 w-4" aria-hidden />
            <span>{t("project.voice.community")}</span>
            {communityVoices.length > 0 && (
              <span
                className={`ml-1 rounded-full px-2 py-0.5 text-caption font-bold ${
                  tab === "community" ? "bg-white/20" : "bg-surface-raised"
                }`}
              >
                {communityVoices.length}
              </span>
            )}
          </button>
        </div>

        {voicesError && (
          <Card
            variant="elevated"
            padding="md"
            className="border-status-failed/30 bg-status-failed/10"
          >
            <div className="flex items-start gap-3">
              <AlertCircle
                className="h-5 w-5 text-status-failed flex-shrink-0 mt-0.5"
                aria-hidden
              />
              <p className="text-body text-status-failed">{voicesError}</p>
            </div>
          </Card>
        )}

        {isLoadingVoices ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-24 animate-pulse rounded-lg bg-surface-panel border border-border-default"
              />
            ))}
          </div>
        ) : (
          <>
            {tab === "my" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {ownVoices.length === 0 ? (
                  <EmptyState
                    variant="bordered"
                    size="sm"
                    className="col-span-full"
                    icon={<Mic aria-hidden />}
                    title={t("project.voice.noPersonalVoices")}
                    description={t("project.voice.recordFirst")}
                    action={
                      onAddVoice ? (
                        <Button variant="primary" size="sm" onClick={onAddVoice}>
                          <Plus className="mr-2 h-4 w-4" aria-hidden />
                          {t("project.voice.recordVoice")}
                        </Button>
                      ) : undefined
                    }
                  />
                ) : (
                  <>
                    {ownVoices.map((voice) => (
                      <Card
                        key={voice.id}
                        variant={selectedVoiceId === voice.id ? "elevated" : "default"}
                        padding="md"
                        className={`cursor-pointer transition-all ${
                          selectedVoiceId === voice.id
                            ? "ring-2 ring-accent-primary border-accent-primary"
                            : "hover:border-accent-primary/40"
                        }`}
                        onClick={() => onVoiceSelect(voice.id)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-accent-primary to-purple-600 flex-shrink-0">
                              <Mic className="h-5 w-5 text-white" aria-hidden />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-text-primary text-body truncate">
                                {voice.name}
                              </p>
                              <p className="text-caption text-text-muted">
                                {t("project.voice.yourVoice")}
                              </p>
                            </div>
                          </div>
                          {selectedVoiceId === voice.id && (
                            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-primary flex-shrink-0">
                              <Check className="h-4 w-4 text-white" aria-hidden />
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}

                    {onAddVoice && (
                      <Card
                        variant="default"
                        padding="md"
                        className="border-dashed hover:border-accent-primary/50 hover:bg-accent-primary/5 transition-all cursor-pointer group"
                        onClick={onAddVoice}
                      >
                        <div className="flex flex-col items-center justify-center h-full min-h-[88px] text-center">
                          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-accent-primary/10 group-hover:bg-accent-primary/20 transition-colors">
                            <Plus className="h-5 w-5 text-accent-primary" aria-hidden />
                          </div>
                          <p className="text-caption font-semibold text-text-primary mb-0.5">
                            {t("project.voice.addVoice")}
                          </p>
                          <p className="text-caption text-text-muted">
                            {canAddVoice
                              ? t("project.voice.remainingLeft", { count: remainingVoiceCount })
                              : t("project.voice.limitReached")}
                          </p>
                        </div>
                      </Card>
                    )}
                  </>
                )}
              </div>
            )}

            {tab === "community" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {communityVoices.length === 0 ? (
                  <EmptyState
                    variant="bordered"
                    size="sm"
                    className="col-span-full"
                    icon={<Globe aria-hidden />}
                    title={t("project.voice.noCommunityVoices")}
                    description={t("project.voice.communityHint")}
                  />
                ) : (
                  communityVoices.map((voice) => (
                    <Card
                      key={voice.id}
                      variant={selectedVoiceId === voice.id ? "elevated" : "default"}
                      padding="md"
                      className={`cursor-pointer transition-all ${
                        selectedVoiceId === voice.id
                          ? "ring-2 ring-accent-cyan border-accent-cyan"
                          : "hover:border-accent-cyan/40"
                      }`}
                      onClick={() => onVoiceSelect(voice.id)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-accent-cyan to-blue-600 flex-shrink-0">
                            <Globe className="h-5 w-5 text-white" aria-hidden />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-text-primary text-body truncate">
                              {voice.name}
                            </p>
                            <p className="text-caption text-text-muted flex items-center gap-1 truncate">
                              <User className="h-3 w-3 flex-shrink-0" aria-hidden />
                              <span className="truncate">@{voice.creator_username}</span>
                            </p>
                            <div className="mt-1">
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 border border-green-500/30 px-1.5 py-0.5 text-[10px] font-bold text-green-600">
                                <div className="h-1 w-1 rounded-full bg-green-600"></div>
                                {t("project.voice.approved")}
                              </span>
                            </div>
                          </div>
                        </div>
                        {selectedVoiceId === voice.id && (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-cyan flex-shrink-0">
                            <Check className="h-4 w-4 text-white" aria-hidden />
                          </div>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Card>
  );
}
