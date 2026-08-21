"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Film,
  Mic,
  ShieldCheck,
  Users,
  BarChart3,
  Layers,
  Zap,
  Play,
  Activity,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/PageHeader";
import { Heading } from "@/components/ui/heading";
import { getAdminStats, type AdminStatsResponse } from "@/lib/api/admin";

type StatCard = {
  label: string;
  value: string;
  icon: LucideIcon;
  color: string;
  href?: string;
  comingSoon?: boolean;
};

type FeatureLink = {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

// Movies, voices, and projects are linked from the stats cards above — omit them here.
const ADMIN_FEATURES: FeatureLink[] = [
  {
    href: "/admin/queues",
    title: "Queue Management",
    description: "Monitor background job queues and inspect queue health",
    icon: Layers,
  },
  {
    href: "/admin/playground-tts-jobs",
    title: "Playground TTS Jobs",
    description: "Monitor anonymous playground TTS usage, rate limits, and failures",
    icon: Zap,
  },
  {
    href: "/admin/studio-tts-jobs",
    title: "Studio TTS Jobs",
    description: "Track stale and failed studio TTS jobs with retry and cancel actions",
    icon: Zap,
  },
  {
    href: "/admin/playground",
    title: "Playground",
    description: "Test voices and TTS settings without creating a full project",
    icon: Play,
  },
  {
    href: "/admin/audit-logs",
    title: "Audit Logs",
    description: "Search compliance logs with filters, stats, and CSV export",
    icon: Activity,
  },
];

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStatsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getAdminStats();
        setStats(data);
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
      }
    };

    fetchStats();
  }, []);

  const statsDisplay: StatCard[] = [
    {
      label: "Total Movies",
      value: stats ? stats.total_movies.toLocaleString() : "-",
      icon: Film,
      color: "from-blue-500 to-cyan-500",
      href: "/admin/movies",
    },
    {
      label: "Active Voices",
      value: stats ? stats.active_voices.toLocaleString() : "-",
      icon: Mic,
      color: "from-green-500 to-emerald-500",
      href: "/admin/voices",
    },
    {
      label: "Total Users",
      value: stats ? stats.total_users.toLocaleString() : "-",
      icon: Users,
      color: "from-purple-500 to-pink-500",
      comingSoon: true,
    },
    {
      label: "Projects Created",
      value: stats ? stats.projects_created.toLocaleString() : "-",
      icon: BarChart3,
      color: "from-orange-500 to-red-500",
      href: "/admin/projects",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Admin Dashboard"
        description="Manage movies, voices, queues, TTS jobs, and audit logs"
      />

      {error && (
        <div className="mb-8 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          ⚠️ {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsDisplay.map((stat) => {
          const Icon = stat.icon;
          const card = (
            <Card
              variant="elevated"
              padding="md"
              className={
                stat.href
                  ? "group hover:border-accent-primary/40 transition-all cursor-pointer h-full"
                  : "h-full opacity-90"
              }
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted mb-1">{stat.label}</p>
                  <Heading variant="metric" className="text-text-primary">
                    {stat.value}
                  </Heading>
                  {stat.comingSoon && <p className="mt-1 text-xs text-text-muted">Coming soon</p>}
                </div>
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center ${
                    stat.href ? "group-hover:scale-110 transition-transform" : ""
                  }`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </Card>
          );

          if (stat.href) {
            return (
              <Link key={stat.label} href={stat.href} className="block">
                {card}
              </Link>
            );
          }

          return (
            <div key={stat.label} aria-disabled="true">
              {card}
            </div>
          );
        })}
      </div>

      {/* Admin Features */}
      <Card variant="elevated" padding="lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle>Admin Features</CardTitle>
              <CardDescription>Jump to any admin management page</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {ADMIN_FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.href}
                  href={feature.href}
                  className="group flex items-start gap-3 rounded-lg border border-border-default bg-surface-panel p-3 transition-all hover:border-accent-primary/40 hover:bg-surface-hover"
                >
                  <div className="w-8 h-8 rounded-lg bg-accent-muted flex items-center justify-center flex-shrink-0">
                    <Icon className="w-4 h-4 text-accent-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="text-sm font-medium text-text-primary">{feature.title}</p>
                      <ChevronRight className="w-3.5 h-3.5 text-text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                    <p className="text-xs text-text-secondary mt-0.5">{feature.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>
          <p className="mt-4 text-xs text-text-muted">
            <Link href="/debug-sse" className="hover:text-accent-primary hover:underline">
              /debug-sse
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
