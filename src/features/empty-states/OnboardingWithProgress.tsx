import React from "react";
import { useOnboarding } from "../../../hooks/useOnboarding";
import { OnboardingStepConfig } from "../../../types/onboardingTypes";

interface OnboardingWithProgressProps {
  steps: OnboardingStepConfig[];
  onComplete?: () => void;
  showStepNumbers?: boolean;
  className?: string;
}

export const OnboardingWithProgress: React.FC<OnboardingWithProgressProps> = ({
  steps,
  onComplete,
  showStepNumbers = true,
  className = "",
}) => {
  const {
    currentStep,
    progress,
    goToNextStep,
    goToPreviousStep,
    completeOnboarding,
    isCompleted,
  } = useOnboarding();

  const currentStepConfig = steps[currentStep];

  if (isCompleted || !currentStepConfig) {
    return null;
  }

  return (
    <div className={`onboarding-with-progress ${className}`}>
      <div className="onboarding-header">
        {showStepNumbers && (
          <div className="step-indicator">
            Step {currentStep + 1} of {steps.length}
          </div>
        )}

        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="progress-percentage">{Math.round(progress)}%</span>
        </div>
      </div>

      <div className="onboarding-content">
        <h3 className="step-title">{currentStepConfig.title}</h3>
        <p className="step-description">{currentStepConfig.description}</p>
        <div className="step-content">{currentStepConfig.content}</div>
      </div>

      <div className="onboarding-navigation">
        {currentStep > 0 && (
          <button onClick={goToPreviousStep} className="nav-button back">
            ← Back
          </button>
        )}

        {currentStep < steps.length - 1 ? (
          <button onClick={goToNextStep} className="nav-button next">
            Next →
          </button>
        ) : (
          <button
            onClick={() => {
              completeOnboarding();
              if (onComplete) onComplete();
            }}
            className="nav-button complete"
          >
            Finish
          </button>
        )}
      </div>

      <style jsx>{`
        .onboarding-with-progress {
          max-width: 600px;
          margin: 0 auto;
          padding: 2rem;
          background: var(--background-secondary);
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .onboarding-header {
          margin-bottom: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .step-indicator {
          font-size: 0.875rem;
          color: var(--text-secondary);
          font-weight: 500;
        }

        .progress-container {
          width: 100%;
        }

        .progress-bar {
          height: 6px;
          background: var(--border-color);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 0.25rem;
        }

        .progress-fill {
          height: 100%;
          background: var(--primary-color);
          border-radius: 3px;
          transition: width 0.3s ease;
        }

        .progress-percentage {
          font-size: 0.75rem;
          color: var(--text-secondary);
          text-align: right;
          display: block;
        }

        .onboarding-content {
          margin: 1.5rem 0;
        }

        .step-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: var(--text-primary);
        }

        .step-description {
          font-size: 0.95rem;
          color: var(--text-secondary);
          margin-bottom: 1rem;
        }

        .step-content {
          margin: 1rem 0;
          padding: 1rem;
          background: var(--background-tertiary);
          border-radius: 6px;
        }

        .onboarding-navigation {
          display: flex;
          justify-content: space-between;
          margin-top: 1.5rem;
        }

        .nav-button {
          padding: 0.5rem 1rem;
          border-radius: 4px;
          border: none;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .nav-button.back {
          background: var(--background-tertiary);
          color: var(--text-primary);
        }

        .nav-button.next {
          background: var(--primary-color);
          color: white;
        }

        .nav-button.complete {
          background: var(--success-color);
          color: white;
        }

        .nav-button:hover {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
};
