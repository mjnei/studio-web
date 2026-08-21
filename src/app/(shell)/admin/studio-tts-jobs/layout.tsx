import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Studio TTS Jobs - Admin",
  description: "Monitor TTS job health and diagnose failures",
};

export default function TTSJobsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
