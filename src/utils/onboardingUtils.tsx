// @ts-nocheck
import { OnboardingStepConfig } from "../types/onboardingTypes";
import React from "react";

/**
 * Generate default onboarding steps for Todone application
 * @returns Array of default onboarding step configurations
 */
export const generateDefaultOnboardingSteps = (): OnboardingStepConfig[] => {
  return [
    {
      id: "welcome",
      title: "Welcome to Todone",
      description: "Let us show you around the application",
      content: React.createElement(
        "div",
        { className: "onboarding-content" },
        React.createElement(
          "p",
          null,
          "Welcome to Todone! This quick tour will help you get started with the application.",
        ),
        React.createElement(
          "p",
          null,
          "We'll show you the key features and how to use them effectively.",
        ),
      ),
      skipable: true,
    },
    {
      id: "tasks",
      title: "Task Management",
      description: "Learn how to create and manage tasks",
      content: React.createElement(
        "div",
        { className: "onboarding-content" },
        React.createElement(
          "p",
          null,
          'Create tasks by clicking the "Add Task" button.',
        ),
        React.createElement(
          "p",
          null,
          "Organize tasks using projects, labels, and due dates.",
        ),
        React.createElement(
          "p",
          null,
          "Use drag and drop to prioritize your work.",
        ),
      ),
      skipable: true,
    },
    {
      id: "projects",
      title: "Project Organization",
      description: "Organize your work with projects",
      content: React.createElement(
        "div",
        { className: "onboarding-content" },
        React.createElement(
          "p",
          null,
          "Create projects to group related tasks together.",
        ),
        React.createElement(
          "p",
          null,
          "Use project views to focus on specific areas of work.",
        ),
        React.createElement(
          "p",
          null,
          "Share projects with team members for collaboration.",
        ),
      ),
      skipable: true,
    },
    {
      id: "calendar",
      title: "Calendar Integration",
      description: "Schedule and plan your work",
      content: React.createElement(
        "div",
        { className: "onboarding-content" },
        React.createElement("p", null, "View your tasks in a calendar format."),
        React.createElement(
          "p",
          null,
          "Schedule tasks and events directly from the calendar.",
        ),
        React.createElement(
          "p",
          null,
          "Sync with external calendars for better planning.",
        ),
      ),
      skipable: true,
    },
    {
      id: "completion",
      title: "Get Started",
      description: "You are ready to use Todone",
      content: React.createElement(
        "div",
        { className: "onboarding-content" },
        React.createElement(
          "p",
          null,
          "That's it! You now know the basics of Todone.",
        ),
        React.createElement(
          "p",
          null,
          "Start by creating your first task or project.",
        ),
        React.createElement(
          "p",
          null,
          "Explore the application to discover more features.",
        ),
      ),
      skipable: false,
    },
  ];
};

/**
 * Create onboarding step ID
 * @param stepTitle Title of the onboarding step
 * @returns Generated step ID
 */
export const createOnboardingStepId = (stepTitle: string): string => {
  return `onboarding-step-${stepTitle.toLowerCase().replace(/\s+/g, "-")}`;
};

/**
 * Validate onboarding step configuration
 * @param step Onboarding step configuration to validate
 * @returns Boolean indicating if step is valid
 */
export const validateOnboardingStep = (step: OnboardingStepConfig): boolean => {
  return (
    step &&
    typeof step.id === "string" &&
    typeof step.title === "string" &&
    typeof step.description === "string" &&
    React.isValidElement(step.content)
  );
};

/**
 * Calculate onboarding progress percentage
 * @param currentStep Current step index
 * @param totalSteps Total number of steps
 * @returns Progress percentage (0-100)
 */
export const calculateOnboardingProgress = (
  currentStep: number,
  totalSteps: number,
): number => {
  if (totalSteps <= 0) return 0;
  return Math.round((currentStep / (totalSteps - 1)) * 100);
};

/**
 * Generate onboarding completion message
 * @param appName Name of the application
 * @returns Completion message
 */
export const generateOnboardingCompletionMessage = (
  appName: string = "Todone",
): string => {
  return `Congratulations! You've completed the onboarding for ${appName}. You're now ready to use all the features.`;
};

/**
 * Check if onboarding should be shown based on user preferences
 * @param userPreferences User preferences object
 * @param onboardingKey Key for onboarding preference
 * @returns Boolean indicating if onboarding should be shown
 */
export const shouldShowOnboarding = (
  userPreferences: any,
  onboardingKey: string = "showOnboarding",
): boolean => {
  return !userPreferences?.[onboardingKey];
};
