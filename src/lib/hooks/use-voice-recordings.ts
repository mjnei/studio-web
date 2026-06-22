"use client";

import { useCallback, useEffect, useState } from "react";
import { VoiceRecordingResponse } from "../types/api";
import {
  deleteVoiceRecording,
  listVoiceRecordings,
  uploadVoiceRecording,
  getVoiceRecordingAudioUrl,
} from "../api/voice-recording-client";

export function useVoiceRecordings() {
  const [recordings, setRecordings] = useState<VoiceRecordingResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecordings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listVoiceRecordings();
      // Add audio URLs to recordings
      const recordingsWithAudioUrls = data.map(recording => ({
        ...recording,
        audio_url: getVoiceRecordingAudioUrl(recording.id),
      }));
      setRecordings(recordingsWithAudioUrls);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch recordings");
    } finally {
      setLoading(false);
    }
  }, []);

  const addRecording = useCallback((recording: VoiceRecordingResponse) => {
    setRecordings((prev) => [recording, ...prev]);
  }, []);

  const uploadRecording = useCallback(
    async (file: Blob, title: string, description?: string, duration?: number) => {
      try {
        const newRecording = await uploadVoiceRecording(file, title, description, duration);
        setRecordings((prev) => [newRecording, ...prev]);
        return newRecording;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to upload recording";
        setError(message);
        throw new Error(message);
      }
    },
    []
  );

  const deleteRecording = useCallback(async (id: string) => {
    try {
      await deleteVoiceRecording(id);
      setRecordings((prev) => prev.filter((r) => r.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete recording";
      setError(message);
      throw new Error(message);
    }
  }, []);

  useEffect(() => {
    fetchRecordings();
  }, [fetchRecordings]);

  return {
    recordings,
    loading,
    error,
    addRecording,
    uploadRecording,
    deleteRecording,
    refetch: fetchRecordings,
  };
}
