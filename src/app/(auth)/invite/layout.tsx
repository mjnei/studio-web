import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata(
  "Invite Only",
  "Enter your invite code to join Huavoi Studio."
);

export default function InviteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
