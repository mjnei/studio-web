import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/metadata";

export const metadata: Metadata = createPageMetadata(
  "Profile Settings",
  "Manage your account, membership, and security settings."
);

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
