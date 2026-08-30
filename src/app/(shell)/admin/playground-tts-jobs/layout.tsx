import type { Metadata } from "next";
import { createAdminMetadata } from "@/lib/metadata";

export const metadata: Metadata = createAdminMetadata(
  "Playground TTS Jobs",
  "Monitor playground TTS job health, rate limiting, and abuse patterns"
);

export default function PlaygroundTTSJobsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
