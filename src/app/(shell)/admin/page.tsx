"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, AlertTriangle, ShieldCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Heading } from "@/components/ui/heading";
import { Spinner } from "@/components/ui/spinner";
import { getAdminStats, type AdminStatsResponse } from "@/lib/api/admin";
import { getAdminFeatureNavItems, getAdminStatNavItems } from "@/lib/admin-nav";

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const data = await getAdminStats();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching stats:", err);
        const message = err instanceof Error ? err.message : "Failed to fetch statistics";
        setError(message);
        setStats({
          total_movies: 0,
          active_voices: 0,
          total_users: 0,
          projects_created: 0,
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statsDisplay = getAdminStatNavItems().map((item) => ({
    label: item.stat.label,
    value: stats ? stats[item.stat.key].toLocaleString() : "-",
    icon: item.icon,
    color: item.stat.gradient,
    href: item.href,
  }));

  const adminFeatures = getAdminFeatureNavItems();

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Admin Dashboard"
        description="Manage movies, voices, users, referrals, queues, TTS jobs, and audit logs"
      />

      {error && (
        <div className="mb-8 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-body text-red-700">
          <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden />
          <span>{error}</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsDisplay.map((stat) => {
          const Icon = stat.icon;
          const card = (
            <Card
              variant="glass"
              padding="md"
              className="group hover:border-accent-primary/40 transition-all cursor-pointer h-full"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-body text-text-muted mb-1">{stat.label}</p>
                  <Heading variant="metric" className="text-text-primary">
                    {isLoading ? (
                      <Spinner size="sm" className="text-accent-primary" aria-hidden />
                    ) : (
                      stat.value
                    )}
                  </Heading>
                </div>
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                >
                  <Icon className="h-5 w-5 text-white" />
                </div>
              </div>
            </Card>
          );

          return (
            <Link key={stat.href} href={stat.href} className="block">
              {card}
            </Link>
          );
        })}
      </div>

      {/* Admin Features */}
      <Card variant="glass" padding="lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle>Admin Features</CardTitle>
              <CardDescription>Jump to any admin management page</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {adminFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.href}
                  href={feature.href}
                  className="group flex items-start gap-3 rounded-lg border border-border-default bg-surface-panel p-3 transition-all hover:border-accent-primary/40 hover:bg-surface-hover"
                >
                  <div className="w-8 h-8 rounded-lg bg-accent-muted flex items-center justify-center flex-shrink-0">
                    <Icon className="h-4 w-4 text-accent-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-body font-medium text-text-primary">
                        {feature.dashboardTitle}
                      </p>
                      <ChevronRight className="h-3.5 w-3.5 text-text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    <p className="text-caption text-text-secondary mt-0.5">
                      {feature.dashboardDescription}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
          <p className="mt-4 text-caption text-text-muted">
            <Link href="/debug-sse" className="hover:text-accent-primary hover:underline">
              /debug-sse
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
