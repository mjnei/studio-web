import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TTS Jobs Monitoring - Admin",
  description: "Monitor TTS job health and diagnose failures",
};

export default function TTSJobsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
