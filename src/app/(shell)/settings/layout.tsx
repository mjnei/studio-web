import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata(
  "Settings",
  "Customize notifications, appearance, and project defaults."
);

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
