import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { EmptyState } from "../EmptyState";
import { OnboardingFlow } from "../OnboardingFlow";
import { EmptyStateTemplate } from "../EmptyStateTemplate";
import { OnboardingStep } from "../OnboardingStep";
import { EmptyStateWithCustomization } from "../EmptyStateWithCustomization";
import {
  generateMockEmptyStateConfig,
  generateMockOnboardingSteps,
} from "./emptyStateTestUtils";
import { useEmptyState } from "../../../hooks/useEmptyState";
import { useOnboarding } from "../../../hooks/useOnboarding";

// Mock hooks
jest.mock("../../../hooks/useEmptyState");
jest.mock("../../../hooks/useOnboarding");

describe("EmptyState Components", () => {
  describe("EmptyState", () => {
    it("should render with default props", () => {
      render(<EmptyState />);

      expect(screen.getByText("No content available")).toBeInTheDocument();
      expect(
        screen.getByText("There is nothing to display here yet"),
      ).toBeInTheDocument();
    });

    it("should render with custom props", () => {
      render(
        <EmptyState
          title="Custom Title"
          description="Custom Description"
          icon={<span>🎉</span>}
        />,
      );

      expect(screen.getByText("Custom Title")).toBeInTheDocument();
      expect(screen.getByText("Custom Description")).toBeInTheDocument();
      expect(screen.getByText("🎉")).toBeInTheDocument();
    });
  });

  describe("EmptyStateTemplate", () => {
    it("should render tasks template", () => {
      render(<EmptyStateTemplate templateType="tasks" />);

      expect(screen.getByText("No tasks found")).toBeInTheDocument();
      expect(
        screen.getByText(
          "Create your first task to get started with your productivity journey",
        ),
      ).toBeInTheDocument();
    });

    it("should render custom template", () => {
      render(
        <EmptyStateTemplate
          templateType="custom"
          customConfig={{
            title: "Custom Template",
            description: "This is a custom template",
          }}
        />,
      );

      expect(screen.getByText("Custom Template")).toBeInTheDocument();
      expect(screen.getByText("This is a custom template")).toBeInTheDocument();
    });
  });

  describe("EmptyStateWithCustomization", () => {
    const mockUseEmptyState = useEmptyState as jest.Mock;

    beforeEach(() => {
      mockUseEmptyState.mockReturnValue({
        emptyStateConfig: generateMockEmptyStateConfig(),
        isVisible: true,
        updateEmptyState: jest.fn(),
        setVisibility: jest.fn(),
        registerEmptyState: jest.fn(),
        emptyStateService: jest.fn(),
      });
    });

    it("should render with customization", () => {
      render(
        <EmptyStateWithCustomization
          emptyStateKey="test-key"
          customConfig={{
            title: "Customized Title",
            description: "Customized Description",
          }}
        />,
      );

      expect(screen.getByText("Customized Title")).toBeInTheDocument();
      expect(screen.getByText("Customized Description")).toBeInTheDocument();
    });
  });

  describe("OnboardingFlow", () => {
    const mockSteps = generateMockOnboardingSteps(3);
    const mockUseOnboarding = useOnboarding as jest.Mock;

    beforeEach(() => {
      mockUseOnboarding.mockReturnValue({
        currentStep: 0,
        goToNextStep: jest.fn(),
        goToPreviousStep: jest.fn(),
        completeOnboarding: jest.fn(),
        onboardingService: jest.fn(),
      });
    });

    it("should render first step", () => {
      render(<OnboardingFlow steps={mockSteps} />);

      expect(screen.getByText(mockSteps[0].title)).toBeInTheDocument();
      expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
    });

    it("should show navigation buttons", () => {
      render(<OnboardingFlow steps={mockSteps} />);

      expect(screen.getByText("Next")).toBeInTheDocument();
      expect(screen.queryByText("Back")).not.toBeInTheDocument();
    });
  });

  describe("OnboardingStep", () => {
    it("should render step with navigation", () => {
      render(
        <OnboardingStep
          title="Test Step"
          description="Test Description"
          stepNumber={1}
          totalSteps={3}
        />,
      );

      expect(screen.getByText("Test Step")).toBeInTheDocument();
      expect(screen.getByText("Test Description")).toBeInTheDocument();
      expect(screen.getByText("Step 1 of 3")).toBeInTheDocument();
    });
  });
});

describe("Empty State Integration Tests", () => {
  it("should handle empty state visibility changes", () => {
    const mockSetVisibility = jest.fn();
    const mockUseEmptyState = useEmptyState as jest.Mock;

    mockUseEmptyState.mockReturnValue({
      emptyStateConfig: generateMockEmptyStateConfig({ show: true }),
      isVisible: true,
      updateEmptyState: jest.fn(),
      setVisibility: mockSetVisibility,
      registerEmptyState: jest.fn(),
      emptyStateService: jest.fn(),
    });

    const { rerender } = render(
      <EmptyStateWithCustomization emptyStateKey="test-key" />,
    );

    // Change visibility
    mockUseEmptyState.mockReturnValue({
      ...mockUseEmptyState(),
      isVisible: false,
    });

    rerender(<EmptyStateWithCustomization emptyStateKey="test-key" />);

    expect(mockSetVisibility).toHaveBeenCalled();
  });
});
