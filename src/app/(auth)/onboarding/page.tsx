"use client";

import { useState } from "react";
import OnboardingLayout from "@/components/onboarding/OnboardingLayout";
import WelcomeStep from "@/components/onboarding/WelcomeStep";
import WorkflowStep from "@/components/onboarding/WorkflowStep";
import PasswordStep from "@/components/onboarding/PasswordStep";
import CompletionStep from "@/components/onboarding/CompletionStep";

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    <WelcomeStep key="welcome" onNext={() => setCurrentStep(1)} />,
    <WorkflowStep
      key="workflow"
      onNext={() => setCurrentStep(2)}
      onBack={() => setCurrentStep(0)}
    />,
    <PasswordStep
      key="password"
      onNext={() => setCurrentStep(3)}
      onSkip={() => setCurrentStep(3)}
      onBack={() => setCurrentStep(1)}
    />,
    <CompletionStep key="completion" />,
  ];

  return (
    <OnboardingLayout currentStep={currentStep} totalSteps={steps.length}>
      {steps[currentStep]}
    </OnboardingLayout>
  );
}
