// @ts-nocheck
/**
 * Recurring Task Scheduler Service
 * Advanced scheduling with background processing, optimization, and conflict resolution
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
} from "date-fns";
import { recurringPatternManager } from "./recurringPatternManager";
import { recurringTaskService } from "./recurringTaskService";

/**
 * Scheduling Configuration Interface
 */
interface SchedulingConfig {
  maxInstancesToGenerate: number;
  maxFutureYears: number;
  batchSize: number;
  conflictResolution: "skip" | "overwrite" | "merge";
  performanceThreshold: number;
}

/**
 * Recurring Task Scheduler
 */
export class RecurringTaskScheduler {
  private static instance: RecurringTaskScheduler;
  private schedulingConfig: SchedulingConfig;
  private isScheduling: boolean = false;
  private scheduleQueue: Array<{ taskId: string; forceRegenerate?: boolean }> =
    [];

  private constructor() {
    this.schedulingConfig = {
      maxInstancesToGenerate: 50,
      maxFutureYears: 5,
      batchSize: 10,
      conflictResolution: "skip",
      performanceThreshold: 7, // Pattern complexity threshold for warnings
    };
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): RecurringTaskScheduler {
    if (!RecurringTaskScheduler.instance) {
      RecurringTaskScheduler.instance = new RecurringTaskScheduler();
    }
    return RecurringTaskScheduler.instance;
  }

  /**
   * Initialize scheduler with custom configuration
   */
  initialize(config?: Partial<SchedulingConfig>): void {
    this.schedulingConfig = {
      ...this.schedulingConfig,
      ...config,
    };
  }

  /**
   * Schedule recurring task generation
   */
  async scheduleRecurringTask(
    taskId: string,
    forceRegenerate: boolean = false,
  ): Promise<void> {
    // Add to queue
    this.scheduleQueue.push({ taskId, forceRegenerate });

    // Process queue if not already processing
    if (!this.isScheduling) {
      await this.processScheduleQueue();
    }
  }

