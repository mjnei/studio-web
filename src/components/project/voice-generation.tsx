"use client";

import { useState } from "react";
import {
  Mic,
  Play,
  Pause,
  Volume2,
  Download,
  Loader2,
  Check,
  Globe,
  User,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { useI18n } from "@/i18n";
import { VoiceResponse, VoiceWithCreator } from "@/lib/types/api";

/**
 * Voice type for component - union of own and community voices
 */
export type Voice = VoiceResponse | VoiceWithCreator;

interface VoiceGenerationProps {
  script: string;
  ownVoices: VoiceResponse[];
  communityVoices: VoiceWithCreator[];
  selectedVoiceId?: number;
  audioUrl?: string;
  isGenerating?: boolean;
  progress?: number;
  onVoiceSelect: (voiceId: number) => void;
  onGenerate: (voiceId: number) => void;
  onChangeVoice: () => void;
  isLoadingVoices?: boolean;
  voicesError?: string | null;
}

export function VoiceGeneration({
  script,
  ownVoices,
  communityVoices,
  selectedVoiceId,
  audioUrl,
  isGenerating = false,
  progress = 0,
  onVoiceSelect,
  onGenerate,
  onChangeVoice,
  isLoadingVoices = false,
  voicesError = null,
}: VoiceGenerationProps) {
  const { t } = useI18n();
  const [playing, setPlaying] = useState(false);
  const [tab, setTab] = useState<"own" | "community">("own");
  const toast = useToast();

  const handleGenerate = () => {
    if (!selectedVoiceId) {
      toast.warning(t("project.voiceGen.selectVoiceTitle"), t("project.voiceGen.selectVoiceDesc"));
      return;
    }
    onGenerate(selectedVoiceId);
  };

  const togglePlayback = () => {
    setPlaying(!playing);
    // Implement actual audio playback logic
  };

  const downloadAudio = () => {
    if (audioUrl) {
      toast.success(t("project.voiceGen.downloaded"), t("project.voiceGen.downloadedDesc"));
    }
  };

  const wordCount = script.split(/\s+/).filter(Boolean).length;
  const estimatedDuration = Math.ceil(wordCount / 150);

  const allVoices = [...ownVoices, ...communityVoices];
  const selectedVoice = allVoices.find((v) => v.id === selectedVoiceId);

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto">
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg">
            <Mic className="w-8 h-8 text-white" />
          </div>
        </div>
        <Heading variant="page" as="h2" className="text-text-primary mb-2">
          {t("project.voiceGen.title")}
        </Heading>
        <Text variant="bodyLg" className="text-text-secondary">
          {t("project.voiceGen.description")}
        </Text>
      </div>

      {/* Voice Selection */}
      <Card variant="elevated" padding="lg">
        <CardHeader className="pb-4">
          <CardTitle>{t("project.voice.title")}</CardTitle>
          <p className="text-sm text-text-secondary mt-1">{t("project.voiceGen.selectHint")}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tab Navigation */}
          <div className="inline-flex items-center gap-2 rounded-lg bg-surface-panel p-1.5 border border-border-default w-full sm:w-auto">
            <button
              onClick={() => setTab("own")}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-all ${
                tab === "own"
                  ? "bg-gradient-to-r from-accent-primary to-purple-600 text-white shadow-md"
                  : "text-text-muted hover:text-text-secondary hover:bg-surface-raised"
              }`}
            >
              <Mic className="h-4 w-4" />
              <span>{t("project.voice.myVoices")}</span>
              {ownVoices.length > 0 && (
                <span
                  className={`text-xs font-bold ${tab === "own" ? "bg-white/20" : "bg-surface-raised"} px-2 py-0.5 rounded-full`}
                >
                  {ownVoices.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setTab("community")}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-all ${
                tab === "community"
                  ? "bg-gradient-to-r from-accent-cyan to-blue-600 text-white shadow-md"
                  : "text-text-muted hover:text-text-secondary hover:bg-surface-raised"
              }`}
            >
              <Globe className="h-4 w-4" />
              <span>{t("project.voice.community")}</span>
              {communityVoices.length > 0 && (
                <span
                  className={`text-xs font-bold ${tab === "community" ? "bg-white/20" : "bg-surface-raised"} px-2 py-0.5 rounded-full`}
                >
                  {communityVoices.length}
                </span>
              )}
            </button>
          </div>

          {/* Error State */}
          {voicesError && (
            <Card
              variant="elevated"
              padding="md"
              className="border-status-failed/30 bg-status-failed/10"
            >
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-status-failed flex-shrink-0 mt-0.5" />
                <p className="text-sm text-status-failed">{voicesError}</p>
              </div>
            </Card>
          )}

          {/* Loading State */}
          {isLoadingVoices ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-lg bg-surface-panel border border-border-default"
                />
              ))}
            </div>
          ) : (
            <>
              {/* Own Voices Tab */}
              {tab === "own" && (
                <div className="space-y-3">
                  {ownVoices.length === 0 ? (
                    <div className="text-center py-8 rounded-lg border border-dashed border-border-default bg-surface-panel/50">
                      <Mic className="h-8 w-8 text-text-muted mx-auto mb-2 opacity-50" />
                      <p className="text-sm text-text-muted mb-2">
                        {t("project.voice.noPersonalVoices")}
                      </p>
                      <p className="text-xs text-text-muted max-w-xs mx-auto">
                        {t("project.voiceGen.recordInLibrary")}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {ownVoices.map((voice) => (
                        <Card
                          key={voice.id}
                          variant={selectedVoiceId === voice.id ? "elevated" : "default"}
                          padding="md"
                          interactive
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
                                <Mic className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-text-primary text-sm truncate">
                                  {voice.name}
                                </p>
                                <p className="text-xs text-text-muted">{t("project.voice.yourVoice")}</p>
                              </div>
                            </div>
                            {selectedVoiceId === voice.id && (
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-primary flex-shrink-0">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Community Voices Tab */}
              {tab === "community" && (
                <div className="space-y-3">
                  {communityVoices.length === 0 ? (
                    <div className="text-center py-8 rounded-lg border border-dashed border-border-default bg-surface-panel/50">
                      <Globe className="h-8 w-8 text-text-muted mx-auto mb-2 opacity-50" />
                      <p className="text-sm text-text-muted mb-2">
                        {t("project.voice.noCommunityVoices")}
                      </p>
                      <p className="text-xs text-text-muted max-w-xs mx-auto">
                        {t("project.voice.communityHint")}
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {communityVoices.map((voice) => (
                        <Card
                          key={voice.id}
                          variant={selectedVoiceId === voice.id ? "elevated" : "default"}
                          padding="md"
                          interactive
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
                                <Globe className="w-5 h-5 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-text-primary text-sm truncate">
                                  {voice.name}
                                </p>
                                <p className="text-xs text-text-muted flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  <span>@{voice.creator_username}</span>
                                </p>
                                {voice.is_approved && voice.admin_approved_at && (
                                  <p className="text-xs text-status-completed mt-1">
                                    {t("project.voiceGen.approved", {
                                      date: voice.admin_approved_at,
                                    })}
                                  </p>
                                )}
                              </div>
                            </div>
                            {selectedVoiceId === voice.id && (
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-cyan flex-shrink-0">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Generation Section */}
      {!audioUrl ? (
        <Card variant="elevated" padding="lg">
          <div className="text-center py-8">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent-secondary to-accent-tertiary shadow-lg">
                <Volume2 className="w-8 h-8 text-white" />
              </div>
            </div>
            <Heading variant="section" as="h3" className="text-text-primary mb-2">
              {t("project.voiceGen.generateAudio")}
            </Heading>
            <p className="text-text-secondary mb-2">
              {selectedVoiceId && selectedVoice
                ? t("project.voiceGen.readyWithVoice", { name: selectedVoice.name })
                : t("project.voiceGen.selectToContinue")}
            </p>
            <p className="text-sm text-text-muted mb-6">
              {t("project.voiceGen.estimatedDuration", {
                minutes: estimatedDuration,
                words: wordCount,
              })}
            </p>

            {isGenerating ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-3">
                  <Loader2 className="w-5 h-5 text-accent-primary animate-spin" />
                  <span className="text-text-secondary">
                    {t("project.voiceGen.generatingAudio", { progress })}
                  </span>
                </div>
                <div className="max-w-md mx-auto">
                  <div className="h-2 bg-surface-hover rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent-secondary to-accent-primary transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <Button
                variant="primary"
                size="lg"
                leftIcon={<Volume2 className="w-5 h-5" />}
                onClick={handleGenerate}
                disabled={!selectedVoiceId}
              >
                {t("project.voiceGen.generateButton")}
              </Button>
            )}
          </div>
        </Card>
      ) : (
        /* Audio Player */
        <div className="space-y-4">
          <Card variant="elevated" padding="lg" className="border-accent-primary/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-status-completed/20">
                <Check className="w-5 h-5 text-status-completed" />
              </div>
              <div>
                <p className="font-semibold text-text-primary">
                  {t("project.voiceGen.audioGenerated")}
                </p>
                <p className="text-sm text-text-secondary">
                  {t("project.voiceGen.voiceLabel", {
                    name: selectedVoice?.name || t("project.common.unknown"),
                  })}
                </p>
              </div>
            </div>

            {/* Audio Player Controls */}
            <div className="bg-surface-raised rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                  onClick={togglePlayback}
                />
                <div className="flex-1">
                  <div className="h-2 bg-surface-hover rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-accent-secondary to-accent-primary"
                      style={{ width: "35%" }}
                    />
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-xs text-text-muted">0:42</span>
                    <span className="text-xs text-text-muted">{estimatedDuration}:00</span>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="md"
                  leftIcon={<Download className="w-5 h-5" />}
                  onClick={downloadAudio}
                >
                  <span className="hidden sm:inline">{t("project.voiceGen.download")}</span>
                </Button>
              </div>
            </div>
          </Card>

          {/* Regenerate Option */}
          <Card variant="elevated" padding="md" className="border-border-subtle">
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-primary/20 flex-shrink-0">
                  <Mic className="w-4 h-4 text-accent-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {t("project.voiceGen.notSatisfied")}
                  </p>
                  <p className="text-xs text-text-secondary">{t("project.voiceGen.tryDifferent")}</p>
                </div>
              </div>
              <Button variant="secondary" size="sm" onClick={onChangeVoice}>
                {t("project.voiceGen.changeVoice")}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
