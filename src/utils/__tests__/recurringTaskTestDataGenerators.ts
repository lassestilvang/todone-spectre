/**
 * Recurring Task Test Data Generators
 * Comprehensive test data generation utilities for recurring task testing
 * Provides realistic mock data for various recurring task scenarios
 */

import {
  Task,
  RecurringTaskConfig,
  RecurringPatternConfig,
} from "../../types/task";
import { RecurringPattern, TaskStatus, PriorityLevel } from "../../types/enums";
import {
  addDays,
  addWeeks,
  addMonths,
  addYears,
  startOfDay,
  endOfDay,
} from "date-fns";
import { faker } from "@faker-js/faker";

/**
 * Generate realistic recurring task data with various patterns and configurations
 */
export class RecurringTaskTestDataGenerator {
  private static instance: RecurringTaskTestDataGenerator;

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): RecurringTaskTestDataGenerator {
    if (!RecurringTaskTestDataGenerator.instance) {
      RecurringTaskTestDataGenerator.instance =
        new RecurringTaskTestDataGenerator();
    }
    return RecurringTaskTestDataGenerator.instance;
  }

  /**
   * Generate a realistic recurring task with comprehensive configuration
   */
  public generateRealisticRecurringTask(
    pattern: RecurringPattern = "weekly",
    overrides: Partial<Task> = {},
  ): Task {
    const baseTask: Task = {
      id: `test-task-${faker.string.uuid()}`,
      title: this.generateRealisticTaskTitle(pattern),
      description: this.generateRealisticTaskDescription(pattern),
      status: this.getRandomStatus(),
      priority: this.getRandomPriority(),
      dueDate: this.generateRealisticDueDate(),
      dueTime: this.generateRandomTime(),
      createdAt: new Date(),
      updatedAt: new Date(),
      completed: false,
      order: 0,
      recurringPattern: pattern,
      customFields: {
        recurringConfig: this.generateRealisticRecurringConfig(pattern),
        ...(overrides.customFields || {}),
      },
    };

    return { ...baseTask, ...overrides };
  }

  /**
   * Generate comprehensive recurring task test scenarios
   */
  public generateRecurringTaskScenarios(): Record<string, Task> {
    return {
      dailyStandup: this.generateRealisticRecurringTask("daily", {
        title: "Daily Standup Meeting",
        description:
          "15-minute daily team sync to discuss progress and blockers",
        customFields: {
          recurringConfig: {
            pattern: "daily",
            startDate: startOfDay(new Date()),
            endDate: addMonths(new Date(), 3),
            maxOccurrences: 90,
            customInterval: 1,
            customUnit: null,
          },
        },
      }),

      weeklyTeamMeeting: this.generateRealisticRecurringTask("weekly", {
        title: "Weekly Team Meeting",
        description:
          "Weekly team meeting to discuss project progress and planning",
        customFields: {
          recurringConfig: {
            pattern: "weekly",
            startDate: startOfDay(new Date()),
            endDate: addYears(new Date(), 1),
            maxOccurrences: 52,
            customInterval: 1,
            customUnit: null,
          },
        },
      }),

      monthlyReport: this.generateRealisticRecurringTask("monthly", {
        title: "Monthly Progress Report",
        description: "Prepare and submit monthly progress report to management",
        customFields: {
          recurringConfig: {
            pattern: "monthly",
            startDate: startOfDay(new Date()),
            endDate: addYears(new Date(), 2),
            maxOccurrences: 24,
            customInterval: 1,
            customUnit: null,
          },
        },
      }),

      yearlyReview: this.generateRealisticRecurringTask("yearly", {
        title: "Annual Performance Review",
        description: "Conduct annual performance review and goal setting",
        customFields: {
          recurringConfig: {
            pattern: "yearly",
            startDate: startOfDay(new Date()),
            endDate: addYears(new Date(), 5),
            maxOccurrences: 5,
            customInterval: 1,
            customUnit: null,
          },
        },
      }),

      customBiweeklyTask: this.generateRealisticRecurringTask("custom", {
        title: "Bi-weekly Code Review",
        description: "Team code review session every two weeks",
        customFields: {
          recurringConfig: {
            pattern: "custom",
            startDate: startOfDay(new Date()),
            endDate: addMonths(new Date(), 6),
            maxOccurrences: 12,
            customInterval: 2,
            customUnit: "weeks",
          },
        },
      }),

      pausedRecurringTask: this.generateRealisticRecurringTask("weekly", {
        title: "Paused Weekly Task",
        description: "This recurring task has been paused",
        status: "archived",
        customFields: {
          isPaused: true,
          recurringConfig: {
            pattern: "weekly",
            startDate: startOfDay(new Date()),
            endDate: addMonths(new Date(), 3),
            maxOccurrences: 12,
            customInterval: 1,
            customUnit: null,
          },
        },
      }),

      completedRecurringTask: this.generateRealisticRecurringTask("daily", {
        title: "Completed Daily Task",
        description: "This recurring task has been completed",
        status: "completed",
        completed: true,
        completedAt: new Date(),
        customFields: {
          recurringConfig: {
            pattern: "daily",
            startDate: startOfDay(new Date()),
            endDate: addWeeks(new Date(), 2),
            maxOccurrences: 10,
            customInterval: 1,
            customUnit: null,
          },
        },
      }),
    };
  }

  /**
   * Generate recurring task with instances for testing instance management
   */
  public generateRecurringTaskWithInstances(
    baseTask: Task,
    instanceCount: number = 5,
  ): { task: Task; instances: Task[] } {
    const instances: Task[] = [];

    for (let i = 1; i <= instanceCount; i++) {
      const dueDate = this.getNextInstanceDate(baseTask, i);
      const isCompleted = i <= Math.floor(instanceCount * 0.3); // 30% completed

      instances.push({
        ...baseTask,
        id: `${baseTask.id}-instance-${i}`,
        title: `${baseTask.title} (Instance ${i})`,
        dueDate,
        dueTime: baseTask.dueTime,
        createdAt: addDays(new Date(), -i),
        updatedAt: new Date(),
        completed: isCompleted,
        completedAt: isCompleted ? addDays(new Date(), -i) : undefined,
        customFields: {
          ...baseTask.customFields,
          originalTaskId: baseTask.id,
          isRecurringInstance: true,
          instanceNumber: i,
          generatedFrom: baseTask.id,
        },
      });
    }

    return { task: baseTask, instances };
  }

  /**
   * Generate test data for performance testing
   */
  public generatePerformanceTestData(taskCount: number = 100): Task[] {
    const tasks: Task[] = [];

    for (let i = 0; i < taskCount; i++) {
      const pattern = this.getRandomPattern();
      tasks.push(
        this.generateRealisticRecurringTask(pattern, {
          title: `Performance Test Task ${i + 1}`,
          description: `Test task for performance measurement - ${i + 1}`,
          customFields: {
            recurringConfig: {
              pattern,
              startDate: startOfDay(new Date()),
              endDate: addMonths(new Date(), 3),
              maxOccurrences: 12,
              customInterval: 1,
              customUnit: null,
            },
          },
        }),
      );
    }

    return tasks;
  }

  /**
   * Generate test data for edge cases and error conditions
   */
  public generateEdgeCaseTestData(): Record<string, Task> {
    return {
      noEndDateTask: this.generateRealisticRecurringTask("daily", {
        title: "Infinite Recurring Task",
        description: "Task with no end date (infinite)",
        customFields: {
          recurringConfig: {
            pattern: "daily",
            startDate: startOfDay(new Date()),
            endDate: null,
            maxOccurrences: null,
            customInterval: 1,
            customUnit: null,
          },
        },
      }),

      pastStartDateTask: this.generateRealisticRecurringTask("weekly", {
        title: "Task with Past Start Date",
        description: "Task that started in the past",
        customFields: {
          recurringConfig: {
            pattern: "weekly",
            startDate: addWeeks(new Date(), -2),
            endDate: addMonths(new Date(), 1),
            maxOccurrences: 8,
            customInterval: 1,
            customUnit: null,
          },
        },
      }),

      highFrequencyTask: this.generateRealisticRecurringTask("daily", {
        title: "High Frequency Task",
        description: "Task that occurs multiple times per day",
        customFields: {
          recurringConfig: {
            pattern: "custom",
            startDate: startOfDay(new Date()),
            endDate: addWeeks(new Date(), 1),
            maxOccurrences: 20,
            customInterval: 1,
            customUnit: "days",
          },
        },
      }),

      complexPatternTask: this.generateRealisticRecurringTask("custom", {
        title: "Complex Pattern Task",
        description: "Task with complex custom pattern",
        customFields: {
          recurringConfig: {
            pattern: "custom",
            startDate: startOfDay(new Date()),
            endDate: addMonths(new Date(), 6),
            maxOccurrences: 24,
            customInterval: 3,
            customUnit: "weeks",
          },
        },
      }),
    };
  }

  /**
   * Generate test data for analytics and reporting
   */
  public generateAnalyticsTestData(): {
    tasks: Task[];
    expectedStats: {
      totalRecurringTasks: number;
      activeRecurringTasks: number;
      pausedRecurringTasks: number;
      completedInstances: number;
      pendingInstances: number;
    };
  } {
    const tasks: Task[] = [];
    let totalRecurringTasks = 0;
    let activeRecurringTasks = 0;
    let pausedRecurringTasks = 0;
    let completedInstances = 0;
    let pendingInstances = 0;

    // Generate 5 active recurring tasks
    for (let i = 0; i < 5; i++) {
      const task = this.generateRealisticRecurringTask("weekly", {
        title: `Analytics Test Task ${i + 1}`,
        status: "active",
        customFields: {
          recurringConfig: {
            pattern: "weekly",
            startDate: startOfDay(new Date()),
            endDate: addMonths(new Date(), 3),
            maxOccurrences: 12,
            customInterval: 1,
            customUnit: null,
          },
        },
      });

      tasks.push(task);
      totalRecurringTasks++;
      activeRecurringTasks++;

      // Add some instances
      const { instances } = this.generateRecurringTaskWithInstances(task, 3);
      tasks.push(...instances);

      // Count completed vs pending instances
      completedInstances += instances.filter((i) => i.completed).length;
      pendingInstances += instances.filter((i) => !i.completed).length;
    }

    // Generate 2 paused recurring tasks
    for (let i = 0; i < 2; i++) {
      const task = this.generateRealisticRecurringTask("monthly", {
        title: `Paused Analytics Task ${i + 1}`,
        status: "archived",
        customFields: {
          isPaused: true,
          recurringConfig: {
            pattern: "monthly",
            startDate: startOfDay(new Date()),
            endDate: addMonths(new Date(), 6),
            maxOccurrences: 6,
            customInterval: 1,
            customUnit: null,
          },
        },
      });

      tasks.push(task);
      totalRecurringTasks++;
      pausedRecurringTasks++;
    }

    return {
      tasks,
      expectedStats: {
        totalRecurringTasks,
        activeRecurringTasks,
        pausedRecurringTasks,
        completedInstances,
        pendingInstances,
      },
    };
  }

  // Private helper methods

  private generateRealisticTaskTitle(pattern: RecurringPattern): string {
    const titles: Record<RecurringPattern, string[]> = {
      daily: [
        "Daily Standup",
        "Morning Check-in",
        "Daily Progress Update",
        "Daily Code Review",
        "Daily Planning Session",
      ],
      weekly: [
        "Weekly Team Meeting",
        "Weekly Sprint Planning",
        "Weekly Retrospective",
        "Weekly Progress Report",
        "Weekly Code Review",
      ],
      monthly: [
        "Monthly Progress Report",
        "Monthly Team Meeting",
        "Monthly Financial Review",
        "Monthly Performance Review",
        "Monthly Planning Session",
      ],
      yearly: [
        "Annual Performance Review",
        "Annual Budget Planning",
        "Annual Strategy Session",
        "Annual Team Retreat",
        "Annual Goal Setting",
      ],
      custom: [
        "Bi-weekly Sync",
        "Quarterly Review",
        "Semi-monthly Check-in",
        "Custom Frequency Task",
        "Variable Interval Task",
      ],
    };

    return titles[pattern][Math.floor(Math.random() * titles[pattern].length)];
  }

  private generateRealisticTaskDescription(pattern: RecurringPattern): string {
    const descriptions: Record<RecurringPattern, string[]> = {
      daily: [
        "15-minute daily team sync to discuss progress and blockers",
        "Daily check-in to review priorities and plan the day",
        "Quick daily update on project status and next steps",
        "Daily code review session to maintain code quality",
        "Morning planning session to align team priorities",
      ],
      weekly: [
        "Weekly team meeting to discuss project progress and planning",
        "Weekly sprint planning session to set goals for the week",
        "Weekly retrospective to review what went well and what to improve",
        "Weekly progress report to update stakeholders on project status",
        "Weekly code review to maintain high code quality standards",
      ],
      monthly: [
        "Monthly progress report to management with detailed metrics",
        "Monthly team meeting to discuss long-term goals and strategy",
        "Monthly financial review to analyze budget and spending",
        "Monthly performance review to assess team productivity",
        "Monthly planning session to set objectives for the coming month",
      ],
      yearly: [
        "Annual performance review and goal setting for the year",
        "Annual budget planning and financial forecasting",
        "Annual strategy session to set company direction",
        "Annual team retreat for team building and planning",
        "Annual goal setting and performance evaluation",
      ],
      custom: [
        "Bi-weekly sync to discuss progress and challenges",
        "Quarterly review of project milestones and deliverables",
        "Semi-monthly check-in to ensure alignment with goals",
        "Custom frequency task based on project needs",
        "Variable interval task for flexible scheduling",
      ],
    };

    return descriptions[pattern][
      Math.floor(Math.random() * descriptions[pattern].length)
    ];
  }

  private generateRealisticDueDate(): Date {
    const daysAhead = Math.floor(Math.random() * 30) + 1; // 1-30 days ahead
    return addDays(startOfDay(new Date()), daysAhead);
  }

  private generateRandomTime(): string {
    const hours = Math.floor(Math.random() * 12) + 8; // 8 AM - 7 PM
    const minutes = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, 45
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
  }

  private getRandomStatus(): TaskStatus {
    const statuses: TaskStatus[] = ["active", "pending", "in-progress"];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  private getRandomPriority(): PriorityLevel {
    const priorities: PriorityLevel[] = ["P1", "P2", "P3", "P4"];
    return priorities[Math.floor(Math.random() * priorities.length)];
  }

  private getRandomPattern(): RecurringPattern {
    const patterns: RecurringPattern[] = [
      "daily",
      "weekly",
      "monthly",
      "yearly",
      "custom",
    ];
    return patterns[Math.floor(Math.random() * patterns.length)];
  }

  private generateRealisticRecurringConfig(
    pattern: RecurringPattern,
  ): RecurringTaskConfig {
    const baseConfig: RecurringTaskConfig = {
      pattern,
      startDate: startOfDay(new Date()),
      endDate: null,
      maxOccurrences: null,
      customInterval: 1,
      customUnit: null,
    };

    // Set realistic end conditions based on pattern
    switch (pattern) {
      case "daily":
        baseConfig.endDate = addMonths(new Date(), 3);
        baseConfig.maxOccurrences = 90;
        break;
      case "weekly":
        baseConfig.endDate = addYears(new Date(), 1);
        baseConfig.maxOccurrences = 52;
        break;
      case "monthly":
        baseConfig.endDate = addYears(new Date(), 2);
        baseConfig.maxOccurrences = 24;
        break;
      case "yearly":
        baseConfig.endDate = addYears(new Date(), 5);
        baseConfig.maxOccurrences = 5;
        break;
      case "custom":
        baseConfig.endDate = addMonths(new Date(), 6);
        baseConfig.maxOccurrences = 12;
        baseConfig.customInterval = 2;
        baseConfig.customUnit = "weeks";
        break;
    }

    return baseConfig;
  }

  private getNextInstanceDate(baseTask: Task, instanceNumber: number): Date {
    const config = baseTask.customFields?.recurringConfig;
    if (!config) return new Date();

    const startDate = new Date(
      config.startDate || baseTask.dueDate || new Date(),
    );
    let nextDate = new Date(startDate);

    if (config.pattern === "daily") {
      nextDate = addDays(
        nextDate,
        instanceNumber * (config.customInterval || 1),
      );
    } else if (config.pattern === "weekly") {
      nextDate = addWeeks(
        nextDate,
        instanceNumber * (config.customInterval || 1),
      );
    } else if (config.pattern === "monthly") {
      nextDate = addMonths(
        nextDate,
        instanceNumber * (config.customInterval || 1),
      );
    } else if (config.pattern === "yearly") {
      nextDate = addYears(
        nextDate,
        instanceNumber * (config.customInterval || 1),
      );
    } else if (config.pattern === "custom" && config.customUnit) {
      if (config.customUnit === "days") {
        nextDate = addDays(
          nextDate,
          instanceNumber * (config.customInterval || 1),
        );
      } else if (config.customUnit === "weeks") {
        nextDate = addWeeks(
          nextDate,
          instanceNumber * (config.customInterval || 1),
        );
      } else if (config.customUnit === "months") {
        nextDate = addMonths(
          nextDate,
          instanceNumber * (config.customInterval || 1),
        );
      } else if (config.customUnit === "years") {
        nextDate = addYears(
          nextDate,
          instanceNumber * (config.customInterval || 1),
        );
      }
    }

    return nextDate;
  }
}

// Singleton instance
export const recurringTaskTestDataGenerator =
  RecurringTaskTestDataGenerator.getInstance();
