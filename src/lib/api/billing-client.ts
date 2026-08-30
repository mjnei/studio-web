import { request } from "@/lib/api-client";

export type BillingCycle = "monthly" | "annual";
export type PaidPricingTierId = "pro" | "premium";

export interface CheckoutSessionRequest {
  tier: PaidPricingTierId;
  billing_cycle: BillingCycle;
}

export interface CheckoutSessionResponse {
  checkout_url: string;
}

/** Set `NEXT_PUBLIC_BILLING_ENABLED=true` when the backend checkout endpoint is live. */
export const BILLING_ENABLED = process.env.NEXT_PUBLIC_BILLING_ENABLED === "true";

export async function createCheckoutSession(
  params: CheckoutSessionRequest
): Promise<CheckoutSessionResponse> {
  return request<CheckoutSessionResponse>("/billing/checkout-session", {
    method: "POST",
    body: JSON.stringify(params),
  });
}
