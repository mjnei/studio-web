import { useCallback, useEffect, useState } from "react";
import { VoiceResponse } from "../types/api";
import { request } from "../api-client";

export function useStockVoices() {
  const [voices, setVoices] = useState<VoiceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVoices = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    fetchVoices();
  }, [fetchVoices]);

  return {
    voices,
    loading,
    error,
    refresh: fetchVoices,
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
