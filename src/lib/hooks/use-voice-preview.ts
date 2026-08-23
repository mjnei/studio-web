"use client";

import { useEffect, useRef } from "react";
import { useToast } from "@/components/ui/toast";
import { useI18n } from "@/i18n";
import { getVoiceAudioUrl } from "@/lib/api/voice-client";
import type { VoiceResponse, VoiceWithCreator } from "@/lib/types/api";

function stopAudio(audioRef: React.RefObject<HTMLAudioElement | null>) {
  if (!audioRef.current) return;

  audioRef.current.pause();
  audioRef.current.currentTime = 0;
  if (audioRef.current.src?.startsWith("blob:")) {
    URL.revokeObjectURL(audioRef.current.src);
  }
  audioRef.current = null;
}

export function useVoicePreview() {
  const { error: toastError } = useToast();
  const { t } = useI18n();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      stopAudio(audioRef);
    };
  }, []);

  const playVoicePreview = async (
    voiceId: number,
    type: "own" | "community",
    ownVoices: VoiceResponse[],
    communityVoices: VoiceWithCreator[]
  ) => {
    stopAudio(audioRef);

    try {
      const voiceData =
        type === "own"
          ? ownVoices.find((v) => v.id === voiceId)
          : communityVoices.find((v) => v.id === voiceId);

      if (!voiceData) {
        toastError(t("project.voice.voiceNotFound"), t("project.voice.voiceNotFoundDesc"));
        return;
      }

      let audioUrl = voiceData.audio_url;
      if (!audioUrl) {
        try {
          const audioUrlData = await getVoiceAudioUrl(voiceId);
          audioUrl = audioUrlData.audio_url;
        } catch (err) {
          console.error("Failed to get audio URL:", err);
          toastError(
            t("project.voice.previewUnavailable"),
            t("project.voice.previewUnavailableDesc")
          );
          return;
        }
      }

      if (!audioUrl) {
        toastError(
          t("project.voice.previewUnavailable"),
          t("project.voice.previewUnavailableDesc")
        );
        return;
      }

      const response = await fetch(audioUrl);
      if (!response.ok) {
        throw new Error("Failed to load voice audio");
      }

      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      audioRef.current = new Audio(blobUrl);
      audioRef.current.onended = () => {
        URL.revokeObjectURL(blobUrl);
      };
      audioRef.current.onerror = (e) => {
        console.error("Audio playback error:", audioRef.current?.error, e);
        toastError(t("project.voice.playbackFailed"), t("project.voice.playbackFailedPlay"));
        URL.revokeObjectURL(blobUrl);
      };

      await audioRef.current.play();
    } catch (err) {
      console.error("Failed to load/play audio:", err);
      toastError(t("project.voice.playbackFailed"), t("project.voice.playbackFailedLoad"));
    }
  };

  return { playVoicePreview };
}
