import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata(
  "Notification Settings",
  "Choose which email and in-app notifications you receive."
);

export default function NotificationSettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
