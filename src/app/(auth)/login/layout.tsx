import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata("Sign In", "Welcome back to Huavoi Studio.");

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
