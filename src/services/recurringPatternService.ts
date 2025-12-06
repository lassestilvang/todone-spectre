// @ts-nocheck
import {
  RecurringPattern,
  TaskRepeatFrequency,
  TaskRepeatEnd,
} from "../types/enums";
import {
  addDays,
  addWeeks,
  addMonths,
  addYears,
  isBefore,
  isAfter,
  isEqual,
  parseISO,
  format,
  getDay,
  setDay,
} from "date-fns";

/**
 * Interface for recurring pattern configuration
 */
interface RecurringPatternConfig {
  pattern: RecurringPattern;
  frequency?: TaskRepeatFrequency;
  endCondition?: TaskRepeatEnd;
  endDate?: Date | null;
  maxOccurrences?: number | null;
  interval?: number;
  customDays?: number[]; // For custom weekly patterns (0=Sunday, 1=Monday, etc.)
  customMonthDays?: number[]; // For custom monthly patterns
  customMonthPosition?: "first" | "second" | "third" | "fourth" | "last"; // For patterns like "first Monday"
  customMonthDay?:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";
}

/**
 * Interface for generated recurring instance
 */
interface RecurringInstance {
  id: string;
  date: Date;
  isGenerated: boolean;
  originalDate: Date;
  occurrenceNumber: number;
}

/**
 * Recurring Pattern Service - Handles all recurring pattern management and generation logic
 */
export class RecurringPatternService {
  private static instance: RecurringPatternService;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance of RecurringPatternService
   */
  public static getInstance(): RecurringPatternService {
    if (!RecurringPatternService.instance) {
      RecurringPatternService.instance = new RecurringPatternService();
    }
    return RecurringPatternService.instance;
  }

  /**
   * Generate recurring dates based on pattern configuration
   */
  generateRecurringDates(
    startDate: Date,
    config: RecurringPatternConfig,
    maxInstances: number = 20,
  ): RecurringInstance[] {
    const instances: RecurringInstance[] = [];
    let currentDate = new Date(startDate);
    let occurrenceNumber = 1;

    // Add the original instance
    instances.push({
      id: "original",
      date: new Date(currentDate),
      isGenerated: false,
      originalDate: new Date(currentDate),
      occurrenceNumber: 0,
    });

    while (instances.length <= maxInstances) {
      const nextDate = this.getNextDate(currentDate, config);

      // Check end conditions
      if (this.shouldStopGenerating(nextDate, config, instances.length)) {
        break;
      }

      instances.push({
        id: `instance-${occurrenceNumber}`,
        date: nextDate,
        isGenerated: true,
        originalDate: new Date(startDate),
        occurrenceNumber,
      });

      currentDate = nextDate;
      occurrenceNumber++;
    }

    return instances;
  }

  /**
   * Get the next date based on recurring pattern
   */
  private getNextDate(currentDate: Date, config: RecurringPatternConfig): Date {
    switch (config.pattern) {
      case "daily":
        return this.getNextDailyDate(currentDate, config);
      case "weekly":
        return this.getNextWeeklyDate(currentDate, config);
      case "monthly":
        return this.getNextMonthlyDate(currentDate, config);
      case "yearly":
        return this.getNextYearlyDate(currentDate, config);
      case "custom":
        return this.getNextCustomDate(currentDate, config);
      default:
        return addWeeks(currentDate, config.interval || 1);
    }
  }

  /**
   * Get next date for daily pattern
   */
  private getNextDailyDate(
    currentDate: Date,
    config: RecurringPatternConfig,
  ): Date {
    const interval = config.interval || 1;
    return addDays(currentDate, interval);
  }

  /**
   * Get next date for weekly pattern
   */
  private getNextWeeklyDate(
    currentDate: Date,
    config: RecurringPatternConfig,
  ): Date {
    const interval = config.interval || 1;

    if (config.customDays && config.customDays.length > 0) {
      // Custom weekly pattern (specific days of week)
      const currentDay = getDay(currentDate);
      let daysToAdd = 0;

      // Find the next day in customDays that comes after current day
      const sortedDays = [...config.customDays].sort((a, b) => a - b);
      const nextDayIndex = sortedDays.findIndex((day) => day > currentDay);

      if (nextDayIndex >= 0) {
        daysToAdd = sortedDays[nextDayIndex] - currentDay;
      } else {
        // Wrap around to next week
        daysToAdd = 7 - currentDay + sortedDays[0];
      }

      return addDays(currentDate, daysToAdd);
    } else {
      // Standard weekly pattern
      return addWeeks(currentDate, interval);
    }
  }

