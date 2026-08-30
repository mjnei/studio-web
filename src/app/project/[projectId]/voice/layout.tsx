import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata(
  "Select Voice",
  "Choose a voice for your project narration."
);

export default function ProjectVoiceLayout({ children }: { children: React.ReactNode }) {
  return children;
}
