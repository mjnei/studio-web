import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata(
  "Welcome to Huavoi Studio",
  "Set up your account and start creating videos."
);

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