  /**
   * Get next date for monthly pattern
   */
  private getNextMonthlyDate(
    currentDate: Date,
    config: RecurringPatternConfig,
  ): Date {
    const interval = config.interval || 1;

    if (config.customMonthDays && config.customMonthDays.length > 0) {
      // Custom monthly pattern (specific days of month)
      const currentDay = currentDate.getDate();
      let monthsToAdd = 0;

      // Find the next day in customMonthDays that comes after current day
      const sortedDays = [...config.customMonthDays].sort((a, b) => a - b);
      const nextDayIndex = sortedDays.findIndex((day) => day > currentDay);

      if (nextDayIndex >= 0) {
        // Next occurrence is in the same month
        const nextDate = new Date(currentDate);
        nextDate.setDate(sortedDays[nextDayIndex]);
        return nextDate;
      } else {
        // Need to go to next month
        monthsToAdd = 1;
        const nextDate = addMonths(currentDate, monthsToAdd);
        nextDate.setDate(sortedDays[0]);
        return nextDate;
      }
    } else if (config.customMonthPosition && config.customMonthDay) {
      // Pattern like "first Monday of the month"
      return this.getNextPositionalMonthlyDate(currentDate, config);
    } else {
      // Standard monthly pattern
      return addMonths(currentDate, interval);
    }
  }

  /**
   * Get next date for positional monthly pattern (e.g., "first Monday")
   */
  private getNextPositionalMonthlyDate(
    currentDate: Date,
    config: RecurringPatternConfig,
  ): Date {
    const targetDay = this.getDayNumber(config.customMonthDay!);
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Find the target day in the current month
    let targetDate = new Date(currentYear, currentMonth, 1);

    // Find the first occurrence of the target day
    while (getDay(targetDate) !== targetDay) {
      targetDate = addDays(targetDate, 1);
    }

    // Adjust for position (first, second, third, fourth, last)
    let weekOffset = 0;
    switch (config.customMonthPosition) {
      case "second":
        weekOffset = 1;
        break;
      case "third":
        weekOffset = 2;
        break;
      case "fourth":
        weekOffset = 3;
        break;
      case "last":
        // For "last", find the last occurrence in the month
        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
        targetDate = lastDayOfMonth;
        while (
          getDay(targetDate) !== targetDay &&
          targetDate > lastDayOfMonth
        ) {
          targetDate = addDays(targetDate, -1);
        }
        return targetDate;
      default: // 'first'
        weekOffset = 0;
    }

    targetDate = addDays(targetDate, weekOffset * 7);

    // If the calculated date is before or equal to current date, move to next month
    if (isBefore(targetDate, currentDate) || isEqual(targetDate, currentDate)) {
      return addMonths(targetDate, 1);
    }

    return targetDate;
  }

  /**
   * Get next date for yearly pattern
   */
  private getNextYearlyDate(
    currentDate: Date,
    config: RecurringPatternConfig,
  ): Date {
    const interval = config.interval || 1;
    return addYears(currentDate, interval);
  }

  /**
   * Get next date for custom pattern
   */
  private getNextCustomDate(
    currentDate: Date,
    config: RecurringPatternConfig,
  ): Date {
    if (config.frequency) {
      switch (config.frequency) {
        case "daily":
          return addDays(currentDate, config.interval || 1);
        case "weekdays":
          // Skip weekends
          let nextDate = addDays(currentDate, 1);
          while (getDay(nextDate) === 0 || getDay(nextDate) === 6) {
            nextDate = addDays(nextDate, 1);
          }
          return nextDate;
        case "weekly":
          return addWeeks(currentDate, config.interval || 1);
        case "biweekly":
          return addWeeks(currentDate, 2);
        case "monthly":
          return addMonths(currentDate, config.interval || 1);
        case "quarterly":
          return addMonths(currentDate, 3);
        case "yearly":
          return addYears(currentDate, config.interval || 1);
        default:
          return addWeeks(currentDate, config.interval || 1);
      }
    }

    return addWeeks(currentDate, config.interval || 1);
  }

