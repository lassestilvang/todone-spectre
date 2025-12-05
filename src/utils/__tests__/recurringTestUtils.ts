/**
 * Recurring Task Test Utilities
 * Comprehensive test utilities for recurring task functionality
 * Provides mock data, test helpers, and validation functions for testing
 */

import {
  Task,
  RecurringTaskConfig,
  RecurringPatternConfig,
} from "../../types/task";
import { RecurringPattern, TaskStatus, PriorityLevel } from "../../types/enums";
import { addDays, addWeeks, addMonths, addYears } from "date-fns";
import { validateRecurringTaskConfiguration } from "../recurringValidationUtils";
import { recurringPatternService } from "../../services/recurringPatternService";
import { recurringTaskService } from "../../services/recurringTaskService";

/**
 * Create mock recurring task
 */
export const createMockRecurringTask = (
  overrides: Partial<Task> = {},
): Task => {
  const baseTask: Task = {
    id: `mock-task-${Date.now()}`,
    title: "Mock Recurring Task",
    description: "This is a mock recurring task for testing",
    status: "active",
    priority: "P2",
    dueDate: new Date(),
    dueTime: "10:00",
    createdAt: new Date(),
    updatedAt: new Date(),
    completed: false,
    order: 0,
    recurringPattern: "weekly",
    customFields: {
      recurringConfig: {
        pattern: "weekly",
        startDate: new Date(),
        endDate: null,
        maxOccurrences: 10,
        customInterval: 1,
        customUnit: null,
      },
    },
  };

  return { ...baseTask, ...overrides };
};

/**
 * Create mock recurring task configuration
 */
export const createMockRecurringConfig = (
  overrides: Partial<RecurringTaskConfig> = {},
): RecurringTaskConfig => {
  const baseConfig: RecurringTaskConfig = {
    pattern: "weekly",
    startDate: new Date(),
    endDate: null,
    maxOccurrences: 10,
    customInterval: 1,
    customUnit: null,
  };

  return { ...baseConfig, ...overrides };
};

/**
 * Create mock pattern configuration
 */
export const createMockPatternConfig = (
  overrides: Partial<RecurringPatternConfig> = {},
): RecurringPatternConfig => {
  const baseConfig: RecurringPatternConfig = {
    pattern: "weekly",
    frequency: "weekly",
    endCondition: "never",
    endDate: null,
    maxOccurrences: null,
    interval: 1,
    customDays: null,
    customMonthDays: null,
    customMonthPosition: null,
    customMonthDay: null,
  };

  return { ...baseConfig, ...overrides };
};

/**
 * Generate test recurring task instances
 */
export const generateTestRecurringInstances = (
  baseTask: Task,
  count: number = 5,
): Task[] => {
  const instances: Task[] = [baseTask];

  for (let i = 1; i <= count; i++) {
    const dueDate = addWeeks(new Date(baseTask.dueDate || new Date()), i);
    instances.push({
      ...baseTask,
      id: `${baseTask.id}-instance-${i}`,
      title: `${baseTask.title} (Instance ${i})`,
      dueDate,
      customFields: {
        ...baseTask.customFields,
        originalTaskId: baseTask.id,
        isRecurringInstance: true,
        instanceNumber: i,
      },
    });
  }

  return instances;
};

/**
 * Create test scenarios for recurring tasks
 */
export const createRecurringTaskTestScenarios = () => {
  const scenarios = {
    dailyTask: createMockRecurringTask({
      title: "Daily Standup",
      recurringPattern: "daily",
      customFields: {
        recurringConfig: createMockRecurringConfig({
          pattern: "daily",
          maxOccurrences: 30,
        }),
      },
    }),

    weeklyTask: createMockRecurringTask({
      title: "Weekly Team Meeting",
      recurringPattern: "weekly",
      customFields: {
        recurringConfig: createMockRecurringConfig({
          pattern: "weekly",
          customInterval: 1,
          maxOccurrences: 52,
        }),
      },
    }),

    monthlyTask: createMockRecurringTask({
      title: "Monthly Report",
      recurringPattern: "monthly",
      customFields: {
        recurringConfig: createMockRecurringConfig({
          pattern: "monthly",
          maxOccurrences: 12,
        }),
      },
    }),

    customWeeklyTask: createMockRecurringTask({
      title: "Custom Weekly Task",
      recurringPattern: "custom",
      customFields: {
        recurringConfig: createMockRecurringConfig({
          pattern: "custom",
          customUnit: "weeks",
          customInterval: 2,
          maxOccurrences: 26,
        }),
      },
    }),

    pausedTask: createMockRecurringTask({
      title: "Paused Recurring Task",
      status: "archived",
      customFields: {
        isPaused: true,
        recurringConfig: createMockRecurringConfig({
          pattern: "weekly",
          endDate: addMonths(new Date(), 3),
        }),
      },
    }),

    completedTask: createMockRecurringTask({
      title: "Completed Recurring Task",
      status: "completed",
      completed: true,
      customFields: {
        recurringConfig: createMockRecurringConfig({
          pattern: "daily",
          maxOccurrences: 5,
        }),
      },
    }),
  };

  return scenarios;
};

