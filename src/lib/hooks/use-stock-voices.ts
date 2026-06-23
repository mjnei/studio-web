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
