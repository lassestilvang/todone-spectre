// @ts-nocheck
/**
 * Recurring Task Generator Service
 * Advanced task generation with validation, optimization, and conflict resolution
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
import { recurringPatternManager } from "./recurringPatternManager";
import { recurringTaskService } from "./recurringTaskService";
import { recurringTaskScheduler } from "./recurringTaskScheduler";

/**
 * Generation Configuration Interface
 */
interface GenerationConfig {
  maxInstancesPerTask: number;
  maxFutureYears: number;
  batchSize: number;
  conflictResolution: "skip" | "overwrite" | "merge";
  validationLevel: "basic" | "strict" | "none";
  performanceThreshold: number;
}

/**
 * Recurring Task Generator
 */
export class RecurringTaskGenerator {
  private static instance: RecurringTaskGenerator;
  private generationConfig: GenerationConfig;
  private generationQueue: Array<{
    taskId: string;
    config: RecurringTaskConfig;
    forceRegenerate?: boolean;
  }> = [];
  private isGenerating: boolean = false;

  private constructor() {
    this.generationConfig = {
      maxInstancesPerTask: 50,
      maxFutureYears: 5,
      batchSize: 5,
      conflictResolution: "skip",
      validationLevel: "basic",
      performanceThreshold: 7,
    };
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): RecurringTaskGenerator {
    if (!RecurringTaskGenerator.instance) {
      RecurringTaskGenerator.instance = new RecurringTaskGenerator();
    }
    return RecurringTaskGenerator.instance;
  }

  /**
   * Initialize generator with custom configuration
   */
  initialize(config?: Partial<GenerationConfig>): void {
    this.generationConfig = {
      ...this.generationConfig,
      ...config,
    };
  }

  /**
   * Generate recurring task instances
   */
  async generateRecurringTaskInstances(
    taskId: string,
    config: RecurringTaskConfig,
    forceRegenerate: boolean = false,
  ): Promise<RecurringTaskInstance[]> {
    // Add to generation queue
    this.generationQueue.push({
      taskId,
      config,
      forceRegenerate,
    });

    // Process queue if not already processing
    if (!this.isGenerating) {
      await this.processGenerationQueue();
    }

    // Return the generated instances
    return this.getGeneratedInstancesForTask(taskId);
  }

