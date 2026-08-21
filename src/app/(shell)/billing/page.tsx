"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageLoadingSkeleton } from "@/components/ui/loading-skeleton";
import { PageHeader } from "@/components/ui/PageHeader";
import { useToast } from "@/components/ui/toast";
import {
  Clock,
  CreditCard,
  Download,
  History,
  Receipt,
  Settings,
  TrendingUp,
  Coins,
  ArrowRight,
  Sparkles,
  Check,
} from "lucide-react";
import {
  getCreditStatus,
  getCreditHistory,
  type CreditStatus,
  type CreditTransaction,
} from "@/lib/credit-client";
import { gimmeCredits } from "@/lib/api-client";

export default function BillingPage() {
  const router = useRouter();
  const { t } = useI18n();
  const [creditStatus, setCreditStatus] = React.useState<CreditStatus | null>(null);
  const [transactions, setTransactions] = React.useState<CreditTransaction[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<"overview" | "history" | "invoices">("overview");
  const [addingCredits, setAddingCredits] = React.useState(false);
  const [creditsSuccess, setCreditsSuccess] = React.useState(false);
  const [creditsError, setCreditsError] = React.useState("");
  const [showCreditsConfirm, setShowCreditsConfirm] = React.useState(false);
  const toast = useToast();

  React.useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [status, history] = await Promise.all([getCreditStatus(), getCreditHistory(1, 10)]);
        if (isMounted) {
          setCreditStatus(status);
          setTransactions(history.transactions);
        }
      } catch (error) {
        console.error("Failed to load billing data:", error);
        if (isMounted) {
          toast.error("Failed to load billing data", t("billing.loading"));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [toast, t]);

  const handleUpdatePayment = () => {
    alert("Updating payment method... (Stripe integration will be implemented in Phase 5)");
  };

  async function handleGimmeCredits() {
    setAddingCredits(true);
    setCreditsSuccess(false);
    setCreditsError("");
    try {
      await gimmeCredits();
      // Refresh credit status to show updated credits
      const [status, history] = await Promise.all([getCreditStatus(), getCreditHistory(1, 10)]);
      setCreditStatus(status);
      setTransactions(history.transactions);
      setCreditsSuccess(true);
      setShowCreditsConfirm(false);
      // Clear success message after 3 seconds
      setTimeout(() => setCreditsSuccess(false), 3000);
    } catch (err: unknown) {
      setCreditsError(err instanceof Error ? err.message : "Failed to add credits");
    } finally {
      setAddingCredits(false);
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatAmount = (amount: number) => {
    return amount >= 0 ? `+${amount}` : `${amount}`;
  };

  const getTransactionColor = (amount: number) => {
    return amount > 0 ? "text-status-success" : "text-text-secondary";
  };

  if (isLoading) {
    return <PageLoadingSkeleton message={t("billing.loading")} />;
  }

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <PageHeader title={t("billing.title")} description={t("billing.description")} />

      {/* Tabs */}
      <div className="mb-8 overflow-x-auto">
        <div className="inline-flex items-center gap-1 rounded-xl bg-surface-panel p-1 shadow-sm border border-border-default min-w-min">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition-all duration-200 ${
              activeTab === "overview"
                ? "bg-accent-primary text-white shadow-md"
                : "text-text-muted hover:text-text-primary hover:bg-surface-raised"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition-all duration-200 ${
              activeTab === "history"
                ? "bg-accent-primary text-white shadow-md"
                : "text-text-muted hover:text-text-primary hover:bg-surface-raised"
            }`}
          >
            Credit History
          </button>
          <button
            onClick={() => setActiveTab("invoices")}
            className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition-all duration-200 ${
              activeTab === "invoices"
                ? "bg-accent-primary text-white shadow-md"
                : "text-text-muted hover:text-text-primary hover:bg-surface-raised"
            }`}
          >
            Invoices
          </button>
        </div>
      </div>

      {activeTab === "overview" && creditStatus && (
        <div className="space-y-6">
          {/* Prominent Credit Balance Card */}
          <Card variant="elevated" padding="none" className="overflow-hidden">
            <div className="bg-gradient-to-br from-accent-cyan/10 via-accent-purple/5 to-surface-raised p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-text-muted mb-2 uppercase tracking-wide font-medium">
                    Current Balance
                  </p>
                  <div className="flex items-baseline gap-3">
                    <h2 className="text-3xl font-bold text-text-primary">
                      {creditStatus.credits_remaining}
                    </h2>
                    <span className="text-lg text-text-muted">credits</span>
                  </div>
                  <p className="text-sm text-text-secondary mt-2">
                    {creditStatus.credits_used} of {creditStatus.monthly_allocation} used this month
                  </p>
                </div>
                <div className="p-4 rounded-full bg-accent-cyan/20 border-2 border-accent-cyan/30">
                  <Coins className="h-12 w-12 text-accent-cyan" />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="h-3 bg-surface-raised rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent-cyan to-accent-purple transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        (creditStatus.credits_used / creditStatus.monthly_allocation) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-text-muted">
                  <span>
                    {Math.round(
                      (creditStatus.credits_used / creditStatus.monthly_allocation) * 100
                    )}
                    % used
                  </span>
                  <span>Resets {formatDate(creditStatus.cycle_end_date)}</span>
                </div>
              </div>

              {/* Upgrade CTA */}
              <div className="flex items-center justify-between p-4 bg-surface-panel rounded-lg border border-border-default">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-accent-cyan" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">Need more credits?</p>
                    <p className="text-xs text-text-muted">
                      Upgrade to get up to 100 credits/month
                    </p>
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<ArrowRight className="h-4 w-4" />}
                  onClick={() => router.push("/pricing")}
                >
                  Upgrade Plan
                </Button>
              </div>

              {/* Success Message */}
              {creditsSuccess && (
                <div className="mt-4 rounded-lg border border-status-completed/30 bg-status-completed/10 px-4 py-3 text-sm text-status-completed flex items-start gap-2">
                  <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>5 credits added successfully! 🎉</span>
                </div>
              )}
              {creditsError && (
                <div className="mt-4 rounded-lg border border-status-failed/30 bg-status-failed/10 px-4 py-3 text-sm text-status-failed flex items-start gap-2">
                  <span>{creditsError}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Credit Status Details */}
          <Card variant="elevated" padding="lg">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-text-primary mb-1">Credit Details</h2>
                <p className="text-sm text-text-muted">Your current credit allocation and usage</p>
              </div>
              <Button
                variant="primary"
                onClick={() => setShowCreditsConfirm(true)}
                disabled={addingCredits}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                {addingCredits ? "Adding..." : "Gimme Credits"}
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3 mb-6">
              <div className="p-4 rounded-lg bg-surface-raised border border-border-default">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-accent-cyan/10">
                    <TrendingUp className="h-5 w-5 text-accent-cyan" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Monthly Allocation</p>
                    <p className="text-2xl font-bold text-text-primary">
                      {creditStatus.monthly_allocation}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-text-muted">Credits allocated per month</p>
              </div>

              <div className="p-4 rounded-lg bg-surface-raised border border-border-default">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-accent-cyan/10">
                    <Coins className="h-5 w-5 text-accent-cyan" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Credits Used</p>
                    <p className="text-2xl font-bold text-text-primary">
                      {creditStatus.credits_used}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-text-muted">Used this billing cycle</p>
              </div>

              <div className="p-4 rounded-lg bg-surface-raised border border-border-default">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-accent-cyan/10">
                    <Clock className="h-5 w-5 text-accent-cyan" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">Cycle Reset</p>
                    <p className="text-sm font-semibold text-text-primary">
                      {formatDate(creditStatus.cycle_end_date)}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-text-muted">Next allocation reset date</p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-warning-bg/10 border border-warning-border">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-warning-text flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-warning-text mb-1">Next Credit Reset</h4>
                  <p className="text-sm text-text-muted">
                    Your credits will reset on{" "}
                    <span className="font-medium text-text-secondary">
                      {formatDate(creditStatus.cycle_end_date)}
                    </span>
                    . Unused credits will roll over up to {creditStatus.max_rollover || "unlimited"}{" "}
                    credits.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Billing Information */}
          <Card variant="elevated" padding="lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-text-primary mb-1">Billing</h2>
                <p className="text-sm text-text-muted">
                  Manage your payment method and subscription
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Settings className="h-4 w-4" />}
                  onClick={handleUpdatePayment}
                >
                  Update
                </Button>
                <Button variant="primary" size="sm" leftIcon={<CreditCard className="h-4 w-4" />}>
                  Billing Portal
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-surface-raised border border-border-default">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-medium text-text-primary">Current Plan</h3>
                  <p className="text-sm text-text-secondary capitalize">
                    {creditStatus.membership_tier}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => router.push("/pricing")}>
                  Change Plan
                </Button>
              </div>

              <div className="grid gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">Subscription Status</span>
                  <span className="font-medium text-status-success">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Monthly Cost</span>
                  <span className="font-medium text-text-primary">
                    {creditStatus.membership_tier === "free" && "$0"}
                    {creditStatus.membership_tier === "pro" && "$49"}
                    {creditStatus.membership_tier === "premium" && "$199"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">Next Billing Date</span>
                  <span className="font-medium text-text-primary">
                    {formatDate(creditStatus.cycle_end_date)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === "history" && (
        <Card variant="elevated" padding="lg">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-text-primary mb-1">
              Credit Transaction History
            </h2>
            <p className="text-sm text-text-muted">Track your credit usage and allocations</p>
          </div>

          {transactions.length === 0 ? (
            <div className="py-12 text-center">
              <History className="h-12 w-12 text-text-muted mx-auto mb-4 opacity-50" />
              <p className="text-text-muted">No credit transactions yet</p>
              <p className="text-xs text-text-muted mt-2">Your credit usage will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-surface-raised border border-border-default hover:bg-surface-hover transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${getTransactionColor(transaction.amount)}/10`}>
                      {transaction.transaction_type === "usage" ? (
                        <Coins className="h-5 w-5 text-status-failed" />
                      ) : (
                        <TrendingUp className="h-5 w-5 text-status-success" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-text-primary capitalize">
                        {transaction.transaction_type}
                      </h4>
                      <p className="text-xs text-text-muted">
                        {transaction.description || "Credit transaction"}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5">
                        {formatDate(transaction.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-semibold ${getTransactionColor(transaction.amount)}`}
                    >
                      {formatAmount(transaction.amount)} credits
                    </p>
                    <p className="text-xs text-text-muted">Balance: {transaction.balance_after}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {activeTab === "invoices" && (
        <Card variant="elevated" padding="lg">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-text-primary mb-1">Invoices</h2>
            <p className="text-sm text-text-muted">View and download your billing invoices</p>
          </div>

          <div className="py-12 text-center">
            <Receipt className="h-16 w-16 text-text-muted mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-medium text-text-primary mb-2">
              Stripe Integration Coming Soon
            </h3>
            <p className="text-text-muted max-w-md mx-auto mb-6">
              Invoice management and payment processing will be available in Phase 5 with Stripe
              integration.
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="ghost" size="lg" leftIcon={<Download className="h-4 w-4" />}>
                Download Sample Invoice
              </Button>
              <Button variant="primary" size="lg" leftIcon={<CreditCard className="h-4 w-4" />}>
                View Stripe Portal
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Help Section */}
      <Card variant="elevated" padding="md" className="mt-6">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-lg bg-accent-cyan/10">
            <Coins className="h-5 w-5 text-accent-cyan" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-text-primary mb-2">Need Help with Billing?</h3>
            <p className="text-sm text-text-muted mb-3">
              Have questions about your credits, subscription, or billing? We&apos;re here to help.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" size="sm">
                Contact Support
              </Button>
              <Button variant="ghost" size="sm">
                View FAQs
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Credits Confirmation Modal */}
      {showCreditsConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card
            variant="elevated"
            padding="lg"
            className="max-w-sm w-full animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-cyan to-accent-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-text-primary">Add Bonus Credits?</h2>
                <p className="text-sm text-text-muted">Get 5 bonus credits now</p>
              </div>
            </div>
            <p className="text-sm text-text-secondary mb-6">
              You're about to add 5 bonus credits to your account. This is a one-time offer for
              testing and development purposes.
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setShowCreditsConfirm(false)} fullWidth>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleGimmeCredits}
                disabled={addingCredits}
                fullWidth
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                {addingCredits ? "Adding..." : "Add Credits"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
