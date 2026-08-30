"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Gift, RefreshCw } from "lucide-react";
import { Heading } from "@/components/ui/heading";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { useToast } from "@/components/ui/toast";
import {
  getAdminReferralOverview,
  type AdminReferralOverviewResponse,
} from "@/lib/api/referral-client";
import { ReferralAnalyticsCard } from "./components/ReferralAnalyticsCard";
import {
  ReferralDateFilter,
  buildReferralDateRange,
  type ReferralDateRange,
} from "./components/ReferralDateFilter";
import { ReferralFraudStatsPanel } from "./components/ReferralFraudStatsPanel";
import { ReferralLevelBreakdown } from "./components/ReferralLevelBreakdown";
import { ReferralProgramSummary } from "./components/ReferralProgramSummary";

export default function AdminReferralsPage() {
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [overview, setOverview] = useState<AdminReferralOverviewResponse | null>(null);
  const [dateRange, setDateRange] = useState<ReferralDateRange>(() => buildReferralDateRange("30d"));

  const loadData = useCallback(async () => {
    try {
      const data = await getAdminReferralOverview(dateRange);
      setOverview(data);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "An error occurred";
      toast.error("Failed to load referral data", message);
    } finally {
      setIsLoading(false);
    }
  }, [dateRange, toast]);

  useEffect(() => {
    let cancelled = false;

    getAdminReferralOverview(dateRange)
      .then((data) => {
        if (cancelled) return;
        setOverview(data);
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        const message = error instanceof Error ? error.message : "An error occurred";
        toast.error("Failed to load referral data", message);
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [dateRange, toast]);

  function handleRefresh() {
    setIsLoading(true);
    void loadData();
  }

  function handleDateSelect(next: ReferralDateRange) {
    setDateRange(next);
    setIsLoading(true);
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="mb-3 inline-flex items-center gap-1.5 text-body text-text-muted hover:text-text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-500">
              <Gift className="h-5 w-5 text-white" />
            </div>
            <div>
              <Heading variant="page" as="h1" className="text-text-primary">
                Referrals
              </Heading>
              <p className="text-body text-text-secondary">
                Monitor program health, signup mix, and fraud detection
              </p>
            </div>
          </div>
        </div>
        <Button
          type="button"
          variant="secondary"
          size="md"
          onClick={handleRefresh}
          leftIcon={<RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />}
        >
          Refresh
        </Button>
      </div>

      <ReferralDateFilter filters={dateRange} onSelect={handleDateSelect} />

      {isLoading && !overview ? (
        <LoadingSpinner />
      ) : overview ? (
        <>
          <ReferralAnalyticsCard analytics={overview.analytics} />
          <ReferralLevelBreakdown referralsByLevel={overview.analytics.referrals_by_level} />
          <ReferralFraudStatsPanel fraud={overview.fraud} />
          <ReferralProgramSummary program={overview.program} />
        </>
      ) : null}
    </div>
  );
}
