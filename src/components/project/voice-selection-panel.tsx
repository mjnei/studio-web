"use client";

import { useState, useMemo } from "react";
import { Mic, Plus, Globe, Search, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VoiceSelectionCard } from "@/components/project/voice-selection-card";
import { useI18n } from "@/i18n";
import type { VoiceResponse, VoiceWithCreator } from "@/lib/types/api";

export interface VoiceSelectionPanelProps {
  ownVoices: VoiceResponse[];
  communityVoices: VoiceWithCreator[];
  selectedVoiceId?: number | null;
  playingVoiceId?: number | null;
  isLoadingVoices?: boolean;
  voicesError?: string | null;
  onVoiceSelect: (voiceId: number) => void;
  onPreviewToggle?: (voiceId: number, voiceType: "own" | "community") => void;
  onAddVoice?: () => void;
  canAddVoice?: boolean;
  remainingVoiceCount?: number;
}

const VOICE_FILTER_CHIPS = ["All", "Dramatic", "Deep", "Energetic", "Warm Storyteller"] as const;

export function VoiceSelectionPanel({
  ownVoices,
  communityVoices,
  selectedVoiceId,
  playingVoiceId,
  isLoadingVoices = false,
  voicesError = null,
  onVoiceSelect,
  onPreviewToggle,
  onAddVoice,
  canAddVoice = true,
  remainingVoiceCount = 0,
}: VoiceSelectionPanelProps) {
  const { t } = useI18n();
  const [tab, setTab] = useState<"community" | "my">("community");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("All");

  // Filter voices by search query & filter chip
  const filteredCommunityVoices = communityVoices.filter((v) => {
    const matchesSearch =
      !searchQuery.trim() ||
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.creator_username?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      selectedFilter === "All" || v.name.toLowerCase().includes(selectedFilter.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  const filteredOwnVoices = ownVoices.filter((v) => {
    const matchesSearch =
      !searchQuery.trim() || v.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      selectedFilter === "All" || v.name.toLowerCase().includes(selectedFilter.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4">
      {/* Top Bar: Tabs & Search Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Voice Category Tabs */}
        <div className="inline-flex items-center gap-1.5 rounded-xl bg-surface-panel p-1 border border-border-default">
          <Button
            variant={tab === "community" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setTab("community")}
            leftIcon={<Globe className="h-4 w-4" aria-hidden />}
            className="touch-manipulation"
          >
            <span>{t("project.voice.community")}</span>
            {communityVoices.length > 0 && (
              <span
                className={`ml-1 rounded-full px-2 py-0.5 text-micro font-bold ${
                  tab === "community"
                    ? "bg-white/20 text-white"
                    : "bg-surface-raised text-text-muted"
                }`}
              >
                {communityVoices.length}
              </span>
            )}
          </Button>

          <Button
            variant={tab === "my" ? "primary" : "ghost"}
            size="sm"
            onClick={() => setTab("my")}
            leftIcon={<Mic className="h-4 w-4" aria-hidden />}
            className="touch-manipulation"
          >
            <span>{t("project.voice.myVoices")}</span>
            {ownVoices.length > 0 && (
              <span
                className={`ml-1 rounded-full px-2 py-0.5 text-micro font-bold ${
                  tab === "my" ? "bg-white/20 text-white" : "bg-surface-raised text-text-muted"
                }`}
              >
                {ownVoices.length}
              </span>
            )}
          </Button>
        </div>

        {/* Search Voice Input */}
        <div className="w-full sm:w-64">
          <Input
            type="text"
            placeholder={t("common.search")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={<Search className="h-4 w-4" />}
          />
        </div>
      </div>

      {/* Filter Chips Bar */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-1">
        {VOICE_FILTER_CHIPS.map((chip) => {
          const isSelected = selectedFilter === chip;
          return (
            <button
              key={chip}
              type="button"
              onClick={() => setSelectedFilter(chip)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-caption font-medium transition-all duration-200 ${
                isSelected
                  ? "bg-accent-primary text-white shadow-sm shadow-accent-primary/25 scale-105"
                  : "bg-surface-raised border border-border-default text-text-secondary hover:text-text-primary hover:border-border-strong"
              }`}
            >
              {chip}
            </button>
          );
        })}
      </div>

      {/* Error Message */}
      {voicesError && (
        <Card
          variant="elevated"
          padding="md"
          className="border-status-failed/30 bg-status-failed/10"
        >
          <p className="text-body text-status-failed">{voicesError}</p>
        </Card>
      )}

      {/* Loading Skeleton */}
      {isLoadingVoices ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-24 animate-pulse rounded-xl bg-surface-panel border border-border-default"
            />
          ))}
        </div>
      ) : (
        <>
          {/* Community Voices Grid */}
          {tab === "community" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredCommunityVoices.length === 0 ? (
                <EmptyState
                  variant="bordered"
                  size="sm"
                  className="col-span-full"
                  icon={<Globe aria-hidden />}
                  title={t("project.voice.noCommunityVoices")}
                  description={t("project.voice.communityHint")}
                  action={
                    searchQuery || selectedFilter !== "All" ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedFilter("All");
                        }}
                      >
                        {t("common.reset")}
                      </Button>
                    ) : undefined
                  }
                />
              ) : (
                filteredCommunityVoices.map((voice) => (
                  <VoiceSelectionCard
                    key={voice.id}
                    id={voice.id}
                    name={voice.name}
                    type="community"
                    metadata={{
                      creator: `@${voice.creator_username}`,
                    }}
                    isSelected={selectedVoiceId === voice.id}
                    isPlaying={playingVoiceId === voice.id}
                    onSelect={() => onVoiceSelect(voice.id)}
                    onPreviewToggle={() => onPreviewToggle?.(voice.id, "community")}
                  />
                ))
              )}
            </div>
          )}

          {/* Personal Cloned Voices Grid */}
          {tab === "my" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredOwnVoices.length === 0 && !onAddVoice ? (
                <EmptyState
                  variant="bordered"
                  size="sm"
                  className="col-span-full"
                  icon={<Mic aria-hidden />}
                  title={t("project.voice.noPersonalVoices")}
                  description={t("project.voice.recordFirst")}
                />
              ) : (
                <>
                  {filteredOwnVoices.map((voice) => (
                    <VoiceSelectionCard
                      key={voice.id}
                      id={voice.id}
                      name={voice.name}
                      type="own"
                      metadata={{
                        language: voice.mime_type?.includes("audio") ? "Custom Voice" : undefined,
                      }}
                      isSelected={selectedVoiceId === voice.id}
                      isPlaying={playingVoiceId === voice.id}
                      onSelect={() => onVoiceSelect(voice.id)}
                      onPreviewToggle={() => onPreviewToggle?.(voice.id, "own")}
                    />
                  ))}

                  {/* Add New Recording Card */}
                  {onAddVoice && (
                    <Card
                      variant="default"
                      padding="md"
                      className="border-dashed hover:border-accent-primary/50 hover:bg-accent-primary/5 transition-all cursor-pointer group flex flex-col items-center justify-center min-h-[96px] text-center"
                      onClick={onAddVoice}
                    >
                      <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-full bg-accent-primary/10 group-hover:bg-accent-primary/20 transition-colors">
                        <Plus className="h-5 w-5 text-accent-primary" aria-hidden />
                      </div>
                      <p className="text-caption font-semibold text-text-primary mb-0.5">
                        {t("project.voice.addVoice")}
                      </p>
                      <p className="text-micro text-text-muted">
                        {canAddVoice
                          ? t("project.voice.remainingLeft", { count: remainingVoiceCount })
                          : t("project.voice.limitReached")}
                      </p>
                    </Card>
                  )}
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
