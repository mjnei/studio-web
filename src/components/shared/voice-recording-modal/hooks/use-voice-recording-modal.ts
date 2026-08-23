"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useI18n } from "@/i18n";
import {
  AUTO_PLAY_DELAY_MS,
  MAX_DURATION_S,
  RECORDING_TIMER_INTERVAL_MS,
} from "../constants";
import {
  generateRandomVoiceName,
  getSupportedMimeType,
  mapMicrophoneStartError,
  requestMicrophoneStream,
} from "../utils";
import type { RecorderState, VoiceRecordingModalProps } from "../types";

interface CompletedRecording {
  blob: Blob;
  url: string;
  mimeType: string;
  duration: number;
  maxReached: boolean;
}

export function useVoiceRecordingModal({ isOpen, onClose, onSaved }: VoiceRecordingModalProps) {
  const { t } = useI18n();

  const [phase, setPhase] = useState<RecorderState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [recording, setRecording] = useState<CompletedRecording | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackProgress, setPlaybackProgress] = useState(0);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [voiceName, setVoiceName] = useState("");
  const [language, setLanguage] = useState("en");
  const [nameError, setNameError] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recordingUrlRef = useRef<string | null>(null);
  const mimeRef = useRef("");

  const stopPlayback = useCallback(() => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    setIsPlaying(false);
    setPlaybackProgress(0);
    setPlaybackTime(0);
  }, []);

  const releaseStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const cleanup = useCallback(() => {
    clearTimer();
    stopPlayback();
    releaseStream();
    audioRef.current = null;

    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
    recorderRef.current = null;
    chunksRef.current = [];
    mimeRef.current = "";

    if (recordingUrlRef.current) {
      URL.revokeObjectURL(recordingUrlRef.current);
      recordingUrlRef.current = null;
    }
  }, [clearTimer, releaseStream, stopPlayback]);

  const resetUi = useCallback(() => {
    setPhase("idle");
    setError(null);
    setElapsed(0);
    setRecording(null);
    setIsSaving(false);
    setVoiceName("");
    setLanguage("en");
    setNameError(false);
  }, []);

  const attachAudio = useCallback(
    (url: string) => {
      stopPlayback();
      const audio = new Audio(url);
      audioRef.current = audio;

      audio.ontimeupdate = () => {
        if (!audio.duration || !isFinite(audio.duration)) return;
        setPlaybackProgress(audio.currentTime / audio.duration);
        setPlaybackTime(audio.currentTime);
      };
      audio.onended = () => {
        setIsPlaying(false);
        setPlaybackProgress(1);
        setPlaybackTime(audio.duration || 0);
      };
      audio.onerror = () => {
        setIsPlaying(false);
        setError(t("voices.recording.errors.playbackFailed"));
      };

      return audio;
    },
    [stopPlayback, t]
  );

  useEffect(() => () => cleanup(), [cleanup]);

  useEffect(() => {
    if (!isOpen) {
      cleanup();
      return;
    }
    resetUi();
  }, [isOpen, cleanup, resetUi]);

  const startRecording = useCallback(async () => {
    cleanup();
    resetUi();
    setPhase("requesting");

    const mime = getSupportedMimeType();
    if (!mime) {
      setError(t("voices.recording.errors.browserUnsupported"));
      setPhase("idle");
      return;
    }
    mimeRef.current = mime;

    try {
      const stream = await requestMicrophoneStream();
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream, { mimeType: mime });
      recorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };

      recorder.onerror = () => {
        setError(t("voices.recording.errors.recordingFailed"));
        cleanup();
        setPhase("idle");
      };

      recorder.onstop = () => {
        clearTimer();
        releaseStream();

        const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
        const blob = new Blob(chunksRef.current, { type: mime });
        const url = URL.createObjectURL(blob);
        recordingUrlRef.current = url;

        const completed: CompletedRecording = {
          blob,
          url,
          mimeType: mime,
          duration,
          maxReached: duration >= MAX_DURATION_S,
        };

        setRecording(completed);
        setPhase("recorded");

        const audio = attachAudio(url);
        setTimeout(() => {
          audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
        }, AUTO_PLAY_DELAY_MS);
      };

      recorder.start();
      setPhase("recording");
      startTimeRef.current = Date.now();

      timerRef.current = setInterval(() => {
        const seconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setElapsed(seconds);
        if (seconds >= MAX_DURATION_S) {
          recorder.stop();
        }
      }, RECORDING_TIMER_INTERVAL_MS);
    } catch (err) {
      console.error("[VoiceRecording] Failed to start recording:", err);
      setError(mapMicrophoneStartError(err, t));
      cleanup();
      setPhase("idle");
    }
  }, [attachAudio, cleanup, clearTimer, releaseStream, resetUi, t]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
    clearTimer();
  }, [clearTimer]);

  const discardRecording = useCallback(() => {
    cleanup();
    resetUi();
  }, [cleanup, resetUi]);

  const proceedToNaming = useCallback(() => {
    stopPlayback();
    setVoiceName("");
    setNameError(false);
    setPhase("naming");
  }, [stopPlayback]);

  const generateName = useCallback(() => {
    setVoiceName(generateRandomVoiceName());
    setNameError(false);
  }, []);

  const saveRecording = useCallback(async () => {
    if (!recording) return;

    const title = voiceName.trim();
    if (!title) {
      setNameError(true);
      return;
    }

    setIsSaving(true);
    setError(null);
    setNameError(false);

    try {
      const { uploadVoice } = await import("@/lib/api/voice-client");
      const { convertWebmToAudio } = await import("@/lib/utils/audio-converter");

      let audioBlob = recording.blob;
      const mimeType = recording.mimeType || recording.blob.type || "audio/webm";

      if (mimeType.includes("webm")) {
        try {
          audioBlob = await convertWebmToAudio(recording.blob, title);
        } catch (conversionErr) {
          console.warn("Audio conversion failed, using original format:", conversionErr);
          audioBlob = new Blob([recording.blob], { type: mimeType });
        }
      }

      const saved = await uploadVoice(audioBlob, title, language, recording.duration);
      onSaved?.(saved);
      cleanup();
      resetUi();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("voices.recording.errors.saveFailed"));
      setIsSaving(false);
    }
  }, [cleanup, language, onClose, onSaved, recording, resetUi, t, voiceName]);

  const togglePlayback = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  }, [isPlaying]);

  const seekPlayback = useCallback((fraction: number) => {
    const audio = audioRef.current;
    if (!audio?.duration || !isFinite(audio.duration)) return;
    audio.currentTime = fraction * audio.duration;
    setPlaybackProgress(fraction);
    setPlaybackTime(audio.currentTime);
  }, []);

  return {
    t,
    phase,
    error,
    elapsed,
    recording,
    isPlaying,
    playbackProgress,
    playbackTime,
    isSaving,
    voiceName,
    language,
    nameError,
    setVoiceName,
    setLanguage,
    setNameError,
    setPhase,
    startRecording,
    stopRecording,
    discardRecording,
    proceedToNaming,
    generateName,
    saveRecording,
    togglePlayback,
    seekPlayback,
  };
}
