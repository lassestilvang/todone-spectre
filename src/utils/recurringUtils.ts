/**
 * Recurring Task Utilities
 * Core utility functions for recurring task management
 */
import {
  Task,
  RecurringTaskConfig,
  RecurringTaskInstance,
} from "../types/task";
import { RecurringPattern, TaskStatus } from "../types/enums";
import {
  addDays,
  addWeeks,
  addMonths,
  addYears,
  isBefore,
  isAfter,
  startOfDay,
  endOfDay,
  isEqual,
  format,
} from "date-fns";
import { recurringPatternService } from "../services/recurringPatternService";

/**
 * Generate recurring task instances based on configuration
 */
export const generateRecurringTaskInstances = (
  task: Task,
  config: RecurringTaskConfig,
  maxInstances: number = 10,
): RecurringTaskInstance[] => {
  if (!task.dueDate) {
    return [];
  }

  const instances: RecurringTaskInstance[] = [];
  let currentDate = new Date(task.dueDate);
  let occurrenceNumber = 1;

  // Add the original instance
  instances.push({
    id: task.id,
    taskId: task.id,
    date: new Date(currentDate),
    isGenerated: false,
    originalTaskId: task.id,
    occurrenceNumber: 0,
    status: task.status,
    completed: task.completed,
  });

  while (instances.length <= maxInstances) {
    const nextDate = getNextDate(currentDate, config);

    // Check end conditions
    if (shouldStopGenerating(nextDate, config, instances.length)) {
      break;
    }

    instances.push({
      id: `${task.id}-instance-${occurrenceNumber}`,
      taskId: `${task.id}-instance-${occurrenceNumber}`,
      date: nextDate,
      isGenerated: true,
      originalTaskId: task.id,
      occurrenceNumber,
      status: "active" as TaskStatus,
      completed: false,
    });

    currentDate = nextDate;
    occurrenceNumber++;
  }

  return instances;
};

/**
 * Get the next date based on recurring pattern
 */
const getNextDate = (currentDate: Date, config: RecurringTaskConfig): Date => {
  switch (config.pattern) {
    case "daily":
      return addDays(currentDate, config.customInterval || 1);
    case "weekly":
      return addWeeks(currentDate, config.customInterval || 1);
    case "monthly":
      return addMonths(currentDate, config.customInterval || 1);
    case "yearly":
      return addYears(currentDate, config.customInterval || 1);
    case "custom":
    default:
      return addWeeks(currentDate, config.customInterval || 1);
  }
};

/**
 * Check if we should stop generating more instances
 */
const shouldStopGenerating = (
  nextDate: Date,
  config: RecurringTaskConfig,
  currentCount: number,
): boolean => {
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
};

/**
 * Validate recurring task configuration
 */
export const validateRecurringTaskConfig = (
  config: RecurringTaskConfig,
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!config.pattern) {
    errors.push("Pattern is required");
  }

  if (!config.startDate) {
    errors.push("Start date is required");
  }

  if (config.maxOccurrences && config.maxOccurrences < 1) {
    errors.push("Maximum occurrences must be at least 1");
  }

  if (config.customInterval && config.customInterval < 1) {
    errors.push("Custom interval must be at least 1");
  }

  if (config.endDate && isBefore(new Date(config.endDate), new Date())) {
    errors.push("End date cannot be in the past");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Calculate completion rate for recurring task
 */
export const calculateRecurringTaskCompletionRate = (
  task: Task,
  instances: RecurringTaskInstance[],
): number => {
  if (instances.length === 0) return 0;

  const completedInstances = instances.filter((instance) => instance.completed);
  return completedInstances.length / instances.length;
};

/**
 * Get next occurrence date for a recurring task
 */
export const getNextOccurrenceDate = (
  task: Task,
  config: RecurringTaskConfig,
): Date | null => {
  if (!task.dueDate) return null;

  const instances = generateRecurringTaskInstances(task, config, 1);
  if (instances.length > 1) {
    return instances[1].date;
  }

  return null;
};

/**
 * Format recurring pattern for display
 */
export const formatRecurringPattern = (config: RecurringTaskConfig): string => {
  return recurringPatternService.formatRecurringPattern({
    pattern: config.pattern,
    frequency: config.customUnit || config.pattern,
    endCondition: config.endDate
      ? "on_date"
      : config.maxOccurrences
        ? "after_occurrences"
        : "never",
    endDate: config.endDate || null,
    maxOccurrences: config.maxOccurrences || null,
    interval: config.customInterval || 1,
  });
};

/**
 * Get recurring task statistics
 */
export const getRecurringTaskStatistics = (
  task: Task,
  instances: RecurringTaskInstance[],
): {
  totalInstances: number;
  completedInstances: number;
  pendingInstances: number;
  nextInstanceDate?: Date;
} => {
  const completedInstances = instances.filter((i) => i.completed);
  const pendingInstances = instances.filter(
    (i) => !i.completed && i.status !== "archived",
  );

  const futureInstances = instances
    .filter((i) => !i.completed && i.date && isAfter(i.date, new Date()))
    .sort((a, b) => (a.date?.getTime() || 0) - (b.date?.getTime() || 0));

  return {
    totalInstances: instances.length,
    completedInstances: completedInstances.length,
    pendingInstances: pendingInstances.length,
    nextInstanceDate:
      futureInstances.length > 0 ? futureInstances[0].date : undefined,
  };
};
