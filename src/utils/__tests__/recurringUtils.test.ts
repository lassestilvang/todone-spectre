/**
 * Test suite for recurring utilities
 * Ensures proper integration with existing services and utilities
 */

import { describe, expect, test } from "@jest/globals";
import {
  generateRecurringTaskInstances,
  calculateNextOccurrence,
  getRecurringTaskStatistics,
  validateRecurringTaskConfig,
} from "../recurringUtils";
import {
  normalizeRecurringPatternConfig,
  getPatternFrequencyDescription,
  getDayName,
  getDayNumber,
  isValidPatternConfig,
  createPatternConfig,
  getPatternComplexityScore,
} from "../recurringPatternUtils";
import {
  Task,
  RecurringTaskConfig,
  RecurringPatternConfig,
} from "../../types/task";
import { recurringPatternService } from "../../services/recurringPatternService";

// Mock task data
const mockTask: Task = {
  id: "task-1",
  title: "Test Recurring Task",
  description: "This is a test recurring task",
  status: "active",
  priority: "P2",
  dueDate: new Date("2023-01-15"),
  createdAt: new Date("2023-01-01"),
  updatedAt: new Date("2023-01-01"),
  completed: false,
  order: 0,
  projectId: "project-1",
  customFields: {
    recurringPattern: "weekly",
    recurringInterval: 1,
    recurringEndCondition: "never",
  },
};

// Mock recurring config
const mockRecurringConfig: RecurringTaskConfig = {
  pattern: "weekly",
  startDate: new Date("2023-01-15"),
  endDate: null,
  maxOccurrences: null,
  customInterval: 1,
  customUnit: null,
};

describe("Recurring Utilities", () => {
  describe("generateRecurringTaskInstances", () => {
    test("should generate recurring task instances", () => {
      const instances = generateRecurringTaskInstances(
        mockTask,
        mockRecurringConfig,
        5,
      );
      expect(instances.length).toBeGreaterThan(0);
      expect(instances[0].taskId).toBe(mockTask.id);
      expect(instances[0].originalTaskId).toBe(mockTask.id);
    });
  });

  describe("calculateNextOccurrence", () => {
    test("should calculate next occurrence for weekly pattern", () => {
      const patternConfig: RecurringPatternConfig = {
        pattern: "weekly",
        interval: 1,
      };
      const currentDate = new Date("2023-01-15");
      const nextDate = calculateNextOccurrence(currentDate, patternConfig);
      expect(nextDate).toBeInstanceOf(Date);
      expect(nextDate > currentDate).toBe(true);
    });
  });

  describe("getRecurringTaskStatistics", () => {
    test("should calculate statistics for recurring task", () => {
      const instances = [
        {
          id: "1",
          taskId: "task-1",
          date: new Date("2023-01-15"),
          isGenerated: true,
          originalTaskId: "task-1",
          status: "active",
          completed: true,
        },
        {
          id: "2",
          taskId: "task-1",
          date: new Date("2023-01-22"),
          isGenerated: true,
          originalTaskId: "task-1",
          status: "active",
          completed: false,
        },
      ];

      const stats = getRecurringTaskStatistics(mockTask, instances);
      expect(stats.totalInstances).toBe(2);
      expect(stats.completedInstances).toBe(1);
      expect(stats.pendingInstances).toBe(1);
    });
  });

  describe("validateRecurringTaskConfig", () => {
    test("should validate valid recurring config", () => {
      const validation = validateRecurringTaskConfig(mockRecurringConfig);
      expect(validation.valid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });

    test("should invalidate config with past start date", () => {
      const invalidConfig = {
        ...mockRecurringConfig,
        startDate: new Date("2020-01-01"),
      };
      const validation = validateRecurringTaskConfig(invalidConfig);
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });
});

describe("Recurring Pattern Utilities", () => {
  describe("normalizeRecurringPatternConfig", () => {
    test("should normalize partial pattern config", () => {
      const partialConfig = {
        pattern: "daily",
      };
      const normalized = normalizeRecurringPatternConfig(partialConfig);
      expect(normalized.pattern).toBe("daily");
      expect(normalized.interval).toBe(1);
      expect(normalized.endCondition).toBe("never");
    });
  });

  describe("getPatternFrequencyDescription", () => {
    test("should get frequency description for daily pattern", () => {
      const config: RecurringPatternConfig = {
        pattern: "daily",
        interval: 1,
      };
      const description = getPatternFrequencyDescription(config);
      expect(description).toBe("Daily");
    });

    test("should get frequency description for custom pattern", () => {
      const config: RecurringPatternConfig = {
        pattern: "custom",
        frequency: "weekdays",
      };
      const description = getPatternFrequencyDescription(config);
      expect(description).toBe("Weekdays (Mon-Fri)");
    });
  });

  describe("getDayName and getDayNumber", () => {
    test("should convert between day names and numbers", () => {
      expect(getDayName(0)).toBe("Sunday");
      expect(getDayNumber("Monday")).toBe(1);
      expect(getDayNumber("monday")).toBe(1);
    });
  });

  describe("isValidPatternConfig", () => {
    test("should validate valid pattern config", () => {
      const config: RecurringPatternConfig = {
        pattern: "weekly",
        interval: 1,
      };
      expect(isValidPatternConfig(config)).toBe(true);
    });
  });

  describe("createPatternConfig", () => {
    test("should create pattern config from parameters", () => {
      const config = createPatternConfig("daily", {
        interval: 2,
        endCondition: "after_occurrences",
        maxOccurrences: 5,
      });

      expect(config.pattern).toBe("daily");
      expect(config.interval).toBe(2);
      expect(config.endCondition).toBe("after_occurrences");
      expect(config.maxOccurrences).toBe(5);
    });
  });

  describe("getPatternComplexityScore", () => {
    test("should calculate complexity score", () => {
      const simpleConfig: RecurringPatternConfig = {
        pattern: "daily",
        interval: 1,
      };

      const complexConfig: RecurringPatternConfig = {
        pattern: "custom",
        frequency: "monthly",
        customMonthDays: [1, 15],
        endCondition: "on_date",
        endDate: new Date("2023-12-31"),
        interval: 2,
      };

      const simpleScore = getPatternComplexityScore(simpleConfig);
      const complexScore = getPatternComplexityScore(complexConfig);

      expect(simpleScore).toBeLessThan(complexScore);
      expect(complexScore).toBeGreaterThan(1);
    });
  });
});

describe("Integration with Existing Services", () => {
  test("should integrate with recurringPatternService", () => {
    const config: RecurringPatternConfig = {
      pattern: "weekly",
      interval: 1,
    };

    // Test that our utilities can use the service methods
    const formatted = recurringPatternService.formatRecurringPattern(config);
    expect(formatted).toBe("Weekly");

    const validation = recurringPatternService.validatePatternConfig(config);
    expect(validation.valid).toBe(true);

    const presets = recurringPatternService.getPatternPresets();
    expect(presets.length).toBeGreaterThan(0);
  });
});
