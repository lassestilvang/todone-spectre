import { useState, useEffect } from 'react';
import { onboardingService } from '../services/onboardingService';
import { OnboardingState, OnboardingStepConfig } from '../types/onboardingTypes';

export const useOnboarding = () => {
  const [onboardingState, setOnboardingState] = useState<OnboardingState>(
    onboardingService.getOnboardingState()
  );

  useEffect(() => {
    const handleStateChange = () => {
      setOnboardingState(onboardingService.getOnboardingState());
    };

    // Subscribe to state changes if needed
    // This would be implemented with an event emitter pattern in a real app

    return () => {
      // Cleanup subscription
    };
  }, []);

  const initializeOnboarding = (steps: OnboardingStepConfig[]) => {
    onboardingService.initializeOnboarding(steps);
    setOnboardingState(onboardingService.getOnboardingState());
  };

  const goToNextStep = () => {
    onboardingService.goToNextStep();
    setOnboardingState(onboardingService.getOnboardingState());
  };

  const goToPreviousStep = () => {
    onboardingService.goToPreviousStep();
    setOnboardingState(onboardingService.getOnboardingState());
  };

  const goToStep = (stepIndex: number) => {
    onboardingService.goToStep(stepIndex);
    setOnboardingState(onboardingService.getOnboardingState());
  };

  const completeOnboarding = () => {
    onboardingService.completeOnboarding();
    setOnboardingState(onboardingService.getOnboardingState());
  };

  const resetOnboarding = () => {
    onboardingService.resetOnboarding();
    setOnboardingState(onboardingService.getOnboardingState());
  };

  const isOnboardingCompleted = () => {
    return onboardingService.isOnboardingCompleted();
  };

  const getCurrentStep = () => {
    return onboardingService.getCurrentStep();
  };

  return {
    onboardingState,
    currentStep: onboardingState.currentStep,
    isCompleted: onboardingState.completed,
    progress: onboardingState.progress,
    totalSteps: onboardingState.steps.length,
    initializeOnboarding,
    goToNextStep,
    goToPreviousStep,
    goToStep,
    completeOnboarding,
    resetOnboarding,
    isOnboardingCompleted,
    getCurrentStep,
    onboardingService
  };
};