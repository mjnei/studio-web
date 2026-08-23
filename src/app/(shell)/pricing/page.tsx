"use client";

import { useState } from "react";
import { useI18n } from "@/i18n";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/PageHeader";
import { Heading } from "@/components/ui/heading";
import { Text } from "@/components/ui/text";
import { Check, Sparkles, Zap, Crown, Coins, TrendingUp } from "lucide-react";

interface PricingTier {
  name: string;
  icon: React.ElementType;
  description: string;
  monthlyPrice: string;
  annualPrice: string;
  features: string[];
  credits: number;
  rollover: string;
  highlight?: boolean;
  color: "blue" | "cyan" | "purple";
}

interface BillingToggleProps {
  billingCycle: "monthly" | "annual";
  onBillingCycleChange: (cycle: "monthly" | "annual") => void;
  t: (key: string) => string;
}

function BillingToggle({ billingCycle, onBillingCycleChange, t }: BillingToggleProps) {
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-surface-raised border border-border-default shadow-sm">
      <button
        type="button"
        onClick={() => onBillingCycleChange("monthly")}
        className={`h-9 px-3.5 sm:px-4 rounded-lg text-body font-medium transition-all ${
          billingCycle === "monthly"
            ? "bg-accent-primary text-white shadow-glow"
            : "text-text-muted hover:text-text-primary"
        }`}
      >
        {t("pricing.billingToggle.monthly")}
      </button>
      <button
        type="button"
        onClick={() => onBillingCycleChange("annual")}
        className={`h-9 px-3.5 sm:px-4 rounded-lg text-body font-medium transition-all ${
          billingCycle === "annual"
            ? "bg-accent-primary text-white shadow-glow"
            : "text-text-muted hover:text-text-primary"
        }`}
      >
        <span>{t("pricing.billingToggle.annual")}</span>
        <span className="ml-2 text-caption opacity-75">{t("pricing.billingToggle.savings")}</span>
      </button>
    </div>
  );
}

