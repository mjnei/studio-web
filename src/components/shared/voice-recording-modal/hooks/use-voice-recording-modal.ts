"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useI18n } from "@/i18n";
import { useAudioPlayback } from "./use-audio-playback";
import { useMediaRecorder } from "./use-media-recorder";
import { generateRandomVoiceName } from "../utils";
import type { RecorderState, VoiceRecordingModalProps } from "../types";

export function useVoiceRecordingModal({ isOpen, onClose, onSaved }: VoiceRecordingModalProps) {
  const { t } = useI18n();
  const [state, setState] = useState<RecorderState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [voiceName, setVoiceName] = useState("");
  const [language, setLanguage] = useState("en");
  const [nameError, setNameError] = useState(false);
  const [languageError, setLanguageError] = useState(false);

  const audioUrlRef = useRef<string | null>(null);

  const playback = useAudioPlayback(() => {
    setError(t("voices.recording.errors.playbackFailed"));
  });

  const recorder = useMediaRecorder({
    translate: t,
    onRecordingStarted: () => {
      setState("recording");
    },
    onRecorded: ({ url }) => {
      audioUrlRef.current = url;
      setState("recorded");
    },
    onRecordingError: (message) => {
      setError(message);
      setState("idle");
    },
    onAutoPlay: (url) => {
      playback.play(url);
    },
  });

  const resetFormState = useCallback(() => {
    setState("idle");
    setError(null);
    setIsSaving(false);
    setVoiceName("");
    setLanguage("en");
    setNameError(false);
    setLanguageError(false);
  }, []);

  const resetAll = useCallback(() => {
    playback.reset();
    recorder.resetRecording();
    recorder.revokeAudioUrl();
    audioUrlRef.current = null;
    resetFormState();
  }, [playback, recorder, resetFormState]);

  useEffect(() => {
    return () => {
      playback.stop();
      recorder.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount/unmount only
  }, []);

  useEffect(() => {
    if (!isOpen) {
      playback.stop();
      recorder.revokeAudioUrl();
      recorder.resetRecording();
      return;
    }

    resetFormState();
    playback.reset();
    recorder.resetRecording();
    audioUrlRef.current = null;
  }, [isOpen, playback, recorder, resetFormState]);

  const startRecording = useCallback(async () => {
    setError(null);
    playback.stop();
    recorder.revokeAudioUrl();
    audioUrlRef.current = null;
    playback.reset();
    setState("requesting");
    await recorder.startRecording();
  }, [playback, recorder]);

  const stopRecording = useCallback(() => {
    recorder.stopRecording();
  }, [recorder]);

  const discardRecording = useCallback(() => {
    resetAll();
  }, [resetAll]);

  const proceedToNaming = useCallback(() => {
    setState("naming");
    setVoiceName("");
    setNameError(false);
    setLanguageError(false);
    playback.stop();
  }, [playback]);

  const generateName = useCallback(() => {
    setVoiceName(generateRandomVoiceName());
    setNameError(false);
  }, []);

  const saveRecording = useCallback(async () => {
    const blob = recorder.getRecordedBlob();
    if (!blob) return;

    const title = voiceName.trim();

    if (!title) {
      setNameError(true);
      return;
    }

    if (!language) {
      setLanguageError(true);
      return;
    }

    setIsSaving(true);
    setError(null);
    setNameError(false);
    setLanguageError(false);

    try {
      const { uploadVoice } = await import("@/lib/api/voice-client");
      const { convertWebmToAudio } = await import("@/lib/utils/audio-converter");

      let audioBlob = blob;
      const mimeType = recorder.getMimeType() || blob.type || "audio/webm";

      if (mimeType.includes("webm")) {
        try {
          audioBlob = await convertWebmToAudio(blob, title);
        } catch (conversionErr) {
          console.warn("Audio conversion failed, using original format:", conversionErr);
          audioBlob = new Blob([blob], { type: mimeType });
        }
      } else {
        audioBlob = new Blob([blob], { type: mimeType });
      }

      const newRecording = await uploadVoice(audioBlob, title, language, recorder.duration);
      onSaved?.(newRecording);
      resetAll();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t("voices.recording.errors.saveFailed"));
      setIsSaving(false);
    }
  }, [language, onClose, onSaved, recorder, resetAll, t, voiceName]);

  const playRecording = useCallback(() => {
    const url = audioUrlRef.current;
    if (url) playback.play(url);
  }, [playback]);

  const togglePlayback = useCallback(() => {
    if (playback.isPlaying) {
      playback.pause();
    } else {
      playRecording();
    }
  }, [playback, playRecording]);

  return {
    t,
    state,
    setState,
    error,
    isSaving,
    voiceName,
    setVoiceName,
    language,
    setLanguage,
    nameError,
    setNameError,
    languageError,
    setLanguageError,
    duration: recorder.duration,
    maxReached: recorder.maxReached,
    isPlaying: playback.isPlaying,
    playbackProgress: playback.progress,
    playbackTime: playback.currentTime,
    startRecording,
    stopRecording,
    discardRecording,
    proceedToNaming,
    generateName,
    saveRecording,
    togglePlayback,
    seekPlayback: playback.seek,
  };
}
