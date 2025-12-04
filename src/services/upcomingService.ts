import { Task } from '../types/task';
import { taskService } from './taskService';
import { isFutureDate } from '../utils/dateUtils';

/**
 * Upcoming Service - Handles business logic for the Upcoming view
 */
export class UpcomingService {
  private static instance: UpcomingService;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance of UpcomingService
   */
  public static getInstance(): UpcomingService {
    if (!UpcomingService.instance) {
      UpcomingService.instance = new UpcomingService();
    }
    return UpcomingService.instance;
  }

  /**
   * Get tasks for the upcoming view
   * Shows future tasks (due after today, not completed)
   */
  async getUpcomingTasks(projectId?: string): Promise<Task[]> {
    try {
      const allTasks = await taskService.getTasks(projectId);

      // Get today's date for comparison
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Filter for upcoming: tasks due in the future, not completed
      const upcomingTasks = allTasks.filter(task => {
        if (!task.dueDate || task.completed) return false;

        const taskDueDate = new Date(task.dueDate);
        taskDueDate.setHours(0, 0, 0, 0);

        return taskDueDate > today;
      });

      // Sort by due date and then by priority
      return this.sortUpcomingTasks(upcomingTasks);
    } catch (error) {
      console.error('Error fetching upcoming tasks:', error);
      throw error;
    }
  }

  /**
   * Sort tasks for upcoming view
   * First by due date (earlier first)
   * Then by priority (critical > high > medium > low)
   */
  private sortUpcomingTasks(tasks: Task[]): Task[] {
    const priorityOrder: Record<string, number> = {
      'critical': 1,
      'high': 2,
      'medium': 3,
      'low': 4
    };

    return [...tasks].sort((a, b) => {
      // First by due date (earlier dates first)
      const aDueDate = a.dueDate?.getTime() || Number.MAX_SAFE_INTEGER;
      const bDueDate = b.dueDate?.getTime() || Number.MAX_SAFE_INTEGER;
      const dateCompare = aDueDate - bDueDate;

      if (dateCompare !== 0) return dateCompare;

      // Then by priority
      return (priorityOrder[a.priority] || 5) - (priorityOrder[b.priority] || 5);
    });
  }

  /**
   * Group tasks by time period for upcoming view
   */
  groupUpcomingTasks(tasks: Task[]): {
    nextWeek: Record<string, Task[]>;
    futureMonths: Record<string, Task[]>;
  } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const nextWeek: Record<string, Task[]> = {};
    const futureMonths: Record<string, Task[]> = {};

    const oneWeekLater = new Date(today);
    oneWeekLater.setDate(today.getDate() + 7);

    tasks.forEach(task => {
      if (task.dueDate) {
        const taskDueDate = new Date(task.dueDate);

        // Tasks due within the next week
        if (taskDueDate <= oneWeekLater) {
          const weekKey = `Week of ${taskDueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
          if (!nextWeek[weekKey]) {
            nextWeek[weekKey] = [];
          }
          nextWeek[weekKey].push(task);
        } else {
          // Tasks due in the future (grouped by month)
          const monthKey = taskDueDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          if (!futureMonths[monthKey]) {
            futureMonths[monthKey] = [];
          }
          futureMonths[monthKey].push(task);
        }
      }
    });

    return { nextWeek, futureMonths };
  }

  /**
   * Get upcoming statistics
   */
  async getUpcomingStatistics(projectId?: string): Promise<{
    total: number;
    nextWeekCount: number;
    futureCount: number;
    byPriority: Record<string, number>;
    timeDistribution: Record<string, number>;
  }> {
    try {
      const tasks = await this.getUpcomingTasks(projectId);
      const { nextWeek, futureMonths } = this.groupUpcomingTasks(tasks);

      // Calculate time distribution
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const timeDistribution: Record<string, number> = {
        '0-7 days': 0,
        '7-30 days': 0,
        '30+ days': 0
      };

      tasks.forEach(task => {
        if (task.dueDate) {
          const taskDueDate = new Date(task.dueDate);
          const daysUntilDue = Math.ceil((taskDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

          if (daysUntilDue <= 7) {
            timeDistribution['0-7 days']++;
          } else if (daysUntilDue <= 30) {
            timeDistribution['7-30 days']++;
          } else {
            timeDistribution['30+ days']++;
          }
        }
      });

      const statistics = {
        total: tasks.length,
        nextWeekCount: Object.values(nextWeek).reduce((sum, tasks) => sum + tasks.length, 0),
        futureCount: Object.values(futureMonths).reduce((sum, tasks) => sum + tasks.length, 0),
        byPriority: {
          'critical': 0,
          'high': 0,
          'medium': 0,
          'low': 0
        },
        timeDistribution
      };

      tasks.forEach(task => {
        statistics.byPriority[task.priority]++;
      });

      return statistics;
    } catch (error) {
      console.error('Error getting upcoming statistics:', error);
      throw error;
    }
  }

  /**
   * Filter upcoming tasks by time range
   */
  filterByTimeRange(tasks: Task[], range: 'next-week' | 'next-month' | 'next-3-months' | 'all' = 'all'): Task[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return tasks.filter(task => {
      if (!task.dueDate) return false;

      const taskDueDate = new Date(task.dueDate);
      const daysUntilDue = Math.ceil((taskDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      switch (range) {
        case 'next-week':
          return daysUntilDue <= 7;
        case 'next-month':
          return daysUntilDue <= 30;
        case 'next-3-months':
          return daysUntilDue <= 90;
        case 'all':
        default:
          return true;
      }
    });
  }

  /**
   * Get tasks due in specific date range
   */
  async getTasksInDateRange(
    startDate: Date,
    endDate: Date,
    projectId?: string
  ): Promise<Task[]> {
    try {
      const allTasks = await this.getUpcomingTasks(projectId);

      return allTasks.filter(task => {
        if (!task.dueDate) return false;

        const taskDueDate = new Date(task.dueDate);
        return taskDueDate >= startDate && taskDueDate <= endDate;
      });
    } catch (error) {
      console.error('Error getting tasks in date range:', error);
      throw error;
    }
  }
}

// Singleton instance
export const upcomingService = UpcomingService.getInstance();