  /**
   * Process the scheduling queue
   */
  private async processScheduleQueue(): Promise<void> {
    if (this.isScheduling) return;

    this.isScheduling = true;

    try {
      while (this.scheduleQueue.length > 0) {
        const batch = this.scheduleQueue.splice(
          0,
          this.schedulingConfig.batchSize,
        );

        await Promise.all(
          batch.map(async ({ taskId, forceRegenerate }) => {
            try {
              await this.generateRecurringInstancesForTask(
                taskId,
                forceRegenerate,
              );
            } catch (error) {
              console.error(`Failed to schedule task ${taskId}:`, error);
            }
          }),
        );

        // Small delay between batches to prevent blocking
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error("Error processing schedule queue:", error);
    } finally {
      this.isScheduling = false;
    }
  }

  /**
   * Generate recurring instances for a specific task
   */
  private async generateRecurringInstancesForTask(
    taskId: string,
    forceRegenerate: boolean = false,
  ): Promise<void> {
    try {
      // Get the task
      const task = await recurringTaskService.getRecurringTask(taskId);
      if (!task || !task.recurringPattern) {
        return;
      }

      // Check if task is paused
      if (task.customFields?.isPaused) {
        console.log(`Skipping paused recurring task: ${taskId}`);
        return;
      }

      // Get current instances
      const currentInstances =
        recurringTaskService.getRecurringInstances(taskId);

      // Check if we need to regenerate
      if (
        forceRegenerate ||
        this.shouldRegenerateInstances(task, currentInstances)
      ) {
        await this.regenerateAllInstances(task);
      } else {
        // Just generate missing future instances
        await this.generateMissingFutureInstances(task, currentInstances);
      }
    } catch (error) {
      console.error(`Error generating instances for task ${taskId}:`, error);
      throw error;
    }
  }

  /**
   * Determine if instances should be regenerated
   */
  private shouldRegenerateInstances(
    task: Task,
    currentInstances: Task[],
  ): boolean {
    // Regenerate if no instances exist
    if (currentInstances.length === 0) return true;

    // Regenerate if pattern or config changed significantly
    const config = task.customFields?.recurringConfig;
    if (!config) return true;

    // Check if the pattern complexity is high (might need regeneration)
    const complexity =
      recurringPatternManager.getPatternComplexityScore(config);
    if (complexity >= this.schedulingConfig.performanceThreshold) {
      console.warn(
        `High complexity pattern (score: ${complexity}) - considering regeneration`,
      );
      return true;
    }

    // Check if we're missing recent instances
    const now = new Date();
    const recentInstances = currentInstances.filter(
      (instance) => instance.dueDate && isAfter(instance.dueDate, now),
    );

    // If we have fewer than 5 future instances, regenerate
    if (recentInstances.length < 5) return true;

    return false;
  }

  /**
   * Regenerate all instances for a task
   */
  private async regenerateAllInstances(task: Task): Promise<void> {
    const config = task.customFields?.recurringConfig;
    if (!config) return;

    console.log(`Regenerating all instances for task: ${task.id}`);

    try {
      // Delete existing generated instances
      const existingInstances = recurringTaskService.getRecurringInstances(
        task.id,
      );
      for (const instance of existingInstances) {
        if (instance.id !== task.id) {
          // Don't delete the original task
          await recurringTaskService.deleteRecurringInstances([instance.id]);
        }
      }

      // Generate new instances
      await this.generateInstances(task, config);
    } catch (error) {
      console.error(`Error regenerating instances for task ${task.id}:`, error);
      throw error;
    }
  }

  /**
   * Generate missing future instances
   */
  private async generateMissingFutureInstances(
    task: Task,
    currentInstances: Task[],
  ): Promise<void> {
    const config = task.customFields?.recurringConfig;
    if (!config) return;

    try {
      // Find the most recent instance
      const recentInstance = currentInstances
        .filter((instance) => instance.dueDate)
        .sort(
          (a, b) => (b.dueDate?.getTime() || 0) - (a.dueDate?.getTime() || 0),
        )[0];

      const startDate = recentInstance?.dueDate || task.dueDate || new Date();

      // Generate future instances
      await this.generateFutureInstances(task, config, startDate);
    } catch (error) {
      console.error(
        `Error generating missing instances for task ${task.id}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Generate instances for a task
   */
  private async generateInstances(
    task: Task,
    config: RecurringPatternConfig,
  ): Promise<void> {
    if (!task.dueDate) return;

    try {
      const instances = recurringPatternManager.generateRecurringDatesAdvanced(
        config.startDate || task.dueDate,
        config,
        this.schedulingConfig.maxInstancesToGenerate,
      );

      // Create instances (skip the original task)
      for (const instance of instances.slice(1)) {
        if (instance.isGenerated) {
          await this.createRecurringInstance(task, instance);
        }
      }
    } catch (error) {
      console.error(`Error generating instances for task ${task.id}:`, error);
      throw error;
    }
  }

  /**
   * Generate future instances from a specific date
   */
  private async generateFutureInstances(
    task: Task,
    config: RecurringPatternConfig,
    startDate: Date,
  ): Promise<void> {
    try {
      const now = new Date();
      let currentDate = new Date(startDate);
      let generatedCount = 0;

      while (generatedCount < this.schedulingConfig.maxInstancesToGenerate) {
        const nextDate = recurringPatternManager.calculateNextOccurrence(
          currentDate,
          config,
        );

        // Stop if we hit end conditions
        if (this.shouldStopGenerating(nextDate, config, generatedCount + 1)) {
          break;
        }

        // Only generate future instances
        if (isAfter(nextDate, now) || isEqual(nextDate, now)) {
          await this.createRecurringInstance(task, {
            id: `${task.id}-instance-${Date.now()}`,
            date: nextDate,
            isGenerated: true,
            originalDate: config.startDate || task.dueDate || new Date(),
            occurrenceNumber: generatedCount + 1,
          });

          generatedCount++;
        }

        currentDate = nextDate;
      }
    } catch (error) {
      console.error(
        `Error generating future instances for task ${task.id}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Create a recurring instance
   */
  private async createRecurringInstance(
    task: Task,
    instance: RecurringInstance,
  ): Promise<Task> {
    try {
      const dueDate = instance.date;
      const instanceId = `${task.id}-instance-${instance.occurrenceNumber}`;

      const newTask: Omit<Task, "id"> = {
        ...task,
        id: instanceId,
        title: `${task.title} (Recurring)`,
        dueDate,
        customFields: {
          ...task.customFields,
          originalTaskId: task.id,
          isRecurringInstance: true,
          instanceNumber: instance.occurrenceNumber,
          recurringInstanceId: instance.id,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        completed: false,
        status: "active" as TaskStatus,
      };

      return await recurringTaskService.createRecurringTask(
        newTask,
        task.customFields?.recurringConfig,
      );
    } catch (error) {
      console.error(
        `Error creating recurring instance for task ${task.id}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Check if we should stop generating instances
   */
  private shouldStopGenerating(
    nextDate: Date,
    config: RecurringTaskConfig,
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

    // Check future limit
    const futureLimit = addYears(
      new Date(),
      this.schedulingConfig.maxFutureYears,
    );
    if (isAfter(nextDate, futureLimit)) {
      return true;
    }

    return false;
  }

  /**
   * Schedule all recurring tasks
   */
  async scheduleAllRecurringTasks(): Promise<void> {
    try {
      console.log("Starting full recurring task scheduling...");

      // Get all recurring tasks
      const recurringTasks = await recurringTaskService.getRecurringTasks();

      // Schedule each task
      for (const task of recurringTasks) {
        await this.scheduleRecurringTask(task.id);
      }

      console.log(`Scheduled ${recurringTasks.length} recurring tasks`);
    } catch (error) {
      console.error("Error scheduling all recurring tasks:", error);
      throw error;
    }
  }

  /**
   * Schedule overdue recurring tasks
   */
  async scheduleOverdueRecurringTasks(): Promise<void> {
    try {
      console.log("Scheduling overdue recurring tasks...");

      // Get overdue instances
      const overdueInstances =
        await recurringTaskService.getOverdueRecurringInstances();

      // For each overdue instance, generate next instance if needed
      for (const instance of overdueInstances) {
        const originalTask = await recurringTaskService.getRecurringTask(
          instance.customFields?.originalTaskId,
        );

        if (originalTask && !originalTask.customFields?.isPaused) {
          await this.scheduleRecurringTask(originalTask.id);
        }
      }
    } catch (error) {
      console.error("Error scheduling overdue recurring tasks:", error);
      throw error;
    }
  }

  /**
   * Schedule upcoming recurring tasks
   */
  async scheduleUpcomingRecurringTasks(daysAhead: number = 30): Promise<void> {
    try {
      console.log(
        `Scheduling upcoming recurring tasks (next ${daysAhead} days)...`,
      );

      // Get upcoming instances
      const upcomingInstances =
        await recurringTaskService.getUpcomingRecurringInstances(daysAhead);

      // For each upcoming instance, ensure we have enough future instances
      for (const instance of upcomingInstances) {
        const originalTask = await recurringTaskService.getRecurringTask(
          instance.customFields?.originalTaskId,
        );

        if (originalTask && !originalTask.customFields?.isPaused) {
          await this.scheduleRecurringTask(originalTask.id);
        }
      }
    } catch (error) {
      console.error("Error scheduling upcoming recurring tasks:", error);
      throw error;
    }
  }

  /**
   * Get scheduling statistics
   */
  async getSchedulingStatistics(): Promise<{
    totalRecurringTasks: number;
    activeRecurringTasks: number;
    pausedRecurringTasks: number;
    totalInstances: number;
    futureInstances: number;
    overdueInstances: number;
    nextScheduledDate?: Date;
  }> {
    try {
      const allTasks = await recurringTaskService.getRecurringTasks();
      const allInstances =
        await recurringTaskService.getRecurringTaskCompletionStats();

      const now = new Date();
      const futureInstances = allInstances.filter(
        (instance) => instance.dueDate && isAfter(instance.dueDate, now),
      );

      const nextScheduledDate =
        futureInstances.length > 0
          ? futureInstances.sort(
              (a, b) =>
                (a.dueDate?.getTime() || 0) - (b.dueDate?.getTime() || 0),
            )[0].dueDate
          : undefined;

      return {
        totalRecurringTasks: allTasks.length,
        activeRecurringTasks: allTasks.filter((t) => !t.customFields?.isPaused)
          .length,
        pausedRecurringTasks: allTasks.filter((t) => t.customFields?.isPaused)
          .length,
        totalInstances: allInstances.length,
        futureInstances: futureInstances.length,
        overdueInstances: allInstances.filter(
          (instance) =>
            instance.dueDate &&
            isBefore(instance.dueDate, now) &&
            !instance.completed,
        ).length,
        nextScheduledDate,
      };
    } catch (error) {
      console.error("Error getting scheduling statistics:", error);
      return {
        totalRecurringTasks: 0,
        activeRecurringTasks: 0,
        pausedRecurringTasks: 0,
        totalInstances: 0,
        futureInstances: 0,
        overdueInstances: 0,
      };
    }
  }

  /**
   * Get scheduling performance metrics
   */
  getSchedulingPerformance(): {
    queueLength: number;
    isProcessing: boolean;
    averageProcessingTime: number;
    lastProcessed: Date | null;
  } {
    return {
      queueLength: this.scheduleQueue.length,
      isProcessing: this.isScheduling,
      averageProcessingTime: 0, // Would track this in a real implementation
      lastProcessed: null, // Would track this in a real implementation
    };
  }

  /**
   * Clean up old recurring instances
   */
  async cleanupOldRecurringInstances(
    maxAgeDays: number = 365,
  ): Promise<number> {
    try {
      console.log(
        `Cleaning up old recurring instances (older than ${maxAgeDays} days)...`,
      );

      const cutoffDate = addDays(new Date(), -maxAgeDays);
      let deletedCount = 0;

      // Get all instances
      const allTasks = await recurringTaskService.getRecurringTasks();
      const instances = allTasks.filter(
        (task) => task.customFields?.isRecurringInstance,
      );

      // Delete old completed instances
      for (const instance of instances) {
        if (
          instance.completed &&
          instance.dueDate &&
          isBefore(instance.dueDate, cutoffDate)
        ) {
          await recurringTaskService.deleteRecurringInstances([instance.id]);
          deletedCount++;
        }
      }

      console.log(`Cleaned up ${deletedCount} old recurring instances`);
      return deletedCount;
    } catch (error) {
      console.error("Error cleaning up old recurring instances:", error);
      return 0;
    }
  }

  /**
   * Optimize recurring task scheduling
   */
  async optimizeScheduling(): Promise<void> {
    try {
      console.log("Optimizing recurring task scheduling...");

      // Get all recurring tasks
      const recurringTasks = await recurringTaskService.getRecurringTasks();

      // Analyze and optimize each task
      for (const task of recurringTasks) {
        await this.optimizeTaskScheduling(task);
      }
    } catch (error) {
      console.error("Error optimizing scheduling:", error);
      throw error;
    }
  }

  /**
   * Optimize scheduling for a specific task
   */
  private async optimizeTaskScheduling(task: Task): Promise<void> {
    if (!task.recurringPattern) return;

    try {
      const config = task.customFields?.recurringConfig;
      if (!config) return;

      // Get pattern complexity
      const complexity =
        recurringPatternManager.getPatternComplexityScore(config);

      // For high complexity patterns, consider reducing instance count
      if (complexity >= this.schedulingConfig.performanceThreshold) {
        console.warn(
          `Optimizing high complexity task ${task.id} (score: ${complexity})`,
        );

        // Reduce max instances for complex patterns
        const optimizedConfig = {
          ...config,
          maxOccurrences: Math.min(config.maxOccurrences || 50, 20),
        };

        // Update task with optimized config
        await recurringTaskService.updateRecurringTask(
          task.id,
          {},
          optimizedConfig,
        );
      }
    } catch (error) {
      console.error(`Error optimizing task ${task.id}:`, error);
    }
  }

  /**
   * Get scheduling recommendations
   */
  async getSchedulingRecommendations(): Promise<
    Array<{
      taskId: string;
      recommendation: string;
      severity: "low" | "medium" | "high";
      details: any;
    }>
  > {
    try {
      const recommendations: Array<{
        taskId: string;
        recommendation: string;
        severity: "low" | "medium" | "high";
        details: any;
      }> = [];

      // Get all recurring tasks
      const recurringTasks = await recurringTaskService.getRecurringTasks();

      // Analyze each task
      for (const task of recurringTasks) {
        const config = task.customFields?.recurringConfig;
        if (config) {
          const complexity =
            recurringPatternManager.getPatternComplexityScore(config);

          // High complexity warning
          if (complexity >= this.schedulingConfig.performanceThreshold) {
            recommendations.push({
              taskId: task.id,
              recommendation: "High complexity pattern may impact performance",
              severity: "high",
              details: {
                complexityScore: complexity,
                pattern: config.pattern,
                interval: config.interval,
              },
            });
          }

          // Large interval warning
          if (config.interval && config.interval > 30) {
            recommendations.push({
              taskId: task.id,
              recommendation: "Large interval may cause scheduling gaps",
              severity: "medium",
              details: {
                interval: config.interval,
                pattern: config.pattern,
              },
            });
          }

          // No end condition warning
          if (!config.endDate && !config.maxOccurrences) {
            recommendations.push({
              taskId: task.id,
              recommendation:
                "No end condition specified - task will run indefinitely",
              severity: "low",
              details: {
                pattern: config.pattern,
                endCondition: config.endCondition,
              },
            });
          }
        }
      }

      return recommendations;
    } catch (error) {
      console.error("Error getting scheduling recommendations:", error);
      return [];
    }
  }

  /**
   * Start background scheduling
   */
  startBackgroundScheduling(intervalMinutes: number = 60): {
    stop: () => void;
  } {
    let intervalId: NodeJS.Timeout;

    const scheduler = () => {
      this.scheduleAllRecurringTasks().catch((error) =>
        console.error("Background scheduling error:", error),
      );
    };

    // Initial run
    scheduler();

    // Set up interval
    intervalId = setInterval(scheduler, intervalMinutes * 60 * 1000);

    return {
      stop: () => {
        clearInterval(intervalId);
      },
    };
  }

  /**
   * Get scheduler status
   */
  getSchedulerStatus(): {
    isRunning: boolean;
    queueLength: number;
    lastRun: Date | null;
    nextRun: Date | null;
  } {
    return {
      isRunning: this.isScheduling,
      queueLength: this.scheduleQueue.length,
      lastRun: null, // Would track in real implementation
      nextRun: null, // Would track in real implementation
    };
  }
}

// Singleton instance
export const recurringTaskScheduler = RecurringTaskScheduler.getInstance();
