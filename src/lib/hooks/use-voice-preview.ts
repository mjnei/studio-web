"use client";

import { useEffect, useRef, useState } from "react";
import { useToast } from "@/components/ui/toast";
import { useI18n } from "@/i18n";
import { getVoiceAudioUrl } from "@/lib/api/voice-client";
import type { VoiceResponse, VoiceWithCreator } from "@/lib/types/api";

function stopAudioElement(audioRef: React.RefObject<HTMLAudioElement | null>) {
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
  const [playingVoiceId, setPlayingVoiceId] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      stopAudioElement(audioRef);
    };
  }, []);

  const stopPreview = () => {
    stopAudioElement(audioRef);
    setPlayingVoiceId(null);
  };

  const playVoicePreview = async (
    voiceId: number,
    type: "own" | "community",
    ownVoices: VoiceResponse[],
    communityVoices: VoiceWithCreator[]
  ) => {
    // If clicking currently playing voice, pause it
    if (playingVoiceId === voiceId) {
      stopPreview();
      return;
    }

    stopAudioElement(audioRef);
    setPlayingVoiceId(null);

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

      const audio = new Audio(blobUrl);
      audioRef.current = audio;

      audio.onended = () => {
        setPlayingVoiceId(null);
        URL.revokeObjectURL(blobUrl);
      };
      audio.onerror = (e) => {
        console.error("Audio playback error:", audio.error, e);
        setPlayingVoiceId(null);
        toastError(t("project.voice.playbackFailed"), t("project.voice.playbackFailedPlay"));
        URL.revokeObjectURL(blobUrl);
      };

      await audio.play();
      setPlayingVoiceId(voiceId);
    } catch (err) {
      console.error("Failed to load/play audio:", err);
      setPlayingVoiceId(null);
      toastError(t("project.voice.playbackFailed"), t("project.voice.playbackFailedLoad"));
    }
  };

  return { playVoicePreview, stopPreview, playingVoiceId };
}
