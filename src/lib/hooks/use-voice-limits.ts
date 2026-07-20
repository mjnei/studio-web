import { useEffect, useState } from "react";
import { getMe } from "@/lib/api-client";
import { listVoices } from "@/lib/api/voice-client";
import { getVoiceLimitMessage, canAddVoice, getVoiceLimit } from "@/lib/constants/voice-limits";
import type { MembershipTier } from "@/lib/constants/voice-limits";

export interface VoiceLimitStatus {
  tier: MembershipTier | string;
  limit: number;
  currentCount: number;
  remainingCount: number;
  canAdd: boolean;
  isAtLimit: boolean;
  message: string;
  upgradeRequired: boolean;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to check user's voice creation limits
 * 
 * Fetches user membership tier and current voice count,
 * then calculates whether they can add more voices.
 */
export function useVoiceLimits(): VoiceLimitStatus {
  const [status, setStatus] = useState<VoiceLimitStatus>({
    tier: "free",
    limit: 1,
    currentCount: 0,
    remainingCount: 1,
    canAdd: true,
    isAtLimit: false,
    message: "",
    upgradeRequired: false,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function checkLimits() {
      try {
        // Fetch user data and voices in parallel
        const [userData, voicesData] = await Promise.all([getMe(), listVoices()]);

        if (cancelled) return;

        const tier = userData.membership_tier || "free";
        const limit = getVoiceLimit(tier);
        
        // Count only non-deleted voices
        const currentCount = voicesData.filter((v) => !v.is_deleted).length;
        const remainingCount = Math.max(0, limit - currentCount);
        const canAddMore = canAddVoice(currentCount, tier);
        const limitMessage = getVoiceLimitMessage(currentCount, tier);

        setStatus({
          tier,
          limit,
          currentCount,
          remainingCount,
          canAdd: canAddMore,
          isAtLimit: limitMessage.isAtLimit,
          message: limitMessage.message,
          upgradeRequired: limitMessage.upgradeRequired,
          loading: false,
          error: null,
        });
      } catch (err) {
        if (cancelled) return;
        
        console.error("Failed to check voice limits:", err);
        setStatus((prev) => ({
          ...prev,
          loading: false,
          error: err instanceof Error ? err.message : "Failed to check voice limits",
        }));
      }
    }

    checkLimits();

    return () => {
      cancelled = true;
    };
  }, []);

  return status;
}
