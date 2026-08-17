import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "TTS Playground - Admin",
  description: "Test TTS functionality without creating a full project",
};

export default function PlaygroundLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
