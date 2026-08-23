"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageLoadingSkeleton } from "@/components/ui/loading-skeleton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
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
  const { t, locale } = useI18n();
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
          toast.error(t("billing.loadError"), t("billing.loading"));
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
    alert(t("billing.updatePaymentAlert"));
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
      setCreditsError(err instanceof Error ? err.message : t("billing.creditsModal.failed"));
    } finally {
      setAddingCredits(false);
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === "chs" ? "zh-CN" : "en-US", {
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
            {t("billing.tabs.overview")}
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition-all duration-200 ${
              activeTab === "history"
                ? "bg-accent-primary text-white shadow-md"
                : "text-text-muted hover:text-text-primary hover:bg-surface-raised"
            }`}
          >
            {t("billing.tabs.history")}
          </button>
          <button
            onClick={() => setActiveTab("invoices")}
            className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition-all duration-200 ${
              activeTab === "invoices"
                ? "bg-accent-primary text-white shadow-md"
                : "text-text-muted hover:text-text-primary hover:bg-surface-raised"
            }`}
          >
            {t("billing.tabs.invoices")}
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
                    {t("billing.overview.currentBalance")}
                  </p>
                  <div className="flex items-baseline gap-3">
                    <Heading variant="metric" as="h2" className="text-text-primary">
                      {creditStatus.credits_remaining}
                    </Heading>
                    <span className="text-lg text-text-muted">{t("billing.overview.credits")}</span>
                  </div>
                  <p className="text-sm text-text-secondary mt-2">
                    {t("billing.overview.usedOfAllocation", {
                      used: creditStatus.credits_used,
                      allocation: creditStatus.monthly_allocation,
                    })}
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
                    {t("billing.overview.percentUsed")}
                  </span>
                  <span>
                    {t("billing.overview.resets")} {formatDate(creditStatus.cycle_end_date)}
                  </span>
                </div>
              </div>

              {/* Upgrade CTA */}
              <div className="flex items-center justify-between p-4 bg-surface-panel rounded-lg border border-border-default">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-accent-cyan" />
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      {t("billing.overview.upgradeSection")}
                    </p>
                    <p className="text-xs text-text-muted">
                      {t("billing.overview.upgradeDescription")}
                    </p>
                  </div>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<ArrowRight className="h-4 w-4" />}
                  onClick={() => router.push("/pricing")}
                >
                  {t("billing.overview.upgradePlan")}
                </Button>
              </div>

              {/* Success Message */}
              {creditsSuccess && (
                <div className="mt-4 rounded-lg border border-status-completed/30 bg-status-completed/10 px-4 py-3 text-sm text-status-completed flex items-start gap-2">
                  <Check className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <span>{t("billing.overview.successMessage")}</span>
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
                <Heading variant="subsection" as="h2" className="text-text-primary mb-1">
                  {t("billing.overview.creditDetails")}
                </Heading>
                <Text variant="body" className="text-text-muted">
                  {t("billing.overview.creditDetailsDescription")}
                </Text>
              </div>
              <Button
                variant="primary"
                onClick={() => setShowCreditsConfirm(true)}
                disabled={addingCredits}
                leftIcon={<Sparkles className="h-4 w-4" />}
              >
                {addingCredits ? t("billing.overview.adding") : t("billing.overview.gimmeCredits")}
              </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-3 mb-6">
              <div className="p-4 rounded-lg bg-surface-raised border border-border-default">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-accent-cyan/10">
                    <TrendingUp className="h-5 w-5 text-accent-cyan" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">
                      {t("billing.overview.monthlyAllocation")}
                    </p>
                    <Heading variant="metric" className="text-text-primary">
                      {creditStatus.monthly_allocation}
                    </Heading>
                  </div>
                </div>
                <p className="text-xs text-text-muted">
                  {t("billing.overview.monthlyAllocationDescription")}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-surface-raised border border-border-default">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-accent-cyan/10">
                    <Coins className="h-5 w-5 text-accent-cyan" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">{t("billing.overview.creditsUsed")}</p>
                    <Heading variant="metric" className="text-text-primary">
                      {creditStatus.credits_used}
                    </Heading>
                  </div>
                </div>
                <p className="text-xs text-text-muted">
                  {t("billing.overview.creditsUsedDescription")}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-surface-raised border border-border-default">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-accent-cyan/10">
                    <Clock className="h-5 w-5 text-accent-cyan" />
                  </div>
                  <div>
                    <p className="text-xs text-text-muted">{t("billing.overview.cycleReset")}</p>
                    <p className="text-sm font-semibold text-text-primary">
                      {formatDate(creditStatus.cycle_end_date)}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-text-muted">
                  {t("billing.overview.cycleResetDescription")}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-warning-bg/10 border border-warning-border">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-warning-text flex-shrink-0 mt-0.5" />
                <div>
                  <Heading variant="label" as="h4" className="text-warning-text mb-1">
                    {t("billing.overview.nextAllocationReset")}
                  </Heading>
                  <p className="text-sm text-text-muted">
                    {t("billing.overview.nextAllocationResetDescription")}{" "}
                    <span className="font-medium text-text-secondary">
                      {formatDate(creditStatus.cycle_end_date)}
                    </span>
                    . {t("billing.overview.rolloverUp")}{" "}
                    {creditStatus.max_rollover || t("billing.overview.unlimited")}{" "}
                    {t("billing.overview.credits")}.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Billing Information */}
          <Card variant="elevated" padding="lg">
            <div className="flex items-center justify-between mb-6">
              <div>
                <Heading variant="subsection" as="h2" className="text-text-primary mb-1">
                  {t("billing.overview.billing")}
                </Heading>
                <Text variant="body" className="text-text-muted">
                  {t("billing.overview.billingDescription")}
                </Text>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Settings className="h-4 w-4" />}
                  onClick={handleUpdatePayment}
                >
                  {t("billing.overview.update")}
                </Button>
                <Button variant="primary" size="sm" leftIcon={<CreditCard className="h-4 w-4" />}>
                  {t("billing.overview.billingPortal")}
                </Button>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-surface-raised border border-border-default">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <Heading variant="label" as="h3" className="text-text-primary">
                    {t("billing.overview.currentPlan")}
                  </Heading>
                  <p className="text-sm text-text-secondary capitalize">
                    {creditStatus.membership_tier}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={() => router.push("/pricing")}>
                  {t("billing.overview.changePlan")}
                </Button>
              </div>

              <div className="grid gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-text-muted">
                    {t("billing.overview.subscriptionStatus")}
                  </span>
                  <span className="font-medium text-status-success">
                    {t("billing.overview.active")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">{t("billing.overview.monthlyCost")}</span>
                  <span className="font-medium text-text-primary">
                    {creditStatus.membership_tier === "free" && "$0"}
                    {creditStatus.membership_tier === "pro" && "$49"}
                    {creditStatus.membership_tier === "premium" && "$199"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">{t("billing.overview.nextBillingDate")}</span>
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
            <Heading variant="subsection" as="h2" className="text-text-primary mb-1">
              {t("billing.history.creditTransactionHistory")}
            </Heading>
            <Text variant="body" className="text-text-muted">
              {t("billing.history.trackUsage")}
            </Text>
          </div>

          {transactions.length === 0 ? (
            <div className="py-12 text-center">
              <History className="h-12 w-12 text-text-muted mx-auto mb-4 opacity-50" />
              <p className="text-text-muted">{t("billing.history.noTransactions")}</p>
              <p className="text-xs text-text-muted mt-2">
                {t("billing.history.noTransactionsDescription")}
              </p>
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
                      <Heading variant="label" as="h4" className="text-text-primary capitalize">
                        {transaction.transaction_type}
                      </Heading>
                      <p className="text-xs text-text-muted">
                        {transaction.description || t("billing.history.creditTransaction")}
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
                      {formatAmount(transaction.amount)} {t("billing.overview.credits")}
                    </p>
                    <p className="text-xs text-text-muted">
                      {t("billing.history.balance")} {transaction.balance_after}
                    </p>
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
            <Heading variant="subsection" as="h2" className="text-text-primary mb-1">
              {t("billing.invoices.invoices")}
            </Heading>
            <Text variant="body" className="text-text-muted">
              {t("billing.invoices.viewDownload")}
            </Text>
          </div>

          <div className="py-12 text-center">
            <Receipt className="h-16 w-16 text-text-muted mx-auto mb-4 opacity-30" />
            <Heading variant="subsection" as="h3" className="text-text-primary mb-2">
              {t("billing.invoices.stripeComingSoon")}
            </Heading>
            <p className="text-text-muted max-w-md mx-auto mb-6">
              {t("billing.invoices.invoiceManagement")}
            </p>
            <div className="flex gap-3 justify-center">
              <Button variant="ghost" size="lg" leftIcon={<Download className="h-4 w-4" />}>
                {t("billing.invoices.downloadSample")}
              </Button>
              <Button variant="primary" size="lg" leftIcon={<CreditCard className="h-4 w-4" />}>
                {t("billing.invoices.viewStripePortal")}
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
            <Heading variant="subsection" as="h3" className="text-text-primary mb-2">
              {t("billing.help.needHelp")}
            </Heading>
            <p className="text-sm text-text-muted mb-3">{t("billing.help.haveQuestions")}</p>
            <div className="flex gap-3">
              <Button variant="ghost" size="sm">
                {t("billing.help.contactSupport")}
              </Button>
              <Button variant="ghost" size="sm">
                {t("billing.help.viewFaqs")}
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
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <Heading variant="section" as="h2" className="text-text-primary">
                  {t("billing.creditsModal.title")}
                </Heading>
                <Text variant="body" className="text-text-muted">
                  {t("billing.creditsModal.subtitle")}
                </Text>
              </div>
            </div>
            <p className="text-sm text-text-secondary mb-6">
              {t("billing.creditsModal.description")}
            </p>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={() => setShowCreditsConfirm(false)} fullWidth>
                {t("billing.creditsModal.cancel")}
              </Button>
              <Button
                variant="primary"
                onClick={handleGimmeCredits}
                disabled={addingCredits}
                fullWidth
                leftIcon={<Sparkles className="h-4 w-4" />}
              >
                {addingCredits
                  ? t("billing.overview.adding")
                  : t("billing.creditsModal.addCredits")}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
