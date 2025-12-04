import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, addDays, subDays } from 'date-fns';

/**
 * Calendar Utilities
 * Date-related utility functions for calendar view
 */
export class CalendarUtils {
  /**
   * Get start and end of day
   */
  static getDayRange(date: Date): { start: Date, end: Date } {
    return {
      start: startOfDay(date),
      end: endOfDay(date)
    };
  }

  /**
   * Get start and end of week (Monday to Sunday)
   */
  static getWeekRange(date: Date): { start: Date, end: Date } {
    return {
      start: startOfWeek(date, { weekStartsOn: 1 }), // Monday
      end: endOfWeek(date, { weekStartsOn: 1 }) // Sunday
    };
  }

  /**
   * Get start and end of month
   */
  static getMonthRange(date: Date): { start: Date, end: Date } {
    return {
      start: startOfMonth(date),
      end: endOfMonth(date)
    };
  }

  /**
   * Get all days in a week
   */
  static getWeekDays(date: Date): Date[] {
    const { start, end } = this.getWeekRange(date);
    return eachDayOfInterval({ start, end });
  }

  /**
   * Get all days in a month
   */
  static getMonthDays(date: Date): Date[] {
    const { start, end } = this.getMonthRange(date);
    return eachDayOfInterval({ start, end });
  }

  /**
   * Format date for display
   */
  static formatDate(date: Date, formatStr: string = 'MMM d, yyyy'): string {
    return format(date, formatStr);
  }

  /**
   * Format date for calendar key (YYYY-MM-DD)
   */
  static formatDateKey(date: Date): string {
    return format(date, 'yyyy-MM-dd');
  }

  /**
   * Format day of week (e.g., "Mon", "Tue")
   */
  static formatDayOfWeek(date: Date): string {
    return format(date, 'EEE');
  }

  /**
   * Format day of month (e.g., "1", "2", "31")
   */
  static formatDayOfMonth(date: Date): string {
    return format(date, 'd');
  }

  /**
   * Format month and year (e.g., "January 2023")
   */
  static formatMonthYear(date: Date): string {
    return format(date, 'MMMM yyyy');
  }

  /**
   * Format week range (e.g., "Jan 1 - Jan 7, 2023")
   */
  static formatWeekRange(startDate: Date, endDate: Date): string {
    const startFormatted = format(startDate, 'MMM d');
    const endFormatted = format(endDate, 'MMM d, yyyy');
    return `${startFormatted} - ${endFormatted}`;
  }

  /**
   * Navigate to previous period
   */
  static navigatePrevious(currentDate: Date, viewMode: string = 'week'): Date {
    if (viewMode === 'day') {
      return subDays(currentDate, 1);
    } else if (viewMode === 'week') {
      return subDays(currentDate, 7);
    } else { // month
      return subDays(currentDate, 30); // Approximate month
    }
  }

  /**
   * Navigate to next period
   */
  static navigateNext(currentDate: Date, viewMode: string = 'week'): Date {
    if (viewMode === 'day') {
      return addDays(currentDate, 1);
    } else if (viewMode === 'week') {
      return addDays(currentDate, 7);
    } else { // month
      return addDays(currentDate, 30); // Approximate month
    }
  }

  /**
   * Check if two dates are on the same day
   */
  static isSameDay(date1: Date, date2: Date): boolean {
    return format(date1, 'yyyy-MM-dd') === format(date2, 'yyyy-MM-dd');
  }

  /**
   * Get date range for navigation
   */
  static getDateRangeForNavigation(currentDate: Date, viewMode: string = 'week'): { start: Date, end: Date } {
    if (viewMode === 'day') {
      return this.getDayRange(currentDate);
    } else if (viewMode === 'week') {
      return this.getWeekRange(currentDate);
    } else { // month
      return this.getMonthRange(currentDate);
    }
  }
}