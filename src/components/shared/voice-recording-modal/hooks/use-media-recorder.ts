"use client";

import { useRef, useCallback, useState } from "react";
import { AUTO_PLAY_DELAY_MS, MAX_DURATION_S, RECORDING_TIMER_INTERVAL_MS } from "../constants";
import type { TranslateFn } from "../types";
import { getSupportedMimeType, mapMicrophoneStartError } from "../utils";

export interface RecordedAudio {
  blob: Blob;
  url: string;
  mimeType: string;
}

export interface UseMediaRecorderOptions {
  maxDurationSeconds?: number;
  timerIntervalMs?: number;
  autoPlayDelayMs?: number;
  translate: TranslateFn;
  onRecordingStarted: () => void;
  onRecorded: (recording: RecordedAudio) => void;
  onRecordingError: (message: string) => void;
  onAutoPlay: (url: string) => void;
}

export interface UseMediaRecorderResult {
  duration: number;
  maxReached: boolean;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  resetRecording: () => void;
  getRecordedBlob: () => Blob | null;
  getMimeType: () => string;
  revokeAudioUrl: () => void;
  dispose: () => void;
}

export function useMediaRecorder({
  maxDurationSeconds = MAX_DURATION_S,
  timerIntervalMs = RECORDING_TIMER_INTERVAL_MS,
  autoPlayDelayMs = AUTO_PLAY_DELAY_MS,
  translate: t,
  onRecordingStarted,
  onRecorded,
  onRecordingError,
  onAutoPlay,
}: UseMediaRecorderOptions): UseMediaRecorderResult {
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioBlobRef = useRef<Blob | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const mimeRef = useRef<string>("");

  const [duration, setDuration] = useState(0);
  const [maxReached, setMaxReached] = useState(false);

  const releaseStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const revokeAudioUrl = useCallback(() => {
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }
  }, []);

  const resetRecording = useCallback(() => {
    clearTimer();
    releaseStream();
    revokeAudioUrl();
    chunksRef.current = [];
    audioBlobRef.current = null;
    mimeRef.current = "";
    setDuration(0);
    setMaxReached(false);
  }, [clearTimer, releaseStream, revokeAudioUrl]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    clearTimer();
  }, [clearTimer]);

  const startRecording = useCallback(async () => {
    resetRecording();
    setMaxReached(false);

    const mime = getSupportedMimeType();
    if (!mime) {
      onRecordingError(t("voices.recording.errors.browserUnsupported"));
      return;
    }
    mimeRef.current = mime;

    try {
      let stream: MediaStream | null = null;

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 48000,
          },
        });
      } catch (err) {
        console.warn("Optimal audio constraints failed, trying minimal constraints:", err);
        stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      }

      streamRef.current = stream;

      const recorder = new MediaRecorder(stream, { mimeType: mime });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      recorder.onerror = () => {
        onRecordingError(t("voices.recording.errors.recordingFailed"));
        releaseStream();
        clearTimer();
      };

      recorder.onstop = () => {
        releaseStream();
        clearTimer();

        const blob = new Blob(chunksRef.current, { type: mime });
        audioBlobRef.current = blob;
        const url = URL.createObjectURL(blob);
        audioUrlRef.current = url;

        onRecorded({ blob, url, mimeType: mime });

        setTimeout(() => {
          onAutoPlay(url);
        }, autoPlayDelayMs);
      };

      recorder.start();
      onRecordingStarted();

      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setDuration(elapsed);
        if (elapsed >= maxDurationSeconds) {
          setMaxReached(true);
          recorder.stop();
        }
      }, timerIntervalMs);
    } catch (err) {
      console.error("[VoiceRecording] Failed to start recording:", err);
      onRecordingError(mapMicrophoneStartError(err, t));
    }
  }, [
    autoPlayDelayMs,
    clearTimer,
    maxDurationSeconds,
    onAutoPlay,
    onRecorded,
    onRecordingError,
    onRecordingStarted,
    releaseStream,
    resetRecording,
    t,
    timerIntervalMs,
  ]);

  const getRecordedBlob = useCallback(() => audioBlobRef.current, []);
  const getMimeType = useCallback(() => mimeRef.current, []);

  const dispose = useCallback(() => {
    clearTimer();
    releaseStream();
    revokeAudioUrl();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
  }, [clearTimer, releaseStream, revokeAudioUrl]);

  return {
    duration,
    maxReached,
    startRecording,
    stopRecording,
    resetRecording,
    getRecordedBlob,
    getMimeType,
    revokeAudioUrl,
    dispose,
  };
}
