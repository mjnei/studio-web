"use client";

import { useCallback, useEffect, useState } from "react";
import { VoiceResponse } from "../types/api";
import {
  deleteVoice,
  listVoices,
  uploadVoice,
  getVoiceAudioUrl,
  toggleVoiceSharing,
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

export function useVoices(): UseVoicesReturn {
  const [voices, setVoices] = useState<VoiceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleUploadVoice = useCallback(
    async (file: Blob, name: string, duration?: number): Promise<VoiceResponse> => {
      try {
        const newVoice = await uploadVoice(file, name, "en", duration);

        // Fetch audio URL for the newly uploaded voice
        try {
          const audioUrlData = await getVoiceAudioUrl(newVoice.id);
          const voiceWithUrl = {
            ...newVoice,
            audio_url: audioUrlData.audio_url,
            audio_storage_type: audioUrlData.storage_type,
            audio_expires_in: audioUrlData.expires_in,
          };
          setVoices((prev) => [voiceWithUrl, ...prev]);
          return voiceWithUrl;
        } catch (err) {
          // Even if audio URL fetch fails, add the voice to state
          console.error(`Failed to fetch audio URL for new voice ${newVoice.id}:`, err);
          setVoices((prev) => [newVoice, ...prev]);
          return newVoice;
        }
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

      // Fetch voices from the backend
      const data = await listVoices();

      // Filter out deleted voices (soft delete support per Requirement 7.1)
      const activeVoices = data.filter((voice) => !voice.is_deleted);

      // Fetch audio URLs for all voices in parallel
      const voicesWithAudioUrls = await Promise.all(
        activeVoices.map(async (voice) => {
          try {
            const audioUrlData = await getVoiceAudioUrl(voice.id);
            return {
              ...voice,
              audio_url: audioUrlData.audio_url,
              audio_storage_type: audioUrlData.storage_type,
              audio_expires_in: audioUrlData.expires_in,
            };
          } catch (err) {
            // Log but don't fail - audio URL fetch is optional
            console.error(`Failed to fetch audio URL for voice ${voice.id}:`, err);
            return voice;
          }
        })
      );

      setVoices(voicesWithAudioUrls);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch voices";
      setError(message);
      console.error("Error fetching voices:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch voices on mount
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch voices from the backend
        const data = await listVoices();

        if (!isMounted) return;

        // Filter out deleted voices (soft delete support per Requirement 7.1)
        const activeVoices = data.filter((voice) => !voice.is_deleted);

        // Fetch audio URLs for all voices in parallel
        const voicesWithAudioUrls = await Promise.all(
          activeVoices.map(async (voice) => {
            try {
              const audioUrlData = await getVoiceAudioUrl(voice.id);
              return {
                ...voice,
                audio_url: audioUrlData.audio_url,
                audio_storage_type: audioUrlData.storage_type,
                audio_expires_in: audioUrlData.expires_in,
              };
            } catch (err) {
              // Log but don't fail - audio URL fetch is optional
              console.error(`Failed to fetch audio URL for voice ${voice.id}:`, err);
              return voice;
            }
          })
        );

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
