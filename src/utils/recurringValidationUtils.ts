/**
 * Recurring Task Validation Utilities
 * Comprehensive validation functions for recurring task configurations
 * Provides validation for patterns, configurations, and business rules
 */

import {
  RecurringPattern,
  TaskRepeatFrequency,
  TaskRepeatEnd,
} from "../types/enums";
import {
  Task,
  RecurringTaskConfig,
  RecurringPatternConfig,
} from "../types/task";
import { recurringPatternService } from "../services/recurringPatternService";
import {
  isBefore,
  isAfter,
  addDays,
  addWeeks,
  addMonths,
  addYears,
} from "date-fns";

/**
 * Validate a complete recurring task configuration
 */
export const validateRecurringTaskConfiguration = (
  task: Partial<Task>,
  config: RecurringTaskConfig,
): { valid: boolean; errors: string[]; warnings: string[] } => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate basic task properties
  if (!task.title || task.title.trim().length === 0) {
    errors.push("Task title is required");
  }

  if (task.title && task.title.length > 255) {
    errors.push("Task title cannot exceed 255 characters");
  }

  if (task.description && task.description.length > 5000) {
    errors.push("Task description cannot exceed 5000 characters");
  }

  // Validate recurring configuration
  const configValidation = validateRecurringConfig(config);
  errors.push(...configValidation.errors);

  // Validate pattern-specific rules
  const patternValidation = validatePatternSpecificRules(config);
  errors.push(...patternValidation.errors);
  warnings.push(...patternValidation.warnings);

  // Validate business rules
  const businessValidation = validateRecurringBusinessRules(task, config);
  errors.push(...businessValidation.errors);
  warnings.push(...businessValidation.warnings);

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Validate recurring configuration
 */
export const validateRecurringConfig = (
  config: RecurringTaskConfig,
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!config.pattern) {
    errors.push("Recurring pattern is required");
  }

  if (!config.startDate) {
    errors.push("Start date is required for recurring tasks");
  } else if (isBefore(config.startDate, new Date())) {
    errors.push("Start date cannot be in the past");
  }

  if (config.endDate && isBefore(config.endDate, config.startDate)) {
    errors.push("End date cannot be before start date");
  }

  if (config.maxOccurrences && config.maxOccurrences < 1) {
    errors.push("Maximum occurrences must be at least 1");
  }

  if (config.customInterval && config.customInterval < 1) {
    errors.push("Custom interval must be at least 1");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validate pattern-specific rules
 */
export const validatePatternSpecificRules = (
  config: RecurringPatternConfig,
): { errors: string[]; warnings: string[] } => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate custom days for weekly patterns
  if (config.customDays && config.customDays.length > 0) {
    const invalidDays = config.customDays.filter((day) => day < 0 || day > 6);
    if (invalidDays.length > 0) {
      errors.push("Custom days must be between 0 (Sunday) and 6 (Saturday)");
    }

    if (config.customDays.length === 0) {
      warnings.push("No custom days selected for weekly pattern");
    }
  }

  // Validate custom month days
  if (config.customMonthDays && config.customMonthDays.length > 0) {
    const invalidDays = config.customMonthDays.filter(
      (day) => day < 1 || day > 31,
    );
    if (invalidDays.length > 0) {
      errors.push("Custom month days must be between 1 and 31");
    }

    if (config.customMonthDays.length === 0) {
      warnings.push("No custom month days selected");
    }
  }

  // Validate month position and day combination
  if (config.customMonthPosition && !config.customMonthDay) {
    errors.push("Month position requires a day of week to be specified");
  }

  if (config.customMonthDay && !config.customMonthPosition) {
    errors.push("Month day requires a position to be specified");
  }

  // Validate interval for different pattern types
  if (config.interval) {
    if (config.interval < 1) {
      errors.push("Interval must be at least 1");
    }

    if (config.interval > 100) {
      warnings.push("Large interval values may cause performance issues");
    }
  }

  return { errors, warnings };
};

/**
 * Validate business rules for recurring tasks
 */
