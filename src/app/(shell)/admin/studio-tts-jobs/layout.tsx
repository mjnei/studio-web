import type { Metadata } from "next";
import { createAdminMetadata } from "@/lib/metadata";

export const metadata: Metadata = createAdminMetadata(
  "Studio TTS Jobs",
  "Monitor TTS job health and diagnose failures"
);

export default function TTSJobsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
