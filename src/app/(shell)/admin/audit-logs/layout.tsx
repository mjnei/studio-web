import type { Metadata } from "next";
import { createAdminMetadata } from "@/lib/metadata";

export const metadata: Metadata = createAdminMetadata(
  "Audit Logs",
  "View and filter system audit logs"
);

export default function AuditLogsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
