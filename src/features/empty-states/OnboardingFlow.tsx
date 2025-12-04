import React, { useState } from 'react';
import { useOnboarding } from '../../../hooks/useOnboarding';

interface OnboardingFlowProps {
  steps: React.ReactNode[];
  onComplete?: () => void;
  className?: string;
}

export const OnboardingFlow: React.FC<OnboardingFlowProps> = ({
  steps,
  onComplete,
  className = ''
}) => {
  const { currentStep, goToNextStep, goToPreviousStep, completeOnboarding } = useOnboarding();
  const [isComplete, setIsComplete] = useState(false);

  const handleComplete = () => {
    if (onComplete) onComplete();
    completeOnboarding();
    setIsComplete(true);
  };

  if (isComplete) {
    return null;
  }

  return (
    <div className={`onboarding-flow ${className}`}>
      <div className="onboarding-progress">
        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
        <span className="progress-text">
          Step {currentStep + 1} of {steps.length}
        </span>
      </div>

      <div className="onboarding-step-container">
        {steps[currentStep]}
      </div>

      <div className="onboarding-navigation">
        {currentStep > 0 && (
          <button
            onClick={goToPreviousStep}
            className="nav-button previous"
          >
            Back
          </button>
        )}

        {currentStep < steps.length - 1 ? (
          <button
            onClick={goToNextStep}
            className="nav-button next"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleComplete}
            className="nav-button complete"
          >
            Finish
          </button>
        )}
      </div>
    </div>
  );
};