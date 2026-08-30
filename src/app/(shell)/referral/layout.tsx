import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata(
  "Referral Program",
  "Invite friends and earn rewards."
);

export default function ReferralLayout({ children }: { children: React.ReactNode }) {
  return children;
}
