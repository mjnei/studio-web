import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata(
  "Referral Leaderboard",
  "See top referrers and community rewards."
);

export default function ReferralLeaderboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
