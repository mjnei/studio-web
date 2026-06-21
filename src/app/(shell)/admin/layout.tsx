"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useIsAdmin } from "@/lib/hooks/use-admin";
import { useAuth } from "@/lib/auth-context";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();
  const isAdmin = useIsAdmin();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAdmin) {
      router.replace("/dashboard");
    }
  }, [isLoading, isAdmin, router]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-sm text-text-muted">Loading...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return <>{children}</>;
}
