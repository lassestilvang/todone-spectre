import { Task, TaskStatus } from "../types/task";
import { taskService } from "./taskService";
import { isToday, isFutureDate } from "../utils/dateUtils";

/**
 * Inbox Service - Handles business logic for the Inbox view
 */
export class InboxService {
  private static instance: InboxService;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance of InboxService
   */
  public static getInstance(): InboxService {
    if (!InboxService.instance) {
      InboxService.instance = new InboxService();
    }
    return InboxService.instance;
  }

  /**
   * Get tasks for the inbox view
   * Shows all active (non-completed) tasks
   */
  async getInboxTasks(projectId?: string): Promise<Task[]> {
    try {
      const allTasks = await taskService.getTasks(projectId);

      // Filter for inbox: non-completed tasks only
      const inboxTasks = allTasks.filter((task) => !task.completed);

      // Sort by priority and due date
      return this.sortInboxTasks(inboxTasks);
    } catch (error) {
      console.error("Error fetching inbox tasks:", error);
      throw error;
    }
  }

  /**
   * Sort tasks for inbox view
   * Priority: Critical > High > Medium > Low
   * Then by due date (earlier first)
   */
  private sortInboxTasks(tasks: Task[]): Task[] {
    const priorityOrder: Record<string, number> = {
      critical: 1,
      high: 2,
      medium: 3,
      low: 4,
    };

    return [...tasks].sort((a, b) => {
      // First by priority
      const priorityCompare =
        (priorityOrder[a.priority] || 5) - (priorityOrder[b.priority] || 5);
      if (priorityCompare !== 0) return priorityCompare;

      // Then by due date (earlier dates first)
      const aDueDate = a.dueDate?.getTime() || Number.MAX_SAFE_INTEGER;
      const bDueDate = b.dueDate?.getTime() || Number.MAX_SAFE_INTEGER;
      return aDueDate - bDueDate;
    });
  }

  /**
   * Group tasks by status for inbox view
   */
  groupTasksByStatus(tasks: Task[]): Record<TaskStatus, Task[]> {
    const grouped: Record<TaskStatus, Task[]> = {
      todo: [],
      "in-progress": [],
      completed: [],
      archived: [],
    };

    tasks.forEach((task) => {
      grouped[task.status].push(task);
    });

    return grouped;
  }

  /**
   * Get inbox statistics
   */
  async getInboxStatistics(projectId?: string): Promise<{
    total: number;
    overdue: number;
    byStatus: Record<TaskStatus, number>;
    byPriority: Record<string, number>;
  }> {
    try {
      const tasks = await this.getInboxTasks(projectId);

      const statistics = {
        total: tasks.length,
        overdue: 0,
        byStatus: {
          todo: 0,
          "in-progress": 0,
          completed: 0,
          archived: 0,
        },
        byPriority: {
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
        },
      };

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      tasks.forEach((task) => {
        // Count by status
        statistics.byStatus[task.status]++;

        // Count by priority
        statistics.byPriority[task.priority]++;

        // Check for overdue tasks
        if (task.dueDate) {
          const dueDate = new Date(task.dueDate);
          dueDate.setHours(0, 0, 0, 0);
          if (dueDate < today && task.status !== "completed") {
            statistics.overdue++;
          }
        }
      });

      return statistics;
    } catch (error) {
      console.error("Error getting inbox statistics:", error);
      throw error;
    }
  }

  /**
   * Filter inbox tasks by status
   */
  filterByStatus(tasks: Task[], status: TaskStatus | "all" = "all"): Task[] {
    if (status === "all") {
      return tasks;
    }
    return tasks.filter((task) => task.status === status);
  }

  /**
   * Filter inbox tasks by priority
   */
  filterByPriority(tasks: Task[], priority: string | "all" = "all"): Task[] {
    if (priority === "all") {
      return tasks;
    }
    return tasks.filter((task) => task.priority === priority);
  }
}

// Singleton instance
export const inboxService = InboxService.getInstance();
