import React from "react";

export interface EmptyStateConfig {
  title: string;
  description: string;
  icon: React.ReactNode | null;
  actions: React.ReactNode | null;
  show: boolean;
  customClass?: string;
}

export interface EmptyStateDisplayOptions {
  showTitle?: boolean;
  showDescription?: boolean;
  showIcon?: boolean;
  showActions?: boolean;
}

export interface EmptyStateTemplateType {
  type: "tasks" | "projects" | "calendar" | "search" | "custom";
  config?: {
    title?: string;
    description?: string;
    icon?: React.ReactNode;
    actions?: React.ReactNode;
  };
}

export interface EmptyStateServiceInterface {
  registerEmptyState(key: string, config: EmptyStateConfig): void;
  getEmptyStateConfig(key: string): EmptyStateConfig;
  updateEmptyStateConfig(key: string, config: Partial<EmptyStateConfig>): void;
  removeEmptyStateConfig(key: string): void;
  shouldShowEmptyState(key: string): boolean;
  setEmptyStateVisibility(key: string, show: boolean): void;
  getAllEmptyStateConfigs(): Map<string, EmptyStateConfig>;
  resetAllEmptyStates(): void;
}
