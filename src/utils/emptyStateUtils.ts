import React from "react";
import {
  EmptyStateConfig,
  EmptyStateTemplateType,
} from "../types/emptyStateTypes";

/**
 * Generate default empty state configuration based on template type
 * @param templateType Type of empty state template
 * @returns Default empty state configuration
 */
export const generateDefaultEmptyStateConfig = (
  templateType: EmptyStateTemplateType["type"],
): EmptyStateConfig => {
  switch (templateType) {
    case "tasks":
      return {
        title: "No tasks found",
        description:
          "Create your first task to get started with your productivity journey",
        icon: null,
        actions: null,
        show: true,
      };

    case "projects":
      return {
        title: "No projects yet",
        description:
          "Start organizing your work by creating your first project",
        icon: null,
        actions: null,
        show: true,
      };

    case "calendar":
      return {
        title: "Empty calendar",
        description:
          "Schedule your first event or task to populate your calendar",
        icon: null,
        actions: null,
        show: true,
      };

    case "search":
      return {
        title: "No results found",
        description: "Try adjusting your search criteria or create new content",
        icon: null,
        actions: null,
        show: true,
      };

    case "custom":
    default:
      return {
        title: "No content available",
        description: "There is nothing to display here yet",
        icon: null,
        actions: null,
        show: true,
      };
  }
};

/**
 * Create empty state key from component name
 * @param componentName Name of the component
 * @returns Generated empty state key
 */
export const createEmptyStateKey = (componentName: string): string => {
  return `empty-state-${componentName.toLowerCase().replace(/\s+/g, "-")}`;
};

/**
 * Validate empty state configuration
 * @param config Empty state configuration to validate
 * @returns Boolean indicating if configuration is valid
 */
export const validateEmptyStateConfig = (config: EmptyStateConfig): boolean => {
  return (
    config &&
    typeof config.title === "string" &&
    typeof config.description === "string" &&
    typeof config.show === "boolean"
  );
};

/**
 * Merge multiple empty state configurations
 * @param baseConfig Base configuration
 * @param overrideConfig Configuration to override base
 * @returns Merged configuration
 */
export const mergeEmptyStateConfigs = (
  baseConfig: EmptyStateConfig,
  overrideConfig: Partial<EmptyStateConfig>,
): EmptyStateConfig => {
  return {
    ...baseConfig,
    ...overrideConfig,
    show:
      overrideConfig.show !== undefined ? overrideConfig.show : baseConfig.show,
  };
};

export const getEmptyStateIcon = (type: string): JSX.Element | null => {
  const iconMap: Record<string, string> = {
    tasks: "📝",
    projects: "🗂️",
    calendar: "📅",
    search: "🔍",
    default: "🤷",
  };

  return React.createElement(
    "span",
    { className: "empty-state-icon" },
    iconMap[type] || iconMap.default,
  );
};
