import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata(
  "Reset Password",
  "Reset your Huavoi Studio account password."
);

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
