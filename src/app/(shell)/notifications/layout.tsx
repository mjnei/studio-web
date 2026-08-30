import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata(
  "Notifications",
  "View your recent activity and alerts."
);

export default function NotificationsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
