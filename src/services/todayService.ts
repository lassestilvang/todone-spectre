import { Task } from '../types/task';
import { taskService } from './taskService';
import { isToday } from '../utils/dateUtils';

/**
 * Today Service - Handles business logic for the Today view
 */
export class TodayService {
  private static instance: TodayService;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance of TodayService
   */
  public static getInstance(): TodayService {
    if (!TodayService.instance) {
      TodayService.instance = new TodayService();
    }
    return TodayService.instance;
  }

  /**
   * Get tasks for the today view
   * Shows tasks due today and overdue tasks
   */
  async getTodayTasks(projectId?: string): Promise<Task[]> {
    try {
      const allTasks = await taskService.getTasks(projectId);

      // Get today's date for comparison
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Filter for today: tasks due today or overdue
      const todayTasks = allTasks.filter(task => {
        if (!task.dueDate || task.completed) return false;

        const taskDueDate = new Date(task.dueDate);
        taskDueDate.setHours(0, 0, 0, 0);

        return taskDueDate <= today;
      });

      // Sort by priority and due date
      return this.sortTodayTasks(todayTasks);
    } catch (error) {
      console.error('Error fetching today tasks:', error);
      throw error;
    }
  }

  /**
   * Sort tasks for today view
   * Priority: Critical > High > Medium > Low
   * Then by due date (earlier first)
   */
  private sortTodayTasks(tasks: Task[]): Task[] {
    const priorityOrder: Record<string, number> = {
      'critical': 1,
      'high': 2,
      'medium': 3,
      'low': 4
    };

    return [...tasks].sort((a, b) => {
      // First by priority
      const priorityCompare = (priorityOrder[a.priority] || 5) - (priorityOrder[b.priority] || 5);
      if (priorityCompare !== 0) return priorityCompare;

      // Then by due date (earlier dates first)
      const aDueDate = a.dueDate?.getTime() || Number.MAX_SAFE_INTEGER;
      const bDueDate = b.dueDate?.getTime() || Number.MAX_SAFE_INTEGER;
      return aDueDate - bDueDate;
    });
  }

  /**
   * Separate tasks into overdue and due today
   */
  separateOverdueAndTodayTasks(tasks: Task[]): { overdue: Task[]; today: Task[] } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdue: Task[] = [];
    const todayTasks: Task[] = [];

    tasks.forEach(task => {
      if (task.dueDate) {
        const taskDueDate = new Date(task.dueDate);
        taskDueDate.setHours(0, 0, 0, 0);

        if (taskDueDate < today) {
          overdue.push(task);
        } else {
          todayTasks.push(task);
        }
      }
    });

    return { overdue, today: todayTasks };
  }

  /**
   * Get today statistics
   */
  async getTodayStatistics(projectId?: string): Promise<{
    total: number;
    overdue: number;
    dueToday: number;
    byPriority: Record<string, number>;
  }> {
    try {
      const tasks = await this.getTodayTasks(projectId);
      const { overdue, today } = this.separateOverdueAndTodayTasks(tasks);

      const statistics = {
        total: tasks.length,
        overdue: overdue.length,
        dueToday: today.length,
        byPriority: {
          'critical': 0,
          'high': 0,
          'medium': 0,
          'low': 0
        }
      };

      tasks.forEach(task => {
        statistics.byPriority[task.priority]++;
      });

      return statistics;
    } catch (error) {
      console.error('Error getting today statistics:', error);
      throw error;
    }
  }

  /**
   * Check if a task is overdue
   */
  isTaskOverdue(task: Task): boolean {
    if (!task.dueDate || task.completed) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);

    return dueDate < today;
  }

  /**
   * Get urgency score for a task (for sorting/prioritization)
   */
  getTaskUrgencyScore(task: Task): number {
    if (!task.dueDate) return 0;

    const today = new Date();
    const dueDate = new Date(task.dueDate);
    const timeDiff = dueDate.getTime() - today.getTime();
    const daysUntilDue = timeDiff / (1000 * 60 * 60 * 24);

    // Priority weights
    const priorityWeights: Record<string, number> = {
      'critical': 4,
      'high': 3,
      'medium': 2,
      'low': 1
    };

    // Calculate urgency score (higher = more urgent)
    const priorityWeight = priorityWeights[task.priority] || 1;
    const timeFactor = daysUntilDue > 0 ? 1 / (daysUntilDue + 1) : 2; // Overdue tasks get higher score

    return priorityWeight * timeFactor;
  }
}

// Singleton instance
export const todayService = TodayService.getInstance();