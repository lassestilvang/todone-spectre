import { Task } from "../types/task";
import { ViewType } from "../types/enums";

/**
 * View Layout Utilities
 * Common utility functions for view layouts
 */
export class ViewLayoutUtils {
  /**
   * Get view type from string
   */
  static getViewTypeFromString(view: string): ViewType {
    const normalized = view.toLowerCase();
    if (normalized === "list") return ViewType.LIST;
    if (normalized === "board") return ViewType.BOARD;
    if (normalized === "calendar") return ViewType.CALENDAR;
    return ViewType.LIST; // default
  }

  /**
   * Get view type label
   */
  static getViewTypeLabel(viewType: ViewType): string {
    const labels: Record<ViewType, string> = {
      [ViewType.LIST]: "List",
      [ViewType.BOARD]: "Board",
      [ViewType.CALENDAR]: "Calendar",
      [ViewType.INBOX]: "Inbox",
      [ViewType.TODAY]: "Today",
      [ViewType.UPCOMING]: "Upcoming",
    };
    return labels[viewType] || "Unknown";
  }

  /**
   * Get available view types
   */
  static getAvailableViewTypes(): ViewType[] {
    return [ViewType.LIST, ViewType.BOARD, ViewType.CALENDAR];
  }

  /**
   * Transform task for display in any view
   */
  static transformTaskForDisplay(task: Task): Task {
    return {
      ...task,
      displayTitle: task.title || "Untitled Task",
      displayPriority: task.priority || "medium",
      displayStatus: task.status || "todo",
      displayDueDate: task.dueDate ? new Date(task.dueDate) : null,
    };
  }

  /**
   * Filter tasks by common criteria
   */
  static filterTasks(
    tasks: Task[],
    filters: {
      searchQuery?: string;
      projectId?: string;
      priority?: string;
      status?: string;
      completed?: boolean;
    },
  ): Task[] {
    return tasks.filter((task) => {
      // Search query filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const matchesTitle = task.title?.toLowerCase().includes(query);
        const matchesDescription = task.description
          ?.toLowerCase()
          .includes(query);
        if (!matchesTitle && !matchesDescription) return false;
      }

      // Project filter
      if (filters.projectId && task.projectId !== filters.projectId)
        return false;

      // Priority filter
      if (filters.priority && task.priority !== filters.priority) return false;

      // Status filter
      if (filters.status && task.status !== filters.status) return false;

      // Completed filter
      if (
        filters.completed !== undefined &&
        task.completed !== filters.completed
      )
        return false;

      return true;
    });
  }

  /**
   * Sort tasks by common criteria
   */
  static sortTasks(tasks: Task[], sortBy: string = "dueDate"): Task[] {
    return [...tasks].sort((a, b) => {
      if (sortBy === "dueDate") {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === "priority") {
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        return (
          (priorityOrder[a.priority || "medium"] || 3) -
          (priorityOrder[b.priority || "medium"] || 3)
        );
      }
      if (sortBy === "title") {
        return (a.title || "").localeCompare(b.title || "");
      }
      if (sortBy === "createdAt") {
        if (!a.createdAt) return 1;
        if (!b.createdAt) return -1;
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
      return 0;
    });
  }

  /**
   * Group tasks by common criteria
   */
  static groupTasks(
    tasks: Task[],
    groupBy: string = "project",
  ): Record<string, Task[]> {
    return tasks.reduce(
      (acc, task) => {
        let groupKey: string;

        if (groupBy === "project") {
          groupKey = task.projectId || "no-project";
        } else if (groupBy === "priority") {
          groupKey = task.priority || "medium";
        } else if (groupBy === "status") {
          groupKey = task.status || "todo";
        } else if (groupBy === "dueDate") {
          if (task.dueDate) {
            const dueDate = new Date(task.dueDate);
            groupKey = dueDate.toISOString().split("T")[0]; // YYYY-MM-DD
          } else {
            groupKey = "no-due-date";
          }
        } else {
          groupKey = "ungrouped";
        }

        if (!acc[groupKey]) {
          acc[groupKey] = [];
        }
        acc[groupKey].push(task);

        return acc;
      },
      {} as Record<string, Task[]>,
    );
  }
}
