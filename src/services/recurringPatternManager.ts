/**
 * Recurring Pattern Manager Service
 * Advanced pattern management with validation, generation, and optimization
 */
import { RecurringPatternConfig, RecurringInstance } from "../types/task";
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
  getDay,
  setDay,
  format,
} from "date-fns";

/**
 * Advanced Recurring Pattern Manager
 */
export class RecurringPatternManager {
  private static instance: RecurringPatternManager;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): RecurringPatternManager {
    if (!RecurringPatternManager.instance) {
      RecurringPatternManager.instance = new RecurringPatternManager();
    }
    return RecurringPatternManager.instance;
  }

  /**
   * Generate recurring dates with advanced pattern handling
   */
  generateRecurringDatesAdvanced(
    startDate: Date,
    config: RecurringPatternConfig,
    maxInstances: number = 50,
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
      const nextDate = this.getNextDateAdvanced(currentDate, config);

      // Check end conditions
      if (
        this.shouldStopGeneratingAdvanced(nextDate, config, instances.length)
      ) {
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
   * Get next date with advanced pattern handling
   */
  private getNextDateAdvanced(
    currentDate: Date,
    config: RecurringPatternConfig,
  ): Date {
    switch (config.pattern) {
      case "daily":
        return this.getNextDailyDateAdvanced(currentDate, config);
      case "weekly":
        return this.getNextWeeklyDateAdvanced(currentDate, config);
      case "monthly":
        return this.getNextMonthlyDateAdvanced(currentDate, config);
      case "yearly":
        return this.getNextYearlyDateAdvanced(currentDate, config);
      case "custom":
        return this.getNextCustomDateAdvanced(currentDate, config);
      default:
        return addWeeks(currentDate, config.interval || 1);
    }
  }

  /**
   * Advanced daily date calculation
   */
  private getNextDailyDateAdvanced(
    currentDate: Date,
    config: RecurringPatternConfig,
  ): Date {
    const interval = config.interval || 1;

    // Handle weekdays-only pattern
    if (config.frequency === "weekdays") {
      let nextDate = addDays(currentDate, 1);
      while (getDay(nextDate) === 0 || getDay(nextDate) === 6) {
        nextDate = addDays(nextDate, 1);
      }
      return nextDate;
    }

    return addDays(currentDate, interval);
  }

  /**
   * Advanced weekly date calculation with custom day handling
   */
  private getNextWeeklyDateAdvanced(
    currentDate: Date,
    config: RecurringPatternConfig,
  ): Date {
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
    }

    // Handle bi-weekly pattern
    if (config.frequency === "biweekly") {
      return addWeeks(currentDate, 2);
    }

    return addWeeks(currentDate, config.interval || 1);
  }

  /**
   * Advanced monthly date calculation with complex patterns
   */
  private getNextMonthlyDateAdvanced(
    currentDate: Date,
    config: RecurringPatternConfig,
  ): Date {
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
    }

    if (config.customMonthPosition && config.customMonthDay) {
      // Pattern like "first Monday of the month"
      return this.getNextPositionalMonthlyDateAdvanced(currentDate, config);
    }

    // Handle quarterly pattern
    if (config.frequency === "quarterly") {
      return addMonths(currentDate, 3);
    }

    return addMonths(currentDate, config.interval || 1);
  }

  /**
   * Advanced positional monthly date calculation
   */
  private getNextPositionalMonthlyDateAdvanced(
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
    if (
      isBefore(targetDate, currentDate) ||
      targetDate.getTime() === currentDate.getTime()
    ) {
      return addMonths(targetDate, 1);
    }

    return targetDate;
  }

  /**
   * Advanced yearly date calculation
   */
  private getNextYearlyDateAdvanced(
    currentDate: Date,
    config: RecurringPatternConfig,
  ): Date {
    return addYears(currentDate, config.interval || 1);
  }

  /**
   * Advanced custom date calculation
   */
  private getNextCustomDateAdvanced(
    currentDate: Date,
    config: RecurringPatternConfig,
  ): Date {
    if (!config.frequency) {
      return addWeeks(currentDate, config.interval || 1);
    }

    switch (config.frequency) {
      case "daily":
        return this.getNextDailyDateAdvanced(currentDate, config);
      case "weekdays":
        return this.getNextDailyDateAdvanced(currentDate, {
          ...config,
          frequency: "weekdays",
        });
      case "weekly":
        return this.getNextWeeklyDateAdvanced(currentDate, config);
      case "biweekly":
        return addWeeks(currentDate, 2);
      case "monthly":
        return this.getNextMonthlyDateAdvanced(currentDate, config);
      case "quarterly":
        return addMonths(currentDate, 3);
      case "yearly":
        return this.getNextYearlyDateAdvanced(currentDate, config);
      default:
        return addWeeks(currentDate, config.interval || 1);
    }
  }

  /**
   * Advanced stop generation logic
   */
  private shouldStopGeneratingAdvanced(
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
   * Optimize recurring pattern configuration
   */
  optimizePatternConfig(
    config: RecurringPatternConfig,
  ): RecurringPatternConfig {
    // Validate and optimize interval
    const interval = Math.max(1, config.interval || 1);

    // Validate and optimize max occurrences
    let maxOccurrences = config.maxOccurrences;
    if (maxOccurrences && maxOccurrences < 1) {
      maxOccurrences = null;
    }

    // Validate end date
    let endDate = config.endDate;
    if (endDate && isBefore(new Date(endDate), new Date())) {
      endDate = null;
    }

    // Validate custom days
    let customDays = config.customDays;
    if (customDays && customDays.some((day) => day < 0 || day > 6)) {
      customDays = null;
    }

    // Validate custom month days
    let customMonthDays = config.customMonthDays;
    if (customMonthDays && customMonthDays.some((day) => day < 1 || day > 31)) {
      customMonthDays = null;
    }

    return {
      ...config,
      interval,
      maxOccurrences,
      endDate,
      customDays,
      customMonthDays,
    };
  }

  /**
   * Validate pattern configuration with advanced checks
   */
  validatePatternConfigAdvanced(config: RecurringPatternConfig): {
    valid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

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

    // Advanced validation for positional monthly patterns
    if (config.customMonthPosition && !config.customMonthDay) {
      errors.push("Month position requires a day of week");
    }

    if (!config.customMonthPosition && config.customMonthDay) {
      warnings.push("Month day specified without position - will be ignored");
    }

    // Check for unreasonable intervals
    if (config.interval && config.interval > 365) {
      warnings.push("Very large interval may cause performance issues");
    }

    // Check for too many occurrences
    if (config.maxOccurrences && config.maxOccurrences > 1000) {
      warnings.push(
        "Very large number of occurrences may cause performance issues",
      );
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Convert day name to day number
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
   * Format pattern for display with advanced formatting
   */
  formatPatternAdvanced(config: RecurringPatternConfig): string {
    switch (config.pattern) {
      case "daily":
        if (config.frequency === "weekdays") return "Weekdays (Mon-Fri)";
        if (config.interval === 1) return "Daily";
        return `Every ${config.interval} days`;
      case "weekly":
        if (config.customDays) {
          const dayNames = config.customDays.map((day) =>
            this.getDayName(day).substring(0, 3),
          );
          return `Weekly on ${dayNames.join(", ")}`;
        }
        if (config.frequency === "biweekly") return "Bi-weekly";
        if (config.interval === 1) return "Weekly";
        return `Every ${config.interval} weeks`;
      case "monthly":
        if (config.customMonthDays) {
          return `Monthly on day ${config.customMonthDays.join(", ")}`;
        }
        if (config.customMonthPosition && config.customMonthDay) {
          return `Monthly on the ${config.customMonthPosition} ${config.customMonthDay}`;
        }
        if (config.frequency === "quarterly") return "Quarterly";
        if (config.interval === 1) return "Monthly";
        return `Every ${config.interval} months`;
      case "yearly":
        if (config.interval === 1) return "Yearly";
        return `Every ${config.interval} years`;
      case "custom":
        return this.formatCustomPatternAdvanced(config);
      default:
        return config.pattern;
    }
  }

  /**
   * Format custom pattern with advanced formatting
   */
  private formatCustomPatternAdvanced(config: RecurringPatternConfig): string {
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
          return `Monthly on day ${config.customMonthDays.join(", ")}`;
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
   * Get end condition description with advanced formatting
   */
  getEndConditionDescriptionAdvanced(config: RecurringPatternConfig): string {
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
   * Calculate next occurrence date from current date
   */
  calculateNextOccurrence(
    currentDate: Date,
    config: RecurringPatternConfig,
  ): Date {
    return this.getNextDateAdvanced(currentDate, config);
  }

  /**
   * Calculate all future occurrences
   */
  calculateFutureOccurrences(
    startDate: Date,
    config: RecurringPatternConfig,
    limit: number = 10,
  ): Date[] {
    const occurrences: Date[] = [];
    let currentDate = new Date(startDate);

    for (let i = 0; i < limit; i++) {
      currentDate = this.calculateNextOccurrence(currentDate, config);
      occurrences.push(new Date(currentDate));

      // Stop if we hit end conditions
      if (this.shouldStopGeneratingAdvanced(currentDate, config, i + 1)) {
        break;
      }
    }

    return occurrences;
  }

  /**
   * Get pattern complexity score (for performance optimization)
   */
  getPatternComplexityScore(config: RecurringPatternConfig): number {
    let score = 0;

    // Base score by pattern type
    switch (config.pattern) {
      case "daily":
        score += 1;
        break;
      case "weekly":
        score += 2;
        break;
      case "monthly":
        score += 3;
        break;
      case "yearly":
        score += 4;
        break;
      case "custom":
        score += 5;
        break;
    }

    // Add complexity for custom configurations
    if (config.customDays) score += config.customDays.length * 0.5;
    if (config.customMonthDays) score += config.customMonthDays.length * 0.5;
    if (config.customMonthPosition) score += 2;
    if (config.customMonthDay) score += 1;

    // Add complexity for large intervals
    if (config.interval && config.interval > 1) {
      score += Math.min(5, Math.log(config.interval) * 2);
    }

    return Math.min(10, score); // Cap at 10
  }

  /**
   * Get pattern presets with advanced configurations
   */
  getAdvancedPatternPresets(): Array<{
    id: string;
    name: string;
    config: RecurringPatternConfig;
    complexity: number;
  }> {
    const presets = [
      {
        id: "daily",
        name: "Daily",
        config: {
          pattern: "daily",
          frequency: "daily",
          endCondition: "never",
          interval: 1,
        },
        complexity: 1,
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
        complexity: 2,
      },
      {
        id: "weekly",
        name: "Weekly",
        config: {
          pattern: "weekly",
          frequency: "weekly",
          endCondition: "never",
          interval: 1,
        },
        complexity: 2,
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
        complexity: 3,
      },
      {
        id: "monthly",
        name: "Monthly",
        config: {
          pattern: "monthly",
          frequency: "monthly",
          endCondition: "never",
          interval: 1,
        },
        complexity: 3,
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
        complexity: 4,
      },
      {
        id: "yearly",
        name: "Yearly",
        config: {
          pattern: "yearly",
          frequency: "yearly",
          endCondition: "never",
          interval: 1,
        },
        complexity: 4,
      },
      {
        id: "custom-weekly",
        name: "Custom Weekly (Mon, Wed, Fri)",
        config: {
          pattern: "custom",
          frequency: "weekly",
          endCondition: "never",
          interval: 1,
          customDays: [1, 3, 5], // Monday, Wednesday, Friday
        },
        complexity: 5,
      },
      {
        id: "custom-monthly",
        name: "Custom Monthly (1st & 15th)",
        config: {
          pattern: "custom",
          frequency: "monthly",
          endCondition: "never",
          interval: 1,
          customMonthDays: [1, 15],
        },
        complexity: 6,
      },
    ];

    // Add complexity scores
    return presets.map((preset) => ({
      ...preset,
      complexity: this.getPatternComplexityScore(preset.config),
    }));
  }
}

// Singleton instance
export const recurringPatternManager = RecurringPatternManager.getInstance();
