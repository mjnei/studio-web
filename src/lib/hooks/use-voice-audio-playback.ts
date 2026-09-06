"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type VoicePlaybackErrorType = "unavailable" | "play_failed" | "load_failed";

export interface UseVoiceAudioPlaybackOptions {
  onError?: (error: VoicePlaybackErrorType) => void;
}

function stopAudioElement(audioRef: React.RefObject<HTMLAudioElement | null>) {
  if (!audioRef.current) return;

  audioRef.current.pause();
  audioRef.current.currentTime = 0;
  audioRef.current = null;
}

export type VoiceAudioUrlInput = string | null | undefined | (() => Promise<string | null | undefined>);

/**
 * Shared voice sample playback hook.
 * Pass a ready `audio_url`, or a resolver that fetches it on first play
 * (e.g. admin lazy-load via getAdminRecordingAudioUrl).
 */
export function useVoiceAudioPlayback(options: UseVoiceAudioPlaybackOptions = {}) {
  const { onError } = options;
  const onErrorRef = useRef(onError);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playingVoiceIdRef = useRef<number | null>(null);
  const [playingVoiceId, setPlayingVoiceId] = useState<number | null>(null);
  const [loadingVoiceId, setLoadingVoiceId] = useState<number | null>(null);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    playingVoiceIdRef.current = playingVoiceId;
  }, [playingVoiceId]);

  useEffect(() => {
    return () => {
      stopAudioElement(audioRef);
    };
  }, []);

  const stopPlayback = useCallback(() => {
    stopAudioElement(audioRef);
    playingVoiceIdRef.current = null;
    setPlayingVoiceId(null);
    setLoadingVoiceId(null);
  }, []);

  const togglePlayback = useCallback(
    async (voiceId: number, audioUrl?: VoiceAudioUrlInput) => {
      if (playingVoiceIdRef.current === voiceId) {
        stopPlayback();
        return;
      }

      stopAudioElement(audioRef);
      playingVoiceIdRef.current = null;
      setPlayingVoiceId(null);
      setLoadingVoiceId(voiceId);

      try {
        const resolvedUrl = typeof audioUrl === "function" ? await audioUrl() : audioUrl;
        if (!resolvedUrl) {
          setLoadingVoiceId(null);
          onErrorRef.current?.("unavailable");
          return;
        }

        const audio = new Audio(resolvedUrl);
        audioRef.current = audio;

        audio.onended = () => {
          playingVoiceIdRef.current = null;
          setPlayingVoiceId(null);
          setLoadingVoiceId(null);
        };

        audio.onerror = () => {
          console.error("Audio playback error:", audio.error);
          playingVoiceIdRef.current = null;
          setPlayingVoiceId(null);
          setLoadingVoiceId(null);
          onErrorRef.current?.("play_failed");
        };

        audio.oncanplay = () => {
          setLoadingVoiceId(null);
        };

        await audio.play();
        playingVoiceIdRef.current = voiceId;
        setPlayingVoiceId(voiceId);
        setLoadingVoiceId(null);
      } catch (err) {
        console.error("Failed to load/play audio:", err);
        playingVoiceIdRef.current = null;
        setPlayingVoiceId(null);
        setLoadingVoiceId(null);
        onErrorRef.current?.("load_failed");
      }
    },
    [stopPlayback]
  );

  const isPlaying = useCallback((voiceId: number) => playingVoiceId === voiceId, [playingVoiceId]);

  const isLoading = useCallback((voiceId: number) => loadingVoiceId === voiceId, [loadingVoiceId]);

  return {
    playingVoiceId,
    loadingVoiceId,
    togglePlayback,
    stopPlayback,
    isPlaying,
    isLoading,
  };
}
