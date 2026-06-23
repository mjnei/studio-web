import { useCallback, useEffect, useState } from "react";
import { VoiceResponse } from "../types/api";
import { listVoices } from "../api/project-client";

export function useStockVoices() {
  const [voices, setVoices] = useState<VoiceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all available stock voices
      let allVoices: VoiceResponse[] = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore) {
        try {
          const response = await listVoices(page, 100);
          allVoices.push(...response.voices);
          
          // Check if there are more pages
          hasMore = allVoices.length < response.total;
          page++;
        } catch (err) {
          // If pagination fails, try to return what we have
          if (allVoices.length > 0) {
            hasMore = false;
          } else {
            throw err;
          }
        }
      }
      
      setVoices(allVoices);
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
