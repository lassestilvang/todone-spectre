/**
 * Recurring Task Integration Service
 * Comprehensive integration layer connecting all recurring task services
 */
import {
  Task,
  RecurringTaskConfig,
  RecurringTaskInstance,
} from "../types/task";
import { RecurringPattern, TaskStatus } from "../types/enums";
import { recurringTaskService } from "./recurringTaskService";
import { recurringPatternManager } from "./recurringPatternManager";
import { recurringTaskScheduler } from "./recurringTaskScheduler";
import { recurringTaskGenerator } from "./recurringTaskGenerator";
import { useRecurringTaskStore } from "../store/useRecurringTaskStore";

/**
 * Recurring Task Integration Service
 */
export class RecurringTaskIntegration {
  private static instance: RecurringTaskIntegration;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): RecurringTaskIntegration {
    if (!RecurringTaskIntegration.instance) {
      RecurringTaskIntegration.instance = new RecurringTaskIntegration();
    }
    return RecurringTaskIntegration.instance;
  }

  /**
   * Initialize all recurring task services
   */
  initialize(): void {
    // Initialize all services with default configurations
    recurringTaskScheduler.initialize();
    recurringTaskGenerator.initialize();
  }

  /**
   * Create recurring task with full integration
   */
  async createRecurringTaskIntegrated(
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "completed">,
    config: RecurringTaskConfig,
  ): Promise<Task> {
    try {
      // Validate configuration
      const validation =
        recurringPatternManager.validatePatternConfigAdvanced(config);
      if (!validation.valid) {
        throw new Error(
          `Invalid configuration: ${validation.errors.join(", ")}`,
        );
      }

      // Create task using service
      const newTask = await recurringTaskService.createRecurringTask(
        taskData,
        config,
      );

      // Generate instances using generator
      await recurringTaskGenerator.generateRecurringTaskInstances(
        newTask.id,
        config,
      );

      // Schedule the task
      await recurringTaskScheduler.scheduleRecurringTask(newTask.id);

      // Add to store
      useRecurringTaskStore.getState().addRecurringTask(newTask);

      return newTask;
    } catch (error) {
      console.error("Error creating recurring task with integration:", error);
      throw error;
    }
  }

  /**
   * Update recurring task with full integration
   */
  async updateRecurringTaskIntegrated(
    taskId: string,
    updates: Partial<Task>,
    configUpdates?: Partial<RecurringTaskConfig>,
  ): Promise<Task> {
    try {
      // Update task using service
      const updatedTask = await recurringTaskService.updateRecurringTask(
        taskId,
        updates,
        configUpdates,
      );

      // If config changed, regenerate instances
      if (configUpdates) {
        const task = await recurringTaskService.getRecurringTask(taskId);
        if (task) {
          const updatedConfig = {
            ...task.customFields?.recurringConfig,
            ...configUpdates,
          };

          // Regenerate instances
          await recurringTaskGenerator.generateRecurringTaskInstances(
            taskId,
            updatedConfig,
            true,
          );

          // Reschedule the task
          await recurringTaskScheduler.scheduleRecurringTask(taskId, true);
        }
      }

      // Update in store
      useRecurringTaskStore.getState().updateRecurringTask(taskId, updates);

      return updatedTask;
    } catch (error) {
      console.error("Error updating recurring task with integration:", error);
      throw error;
    }
  }

  /**
   * Delete recurring task with full integration
   */
  async deleteRecurringTaskIntegrated(taskId: string): Promise<void> {
    try {
      // Delete using service
      await recurringTaskService.deleteRecurringTask(taskId);

      // Remove from scheduler queue
      // Note: In a real implementation, we would have access to the scheduler's internal queue

      // Remove from store
      useRecurringTaskStore.getState().deleteRecurringTask(taskId);
    } catch (error) {
      console.error("Error deleting recurring task with integration:", error);
      throw error;
    }
  }

  /**
   * Complete recurring instance with full integration
   */
  async completeRecurringInstanceIntegrated(instanceId: string): Promise<Task> {
    try {
      // Complete using service
      const completedInstance =
        await recurringTaskService.completeRecurringInstance(instanceId);

      // Update in store
      useRecurringTaskStore.getState().updateRecurringInstance(instanceId, {
        completed: true,
        status: "completed" as TaskStatus,
      });

      // Check if we need to generate next instance
      const instance = await recurringTaskService.getRecurringTask(instanceId);
      if (instance) {
        const originalTask = await recurringTaskService.getRecurringTask(
          instance.customFields?.originalTaskId,
        );

        if (
          originalTask &&
          originalTask.recurringPattern &&
          !originalTask.customFields?.isPaused
        ) {
          // Generate next instance
          await recurringTaskGenerator.generateRecurringTaskInstances(
            originalTask.id,
            originalTask.customFields?.recurringConfig,
          );

          // Schedule the task
          await recurringTaskScheduler.scheduleRecurringTask(originalTask.id);
        }
      }

      return completedInstance;
    } catch (error) {
      console.error(
        "Error completing recurring instance with integration:",
        error,
      );
      throw error;
    }
  }

  /**
   * Generate next instance with full integration
   */
  async generateNextInstanceIntegrated(taskId: string): Promise<Task | null> {
    try {
      // Generate using generator
      const newInstance =
        await recurringTaskGenerator.generateRecurringTaskInstances(
          taskId,
          (await recurringTaskService.getRecurringTask(taskId))?.customFields
            ?.recurringConfig,
        );

      // Schedule the task
      await recurringTaskScheduler.scheduleRecurringTask(taskId);

      return newInstance || null;
    } catch (error) {
      console.error("Error generating next instance with integration:", error);
      throw error;
    }
  }

  /**
   * Regenerate all instances with full integration
   */
  async regenerateAllInstancesIntegrated(taskId: string): Promise<void> {
    try {
      const task = await recurringTaskService.getRecurringTask(taskId);
      if (!task) return;

      // Regenerate using generator
      await recurringTaskGenerator.generateRecurringTaskInstances(
        taskId,
        task.customFields?.recurringConfig,
        true,
      );

      // Reschedule the task
      await recurringTaskScheduler.scheduleRecurringTask(taskId, true);
    } catch (error) {
      console.error("Error regenerating instances with integration:", error);
      throw error;
    }
  }

  /**
   * Get comprehensive recurring task data
   */
  async getComprehensiveRecurringTaskData(taskId: string): Promise<{
    task: Task;
    instances: RecurringTaskInstance[];
    stats: {
      totalInstances: number;
      completedInstances: number;
      pendingInstances: number;
      nextInstanceDate?: Date;
    };
    schedulingInfo: {
      isScheduled: boolean;
      nextScheduledDate?: Date;
    };
  }> {
    try {
      // Get task
      const task = await recurringTaskService.getRecurringTask(taskId);
      if (!task) {
        throw new Error("Task not found");
      }

      // Get instances
      const instances = recurringTaskService.getRecurringInstances(taskId);

      // Get stats
      const stats = useRecurringTaskStore
        .getState()
        .getRecurringTaskStats(taskId);

      // Get scheduling info
      const schedulingStats =
        await recurringTaskScheduler.getSchedulingStatistics();

      return {
        task,
        instances: instances.map((instance, index) => ({
          id: instance.id,
          taskId: instance.id,
          date: instance.dueDate || new Date(),
          isGenerated: !!instance.customFields?.isRecurringInstance,
          originalTaskId: instance.customFields?.originalTaskId || taskId,
          occurrenceNumber: index + 1,
          status: instance.status,
          completed: instance.completed,
        })),
        stats,
        schedulingInfo: {
          isScheduled: true,
          nextScheduledDate: schedulingStats.nextScheduledDate,
        },
      };
    } catch (error) {
      console.error("Error getting comprehensive recurring task data:", error);
      throw error;
    }
  }

  /**
   * Get system-wide recurring task statistics
   */
  async getSystemWideStatistics(): Promise<{
    recurringTasks: {
      total: number;
      active: number;
      paused: number;
      byPattern: Record<RecurringPattern, number>;
    };
    instances: {
      total: number;
      completed: number;
      pending: number;
      overdue: number;
    };
    scheduling: {
      queueLength: number;
      isProcessing: boolean;
      lastProcessed?: Date;
    };
    generation: {
      queueLength: number;
      isGenerating: boolean;
      lastGenerated?: Date;
    };
  }> {
    try {
      // Get task stats
      const taskStats =
        await recurringTaskService.getRecurringTaskCompletionStats();
      const patternDistribution =
        await recurringTaskService.getRecurringTaskPatternDistribution();

      // Get scheduling stats
      const schedulingStats = recurringTaskScheduler.getSchedulingPerformance();

      // Get generation stats
      const generationStats = recurringTaskGenerator.getGenerationPerformance();

      return {
        recurringTasks: {
          total: taskStats.totalRecurringTasks,
          active: taskStats.activeRecurringTasks,
          paused: taskStats.pausedRecurringTasks,
          byPattern: patternDistribution,
        },
        instances: {
          total: taskStats.completedInstances + taskStats.pendingInstances,
          completed: taskStats.completedInstances,
          pending: taskStats.pendingInstances,
          overdue: 0, // Would calculate in real implementation
        },
        scheduling: {
          queueLength: schedulingStats.queueLength,
          isProcessing: schedulingStats.isProcessing,
          lastProcessed: schedulingStats.lastProcessed,
        },
        generation: {
          queueLength: generationStats.queueLength,
          isGenerating: generationStats.isGenerating,
          lastGenerated: generationStats.lastGenerated,
        },
      };
    } catch (error) {
      console.error("Error getting system-wide statistics:", error);
      return {
        recurringTasks: {
          total: 0,
          active: 0,
          paused: 0,
          byPattern: {
            daily: 0,
            weekly: 0,
            monthly: 0,
            yearly: 0,
            custom: 0,
          },
        },
        instances: {
          total: 0,
          completed: 0,
          pending: 0,
          overdue: 0,
        },
        scheduling: {
          queueLength: 0,
          isProcessing: false,
        },
        generation: {
          queueLength: 0,
          isGenerating: false,
        },
      };
    }
  }

  /**
   * Run full system optimization
   */
  async runFullSystemOptimization(): Promise<void> {
    try {
      console.log("Running full recurring task system optimization...");

      // Optimize scheduling
      await recurringTaskScheduler.optimizeScheduling();

      // Optimize generation
      await recurringTaskGenerator.optimizeInstanceGeneration();

      // Clean up old instances
      await recurringTaskGenerator.cleanupOldGeneratedInstances();

      console.log("Full system optimization completed");
    } catch (error) {
      console.error("Error running full system optimization:", error);
      throw error;
    }
  }

  /**
   * Get system health report
   */
  async getSystemHealthReport(): Promise<{
    healthScore: number;
    issues: Array<{
      severity: "critical" | "warning" | "info";
      message: string;
      details: any;
    }>;
    recommendations: Array<{
      priority: "high" | "medium" | "low";
      recommendation: string;
      action: string;
    }>;
  }> {
    try {
      const issues: Array<{
        severity: "critical" | "warning" | "info";
        message: string;
        details: any;
      }> = [];

      const recommendations: Array<{
        priority: "high" | "medium" | "low";
        recommendation: string;
        action: string;
      }> = [];

      let healthScore = 100;

      // Get system statistics
      const stats = await this.getSystemWideStatistics();

      // Check for critical issues
      if (stats.scheduling.queueLength > 50) {
        issues.push({
          severity: "warning",
          message: "High scheduling queue length",
          details: {
            queueLength: stats.scheduling.queueLength,
            threshold: 50,
          },
        });
        healthScore -= 10;
      }

      if (stats.generation.queueLength > 50) {
        issues.push({
          severity: "warning",
          message: "High generation queue length",
          details: {
            queueLength: stats.generation.queueLength,
            threshold: 50,
          },
        });
        healthScore -= 10;
      }

      // Check for performance issues
      if (stats.recurringTasks.total > 1000) {
        issues.push({
          severity: "warning",
          message: "Very large number of recurring tasks",
          details: {
            totalTasks: stats.recurringTasks.total,
            threshold: 1000,
          },
        });
        healthScore -= 15;
        recommendations.push({
          priority: "high",
          recommendation: "Consider archiving or deleting old recurring tasks",
          action: "Review and clean up recurring tasks",
        });
      }

      if (stats.instances.total > 5000) {
        issues.push({
          severity: "critical",
          message: "Extremely large number of recurring instances",
          details: {
            totalInstances: stats.instances.total,
            threshold: 5000,
          },
        });
        healthScore -= 25;
        recommendations.push({
          priority: "high",
          recommendation: "Immediately clean up old recurring instances",
          action: "Run cleanup and optimization",
        });
      }

      // Get scheduling recommendations
      const schedulingRecommendations =
        await recurringTaskScheduler.getSchedulingRecommendations();
      schedulingRecommendations.forEach((rec) => {
        recommendations.push({
          priority:
            rec.severity === "high"
              ? "high"
              : rec.severity === "medium"
                ? "medium"
                : "low",
          recommendation: rec.recommendation,
          action: `Review task ${rec.taskId}`,
        });
      });

      // Get generation recommendations
      const generationRecommendations =
        await recurringTaskGenerator.getGenerationRecommendations();
      generationRecommendations.forEach((rec) => {
        recommendations.push({
          priority:
            rec.severity === "high"
              ? "high"
              : rec.severity === "medium"
                ? "medium"
                : "low",
          recommendation: rec.recommendation,
          action: `Review task ${rec.taskId}`,
        });
      });

      // Cap health score
      healthScore = Math.max(0, Math.min(100, healthScore));

      return {
        healthScore,
        issues,
        recommendations,
      };
    } catch (error) {
      console.error("Error getting system health report:", error);
      return {
        healthScore: 50,
        issues: [
          {
            severity: "critical",
            message: "Failed to generate health report",
            details: {
              error: error instanceof Error ? error.message : "Unknown error",
            },
          },
        ],
        recommendations: [
          {
            priority: "high",
            recommendation: "Check system logs for errors",
            action: "Review error details",
          },
        ],
      };
    }
  }

  /**
   * Start background processing
   */
  startBackgroundProcessing(): {
    stopScheduling: () => void;
    stopGeneration: () => void;
    stopAll: () => void;
  } {
    const scheduling = recurringTaskScheduler.startBackgroundScheduling(60); // Every 60 minutes
    const generation = recurringTaskGenerator.startBackgroundGeneration(120); // Every 120 minutes

    return {
      stopScheduling: scheduling.stop,
      stopGeneration: generation.stop,
      stopAll: () => {
        scheduling.stop();
        generation.stop();
      },
    };
  }

  /**
   * Get integration status
   */
  getIntegrationStatus(): {
    services: Array<{
      name: string;
      status: "active" | "inactive" | "error";
      details: any;
    }>;
    systemLoad: number;
    memoryUsage: number;
  } {
    // In a real implementation, this would check actual service statuses
    return {
      services: [
        {
          name: "RecurringTaskService",
          status: "active",
          details: { version: "1.0" },
        },
        {
          name: "RecurringPatternManager",
          status: "active",
          details: { version: "1.0" },
        },
        {
          name: "RecurringTaskScheduler",
          status: "active",
          details: { version: "1.0" },
        },
        {
          name: "RecurringTaskGenerator",
          status: "active",
          details: { version: "1.0" },
        },
        {
          name: "RecurringTaskStore",
          status: "active",
          details: { version: "1.0" },
        },
      ],
      systemLoad: 0.3, // Would measure actual load
      memoryUsage: 0.4, // Would measure actual memory usage
    };
  }

  /**
   * Run comprehensive system validation
   */
  async runSystemValidation(): Promise<{
    isValid: boolean;
    validationResults: Array<{
      component: string;
      status: "pass" | "fail" | "warning";
      message: string;
      details: any;
    }>;
  }> {
    try {
      const validationResults: Array<{
        component: string;
        status: "pass" | "fail" | "warning";
        message: string;
        details: any;
      }> = [];

      // Validate services are available
      if (recurringTaskService) {
        validationResults.push({
          component: "RecurringTaskService",
          status: "pass",
          message: "Service available",
          details: {},
        });
      } else {
        validationResults.push({
          component: "RecurringTaskService",
          status: "fail",
          message: "Service not available",
          details: {},
        });
      }

      // Validate pattern manager
      if (recurringPatternManager) {
        validationResults.push({
          component: "RecurringPatternManager",
          status: "pass",
          message: "Pattern manager available",
          details: {},
        });
      } else {
        validationResults.push({
          component: "RecurringPatternManager",
          status: "fail",
          message: "Pattern manager not available",
          details: {},
        });
      }

      // Validate scheduler
      if (recurringTaskScheduler) {
        validationResults.push({
          component: "RecurringTaskScheduler",
          status: "pass",
          message: "Scheduler available",
          details: {},
        });
      } else {
        validationResults.push({
          component: "RecurringTaskScheduler",
          status: "fail",
          message: "Scheduler not available",
          details: {},
        });
      }

      // Validate generator
      if (recurringTaskGenerator) {
        validationResults.push({
          component: "RecurringTaskGenerator",
          status: "pass",
          message: "Generator available",
          details: {},
        });
      } else {
        validationResults.push({
          component: "RecurringTaskGenerator",
          status: "fail",
          message: "Generator not available",
          details: {},
        });
      }

      // Validate store
      try {
        const storeState = useRecurringTaskStore.getState();
        if (storeState) {
          validationResults.push({
            component: "RecurringTaskStore",
            status: "pass",
            message: "Store available",
            details: {
              taskCount: storeState.recurringTasks.length,
              instanceCount: storeState.recurringTaskInstances.length,
            },
          });
        } else {
          validationResults.push({
            component: "RecurringTaskStore",
            status: "fail",
            message: "Store not available",
            details: {},
          });
        }
      } catch (error) {
        validationResults.push({
          component: "RecurringTaskStore",
          status: "fail",
          message: "Store error",
          details: {
            error: error instanceof Error ? error.message : "Unknown error",
          },
        });
      }

      // Check for any critical failures
      const hasCriticalFailures = validationResults.some(
        (result) => result.status === "fail",
      );
      const hasWarnings = validationResults.some(
        (result) => result.status === "warning",
      );

      return {
        isValid: !hasCriticalFailures,
        validationResults,
      };
    } catch (error) {
      console.error("Error running system validation:", error);
      return {
        isValid: false,
        validationResults: [
          {
            component: "SystemValidation",
            status: "fail",
            message: "Validation failed",
            details: {
              error: error instanceof Error ? error.message : "Unknown error",
            },
          },
        ],
      };
    }
  }

  /**
   * Export system configuration
   */
  exportSystemConfiguration(): string {
    try {
      return JSON.stringify(
        {
          services: {
            recurringTaskService: "active",
            recurringPatternManager: "active",
            recurringTaskScheduler: "active",
            recurringTaskGenerator: "active",
            recurringTaskStore: "active",
          },
          configurations: {
            scheduler: recurringTaskScheduler["schedulingConfig"],
            generator: recurringTaskGenerator["generationConfig"],
          },
          exportDate: new Date().toISOString(),
          version: "1.0.0",
        },
        null,
        2,
      );
    } catch (error) {
      console.error("Error exporting system configuration:", error);
      return JSON.stringify({
        error: "Failed to export configuration",
        details: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Import system configuration
   */
  importSystemConfiguration(configData: string): {
    success: boolean;
    message: string;
  } {
    try {
      const config = JSON.parse(configData);

      // Validate configuration
      if (!config || !config.services || !config.configurations) {
        return {
          success: false,
          message: "Invalid configuration format",
        };
      }

      // Apply configurations
      if (config.configurations.scheduler) {
        recurringTaskScheduler.initialize(config.configurations.scheduler);
      }

      if (config.configurations.generator) {
        recurringTaskGenerator.initialize(config.configurations.generator);
      }

      return {
        success: true,
        message: "Configuration imported successfully",
      };
    } catch (error) {
      console.error("Error importing system configuration:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

// Singleton instance
export const recurringTaskIntegration = RecurringTaskIntegration.getInstance();