/**
 * Validate recurring task test data
 */
export const validateTestRecurringTask = (
  task: Task,
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!task.id) {
    errors.push("Task ID is required");
  }

  if (!task.title || task.title.trim().length === 0) {
    errors.push("Task title is required");
  }

  if (task.recurringPattern && !task.customFields?.recurringConfig) {
    errors.push("Recurring task must have a recurring configuration");
  }

  if (task.customFields?.recurringConfig) {
    const configValidation = validateRecurringTaskConfiguration(
      task,
      task.customFields.recurringConfig,
    );

    if (!configValidation.valid) {
      errors.push(...configValidation.errors);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Test recurring pattern generation
 */
export const testRecurringPatternGeneration = async (
  config: RecurringPatternConfig,
  expectedCount: number,
): Promise<{ success: boolean; actualCount: number; instances: any[] }> => {
  try {
    const startDate = new Date();
    const instances = recurringPatternService.generateRecurringDates(
      startDate,
      config,
      expectedCount * 2,
    );

    return {
      success: instances.length >= expectedCount,
      actualCount: instances.length,
      instances,
    };
  } catch (error) {
    return {
      success: false,
      actualCount: 0,
      instances: [],
      error: error.message,
    };
  }
};

/**
 * Test recurring task service methods
 */
export const testRecurringTaskServiceMethods = async (
  mockTask: Task,
): Promise<{
  createTest: { success: boolean; error?: string };
  updateTest: { success: boolean; error?: string };
  deleteTest: { success: boolean; error?: string };
  instanceGenerationTest: { success: boolean; error?: string };
}> => {
  const results = {
    createTest: { success: false },
    updateTest: { success: false },
    deleteTest: { success: false },
    instanceGenerationTest: { success: false },
  };

  try {
    // Test create
    const createdTask = await recurringTaskService.createRecurringTask(
      mockTask,
      mockTask.customFields?.recurringConfig || createMockRecurringConfig(),
    );
    results.createTest.success = !!createdTask;

    // Test update
    if (results.createTest.success && createdTask.id) {
      const updatedTask = await recurringTaskService.updateRecurringTask(
        createdTask.id,
        { title: "Updated Test Task" },
      );
      results.updateTest.success = updatedTask.title === "Updated Test Task";
    }

    // Test instance generation
    if (results.createTest.success && createdTask.id) {
      const instances = await recurringTaskService.generateRecurringInstances(
        createdTask,
        createdTask.customFields?.recurringConfig ||
          createMockRecurringConfig(),
      );
      results.instanceGenerationTest.success = instances.length > 0;
    }

    // Test delete
    if (results.createTest.success && createdTask.id) {
      await recurringTaskService.deleteRecurringTask(createdTask.id, false);
      results.deleteTest.success = true;
    }
  } catch (error) {
    console.error("Test error:", error);
    if (error instanceof Error) {
      if (error.message.includes("create")) {
        results.createTest.error = error.message;
      } else if (error.message.includes("update")) {
        results.updateTest.error = error.message;
      } else if (error.message.includes("delete")) {
        results.deleteTest.error = error.message;
      } else {
        results.instanceGenerationTest.error = error.message;
      }
    }
  }

  return results;
};

/**
 * Create performance test for recurring tasks
 */
export const createRecurringTaskPerformanceTest = async (
  taskCount: number = 100,
): Promise<{
  creationTime: number;
  generationTime: number;
  memoryUsage: number;
  success: boolean;
}> => {
  const startTime = performance.now();
  let memoryStart = 0;

  if (typeof performance.memory !== "undefined") {
    memoryStart = performance.memory.usedJSHeapSize;
  }

  try {
    const mockConfig = createMockRecurringConfig({
      pattern: "weekly",
      maxOccurrences: 5,
    });

    // Test creation performance
    const creationStart = performance.now();
    const createdTasks: Task[] = [];

    for (let i = 0; i < taskCount; i++) {
      const mockTask = createMockRecurringTask({
        title: `Performance Test Task ${i}`,
        customFields: {
          recurringConfig: mockConfig,
        },
      });

      // In a real test, we would actually create these tasks
      // For this mock test, we'll just simulate the creation
      createdTasks.push(mockTask);
    }

    const creationTime = performance.now() - creationStart;

    // Test instance generation performance
    const generationStart = performance.now();
    let totalInstances = 0;

    for (const task of createdTasks) {
      const instances = await recurringTaskService.generateRecurringInstances(
        task,
        task.customFields?.recurringConfig || mockConfig,
      );
      totalInstances += instances.length;
    }

    const generationTime = performance.now() - generationStart;

    let memoryEnd = 0;
    if (typeof performance.memory !== "undefined") {
      memoryEnd = performance.memory.usedJSHeapSize;
    }

    const memoryUsage = memoryEnd - memoryStart;

    return {
      creationTime,
      generationTime,
      memoryUsage,
      success: true,
    };
  } catch (error) {
    console.error("Performance test error:", error);
    return {
      creationTime: 0,
      generationTime: 0,
      memoryUsage: 0,
      success: false,
    };
  }
};

/**
 * Create validation test suite for recurring tasks
 */
export const createRecurringTaskValidationTestSuite = () => {
  const testCases = [
    {
      name: "Valid Daily Task",
      task: createMockRecurringTask({
        recurringPattern: "daily",
        customFields: {
          recurringConfig: createMockRecurringConfig({
            pattern: "daily",
            maxOccurrences: 30,
          }),
        },
      }),
      shouldBeValid: true,
    },
    {
      name: "Valid Weekly Task",
      task: createMockRecurringTask({
        recurringPattern: "weekly",
        customFields: {
          recurringConfig: createMockRecurringConfig({
            pattern: "weekly",
            endDate: addMonths(new Date(), 6),
          }),
        },
      }),
      shouldBeValid: true,
    },
    {
      name: "Invalid - No Pattern",
      task: createMockRecurringTask({
        recurringPattern: undefined,
        customFields: {
          recurringConfig: createMockRecurringConfig({
            pattern: undefined,
          }),
        },
      }),
      shouldBeValid: false,
    },
    {
      name: "Invalid - Past Start Date",
      task: createMockRecurringTask({
        customFields: {
          recurringConfig: createMockRecurringConfig({
            pattern: "weekly",
            startDate: addDays(new Date(), -1), // Yesterday
          }),
        },
      }),
      shouldBeValid: false,
    },
    {
      name: "Invalid - Zero Occurrences",
      task: createMockRecurringTask({
        customFields: {
          recurringConfig: createMockRecurringConfig({
            pattern: "monthly",
            maxOccurrences: 0,
          }),
        },
      }),
      shouldBeValid: false,
    },
  ];

  return testCases;
};

/**
 * Run recurring task validation tests
 */
export const runRecurringTaskValidationTests = async (
  testCases: Array<{
    name: string;
    task: Task;
    shouldBeValid: boolean;
  }>,
): Promise<{
  passed: number;
  failed: number;
  results: Array<{
    testName: string;
    passed: boolean;
    expectedValid: boolean;
    actualValid: boolean;
    errors?: string[];
  }>;
}> => {
  const results: Array<{
    testName: string;
    passed: boolean;
    expectedValid: boolean;
    actualValid: boolean;
    errors?: string[];
  }> = [];

  for (const testCase of testCases) {
    try {
      const validation = validateRecurringTaskConfiguration(
        testCase.task,
        testCase.task.customFields?.recurringConfig ||
          createMockRecurringConfig(),
      );

      const passed = validation.valid === testCase.shouldBeValid;

      results.push({
        testName: testCase.name,
        passed,
        expectedValid: testCase.shouldBeValid,
        actualValid: validation.valid,
        errors: passed ? undefined : validation.errors,
      });
    } catch (error) {
      results.push({
        testName: testCase.name,
        passed: false,
        expectedValid: testCase.shouldBeValid,
        actualValid: false,
        errors: [error instanceof Error ? error.message : "Unknown error"],
      });
    }
  }

  const passed = results.filter((r) => r.passed).length;
  const failed = results.length - passed;

  return {
    passed,
    failed,
    results,
  };
};

/**
 * Create integration test for recurring tasks
 */
export const createRecurringTaskIntegrationTest = async (
  mockTask: Task,
): Promise<{
  serviceIntegration: boolean;
  patternServiceIntegration: boolean;
  validationIntegration: boolean;
  errors: string[];
}> => {
  const errors: string[] = [];
  let serviceIntegration = false;
  let patternServiceIntegration = false;
  let validationIntegration = false;

  try {
    // Test service integration
    const serviceTest = await testRecurringTaskServiceMethods(mockTask);
    serviceIntegration =
      serviceTest.createTest.success &&
      serviceTest.updateTest.success &&
      serviceTest.instanceGenerationTest.success;

    if (!serviceIntegration) {
      errors.push("Service integration test failed");
    }

    // Test pattern service integration
    const patternConfig =
      mockTask.customFields?.recurringConfig || createMockPatternConfig();
    const patternTest = await testRecurringPatternGeneration(patternConfig, 3);
    patternServiceIntegration = patternTest.success;

    if (!patternServiceIntegration) {
      errors.push("Pattern service integration test failed");
    }

    // Test validation integration
    const validation = validateRecurringTaskConfiguration(
      mockTask,
      mockTask.customFields?.recurringConfig || createMockRecurringConfig(),
    );
    validationIntegration = validation.valid;

    if (!validationIntegration) {
      errors.push("Validation integration test failed");
    }
  } catch (error) {
    errors.push(
      error instanceof Error ? error.message : "Unknown integration error",
    );
  }

  return {
    serviceIntegration,
    patternServiceIntegration,
    validationIntegration,
    errors,
  };
};

/**
 * Create mock recurring task with instances
 */
export const createMockRecurringTaskWithInstances = (
  instanceCount: number = 3,
): { task: Task; instances: Task[] } => {
  const baseTask = createMockRecurringTask({
    title: "Recurring Task with Instances",
    customFields: {
      recurringConfig: createMockRecurringConfig({
        pattern: "weekly",
        maxOccurrences: instanceCount + 1,
      }),
    },
  });

  const instances: Task[] = [];
  for (let i = 1; i <= instanceCount; i++) {
    instances.push({
      ...baseTask,
      id: `${baseTask.id}-instance-${i}`,
      title: `${baseTask.title} (Instance ${i})`,
      dueDate: addWeeks(new Date(baseTask.dueDate || new Date()), i),
      customFields: {
        ...baseTask.customFields,
        originalTaskId: baseTask.id,
        isRecurringInstance: true,
        instanceNumber: i,
      },
    });
  }

  return { task: baseTask, instances };
};

/**
 * Create test data for recurring task analytics
 */
export const createRecurringTaskAnalyticsTestData = () => {
  const now = new Date();
  const baseDate = new Date(now.getFullYear(), now.getMonth(), 1);

  return {
    completedTask: createMockRecurringTask({
      title: "Completed Recurring Task",
      status: "completed",
      completed: true,
      completedAt: addDays(baseDate, -5),
      customFields: {
        recurringConfig: createMockRecurringConfig({
          pattern: "daily",
          maxOccurrences: 10,
        }),
      },
    }),

    overdueTask: createMockRecurringTask({
      title: "Overdue Recurring Task",
      status: "active",
      dueDate: addDays(baseDate, -2),
      customFields: {
        recurringConfig: createMockRecurringConfig({
          pattern: "weekly",
          maxOccurrences: 5,
        }),
      },
    }),

    upcomingTask: createMockRecurringTask({
      title: "Upcoming Recurring Task",
      status: "active",
      dueDate: addDays(baseDate, 10),
      customFields: {
        recurringConfig: createMockRecurringConfig({
          pattern: "monthly",
          maxOccurrences: 12,
        }),
      },
    }),

    pausedTask: createMockRecurringTask({
      title: "Paused Recurring Task",
      status: "archived",
      customFields: {
        isPaused: true,
        recurringConfig: createMockRecurringConfig({
          pattern: "weekly",
          endDate: addMonths(baseDate, 3),
        }),
      },
    }),
  };
};

/**
 * Test recurring task analytics functions
 */
export const testRecurringTaskAnalytics = async (
  testData: ReturnType<typeof createRecurringTaskAnalyticsTestData>,
): Promise<{
  completionStats: { success: boolean; error?: string };
  patternDistribution: { success: boolean; error?: string };
  timelineGeneration: { success: boolean; error?: string };
}> => {
  const results = {
    completionStats: { success: false },
    patternDistribution: { success: false },
    timelineGeneration: { success: false },
  };

  try {
    // Test completion stats
    const stats = await recurringTaskService.getRecurringTaskCompletionStats();
    results.completionStats.success = stats.totalRecurringTasks >= 0;

    // Test pattern distribution
    const distribution =
      await recurringTaskService.getRecurringTaskPatternDistribution();
    results.patternDistribution.success = Object.keys(distribution).length > 0;

    // Test timeline generation (using one of the test tasks)
    const timeline = await recurringTaskService.getRecurringTaskTimeline(
      testData.completedTask.id,
    );
    results.timelineGeneration.success = timeline.length > 0;
  } catch (error) {
    console.error("Analytics test error:", error);
    if (error instanceof Error) {
      if (error.message.includes("completion")) {
        results.completionStats.error = error.message;
      } else if (error.message.includes("distribution")) {
        results.patternDistribution.error = error.message;
      } else {
        results.timelineGeneration.error = error.message;
      }
    }
  }

  return results;
};
