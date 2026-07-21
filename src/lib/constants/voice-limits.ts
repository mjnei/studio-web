/**
 * Voice creation limits by membership tier
 *
 * These limits match the backend enforcement in:
 * app/services/voice_service.py::check_voice_limit()
 */

export const VOICE_LIMITS = {
  free: 2,
  pro: 5,
  premium: 10,
} as const;

export type MembershipTier = keyof typeof VOICE_LIMITS;

/**
 * Get voice limit for a membership tier
 */
export function getVoiceLimit(tier: MembershipTier | string): number {
  const normalizedTier = tier.toLowerCase() as MembershipTier;
  return VOICE_LIMITS[normalizedTier] || VOICE_LIMITS.free;
}

/**
 * Check if user can add more voices
 */
export function canAddVoice(currentCount: number, tier: MembershipTier | string): boolean {
  const limit = getVoiceLimit(tier);
  return currentCount < limit;
}

/**
 * Get upgrade message for voice limit
 */
export function getVoiceLimitMessage(
  currentCount: number,
  tier: MembershipTier | string
): {
  isAtLimit: boolean;
  message: string;
  upgradeRequired: boolean;
} {
  const limit = getVoiceLimit(tier);
  const isAtLimit = currentCount >= limit;

  if (!isAtLimit) {
    return {
      isAtLimit: false,
      message: `You have ${currentCount} of ${limit} voices. You can add ${limit - currentCount} more.`,
      upgradeRequired: false,
    };
  }

  // At limit - suggest upgrade
  const tierName = tier === "free" ? "Free" : tier === "pro" ? "Pro" : "Premium";

  if (tier === "premium") {
    return {
      isAtLimit: true,
      message: `You've reached the maximum of ${limit} voices on the ${tierName} plan.`,
      upgradeRequired: false,
    };
  }

  const nextTier = tier === "free" ? "Pro" : "Premium";
  const nextLimit = tier === "free" ? VOICE_LIMITS.pro : VOICE_LIMITS.premium;

  return {
    isAtLimit: true,
    message: `You've reached your ${tierName} plan limit of ${limit} voice${limit > 1 ? "s" : ""}. Upgrade to ${nextTier} to create up to ${nextLimit} voices.`,
    upgradeRequired: true,
  };
}
