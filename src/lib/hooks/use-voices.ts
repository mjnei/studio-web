"use client";

import { useCallback, useEffect, useState } from "react";
import { VoiceResponse } from "../types/api";
import {
  deleteVoice,
  listVoices,
  uploadVoice,
  toggleVoiceSharing,
  attachVoiceAudioUrls,
} from "../api/voice-client";

export interface UseVoicesReturn {
  voices: VoiceResponse[];
  loading: boolean;
  error: string | null;
  uploadVoice: (file: Blob, name: string, duration?: number) => Promise<VoiceResponse>;
  deleteVoice: (id: number) => Promise<void>;
  toggleSharing: (id: number, isShared: boolean) => Promise<VoiceResponse>;
  refetch: () => Promise<void>;
}

async function loadVoicesWithAudioUrls(): Promise<VoiceResponse[]> {
  const data = await listVoices();
  const activeVoices = data.filter((voice) => !voice.is_deleted);
  return attachVoiceAudioUrls(activeVoices);
}

export function useVoices(): UseVoicesReturn {
  const [voices, setVoices] = useState<VoiceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleUploadVoice = useCallback(
    async (file: Blob, name: string, duration?: number): Promise<VoiceResponse> => {
      try {
        const newVoice = await uploadVoice(file, name, "en", duration);
        const [voiceWithUrl] = await attachVoiceAudioUrls([newVoice]);
        setVoices((prev) => [voiceWithUrl, ...prev]);
        return voiceWithUrl;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to upload voice";
        setError(message);
        throw new Error(message);
      }
    },
    []
  );

  const handleDeleteVoice = useCallback(async (id: number) => {
    try {
      await deleteVoice(id);
      setVoices((prev) => prev.filter((v) => v.id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete voice";
      setError(message);
      throw new Error(message);
    }
  }, []);

  const handleToggleSharing = useCallback(
    async (id: number, isShared: boolean): Promise<VoiceResponse> => {
      try {
        const updatedVoice = await toggleVoiceSharing(id, isShared);
        setVoices((prev) => prev.map((v) => (v.id === id ? { ...v, ...updatedVoice } : v)));
        return updatedVoice;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to toggle voice sharing";
        setError(message);
        throw new Error(message);
      }
    },
    []
  );

  const handleRefetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setVoices(await loadVoicesWithAudioUrls());
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch voices";
      setError(message);
      console.error("Error fetching voices:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const voicesWithAudioUrls = await loadVoicesWithAudioUrls();
        if (isMounted) {
          setVoices(voicesWithAudioUrls);
        }
      } catch (err) {
        if (isMounted) {
          const message = err instanceof Error ? err.message : "Failed to fetch voices";
          setError(message);
          console.error("Error fetching voices:", err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    voices,
    loading,
    error,
    uploadVoice: handleUploadVoice,
    deleteVoice: handleDeleteVoice,
    toggleSharing: handleToggleSharing,
    refetch: handleRefetch,
  };
}