export const validateRecurringBusinessRules = (
  task: Partial<Task>,
  config: RecurringTaskConfig,
): { errors: string[]; warnings: string[] } => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check if task has both recurring pattern and is a subtask
  if (task.parentTaskId && config.pattern) {
    warnings.push(
      "Recurring subtasks may cause complex behavior - consider making this a top-level task",
    );
  }

  // Check for very long recurring patterns
  if (config.endDate) {
    const durationDays = Math.ceil(
      (config.endDate.getTime() - config.startDate.getTime()) /
        (1000 * 60 * 60 * 24),
    );
    if (durationDays > 365 * 5) {
      // More than 5 years
      warnings.push(
        "Long recurring duration - consider setting an end condition",
      );
    }
  }

  // Check for very frequent patterns with many occurrences
  if (config.maxOccurrences && config.maxOccurrences > 100) {
    warnings.push("Large number of occurrences may impact performance");
  }

  // Check for patterns that might generate too many instances
  if (
    config.pattern === "daily" &&
    config.customInterval === 1 &&
    (!config.endDate || !config.maxOccurrences)
  ) {
    warnings.push(
      "Daily pattern without end condition will generate many instances",
    );
  }

  // Validate that recurring tasks have reasonable due dates
  if (
    task.dueDate &&
    config.startDate &&
    isBefore(new Date(task.dueDate), config.startDate)
  ) {
    errors.push("Task due date cannot be before recurring pattern start date");
  }

  return { errors, warnings };
};

/**
 * Validate pattern configuration against service rules
 */
export const validatePatternWithService = (
  config: RecurringPatternConfig,
): { valid: boolean; errors: string[] } => {
  return recurringPatternService.validatePatternConfig(config);
};

/**
 * Check if a recurring configuration is valid for a specific date range
 */
