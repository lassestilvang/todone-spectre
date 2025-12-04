import { Task } from '../types/task';
import { ViewType } from '../types/enums';
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

/**
 * Calendar View Service
 * Handles data transformation and business logic for calendar view
 */
export class CalendarViewService {
  /**
   * Transform tasks for calendar view display
   */
  static transformTasksForCalendarView(tasks: Task[]): Task[] {
    return tasks.map(task => ({
      ...task,
      // Add any calendar-specific transformations
      displayTitle: task.title || 'Untitled Task',
      displayDate: task.dueDate ? new Date(task.dueDate) : null,
      // Ensure due date exists for calendar view
      dueDate: task.dueDate || new Date().toISOString()
    }));
  }

  /**
   * Group tasks by date for calendar view
   */
  static groupTasksByDate(tasks: Task[]): Record<string, Task[]> {
    return tasks.reduce((acc, task) => {
      if (task.dueDate) {
        const dateKey = format(new Date(task.dueDate), 'yyyy-MM-dd');
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(task);
      }
      return acc;
    }, {} as Record<string, Task[]>);
  }

  /**
   * Get tasks for specific date range
   */
  static getTasksForDateRange(tasks: Task[], startDate: Date, endDate: Date): Task[] {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate >= startDate && taskDate <= endDate;
    });
  }

  /**
   * Get tasks for today
   */
  static getTasksForToday(tasks: Task[]): Task[] {
    const today = new Date();
    const startOfToday = startOfDay(today);
    const endOfToday = endOfDay(today);
    return this.getTasksForDateRange(tasks, startOfToday, endOfToday);
  }

  /**
   * Get tasks for current week
   */
  static getTasksForCurrentWeek(tasks: Task[]): Task[] {
    const today = new Date();
    const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 }); // Monday
    const endOfCurrentWeek = endOfWeek(today, { weekStartsOn: 1 }); // Sunday
    return this.getTasksForDateRange(tasks, startOfCurrentWeek, endOfCurrentWeek);
  }

  /**
   * Get tasks for current month
   */
  static getTasksForCurrentMonth(tasks: Task[]): Task[] {
    const today = new Date();
    const startOfCurrentMonth = startOfMonth(today);
    const endOfCurrentMonth = endOfMonth(today);
    return this.getTasksForDateRange(tasks, startOfCurrentMonth, endOfCurrentMonth);
  }

  /**
   * Get calendar view configuration
   */
  static getCalendarViewConfig(): { viewMode: string, showWeekends: boolean } {
    return {
      viewMode: 'week',
      showWeekends: true
    };
  }

  /**
   * Filter tasks for calendar view
   */
  static filterTasks(tasks: Task[], filters: Partial<Task>): Task[] {
    return tasks.filter(task => {
      if (filters.projectId && task.projectId !== filters.projectId) return false;
      if (filters.priority && task.priority !== filters.priority) return false;
      if (filters.completed !== undefined && task.completed !== filters.completed) return false;
      return true;
    });
  }

  /**
   * Get date range for navigation
   */
  static getDateRangeForNavigation(currentDate: Date, viewMode: string = 'week'): { start: Date, end: Date } {
    if (viewMode === 'day') {
      return {
        start: startOfDay(currentDate),
        end: endOfDay(currentDate)
      };
    }
    if (viewMode === 'week') {
      return {
        start: startOfWeek(currentDate, { weekStartsOn: 1 }),
        end: endOfWeek(currentDate, { weekStartsOn: 1 })
      };
    }
    // default to month
    return {
      start: startOfMonth(currentDate),
      end: endOfMonth(currentDate)
    };
  }
}