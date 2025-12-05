import React from "react";
import { EmptyState } from "./EmptyState";

interface EmptyStateTemplateProps {
  templateType: "tasks" | "projects" | "calendar" | "search" | "custom";
  customConfig?: {
    title?: string;
    description?: string;
    icon?: React.ReactNode;
    actions?: React.ReactNode;
  };
}

export const EmptyStateTemplate: React.FC<EmptyStateTemplateProps> = ({
  templateType,
  customConfig,
}) => {
  const getTemplateConfig = () => {
    switch (templateType) {
      case "tasks":
        return {
          title: "No tasks found",
          description:
            "Create your first task to get started with your productivity journey",
          icon: <span className="template-icon">📝</span>,
          actions: <button className="primary-action">Create Task</button>,
        };

      case "projects":
        return {
          title: "No projects yet",
          description:
            "Start organizing your work by creating your first project",
          icon: <span className="template-icon">🗂️</span>,
          actions: <button className="primary-action">Create Project</button>,
        };

      case "calendar":
        return {
          title: "Empty calendar",
          description:
            "Schedule your first event or task to populate your calendar",
          icon: <span className="template-icon">📅</span>,
          actions: <button className="primary-action">Add Event</button>,
        };

      case "search":
        return {
          title: "No results found",
          description:
            "Try adjusting your search criteria or create new content",
          icon: <span className="template-icon">🔍</span>,
          actions: <button className="primary-action">Search Again</button>,
        };

      case "custom":
        return {
          title: customConfig?.title || "Custom empty state",
          description:
            customConfig?.description || "This is a custom empty state",
          icon: customConfig?.icon,
          actions: customConfig?.actions,
        };

      default:
        return {
          title: "No content",
          description: "There is nothing to display here",
          icon: <span className="template-icon">🤷</span>,
        };
    }
  };

  const config = getTemplateConfig();

  return (
    <EmptyState
      title={config.title}
      description={config.description}
      icon={config.icon}
      actions={config.actions}
      className={`empty-state-template ${templateType}`}
    />
  );
};
