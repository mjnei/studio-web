import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata(
  "Referral Code Required",
  "New accounts need a referral code from a current member."
);

export default function ReferralRequiredLayout({ children }: { children: React.ReactNode }) {
  return children;
}
