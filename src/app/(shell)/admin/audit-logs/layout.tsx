import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Audit Logs | Admin",
  description: "View and filter system audit logs",
};

export default function AuditLogsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
