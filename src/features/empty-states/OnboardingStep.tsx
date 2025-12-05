import React from "react";

interface OnboardingStepProps {
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

export const OnboardingStep: React.FC<OnboardingStepProps> = ({
  title,
  description,
  children,
  stepNumber,
  totalSteps,
  onNext,
  onBack,
  onSkip,
  className = "",
}) => {
  return (
    <div className={`onboarding-step ${className}`}>
      <div className="step-header">
        <h3 className="step-title">{title}</h3>
        <p className="step-description">{description}</p>
        <div className="step-progress">
          Step {stepNumber} of {totalSteps}
        </div>
      </div>

      <div className="step-content">{children}</div>

      <div className="step-navigation">
        {onBack && (
          <button onClick={onBack} className="nav-button back">
            Back
          </button>
        )}

        {onSkip && (
          <button onClick={onSkip} className="nav-button skip">
            Skip
          </button>
        )}

        {onNext && (
          <button onClick={onNext} className="nav-button next">
            {stepNumber === totalSteps ? "Finish" : "Next"}
          </button>
        )}
      </div>
    </div>
  );
};
