import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Referrals | Admin",
  description: "Monitor referral program analytics, configuration, and fraud moderation",
};

export default function AdminReferralsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
