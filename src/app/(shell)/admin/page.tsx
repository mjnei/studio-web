"use client";

import Link from "next/link";
import { Film, Mic, ShieldCheck, Database, Users, Settings, BarChart3 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/PageHeader";

export default function AdminPage() {
  const adminSections = [
    {
      title: "Movies",
      description: "Import from TMDB or manage your existing movie library with full metadata",
      icon: Film,
      href: "/admin/movies",
      gradient: "from-blue-500 to-cyan-500",
      stats: "1,234 movies",
    },
    {
      title: "Voices",
      description: "Manage stock voices catalog and configure availability",
      icon: Mic,
      href: "/admin/voices",
      gradient: "from-green-500 to-emerald-500",
      stats: "48 voices",
    },
    {
      title: "TMDB Import",
      description: "Search and import movies with multi-language support",
      icon: Database,
      href: "/admin/tmdb",
      gradient: "from-purple-500 to-pink-500",
      stats: "Full metadata",
    },
  ];

  const stats = [
    {
      label: "Total Movies",
      value: "1,234",
      icon: Film,
      color: "from-blue-500 to-cyan-500",
    },
    {
      label: "Active Voices",
      value: "48",
      icon: Mic,
      color: "from-green-500 to-emerald-500",
    },
    {
      label: "Total Users",
      value: "856",
      icon: Users,
      color: "from-purple-500 to-pink-500",
    },
    {
      label: "Projects Created",
      value: "2,341",
      icon: BarChart3,
      color: "from-orange-500 to-red-500",
    },
  ];

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        title="Admin Dashboard"
        description="Manage movies and voices catalog for the Huavoi platform"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.label}
              variant="elevated"
              padding="md"
              className="group hover:border-accent-primary/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-text-muted mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
                </div>
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Admin Sections */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {adminSections.map((section) => {
          const Icon = section.icon;
          return (
            <Link key={section.title} href={section.href}>
              <Card
                variant="interactive"
                padding="lg"
                className="group h-full hover:border-accent-primary/50 hover:shadow-xl transition-all"
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${section.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}
                    >
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xs font-medium text-accent-primary bg-accent-muted px-2 py-1 rounded-full">
                      {section.stats}
                    </span>
                  </div>
                  <h2 className="text-xl font-semibold text-text-primary mb-2 group-hover:text-accent-primary transition-colors">
                    {section.title}
                  </h2>
                  <p className="text-sm text-text-secondary flex-1">{section.description}</p>
                </div>
              </Card>
            </Link>
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
              <CardDescription>Available management capabilities</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent-muted flex items-center justify-center flex-shrink-0">
                <Film className="w-4 h-4 text-accent-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary mb-1">Movie Management</p>
                <p className="text-xs text-text-secondary">
                  Full TMDB integration with cast, crew, genres, and multi-language support
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent-muted flex items-center justify-center flex-shrink-0">
                <Mic className="w-4 h-4 text-accent-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary mb-1">Voice Catalog</p>
                <p className="text-xs text-text-secondary">
                  Manage stock voices, toggle availability, and configure voice settings
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent-muted flex items-center justify-center flex-shrink-0">
                <Database className="w-4 h-4 text-accent-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary mb-1">Bulk Operations</p>
                <p className="text-xs text-text-secondary">
                  Import multiple movies or voices at once with batch processing
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-accent-muted flex items-center justify-center flex-shrink-0">
                <Settings className="w-4 h-4 text-accent-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-text-primary mb-1">Audit Logs</p>
                <p className="text-xs text-text-secondary">
                  All operations are logged for compliance and audit trail
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
