import { useEffect, useState } from "react";
import { VoiceResponse } from "../types/api";
import { request } from "../api-client";

export function useStockVoices() {
  const [voices, setVoices] = useState<VoiceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    let isMounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);

        // The /voices endpoint returns a plain array, not a paginated response
        const voicesList = await request<VoiceResponse[]>("/voices");

        if (isMounted) {
          setVoices(voicesList || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to fetch stock voices");
          setVoices([]);
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
      controller.abort();
    };
  }, []);

  return {
    voices,
    loading,
    error,
    refresh: async () => {
      try {
        setLoading(true);
        setError(null);

        // The /voices endpoint returns a plain array, not a paginated response
        const voicesList = await request<VoiceResponse[]>("/voices");

        setVoices(voicesList || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch stock voices");
        setVoices([]);
      } finally {
        setLoading(false);
      }
    },
  };
}

/**
 * Get presigned audio URL for a stock voice
 */
export async function getVoicePreviewUrl(voiceId: string): Promise<string | null> {
  try {
    const response = await request<{ audio_url: string | null; expires_in: number | null }>(
      `/voices/${voiceId}/preview-url`
    );
    return response.audio_url;
  } catch (error) {
    console.error("Failed to get voice preview URL:", error);
    return null;
  }
}