export const validateConfigForDateRange = (
  config: RecurringPatternConfig,
  startDate: Date,
  endDate: Date,
): { valid: boolean; errors: string[]; warnings: string[] } => {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (isBefore(startDate, new Date())) {
    errors.push("Start date cannot be in the past");
  }

  if (isBefore(endDate, startDate)) {
    errors.push("End date cannot be before start date");
  }

  // Check if the pattern would generate any instances in the date range
  const testInstances = recurringPatternService.generateRecurringDates(
    startDate,
    config,
    10,
  );
  const instancesInRange = testInstances.filter(
    (instance) =>
      !isBefore(instance.date, startDate) && !isAfter(instance.date, endDate),
  );

  if (instancesInRange.length === 0) {
    warnings.push(
      "This pattern configuration may not generate instances in the specified date range",
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Validate that a pattern configuration can generate instances
 */
export const validatePatternCanGenerateInstances = (
  config: RecurringPatternConfig,
  startDate: Date,
): { canGenerate: boolean; reason?: string } => {
  try {
    const testInstances = recurringPatternService.generateRecurringDates(
      startDate,
      config,
      1,
    );

    if (testInstances.length === 0) {
      return {
        canGenerate: false,
        reason: "Pattern configuration did not generate any instances",
      };
    }

    return { canGenerate: true };
  } catch (error) {
    return {
      canGenerate: false,
      reason: `Pattern generation failed: ${error.message}`,
    };
  }
};

/**
 * Check if two recurring configurations would conflict
 */
export const checkConfigConflict = (
  config1: RecurringPatternConfig,
  config2: RecurringPatternConfig,
): { conflict: boolean; reasons: string[] } => {
  const reasons: string[] = [];

  // Same pattern with different intervals
  if (
    config1.pattern === config2.pattern &&
    config1.interval !== config2.interval
  ) {
    reasons.push("Same pattern type with different intervals");
  }

  // Overlapping date ranges
  if (
    config1.endDate &&
    config2.endDate &&
    config1.startDate &&
    config2.startDate
  ) {
    const range1Start = config1.startDate;
    const range1End = config1.endDate;
    const range2Start = config2.startDate;
    const range2End = config2.endDate;

    if (!(isAfter(range1End, range2Start) || isAfter(range2End, range1Start))) {
      reasons.push("Date ranges overlap");
    }
  }

  // Same custom days for weekly patterns
  if (
    config1.customDays &&
    config2.customDays &&
    JSON.stringify(config1.customDays.sort()) ===
      JSON.stringify(config2.customDays.sort())
  ) {
    reasons.push("Same custom days configuration");
  }

  return {
    conflict: reasons.length > 0,
    reasons,
  };
};

/**
 * Validate recurring task for completion
 */
export const validateRecurringTaskForCompletion = (
  task: Task,
  config: RecurringPatternConfig,
): { canComplete: boolean; reason?: string } => {
  if (!task.recurringPattern) {
    return {
      canComplete: true,
      reason: "Non-recurring task can be completed normally",
    };
  }

  // Check if this is the last allowed occurrence
  if (config.endCondition === "after_occurrences" && config.maxOccurrences) {
    const stats = getRecurringTaskStatsFromConfig(task, config);
    if (stats.completedInstances >= config.maxOccurrences) {
      return {
        canComplete: false,
        reason: "Maximum occurrences reached",
      };
    }
  }

  // Check if we're past the end date
  if (
    config.endCondition === "on_date" &&
    config.endDate &&
    isAfter(new Date(), config.endDate)
  ) {
    return {
      canComplete: false,
      reason: "Past recurring end date",
    };
  }

  return { canComplete: true };
};

/**
 * Get recurring task statistics from configuration
 */
export const getRecurringTaskStatsFromConfig = (
  task: Task,
  config: RecurringPatternConfig,
): {
  totalInstances: number;
  completedInstances: number;
  pendingInstances: number;
} => {
  // This is a simplified version - in a real app, you'd query the actual instances
  const totalInstances = config.maxOccurrences || 10; // Default estimate
  const completedInstances = task.customFields?.completedInstances || 0;
  const pendingInstances = totalInstances - completedInstances;

  return {
    totalInstances,
    completedInstances,
    pendingInstances,
  };
};

/**
 * Validate that a pattern configuration is reasonable for the given task
 */
export const validatePatternForTask = (
  task: Partial<Task>,
  config: RecurringPatternConfig,
): { valid: boolean; errors: string[]; warnings: string[] } => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check task priority vs pattern frequency
  if (task.priority === "P1" && config.pattern === "yearly") {
    warnings.push(
      "High priority task with yearly recurrence may not be optimal",
    );
  }

  if (task.priority === "P4" && config.pattern === "daily") {
    warnings.push("Low priority task with daily recurrence may not be optimal");
  }

  // Check task due date vs pattern start date
  if (task.dueDate && config.startDate) {
    const dueDate = new Date(task.dueDate);
    const startDate = new Date(config.startDate);

    if (isBefore(dueDate, startDate)) {
      errors.push(
        "Task due date cannot be before recurring pattern start date",
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Validate pattern configuration against performance constraints
 */
export const validatePatternPerformance = (
  config: RecurringPatternConfig,
): { safe: boolean; warnings: string[] } => {
  const warnings: string[] = [];

  // Check for patterns that might generate too many instances
  if (!config.endDate && !config.maxOccurrences) {
    warnings.push(
      "Pattern without end condition may generate unlimited instances",
    );
  }

  if (
    config.pattern === "daily" &&
    (!config.customInterval || config.customInterval === 1)
  ) {
    if (
      !config.endDate &&
      (!config.maxOccurrences || config.maxOccurrences > 365)
    ) {
      warnings.push(
        "Daily pattern may generate too many instances - consider adding limits",
      );
    }
  }

  // Check for complex patterns that might be slow
  if (isComplexPattern(config)) {
    warnings.push("Complex pattern configuration may impact performance");
  }

  return {
    safe: warnings.length === 0,
    warnings,
  };
};

/**
 * Check if pattern configuration is complex
 */
export const isComplexPattern = (config: RecurringPatternConfig): boolean => {
  return !!(
    config.customDays?.length ||
    config.customMonthDays?.length ||
    config.customMonthPosition ||
    config.customMonthDay ||
    (config.interval && config.interval > 1) ||
    config.frequency !== config.pattern
  );
};

/**
 * Validate that end conditions are properly configured
 */
export const validateEndConditions = (
  config: RecurringPatternConfig,
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (config.endCondition === "on_date" && !config.endDate) {
    errors.push('End condition "on_date" requires an endDate');
  }

  if (config.endCondition === "after_occurrences" && !config.maxOccurrences) {
    errors.push('End condition "after_occurrences" requires maxOccurrences');
  }

  if (config.endDate && config.maxOccurrences) {
    // Both end conditions are set - this is allowed but might be confusing
    // We'll just warn about this in the pattern validation
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Get validation summary for a recurring task
 */
export const getRecurringTaskValidationSummary = (
  task: Partial<Task>,
  config: RecurringPatternConfig,
): {
  isValid: boolean;
  errorCount: number;
  warningCount: number;
  errorMessages: string[];
  warningMessages: string[];
  validationDetails: {
    configValidation: { valid: boolean; errors: string[] };
    patternValidation: { errors: string[]; warnings: string[] };
    businessValidation: { errors: string[]; warnings: string[] };
    performanceValidation: { safe: boolean; warnings: string[] };
  };
} => {
  const configValidation = validateRecurringConfig(config);
  const patternValidation = validatePatternSpecificRules(config);
  const businessValidation = validateRecurringBusinessRules(task, config);
  const performanceValidation = validatePatternPerformance(config);

  const allErrors = [
    ...configValidation.errors,
    ...patternValidation.errors,
    ...businessValidation.errors,
  ];

  const allWarnings = [
    ...patternValidation.warnings,
    ...businessValidation.warnings,
    ...performanceValidation.warnings,
  ];

  return {
    isValid: allErrors.length === 0,
    errorCount: allErrors.length,
    warningCount: allWarnings.length,
    errorMessages: allErrors,
    warningMessages: allWarnings,
    validationDetails: {
      configValidation,
      patternValidation,
      businessValidation,
      performanceValidation,
    },
  };
};
