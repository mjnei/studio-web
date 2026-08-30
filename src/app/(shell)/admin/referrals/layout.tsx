import type { Metadata } from "next";
import { createAdminMetadata } from "@/lib/metadata";

export const metadata: Metadata = createAdminMetadata(
  "Referrals",
  "Monitor referral program analytics, configuration, and fraud moderation"
);

export default function AdminReferralsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
