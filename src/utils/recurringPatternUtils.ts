/**
 * Recurring Pattern Utilities
 * Pattern-specific utility functions for recurring task management
 */
import { RecurringPatternConfig, RecurringTaskInstance } from "../types/task";
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
  format,
} from "date-fns";
import { recurringPatternService } from "../services/recurringPatternService";

/**
 * Normalize recurring pattern configuration
 */
export const normalizeRecurringPatternConfig = (
  config: Partial<RecurringPatternConfig>,
): RecurringPatternConfig => {
  return {
    pattern: config.pattern || "weekly",
    frequency: config.frequency || config.pattern || "weekly",
    endCondition: config.endCondition || "never",
    endDate: config.endDate || null,
    maxOccurrences: config.maxOccurrences || null,
    interval: config.interval || 1,
    customDays: config.customDays || null,
    customMonthDays: config.customMonthDays || null,
    customMonthPosition: config.customMonthPosition || null,
    customMonthDay: config.customMonthDay || null,
  };
};

/**
 * Get pattern frequency description
 */
export const getPatternFrequencyDescription = (
  config: RecurringPatternConfig,
): string => {
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
      return getCustomPatternDescription(config);
    default:
      return config.pattern;
  }
};

/**
 * Get custom pattern description
 */
const getCustomPatternDescription = (
  config: RecurringPatternConfig,
): string => {
  if (!config.frequency) return "Custom pattern";

  switch (config.frequency) {
    case "daily":
      return config.interval === 1 ? "Daily" : `Every ${config.interval} days`;
    case "weekdays":
      return "Weekdays (Mon-Fri)";
    case "weekly":
      if (config.customDays) {
        const dayNames = config.customDays.map((day) =>
          getDayName(day).substring(0, 3),
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
};

/**
 * Get day name from day number
 */
const getDayName = (dayNumber: number): string => {
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
};

/**
 * Calculate pattern complexity score
 */
export const calculatePatternComplexityScore = (
  config: RecurringPatternConfig,
): number => {
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
};

/**
 * Validate pattern configuration
 */
export const validatePatternConfiguration = (
  config: RecurringPatternConfig,
): { valid: boolean; errors: string[] } => {
  return recurringPatternService.validatePatternConfig(config);
};

/**
 * Get pattern presets
 */
export const getPatternPresets = (): Array<{
  id: string;
  name: string;
  config: RecurringPatternConfig;
}> => {
  return recurringPatternService.getPatternPresets();
};

/**
 * Get default pattern configuration
 */
export const getDefaultPatternConfig = (
  pattern: RecurringPattern,
): RecurringPatternConfig => {
  return recurringPatternService.getDefaultPatternConfig(pattern);
};

/**
 * Format pattern for display
 */
export const formatPatternForDisplay = (
  config: RecurringPatternConfig,
): string => {
  return recurringPatternService.formatRecurringPattern(config);
};

/**
 * Get end condition description
 */
export const getEndConditionDescription = (
  config: RecurringPatternConfig,
): string => {
  return recurringPatternService.getEndConditionDescription(config);
};

/**
 * Calculate next occurrence date
 */
export const calculateNextOccurrenceDate = (
  currentDate: Date,
  config: RecurringPatternConfig,
): Date => {
  return (
    recurringPatternService.generateRecurringDates(currentDate, config, 1)[1]
      ?.date || currentDate
  );
};

/**
 * Generate preview instances
 */
export const generatePreviewInstances = (
  startDate: Date,
  config: RecurringPatternConfig,
  count: number = 5,
): RecurringTaskInstance[] => {
  return recurringPatternService
    .generateRecurringDates(startDate, config, count)
    .map((instance, index) => ({
      id: `preview-${index}`,
      taskId: "preview",
      date: instance.date,
      isGenerated: instance.isGenerated,
      originalTaskId: "preview",
      occurrenceNumber: index + 1,
      status: "active" as TaskStatus,
      completed: false,
    }));
};