  /**
   * Check if we should stop generating more instances
   */
  private shouldStopGenerating(
    nextDate: Date,
    config: RecurringPatternConfig,
    currentCount: number,
  ): boolean {
    // Check max occurrences
    if (config.maxOccurrences && currentCount >= config.maxOccurrences) {
      return true;
    }

    // Check end date
    if (config.endDate && isAfter(nextDate, new Date(config.endDate))) {
      return true;
    }

    // Check if date is too far in the future (safety limit)
    const futureLimit = addYears(new Date(), 10); // 10 years limit
    if (isAfter(nextDate, futureLimit)) {
      return true;
    }

    return false;
  }

  /**
   * Convert day name to day number (0=Sunday, 1=Monday, etc.)
   */
  private getDayNumber(dayName: string): number {
    const days: Record<string, number> = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };
    return days[dayName.toLowerCase()] || 0;
  }

  /**
   * Get day name from day number
   */
  getDayName(dayNumber: number): string {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[dayNumber] || "Sunday";
  }

  /**
   * Format recurring pattern for display
   */
  formatRecurringPattern(config: RecurringPatternConfig): string {
    switch (config.pattern) {
      case "daily":
        if (config.interval === 1) return "Daily";
        return `Every ${config.interval} days`;
      case "weekly":
        if (config.interval === 1) return "Weekly";
        return `Every ${config.interval} weeks`;
      case "monthly":
        if (config.interval === 1) return "Monthly";
        return `Every ${config.interval} months`;
      case "yearly":
        if (config.interval === 1) return "Yearly";
        return `Every ${config.interval} years`;
      case "custom":
        return this.formatCustomPattern(config);
      default:
        return config.pattern;
    }
  }

  /**
   * Format custom recurring pattern
   */
  private formatCustomPattern(config: RecurringPatternConfig): string {
    if (!config.frequency) return "Custom pattern";

    switch (config.frequency) {
      case "daily":
        return config.interval === 1
          ? "Daily"
          : `Every ${config.interval} days`;
      case "weekdays":
        return "Weekdays (Mon-Fri)";
      case "weekly":
        if (config.customDays) {
          const dayNames = config.customDays.map((day) =>
            this.getDayName(day).substring(0, 3),
          );
          return `Weekly on ${dayNames.join(", ")}`;
        }
        return config.interval === 1
          ? "Weekly"
          : `Every ${config.interval} weeks`;
      case "biweekly":
        return "Bi-weekly";
      case "monthly":
        if (config.customMonthDays) {
          const days = config.customMonthDays.join(", ");
          return `Monthly on day ${days}`;
        }
        if (config.customMonthPosition && config.customMonthDay) {
          return `Monthly on the ${config.customMonthPosition} ${config.customMonthDay}`;
        }
        return config.interval === 1
          ? "Monthly"
          : `Every ${config.interval} months`;
      case "quarterly":
        return "Quarterly";
      case "yearly":
        return config.interval === 1
          ? "Yearly"
          : `Every ${config.interval} years`;
      default:
        return "Custom pattern";
    }
  }

  /**
   * Get end condition description
   */
  getEndConditionDescription(config: RecurringPatternConfig): string {
    if (!config.endCondition || config.endCondition === "never") {
      return "Never ends";
    }

    if (config.endCondition === "on_date" && config.endDate) {
      return `Ends on ${format(new Date(config.endDate), "PPP")}`;
    }

    if (config.endCondition === "after_occurrences" && config.maxOccurrences) {
      return `Ends after ${config.maxOccurrences} occurrences`;
    }

    return "Custom end condition";
  }

  /**
   * Validate recurring pattern configuration
   */
  validatePatternConfig(config: RecurringPatternConfig): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!config.pattern) {
      errors.push("Pattern is required");
    }

    if (config.interval && config.interval < 1) {
      errors.push("Interval must be at least 1");
    }

    if (config.maxOccurrences && config.maxOccurrences < 1) {
      errors.push("Maximum occurrences must be at least 1");
    }

    if (config.endDate && isBefore(new Date(config.endDate), new Date())) {
      errors.push("End date cannot be in the past");
    }

    if (
      config.customDays &&
      config.customDays.some((day) => day < 0 || day > 6)
    ) {
      errors.push("Custom days must be between 0 (Sunday) and 6 (Saturday)");
    }

    if (
      config.customMonthDays &&
      config.customMonthDays.some((day) => day < 1 || day > 31)
    ) {
      errors.push("Custom month days must be between 1 and 31");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get default pattern configuration for a given pattern type
   */
  getDefaultPatternConfig(pattern: RecurringPattern): RecurringPatternConfig {
    switch (pattern) {
      case "daily":
        return {
          pattern: "daily",
          frequency: "daily",
          endCondition: "never",
          interval: 1,
        };
      case "weekly":
        return {
          pattern: "weekly",
          frequency: "weekly",
          endCondition: "never",
          interval: 1,
        };
      case "monthly":
        return {
          pattern: "monthly",
          frequency: "monthly",
          endCondition: "never",
          interval: 1,
        };
      case "yearly":
        return {
          pattern: "yearly",
          frequency: "yearly",
          endCondition: "never",
          interval: 1,
        };
      case "custom":
        return {
          pattern: "custom",
          frequency: "weekly",
          endCondition: "never",
          interval: 1,
        };
      default:
        return {
          pattern: "weekly",
          frequency: "weekly",
          endCondition: "never",
          interval: 1,
        };
    }
  }

  /**
   * Parse pattern configuration from task custom fields
   */
  parsePatternConfigFromTask(
    taskCustomFields: Record<string, any>,
  ): RecurringPatternConfig {
    return {
      pattern: taskCustomFields.recurringPattern || "weekly",
      frequency: taskCustomFields.recurringFrequency || "weekly",
      endCondition: taskCustomFields.recurringEndCondition || "never",
      endDate: taskCustomFields.recurringEndDate
        ? new Date(taskCustomFields.recurringEndDate)
        : null,
      maxOccurrences: taskCustomFields.recurringMaxOccurrences || null,
      interval: taskCustomFields.recurringInterval || 1,
      customDays: taskCustomFields.recurringCustomDays || null,
      customMonthDays: taskCustomFields.recurringCustomMonthDays || null,
      customMonthPosition:
        taskCustomFields.recurringCustomMonthPosition || null,
      customMonthDay: taskCustomFields.recurringCustomMonthDay || null,
    };
  }

  /**
   * Convert pattern config to task custom fields format
   */
  convertConfigToCustomFields(
    config: RecurringPatternConfig,
  ): Record<string, any> {
    return {
      recurringPattern: config.pattern,
      recurringFrequency: config.frequency,
      recurringEndCondition: config.endCondition,
      recurringEndDate: config.endDate?.toISOString(),
      recurringMaxOccurrences: config.maxOccurrences,
      recurringInterval: config.interval,
      recurringCustomDays: config.customDays,
      recurringCustomMonthDays: config.customMonthDays,
      recurringCustomMonthPosition: config.customMonthPosition,
      recurringCustomMonthDay: config.customMonthDay,
    };
  }

  /**
   * Get all available pattern presets
   */
  getPatternPresets(): Array<{
    id: string;
    name: string;
    config: RecurringPatternConfig;
  }> {
    return [
      {
        id: "daily",
        name: "Daily",
        config: this.getDefaultPatternConfig("daily"),
      },
      {
        id: "weekdays",
        name: "Weekdays (Mon-Fri)",
        config: {
          pattern: "custom",
          frequency: "weekdays",
          endCondition: "never",
          interval: 1,
        },
      },
      {
        id: "weekly",
        name: "Weekly",
        config: this.getDefaultPatternConfig("weekly"),
      },
      {
        id: "biweekly",
        name: "Bi-weekly",
        config: {
          pattern: "custom",
          frequency: "biweekly",
          endCondition: "never",
          interval: 2,
        },
      },
      {
        id: "monthly",
        name: "Monthly",
        config: this.getDefaultPatternConfig("monthly"),
      },
      {
        id: "quarterly",
        name: "Quarterly",
        config: {
          pattern: "custom",
          frequency: "quarterly",
          endCondition: "never",
          interval: 3,
        },
      },
      {
        id: "yearly",
        name: "Yearly",
        config: this.getDefaultPatternConfig("yearly"),
      },
    ];
  }
}

// Singleton instance
export const recurringPatternService = RecurringPatternService.getInstance();
