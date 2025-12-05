import {
  OnboardingStepConfig,
  OnboardingState,
} from "../types/onboardingTypes";

class OnboardingService {
  private static instance: OnboardingService;
  private onboardingState: OnboardingState = {
    currentStep: 0,
    completed: false,
    steps: [],
    progress: 0,
  };

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): OnboardingService {
    if (!OnboardingService.instance) {
      OnboardingService.instance = new OnboardingService();
    }
    return OnboardingService.instance;
  }

  /**
   * Initialize onboarding with steps
   * @param steps Array of onboarding step configurations
   */
  public initializeOnboarding(steps: OnboardingStepConfig[]): void {
    this.onboardingState = {
      currentStep: 0,
      completed: false,
      steps,
      progress: 0,
    };
  }

  /**
   * Get current onboarding state
   * @returns Current onboarding state
   */
  public getOnboardingState(): OnboardingState {
    return { ...this.onboardingState };
  }

  /**
   * Go to next step in onboarding
   */
  public goToNextStep(): void {
    if (
      this.onboardingState.currentStep <
      this.onboardingState.steps.length - 1
    ) {
      this.onboardingState.currentStep += 1;
      this.updateProgress();
    }
  }

  /**
   * Go to previous step in onboarding
   */
  public goToPreviousStep(): void {
    if (this.onboardingState.currentStep > 0) {
      this.onboardingState.currentStep -= 1;
      this.updateProgress();
    }
  }

  /**
   * Go to specific step
   * @param stepIndex Index of step to navigate to
   */
  public goToStep(stepIndex: number): void {
    if (stepIndex >= 0 && stepIndex < this.onboardingState.steps.length) {
      this.onboardingState.currentStep = stepIndex;
      this.updateProgress();
    }
  }

  /**
   * Complete onboarding flow
   */
  public completeOnboarding(): void {
    this.onboardingState.completed = true;
    this.onboardingState.progress = 100;
  }

  /**
   * Reset onboarding to initial state
   */
  public resetOnboarding(): void {
    this.onboardingState = {
      currentStep: 0,
      completed: false,
      steps: [],
      progress: 0,
    };
  }

  /**
   * Update progress based on current step
   */
  private updateProgress(): void {
    if (this.onboardingState.steps.length > 0) {
      this.onboardingState.progress =
        (this.onboardingState.currentStep /
          (this.onboardingState.steps.length - 1)) *
        100;
    }
  }

  /**
   * Check if onboarding is completed
   * @returns Boolean indicating if onboarding is completed
   */
  public isOnboardingCompleted(): boolean {
    return this.onboardingState.completed;
  }

  /**
   * Get current step configuration
   * @returns Current step configuration or null if no steps
   */
  public getCurrentStep(): OnboardingStepConfig | null {
    return this.onboardingState.steps[this.onboardingState.currentStep] || null;
  }

  /**
   * Get total number of steps
   * @returns Total number of steps
   */
  public getTotalSteps(): number {
    return this.onboardingState.steps.length;
  }
}

// Export singleton instance
export const onboardingService = OnboardingService.getInstance();