  /**
   * Process the generation queue
   */
  private async processGenerationQueue(): Promise<void> {
    if (this.isGenerating) return;

    this.isGenerating = true;

    try {
      while (this.generationQueue.length > 0) {
        const batch = this.generationQueue.splice(
          0,
          this.generationConfig.batchSize,
        );

        await Promise.all(
          batch.map(async ({ taskId, config, forceRegenerate }) => {
            try {
              await this.generateInstancesForTask(
                taskId,
                config,
                forceRegenerate,
              );
            } catch (error) {
              console.error(
                `Failed to generate instances for task ${taskId}:`,
                error,
              );
            }
          }),
        );

        // Small delay between batches
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    } catch (error) {
      console.error("Error processing generation queue:", error);
    } finally {
      this.isGenerating = false;
    }
  }

  /**
   * Generate instances for a specific task
   */
  private async generateInstancesForTask(
    taskId: string,
    config: RecurringTaskConfig,
    forceRegenerate: boolean = false,
  ): Promise<void> {
    try {
      // Validate configuration
      const validation = this.validateGenerationConfig(config);
      if (!validation.valid) {
        throw new Error(
          `Invalid generation config: ${validation.errors.join(", ")}`,
        );
      }

      // Get the task
      const task = await recurringTaskService.getRecurringTask(taskId);
      if (!task) {
        throw new Error(`Task not found: ${taskId}`);
      }

      // Check if task is paused
      if (task.customFields?.isPaused) {
        console.log(`Skipping generation for paused task: ${taskId}`);
        return;
      }

      // Optimize configuration
      const optimizedConfig = this.optimizeGenerationConfig(config);

      // Generate instances
      if (forceRegenerate) {
        await this.regenerateAllInstances(task, optimizedConfig);
      } else {
        await this.generateMissingInstances(task, optimizedConfig);
      }
    } catch (error) {
      console.error(`Error generating instances for task ${taskId}:`, error);
      throw error;
    }
  }

  /**
   * Regenerate all instances for a task
   */
  private async regenerateAllInstances(
    task: Task,
    config: RecurringTaskConfig,
  ): Promise<void> {
    console.log(`Regenerating all instances for task: ${task.id}`);

    try {
      // Delete existing generated instances
      await this.deleteExistingInstances(task.id);

      // Generate new instances
      await this.generateNewInstances(task, config);
    } catch (error) {
      console.error(`Error regenerating instances for task ${task.id}:`, error);
      throw error;
    }
  }

  /**
   * Generate missing instances for a task
   */
  private async generateMissingInstances(
    task: Task,
    config: RecurringTaskConfig,
  ): Promise<void> {
    try {
      // Get current instances
      const currentInstances = recurringTaskService.getRecurringInstances(
        task.id,
      );

      // Find the most recent instance
      const recentInstance = currentInstances
        .filter((instance) => instance.dueDate)
        .sort(
          (a, b) => (b.dueDate?.getTime() || 0) - (a.dueDate?.getTime() || 0),
        )[0];

      const startDate = recentInstance?.dueDate || task.dueDate || new Date();

      // Generate missing future instances
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
   * Generate new instances for a task
   */
  private async generateNewInstances(
    task: Task,
    config: RecurringTaskConfig,
  ): Promise<void> {
    if (!task.dueDate) {
      throw new Error("Task must have a due date for instance generation");
    }

    try {
      const startDate = config.startDate || task.dueDate;
      const instances = recurringPatternManager.generateRecurringDatesAdvanced(
        startDate,
        config,
        this.generationConfig.maxInstancesPerTask,
      );

      // Create instances (skip the original task)
      for (const instance of instances.slice(1)) {
        if (instance.isGenerated) {
          await this.createRecurringInstance(task, instance, config);
        }
      }
    } catch (error) {
      console.error(
        `Error generating new instances for task ${task.id}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Generate future instances from a specific date
   */
  private async generateFutureInstances(
    task: Task,
    config: RecurringTaskConfig,
    startDate: Date,
  ): Promise<void> {
    try {
      const now = new Date();
      let currentDate = new Date(startDate);
      let generatedCount = 0;

      while (generatedCount < this.generationConfig.maxInstancesPerTask) {
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
          // Check if this instance already exists
          const existingInstance = await this.findExistingInstance(
            task.id,
            nextDate,
          );
          if (!existingInstance) {
            await this.createRecurringInstance(
              task,
              {
                id: `${task.id}-instance-${Date.now()}`,
                date: nextDate,
                isGenerated: true,
                originalDate: config.startDate || task.dueDate || new Date(),
                occurrenceNumber: generatedCount + 1,
              },
              config,
            );

            generatedCount++;
          }
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
   * Find existing instance by date
   */
  private async findExistingInstance(
    taskId: string,
    date: Date,
  ): Promise<Task | null> {
    try {
      const instances = recurringTaskService.getRecurringInstances(taskId);
      return (
        instances.find(
          (instance) =>
            instance.dueDate &&
            isEqual(startOfDay(instance.dueDate), startOfDay(date)),
        ) || null
      );
    } catch (error) {
      console.error(
        `Error finding existing instance for task ${taskId}:`,
        error,
      );
      return null;
    }
  }

  /**
   * Create a recurring instance
   */
  private async createRecurringInstance(
    task: Task,
    instance: RecurringInstance,
    config: RecurringTaskConfig,
  ): Promise<Task> {
    try {
      const dueDate = instance.date;
      const instanceId = `${task.id}-instance-${instance.occurrenceNumber}`;

      // Create the instance task
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
          recurringConfig: config,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        completed: false,
        status: "active" as TaskStatus,
      };

      // Create the task
      const createdTask = await recurringTaskService.createRecurringTask(
        newTask,
        config,
      );

      console.log(
        `Generated recurring instance ${instanceId} for task ${task.id}`,
      );
      return createdTask;
    } catch (error) {
      console.error(
        `Error creating recurring instance for task ${task.id}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Delete existing instances for a task
   */
  private async deleteExistingInstances(taskId: string): Promise<void> {
    try {
      const instances = recurringTaskService.getRecurringInstances(taskId);

      // Delete all generated instances (keep the original task)
      const instanceIds = instances
        .filter((instance) => instance.id !== taskId)
        .map((instance) => instance.id);

      if (instanceIds.length > 0) {
        await recurringTaskService.deleteRecurringInstances(instanceIds);
        console.log(
          `Deleted ${instanceIds.length} existing instances for task ${taskId}`,
        );
      }
    } catch (error) {
      console.error(
        `Error deleting existing instances for task ${taskId}:`,
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
      this.generationConfig.maxFutureYears,
    );
    if (isAfter(nextDate, futureLimit)) {
      return true;
    }

    return false;
  }

  /**
   * Validate generation configuration
   */
  private validateGenerationConfig(config: RecurringTaskConfig): {
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

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Optimize generation configuration
   */
  private optimizeGenerationConfig(
    config: RecurringTaskConfig,
  ): RecurringTaskConfig {
    // Get pattern complexity
    const complexity =
      recurringPatternManager.getPatternComplexityScore(config);

    // For high complexity patterns, limit the number of instances
    let maxOccurrences = config.maxOccurrences;
    if (complexity >= this.generationConfig.performanceThreshold) {
      maxOccurrences = Math.min(
        maxOccurrences || this.generationConfig.maxInstancesPerTask,
        20,
      );
    }

    return {
      ...config,
      maxOccurrences,
    };
  }

  /**
   * Get generated instances for a task
   */
  private getGeneratedInstancesForTask(
    taskId: string,
  ): RecurringTaskInstance[] {
    try {
      const instances = recurringTaskService.getRecurringInstances(taskId);
      return instances.map((instance, index) => ({
        id: instance.id,
        taskId: instance.id,
        date: instance.dueDate || new Date(),
        isGenerated: !!instance.customFields?.isRecurringInstance,
        originalTaskId: instance.customFields?.originalTaskId || taskId,
        occurrenceNumber: index + 1,
        status: instance.status,
        completed: instance.completed,
      }));
    } catch (error) {
      console.error(
        `Error getting generated instances for task ${taskId}:`,
        error,
      );
      return [];
    }
  }

  /**
   * Generate instances for all recurring tasks
   */
  async generateInstancesForAllRecurringTasks(): Promise<void> {
    try {
      console.log("Generating instances for all recurring tasks...");

      // Get all recurring tasks
      const recurringTasks = await recurringTaskService.getRecurringTasks();

      // Generate instances for each task
      for (const task of recurringTasks) {
        if (task.recurringPattern && task.customFields?.recurringConfig) {
          await this.generateRecurringTaskInstances(
            task.id,
            task.customFields.recurringConfig,
          );
        }
      }

      console.log(
        `Generated instances for ${recurringTasks.length} recurring tasks`,
      );
    } catch (error) {
      console.error(
        "Error generating instances for all recurring tasks:",
        error,
      );
      throw error;
    }
  }

  /**
   * Generate instances for overdue tasks
   */
  async generateInstancesForOverdueTasks(): Promise<void> {
    try {
      console.log("Generating instances for overdue recurring tasks...");

      // Get overdue instances
      const overdueInstances =
        await recurringTaskService.getOverdueRecurringInstances();

      // For each overdue instance, generate next instances
      for (const instance of overdueInstances) {
        const originalTask = await recurringTaskService.getRecurringTask(
          instance.customFields?.originalTaskId,
        );

        if (
          originalTask &&
          originalTask.recurringPattern &&
          !originalTask.customFields?.isPaused
        ) {
          await this.generateRecurringTaskInstances(
            originalTask.id,
            originalTask.customFields.recurringConfig,
            true, // Force regenerate
          );
        }
      }
    } catch (error) {
      console.error("Error generating instances for overdue tasks:", error);
      throw error;
    }
  }

  /**
   * Generate instances for upcoming tasks
   */
  async generateInstancesForUpcomingTasks(
    daysAhead: number = 30,
  ): Promise<void> {
    try {
      console.log(
        `Generating instances for upcoming recurring tasks (next ${daysAhead} days)...`,
      );

      // Get upcoming instances
      const upcomingInstances =
        await recurringTaskService.getUpcomingRecurringInstances(daysAhead);

      // For each upcoming instance, ensure we have enough future instances
      for (const instance of upcomingInstances) {
        const originalTask = await recurringTaskService.getRecurringTask(
          instance.customFields?.originalTaskId,
        );

        if (
          originalTask &&
          originalTask.recurringPattern &&
          !originalTask.customFields?.isPaused
        ) {
          await this.generateRecurringTaskInstances(
            originalTask.id,
            originalTask.customFields.recurringConfig,
          );
        }
      }
    } catch (error) {
      console.error("Error generating instances for upcoming tasks:", error);
      throw error;
    }
  }

  /**
   * Get generation statistics
   */
  async getGenerationStatistics(): Promise<{
    totalTasksProcessed: number;
    totalInstancesGenerated: number;
    averageInstancesPerTask: number;
    generationTime: number;
    queueLength: number;
    isGenerating: boolean;
  }> {
    // In a real implementation, this would track actual statistics
    return {
      totalTasksProcessed: 0,
      totalInstancesGenerated: 0,
      averageInstancesPerTask: 0,
      generationTime: 0,
      queueLength: this.generationQueue.length,
      isGenerating: this.isGenerating,
    };
  }

  /**
   * Get generation performance metrics
   */
  getGenerationPerformance(): {
    queueLength: number;
    isGenerating: boolean;
    averageGenerationTime: number;
    lastGenerated: Date | null;
  } {
    return {
      queueLength: this.generationQueue.length,
      isGenerating: this.isGenerating,
      averageGenerationTime: 0, // Would track in real implementation
      lastGenerated: null, // Would track in real implementation
    };
  }

  /**
   * Clean up old generated instances
   */
  async cleanupOldGeneratedInstances(
    maxAgeDays: number = 365,
  ): Promise<number> {
    try {
      console.log(
        `Cleaning up old generated instances (older than ${maxAgeDays} days)...`,
      );

      const cutoffDate = addDays(new Date(), -maxAgeDays);
      let deletedCount = 0;

      // Get all recurring tasks
      const recurringTasks = await recurringTaskService.getRecurringTasks();

      // For each task, clean up old instances
      for (const task of recurringTasks) {
        const instances = recurringTaskService.getRecurringInstances(task.id);

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
      }

      console.log(`Cleaned up ${deletedCount} old generated instances`);
      return deletedCount;
    } catch (error) {
      console.error("Error cleaning up old generated instances:", error);
      return 0;
    }
  }

  /**
   * Optimize instance generation
   */
  async optimizeInstanceGeneration(): Promise<void> {
    try {
      console.log("Optimizing instance generation...");

      // Get all recurring tasks
      const recurringTasks = await recurringTaskService.getRecurringTasks();

      // Analyze and optimize each task
      for (const task of recurringTasks) {
        await this.optimizeTaskGeneration(task);
      }
    } catch (error) {
      console.error("Error optimizing instance generation:", error);
      throw error;
    }
  }

  /**
   * Optimize generation for a specific task
   */
  private async optimizeTaskGeneration(task: Task): Promise<void> {
    if (!task.recurringPattern) return;

    try {
      const config = task.customFields?.recurringConfig;
      if (!config) return;

      // Get pattern complexity
      const complexity =
        recurringPatternManager.getPatternComplexityScore(config);

      // For high complexity patterns, consider reducing instance count
      if (complexity >= this.generationConfig.performanceThreshold) {
        console.warn(
          `Optimizing high complexity task ${task.id} (score: ${complexity})`,
        );

        // Get current instances
        const instances = recurringTaskService.getRecurringInstances(task.id);

        // If we have too many instances for a complex pattern, reduce
        if (instances.length > 30) {
          const optimizedConfig = {
            ...config,
            maxOccurrences: Math.min(config.maxOccurrences || 50, 25),
          };

          // Update task with optimized config and regenerate
          await recurringTaskService.updateRecurringTask(
            task.id,
            {},
            optimizedConfig,
          );
          await this.generateRecurringTaskInstances(
            task.id,
            optimizedConfig,
            true,
          );
        }
      }
    } catch (error) {
      console.error(`Error optimizing generation for task ${task.id}:`, error);
    }
  }

  /**
   * Get generation recommendations
   */
  async getGenerationRecommendations(): Promise<
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
          const instances = recurringTaskService.getRecurringInstances(task.id);

          // High complexity with many instances
          if (
            complexity >= this.generationConfig.performanceThreshold &&
            instances.length > 20
          ) {
            recommendations.push({
              taskId: task.id,
              recommendation:
                "High complexity pattern with many instances may impact performance",
              severity: "high",
              details: {
                complexityScore: complexity,
                instanceCount: instances.length,
                pattern: config.pattern,
              },
            });
          }

          // Very large number of instances
          if (instances.length > 100) {
            recommendations.push({
              taskId: task.id,
              recommendation:
                "Very large number of instances may cause performance issues",
              severity: "high",
              details: {
                instanceCount: instances.length,
                pattern: config.pattern,
              },
            });
          }

          // No end condition with many instances
          if (
            !config.endDate &&
            !config.maxOccurrences &&
            instances.length > 50
          ) {
            recommendations.push({
              taskId: task.id,
              recommendation:
                "No end condition with many instances - consider adding limits",
              severity: "medium",
              details: {
                instanceCount: instances.length,
                pattern: config.pattern,
              },
            });
          }
        }
      }

      return recommendations;
    } catch (error) {
      console.error("Error getting generation recommendations:", error);
      return [];
    }
  }

  /**
   * Start background generation
   */
  startBackgroundGeneration(intervalMinutes: number = 120): {
    stop: () => void;
  } {
    let intervalId: NodeJS.Timeout;

    const generator = () => {
      this.generateInstancesForAllRecurringTasks().catch((error) =>
        console.error("Background generation error:", error),
      );
    };

    // Initial run
    generator();

    // Set up interval
    intervalId = setInterval(generator, intervalMinutes * 60 * 1000);

    return {
      stop: () => {
        clearInterval(intervalId);
      },
    };
  }

  /**
   * Get generator status
   */
  getGeneratorStatus(): {
    isGenerating: boolean;
    queueLength: number;
    lastGeneration: Date | null;
    nextGeneration: Date | null;
  } {
    return {
      isGenerating: this.isGenerating,
      queueLength: this.generationQueue.length,
      lastGeneration: null, // Would track in real implementation
      nextGeneration: null, // Would track in real implementation
    };
  }

  /**
   * Generate preview instances for UI
   */
  generatePreviewInstances(
    startDate: Date,
    config: RecurringTaskConfig,
    count: number = 5,
  ): RecurringTaskInstance[] {
    try {
      return recurringPatternManager
        .generateRecurringDatesAdvanced(startDate, config, count)
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
    } catch (error) {
      console.error("Error generating preview instances:", error);
      return [];
    }
  }

  /**
   * Validate instance generation capability
   */
  validateInstanceGeneration(
    task: Task,
    config: RecurringTaskConfig,
  ): {
    canGenerate: boolean;
    reason?: string;
    warnings?: string[];
  } {
    try {
      if (!task.recurringPattern) {
        return {
          canGenerate: false,
          reason: "Task is not a recurring task",
        };
      }

      if (task.customFields?.isPaused) {
        return {
          canGenerate: false,
          reason: "Recurring task is paused",
        };
      }

      const validation =
        recurringPatternManager.validatePatternConfigAdvanced(config);
      if (!validation.valid) {
        return {
          canGenerate: false,
          reason: `Invalid configuration: ${validation.errors.join(", ")}`,
        };
      }

      // Check if we've reached end conditions
      const instances = recurringTaskService.getRecurringInstances(task.id);
      if (config.maxOccurrences && instances.length >= config.maxOccurrences) {
        return {
          canGenerate: false,
          reason: "Maximum occurrences reached",
        };
      }

      if (config.endDate && new Date(config.endDate) < new Date()) {
        return {
          canGenerate: false,
          reason: "End date has passed",
        };
      }

      return {
        canGenerate: true,
        warnings: validation.warnings,
      };
    } catch (error) {
      console.error("Error validating instance generation:", error);
      return {
        canGenerate: false,
        reason: "Validation error",
      };
    }
  }
}

// Singleton instance
export const recurringTaskGenerator = RecurringTaskGenerator.getInstance();