export default function PricingPage() {
  const { t } = useI18n();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const pricingTiers: PricingTier[] = [
    {
      name: t("pricing.free.name"),
      icon: Coins,
      description: t("pricing.free.description"),
      monthlyPrice: t("pricing.free.price.monthly"),
      annualPrice: t("pricing.free.price.annual"),
      features: [
        t("pricing.free.features.credits"),
        t("pricing.free.features.rollover"),
        t("pricing.free.features.voices"),
        t("pricing.free.features.video"),
        t("pricing.free.features.quality"),
        t("pricing.free.features.storage"),
      ],
      credits: 5,
      rollover: t("pricing.free.rolloverAmount"),
      color: "blue",
    },
    {
      name: t("pricing.pro.name"),
      icon: Zap,
      description: t("pricing.pro.description"),
      monthlyPrice: t("pricing.pro.price.monthly"),
      annualPrice: t("pricing.pro.price.annual"),
      features: [
        t("pricing.pro.features.credits"),
        t("pricing.pro.features.rollover"),
        t("pricing.pro.features.voices"),
        t("pricing.pro.features.video"),
        t("pricing.pro.features.priority"),
        t("pricing.pro.features.analytics"),
        t("pricing.pro.features.export"),
      ],
      credits: 25,
      rollover: t("pricing.pro.rolloverAmount"),
      highlight: true,
      color: "cyan",
    },
    {
      name: t("pricing.premium.name"),
      icon: Crown,
      description: t("pricing.premium.description"),
      monthlyPrice: t("pricing.premium.price.monthly"),
      annualPrice: t("pricing.premium.price.annual"),
      features: [
        t("pricing.premium.features.credits"),
        t("pricing.premium.features.rollover"),
        t("pricing.premium.features.voices"),
        t("pricing.premium.features.quality"),
        t("pricing.premium.features.support"),
        t("pricing.premium.features.ai"),
        t("pricing.premium.features.team"),
        t("pricing.premium.features.whiteLabel"),
        t("pricing.premium.features.api"),
      ],
      credits: 100,
      rollover: t("pricing.premium.rolloverAmount"),
      color: "purple",
    },
  ];

  const getColorClasses = (color: PricingTier["color"]) => {
    switch (color) {
      case "blue":
        return "text-text-secondary";
      case "cyan":
        return "text-accent-cyan";
      case "purple":
        return "text-accent-purple";
      default:
        return "text-text-secondary";
    }
  };

  const getBgColorClasses = (color: PricingTier["color"]) => {
    switch (color) {
      case "blue":
        return "bg-surface-raised";
      case "cyan":
        return "bg-accent-cyan/5";
      case "purple":
        return "bg-accent-purple/5";
      default:
        return "bg-surface-raised";
    }
  };

  const getBorderColorClasses = (color: PricingTier["color"]) => {
    switch (color) {
      case "blue":
        return "border-border-default";
      case "cyan":
        return "border-accent-cyan/30";
      case "purple":
        return "border-accent-purple/30";
      default:
        return "border-border-default";
    }
  };

  const getButtonVariant = (color: PricingTier["color"]) => {
    switch (color) {
      case "blue":
        return "secondary" as const;
      case "cyan":
        return "primary" as const;
      case "purple":
        return "primary" as const;
      default:
        return "secondary" as const;
    }
  };

  const handleSubscribe = (tier: string) => {
    alert(t("pricing.subscribeComingSoon", { tier }));
  };

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader title={t("pricing.title")} description={t("pricing.description")} />

      {/* Pricing Header with Badge and Billing Toggle */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-muted text-accent-primary text-body font-medium mb-4">
          <Sparkles className="h-4 w-4" />
          {t("pricing.badge")}
        </div>
        <div className="flex justify-center">
          <BillingToggle billingCycle={billingCycle} onBillingCycleChange={setBillingCycle} t={t} />
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        {pricingTiers.map((tier) => {
          const Icon = tier.icon;
          const currentPrice = billingCycle === "annual" ? tier.annualPrice : tier.monthlyPrice;
          const isAnnual = billingCycle === "annual";

          return (
            <div
              key={tier.name}
              className={`relative rounded-xl ${getBgColorClasses(tier.color)} ${getBorderColorClasses(
                tier.color
              )} border-2 p-6 h-full flex flex-col transition-all duration-300 hover:scale-[1.02] ${
                tier.highlight ? "shadow-lg" : "shadow-sm"
              }`}
            >
              {tier.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <div className="bg-accent-cyan text-white text-caption font-bold px-4 py-1.5 rounded-full inline-flex items-center gap-1.5 shadow-lg">
                    <Sparkles className="h-3 w-3" />
                    {t("pricing.pro.badge")}
                  </div>
                </div>
              )}

              {/* Tier Header */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2.5 rounded-lg ${getBgColorClasses(tier.color)}`}>
                    <Icon className={`h-6 w-6 ${getColorClasses(tier.color)}`} />
                  </div>
                  <div>
                    <Heading variant="section" as="h2" className="text-text-primary">
                      {tier.name}
                    </Heading>
                    <Text variant="body" className="text-text-muted">
                      {tier.description}
                    </Text>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-2">
                  <div className="flex items-baseline gap-2">
                    <Heading variant="metric" as="span" className="text-text-primary">
                      {currentPrice}
                    </Heading>
                    {isAnnual && tier.name !== t("pricing.free.name") && (
                      <span className="text-body text-text-muted">
                        {t("pricing.free.price.billedAnnually")}
                      </span>
                    )}
                  </div>
                  {isAnnual && tier.name !== t("pricing.free.name") && (
                    <p className="text-body text-text-muted line-through">
                      {tier.monthlyPrice} {t("pricing.free.price.billedMonthly")}
                    </p>
                  )}
                </div>

                {/* Credits */}
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className={`h-5 w-5 ${getColorClasses(tier.color)}`} />
                  <span className={`text-body font-semibold ${getColorClasses(tier.color)}`}>
                    {tier.credits} {t("pricing.creditsPerMonth")}
                  </span>
                  <span className="text-caption text-text-muted">
                    • {t("pricing.rolloverLabel")} {tier.rollover}
                  </span>
                </div>
              </div>

              {/* Features */}
              <div className="flex-1 mb-8">
                <Heading
                  variant="label"
                  as="h3"
                  className="text-text-secondary mb-3 uppercase tracking-wide"
                >
                  {t("pricing.whatsIncluded")}
                </Heading>
                <ul className="space-y-2.5">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className={`h-4 w-4 mt-0.5 ${getColorClasses(tier.color)}`} />
                      <span className="text-body text-text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <Button
                variant={getButtonVariant(tier.color)}
                size="md"
                onClick={() => handleSubscribe(tier.name)}
                className="w-full"
                disabled={tier.name === t("pricing.free.name")}
              >
                {tier.name === t("pricing.free.name")
                  ? t("pricing.free.button")
                  : `${t(tier.name === t("pricing.pro.name") ? "pricing.pro.button" : "pricing.premium.button")}`}
              </Button>
            </div>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="mb-6">
        <Heading variant="section" as="h2" className="mb-6 text-center text-text-primary">
          {t("pricing.faq.title")}
        </Heading>
        <div className="mx-auto max-w-3xl space-y-4">
          <Card variant="elevated" padding="md">
            <Heading variant="label" as="h3" className="mb-2 text-text-primary">
              {t("pricing.faq.creditQuestion")}
            </Heading>
            <p className="text-body text-text-secondary">{t("pricing.faq.creditAnswer")}</p>
          </Card>

          <Card variant="elevated" padding="md">
            <Heading variant="label" as="h3" className="mb-2 text-text-primary">
              {t("pricing.faq.rolloverQuestion")}
            </Heading>
            <p className="text-body text-text-secondary">{t("pricing.faq.rolloverAnswer")}</p>
          </Card>

          <Card variant="elevated" padding="md">
            <Heading variant="label" as="h3" className="mb-2 text-text-primary">
              {t("pricing.faq.changeQuestion")}
            </Heading>
            <p className="text-body text-text-secondary">{t("pricing.faq.changeAnswer")}</p>
          </Card>

          <Card variant="elevated" padding="md">
            <Heading variant="label" as="h3" className="mb-2 text-text-primary">
              {t("pricing.faq.teamQuestion")}
            </Heading>
            <p className="text-body text-text-secondary">{t("pricing.faq.teamAnswer")}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
