import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata(
  "Create Account",
  "Create your Huavoi Studio account."
);

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children;
}
