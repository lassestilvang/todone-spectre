import React from 'react';

export interface OnboardingStepConfig {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
  skipable?: boolean;
  validation?: () => boolean;
}

export interface OnboardingState {
  currentStep: number;
  completed: boolean;
  steps: OnboardingStepConfig[];
  progress: number;
}

export interface OnboardingNavigation {
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  goToStep: (stepIndex: number) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

export interface OnboardingServiceInterface {
  initializeOnboarding(steps: OnboardingStepConfig[]): void;
  getOnboardingState(): OnboardingState;
  goToNextStep(): void;
  goToPreviousStep(): void;
  goToStep(stepIndex: number): void;
  completeOnboarding(): void;
  resetOnboarding(): void;
  isOnboardingCompleted(): boolean;
  getCurrentStep(): OnboardingStepConfig | null;
  getTotalSteps(): number;
}

export interface OnboardingFlowProps {
  steps: OnboardingStepConfig[];
  onComplete?: () => void;
  className?: string;
}

export interface OnboardingStepProps {
  title: string;
  description: string;
  children?: React.ReactNode;
  stepNumber: number;
  totalSteps: number;
  onNext?: () => void;
  onBack?: () => void;
  onSkip?: () => void;
  className?: string;
}