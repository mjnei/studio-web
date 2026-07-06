"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Zap, Crown, Coins, TrendingUp } from "lucide-react";
import { useState } from "react";

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

const pricingTiers: PricingTier[] = [
  {
    name: "Free",
    icon: Coins,
    description: "Get started with basic video generation",
    monthlyPrice: "$0",
    annualPrice: "$0",
    features: [
      "5 credits per month",
      "Rollover up to 10 credits",
      "Basic video generation",
      "720p video quality",
      "Standard project storage",
    ],
    credits: 5,
    rollover: "10 credits",
    color: "blue",
  },
  {
    name: "Pro",
    icon: Zap,
    description: "For creators who need more capacity",
    monthlyPrice: "$49/mo",
    annualPrice: "$39/mo",
    features: [
      "25 credits per month",
      "Rollover up to 50 credits",
      "HD video generation (1080p)",
      "Priority processing",
      "Advanced analytics",
      "Export customization",
    ],
    credits: 25,
    rollover: "50 credits",
    highlight: true,
    color: "cyan",
  },
  {
    name: "Premium",
    icon: Crown,
    description: "Unlimited capacity for professionals",
    monthlyPrice: "$199/mo",
    annualPrice: "$159/mo",
    features: [
      "100 credits per month",
      "Unlimited rollover",
      "4K video quality",
      "Priority support",
      "Advanced AI features",
      "Team collaboration",
      "White-label exports",
      "API access",
    ],
    credits: 100,
    rollover: "Unlimited",
    color: "purple",
  },
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

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
    alert(`Subscribing to ${tier} tier... (Integration with Stripe will be implemented in Phase 5)`);
  };

  return (
    <div className="py-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <h1 className="text-3xl font-bold text-text-primary mb-4">Simple, Transparent Pricing</h1>
        <p className="text-lg text-text-muted mb-6">
          1 credit = 1 video generation. Choose the plan that fits your needs.
        </p>

        {/* Billing Toggle */}
        <div className="inline-flex items-center gap-4 p-1.5 rounded-lg bg-surface-raised border border-border-default">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === "monthly"
                ? "bg-surface-panel text-text-primary shadow-sm"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("annual")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingCycle === "annual"
                ? "bg-surface-panel text-text-primary shadow-sm"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            Annual (Save 20%)
          </button>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto">
        {pricingTiers.map((tier) => {
          const Icon = tier.icon;
          const currentPrice =
            billingCycle === "annual" ? tier.annualPrice : tier.monthlyPrice;
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
                  <div className="bg-accent-cyan text-white text-xs font-bold px-4 py-1.5 rounded-full inline-flex items-center gap-1.5 shadow-lg">
                    <Sparkles className="h-3 w-3" />
                    Most Popular
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
                    <h2 className="text-xl font-bold text-text-primary">{tier.name}</h2>
                    <p className="text-sm text-text-muted">{tier.description}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-text-primary">{currentPrice}</span>
                    {isAnnual && tier.name !== "Free" && (
                      <span className="text-sm text-text-muted">billed annually</span>
                    )}
                  </div>
                  {isAnnual && tier.name !== "Free" && (
                    <p className="text-sm text-text-muted line-through">
                      {tier.monthlyPrice} when billed monthly
                    </p>
                  )}
                </div>

                {/* Credits */}
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className={`h-5 w-5 ${getColorClasses(tier.color)}`} />
                  <span className={`text-sm font-semibold ${getColorClasses(tier.color)}`}>
                    {tier.credits} credits/month
                  </span>
                  <span className="text-xs text-text-muted">• Rollover: {tier.rollover}</span>
                </div>
              </div>

              {/* Features */}
              <div className="flex-1 mb-8">
                <h3 className="text-sm font-semibold text-text-secondary mb-3 uppercase tracking-wide">
                  What&apos;s included
                </h3>
                <ul className="space-y-2.5">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className={`h-4 w-4 mt-0.5 ${getColorClasses(tier.color)}`} />
                      <span className="text-sm text-text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <Button
                variant={getButtonVariant(tier.color)}
                size="lg"
                onClick={() => handleSubscribe(tier.name)}
                className="w-full"
                disabled={tier.name === "Free"}
              >
                {tier.name === "Free" ? "Current Plan" : "Upgrade to " + tier.name}
              </Button>
            </div>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto mt-16">
        <h2 className="text-2xl font-bold text-text-primary text-center mb-8">
          Frequently Asked Questions
        </h2>
        <div className="space-y-6">
          <Card variant="elevated" padding="md">
            <h3 className="font-medium text-text-primary mb-2">
              What is a credit and how is it used?
            </h3>
            <p className="text-sm text-text-secondary">
              A credit is used to generate one video. Each video generation consumes 1 credit,
              regardless of video length or complexity. Failed generations are automatically
              refunded.
            </p>
          </Card>

          <Card variant="elevated" padding="md">
            <h3 className="font-medium text-text-primary mb-2">How does credit rollover work?</h3>
            <p className="text-sm text-text-secondary">
              Unused credits roll over to the next month, up to the maximum rollover limit for
              your tier (Free: 10, Pro: 50, Premium: unlimited). Credits expire after 6 months of
              inactivity.
            </p>
          </Card>

          <Card variant="elevated" padding="md">
            <h3 className="font-medium text-text-primary mb-2">Can I change or cancel my plan?</h3>
            <p className="text-sm text-text-secondary">
              Yes, you can upgrade, downgrade, or cancel your plan at any time. When downgrading,
              you keep access to your current plan features until the end of your billing cycle.
            </p>
          </Card>

          <Card variant="elevated" padding="md">
            <h3 className="font-medium text-text-primary mb-2">Do you offer team plans?</h3>
            <p className="text-sm text-text-secondary">
              Team plans with shared credits and collaborative features are available for
              Premium tier subscribers. Contact us for custom pricing.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
