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
