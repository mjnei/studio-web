import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Playground TTS Jobs - Admin",
  description: "Monitor playground TTS job health, rate limiting, and abuse patterns",
};

export default function PlaygroundTTSJobsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
