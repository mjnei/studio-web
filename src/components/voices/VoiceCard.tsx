"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, Trash2, Share2, Lock, Clock, CheckCircle2, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { useToast } from "@/components/ui/toast";
import { useI18n, type InterpolationValues } from "@/i18n";
import { Spinner } from "@/components/ui/spinner";
import type { VoiceWithCreator, VoiceResponse } from "@/lib/types/api";

interface VoiceCardProps {
  voice: VoiceResponse | VoiceWithCreator;
  variant: "private" | "community";
  currentUserId?: string;
  onDelete: (id: number) => void;
  onShare?: (id: number) => void;
  onUnshare?: (id: number) => void;
}

/**
 * Format relative time for display
 */
function formatRelativeTime(
  dateString: string,
  t: (key: string, options?: InterpolationValues) => string
): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);

  if (diffSec < 60) return t("voices.metadata.justNow");
  if (diffMin < 60) return t("voices.metadata.minutesAgo", { count: diffMin });
  if (diffHours < 24) return t("voices.metadata.hoursAgo", { count: diffHours });
  if (diffDays < 7) return t("voices.metadata.daysAgo", { count: diffDays });
  if (diffWeeks < 4) return t("voices.metadata.weeksAgo", { count: diffWeeks });

  const months = Math.floor(diffDays / 30);
  if (months < 12) return t("voices.metadata.monthsAgo", { count: months });

  const years = Math.floor(diffDays / 365);
  return t("voices.metadata.yearsAgo", { count: years });
}

/**
 * Format duration in seconds to MM:SS format
 */
function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Format language code to translation key
 */
function formatLanguageKey(language: string | null | undefined): string | null {
  if (!language) return null;

  const languageKeyMap: Record<string, string> = {
    en: "voices.languages.en",
    es: "voices.languages.es",
    fr: "voices.languages.fr",
    de: "voices.languages.de",
    it: "voices.languages.it",
    pt: "voices.languages.pt",
    ru: "voices.languages.ru",
    ja: "voices.languages.ja",
    zh: "voices.languages.zh",
    "zh-CN": "voices.languages.zhCN",
    "zh-TW": "voices.languages.zhTW",
    ko: "voices.languages.ko",
    ar: "voices.languages.ar",
    hi: "voices.languages.hi",
  };

  return languageKeyMap[language] || null;
}

export function VoiceCard({
  voice,
  variant,
  currentUserId,
  onDelete,
  onShare,
  onUnshare,
}: VoiceCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const toast = useToast();
  const { t } = useI18n();

  const isOwnVoice = currentUserId && voice.user_id === parseInt(currentUserId, 10);
  const creatorInfo = "creator_username" in voice ? voice : null;

  const togglePlayback = async () => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    if (!audioRef.current) {
      setIsLoading(true);

      try {
        const audioUrl = voice.audio_url;

        if (!audioUrl) {
          toast.error(
            t("voices.playback.audioUnavailable"),
            t("voices.playback.audioUrlNotAvailable")
          );
          setIsLoading(false);
          return;
        }

        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onended = () => {
          setIsPlaying(false);
        };

        audio.onerror = () => {
          setIsPlaying(false);
          setIsLoading(false);
          toast.error(t("voices.playback.playbackFailed"), t("voices.playback.failedToPlayAudio"));
        };

        audio.oncanplay = () => {
          setIsLoading(false);
        };

        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Audio playback error:", error);
        setIsLoading(false);
        toast.error(t("voices.playback.playbackFailed"), t("voices.playback.failedToLoadAudio"));
      }
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const renderStatusBadge = () => {
    if (variant === "private") {
      if (voice.is_shared && !voice.is_approved) {
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 border border-yellow-500/30 px-2 py-1 text-caption font-semibold text-yellow-600">
            <Clock className="h-3 w-3" />
            {t("voices.status.pendingReview")}
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-500/10 border border-gray-500/30 px-2 py-1 text-caption font-semibold text-gray-600">
          <Lock className="h-3 w-3" />
          {t("voices.status.private")}
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 border border-green-500/30 px-2 py-1 text-caption font-semibold text-green-600">
          <CheckCircle2 className="h-3 w-3" />
          {t("voices.status.approved")}
        </span>
      );
    }
  };

  return (
    <Card
      variant="elevated"
      padding="none"
      className="overflow-hidden hover:border-accent-primary/40 hover:shadow-lg transition-all duration-200"
    >
      {/* Voice Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-3 mb-2">
          <Heading variant="subsection" as="h3" className="text-text-primary truncate flex-1">
            {voice.name}
          </Heading>
          {renderStatusBadge()}
        </div>

        {/* Metadata */}
        <div className="flex items-center gap-2 text-caption text-text-muted flex-wrap">
          {variant === "community" && creatorInfo && (
            <>
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>
                  @{creatorInfo.creator_username}
                  {isOwnVoice && (
                    <span className="text-accent-primary ml-1">{t("voices.metadata.you")}</span>
                  )}
                </span>
              </div>
              <span>•</span>
            </>
          )}
          <span>{formatRelativeTime(voice.created_at, t)}</span>
          {voice.duration_seconds && (
            <>
              <span>•</span>
              <span>{formatDuration(voice.duration_seconds)}</span>
            </>
          )}
          {formatLanguageKey(voice.language) && (
            <>
              <span>•</span>
              <span className="inline-flex items-center rounded-full bg-blue-500/10 border border-blue-500/30 px-2 py-0.5 text-caption font-medium text-blue-600">
                {t(formatLanguageKey(voice.language)!)}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Playback Controls */}
      <div className="px-4 pb-3 border-t border-border-subtle pt-3">
        <div className="flex items-center gap-2">
          <Button
            size="md"
            variant="ghost"
            onClick={togglePlayback}
            disabled={isLoading}
            className="flex-1"
            leftIcon={
              isLoading ? (
                <Spinner size="sm" className="text-current" />
              ) : isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )
            }
          >
            {isLoading
              ? t("voices.playback.loading")
              : isPlaying
                ? t("voices.playback.pause")
                : t("voices.playback.play")}
          </Button>

          {/* Action Buttons */}
          {variant === "private" && (
            <>
              {!voice.is_shared && onShare && (
                <Button
                  size="icon"
                  variant="success"
                  onClick={() => onShare(voice.id)}
                  title={t("voices.actions.shareWithCommunity")}
                  aria-label={t("voices.actions.shareWithCommunity")}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              )}
              {voice.is_shared && !voice.is_approved && onUnshare && (
                <Button
                  size="icon"
                  variant="secondary"
                  onClick={() => onUnshare(voice.id)}
                  title={t("voices.actions.makePrivate")}
                  aria-label={t("voices.actions.makePrivate")}
                >
                  <Lock className="h-4 w-4" />
                </Button>
              )}
            </>
          )}

          {(variant === "private" || (variant === "community" && isOwnVoice)) && (
            <Button
              size="icon"
              variant="danger"
              onClick={() => onDelete(voice.id)}
              title={t("voices.actions.deleteVoice")}
              aria-label={t("voices.actions.deleteVoice")}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
