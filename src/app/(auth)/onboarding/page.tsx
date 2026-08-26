"use client";

import { useState } from "react";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import WelcomeStep from "@/components/onboarding/WelcomeStep";
import LanguageStep from "@/components/onboarding/LanguageStep";
import ThemeStep from "@/components/onboarding/ThemeStep";
import WorkflowStep from "@/components/onboarding/WorkflowStep";
import PasswordStep from "@/components/onboarding/PasswordStep";
import CompletionStep from "@/components/onboarding/CompletionStep";

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    <WelcomeStep key="welcome" onNext={() => setCurrentStep(1)} />,
    <LanguageStep
      key="language"
      onNext={() => setCurrentStep(2)}
      onBack={() => setCurrentStep(0)}
    />,
    <ThemeStep
      key="theme"
      onNext={() => setCurrentStep(3)}
      onBack={() => setCurrentStep(1)}
    />,
    <WorkflowStep
      key="workflow"
      onNext={() => setCurrentStep(4)}
      onBack={() => setCurrentStep(2)}
    />,
    <PasswordStep
      key="password"
      onNext={() => setCurrentStep(5)}
      onSkip={() => setCurrentStep(5)}
      onBack={() => setCurrentStep(3)}
    />,
    <CompletionStep key="completion" />,
  ];

  return (
    <OnboardingLayout currentStep={currentStep} totalSteps={steps.length}>
      {steps[currentStep]}
    </OnboardingLayout>
  );
}
