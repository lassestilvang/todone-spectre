// @ts-nocheck
/**
 * Comprehensive Recurring Task Integration Hook
 * Integrates all recurring task services with React state management
 */
import { useState, useEffect, useCallback } from "react";
import { useRecurringTaskStore } from "../store/useRecurringTaskStore";
import { useRecurringTaskState } from "./useRecurringTaskState";
import { recurringTaskIntegration } from "../services/recurringTaskIntegration";
import { recurringTaskScheduler } from "../services/recurringTaskScheduler";
import { recurringTaskGenerator } from "../services/recurringTaskGenerator";
import {
  Task,
  RecurringTaskConfig,
  RecurringTaskInstance,
} from "../types/task";
import { RecurringPattern, TaskStatus } from "../types/enums";

/**
 * Recurring Task Integration Hook Return Type
 */
export interface UseRecurringTaskIntegrationReturn {
  // State from integrated services
  recurringTasks: Task[];
  recurringTaskInstances: RecurringTaskInstance[];
  isLoading: boolean;
  error: string | null;
  systemStatus: {
    healthScore: number;
    issuesCount: number;
    recommendationsCount: number;
  };

  // Comprehensive CRUD Operations
  createRecurringTaskIntegrated: (
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "completed">,
    config: RecurringTaskConfig,
  ) => Promise<Task>;

  updateRecurringTaskIntegrated: (
    taskId: string,
    updates: Partial<Task>,
    configUpdates?: Partial<RecurringTaskConfig>,
  ) => Promise<Task>;

  deleteRecurringTaskIntegrated: (taskId: string) => Promise<void>;

  // Comprehensive Instance Management
  completeRecurringInstanceIntegrated: (instanceId: string) => Promise<Task>;
  generateNextInstanceIntegrated: (taskId: string) => Promise<Task | null>;
  regenerateAllInstancesIntegrated: (taskId: string) => Promise<void>;

  // Pattern Management
  updateRecurringPatternIntegrated: (
    taskId: string,
    pattern: RecurringPattern,
  ) => Promise<void>;
  updateRecurringConfigIntegrated: (
    taskId: string,
    config: RecurringTaskConfig,
  ) => Promise<void>;

  // State Management
  pauseRecurringTaskIntegrated: (taskId: string) => Promise<void>;
  resumeRecurringTaskIntegrated: (taskId: string) => Promise<void>;

  // System Operations
  runFullSystemOptimization: () => Promise<void>;
  getSystemHealthReport: () => Promise<{
    healthScore: number;
    issues: any[];
    recommendations: any[];
  }>;
  getSystemWideStatistics: () => Promise<any>;

  // Background Processing
  startBackgroundProcessing: () => {
    stopScheduling: () => void;
    stopGeneration: () => void;
    stopAll: () => void;
  };

  // Validation and Diagnostics
  validateSystem: () => Promise<{
    isValid: boolean;
    validationResults: any[];
  }>;

  // Configuration Management
  exportSystemConfiguration: () => string;
  importSystemConfiguration: (configData: string) => {
    success: boolean;
    message: string;
  };

  // Utility Methods
  getComprehensiveTaskData: (taskId: string) => Promise<any>;
  getIntegrationStatus: () => any;

  // Event Handlers
  onSystemHealthChange: (callback: (healthScore: number) => void) => void;
  onSystemStatusChange: (callback: (status: any) => void) => void;
}

/**
 * Comprehensive Recurring Task Integration Hook
 */
export const useRecurringTaskIntegration =
  (): UseRecurringTaskIntegrationReturn => {
    // Get state from store
    const { recurringTasks, recurringTaskInstances, isLoading, error } =
      useRecurringTaskStore();

    // Get state management functions
    const {
      createRecurringTaskWithState,
      updateRecurringTaskWithState,
      deleteRecurringTaskWithState,
      completeRecurringInstanceWithState,
      generateNextInstanceWithState,
      regenerateAllInstancesWithState,
      pauseRecurringTaskWithState,
      resumeRecurringTaskWithState,
    } = useRecurringTaskState();

    // Local state for system monitoring
    const [systemStatus, setSystemStatus] = useState({
      healthScore: 100,
      issuesCount: 0,
      recommendationsCount: 0,
    });

    const [healthCallbacks, setHealthCallbacks] = useState<
      Array<(score: number) => void>
    >([]);
    const [statusCallbacks, setStatusCallbacks] = useState<
      Array<(status: any) => void>
    >([]);

    // Initialize the integration service
    useEffect(() => {
      recurringTaskIntegration.initialize();
    }, []);

    /**
     * Create recurring task with full integration
     */
    const createRecurringTaskIntegrated = useCallback(
      async (
        taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "completed">,
        config: RecurringTaskConfig,
      ): Promise<Task> => {
        try {
          const newTask =
            await recurringTaskIntegration.createRecurringTaskIntegrated(
              taskData,
              config,
            );
          await updateSystemStatus();
          return newTask;
        } catch (error) {
          console.error("Error in createRecurringTaskIntegrated:", error);
          throw error;
        }
      },
      [updateSystemStatus],
    );

    /**
     * Update recurring task with full integration
     */
    const updateRecurringTaskIntegrated = useCallback(
      async (
        taskId: string,
        updates: Partial<Task>,
        configUpdates?: Partial<RecurringTaskConfig>,
      ): Promise<Task> => {
        try {
          const updatedTask =
            await recurringTaskIntegration.updateRecurringTaskIntegrated(
              taskId,
              updates,
              configUpdates,
            );
          await updateSystemStatus();
          return updatedTask;
        } catch (error) {
          console.error("Error in updateRecurringTaskIntegrated:", error);
          throw error;
        }
      },
      [updateSystemStatus],
    );

    /**
     * Delete recurring task with full integration
     */
    const deleteRecurringTaskIntegrated = useCallback(
      async (taskId: string): Promise<void> => {
        try {
          await recurringTaskIntegration.deleteRecurringTaskIntegrated(taskId);
          await updateSystemStatus();
        } catch (error) {
          console.error("Error in deleteRecurringTaskIntegrated:", error);
          throw error;
        }
      },
      [updateSystemStatus],
    );

    /**
     * Complete recurring instance with full integration
     */
    const completeRecurringInstanceIntegrated = useCallback(
      async (instanceId: string): Promise<Task> => {
        try {
          const completedInstance =
            await recurringTaskIntegration.completeRecurringInstanceIntegrated(
              instanceId,
            );
          await updateSystemStatus();
          return completedInstance;
        } catch (error) {
          console.error("Error in completeRecurringInstanceIntegrated:", error);
          throw error;
        }
      },
      [updateSystemStatus],
    );

    /**
     * Generate next instance with full integration
     */
    const generateNextInstanceIntegrated = useCallback(
      async (taskId: string): Promise<Task | null> => {
        try {
          const newInstance =
            await recurringTaskIntegration.generateNextInstanceIntegrated(
              taskId,
            );
          await updateSystemStatus();
          return newInstance;
        } catch (error) {
          console.error("Error in generateNextInstanceIntegrated:", error);
          throw error;
        }
      },
      [updateSystemStatus],
    );

    /**
     * Regenerate all instances with full integration
     */
    const regenerateAllInstancesIntegrated = useCallback(
      async (taskId: string): Promise<void> => {
        try {
          await recurringTaskIntegration.regenerateAllInstancesIntegrated(
            taskId,
          );
          await updateSystemStatus();
        } catch (error) {
          console.error("Error in regenerateAllInstancesIntegrated:", error);
          throw error;
        }
      },
      [updateSystemStatus],
    );

    /**
     * Update recurring pattern with full integration
     */
    const updateRecurringPatternIntegrated = useCallback(
      async (taskId: string, pattern: RecurringPattern): Promise<void> => {
        try {
          await updateRecurringTaskIntegrated(
            taskId,
            { recurringPattern: pattern },
            { pattern },
          );
        } catch (error) {
          console.error("Error in updateRecurringPatternIntegrated:", error);
          throw error;
        }
      },
      [updateRecurringTaskIntegrated],
    );

    /**
     * Update recurring config with full integration
     */
    const updateRecurringConfigIntegrated = useCallback(
      async (taskId: string, config: RecurringTaskConfig): Promise<void> => {
        try {
          await updateRecurringTaskIntegrated(taskId, {}, config);
        } catch (error) {
          console.error("Error in updateRecurringConfigIntegrated:", error);
          throw error;
        }
      },
      [updateRecurringTaskIntegrated],
    );

    /**
     * Pause recurring task with full integration
     */
    const pauseRecurringTaskIntegrated = useCallback(
      async (taskId: string): Promise<void> => {
        try {
          await pauseRecurringTaskWithState(taskId);
          await updateSystemStatus();
        } catch (error) {
          console.error("Error in pauseRecurringTaskIntegrated:", error);
          throw error;
        }
      },
      [pauseRecurringTaskWithState, updateSystemStatus],
    );

    /**
     * Resume recurring task with full integration
     */
    const resumeRecurringTaskIntegrated = useCallback(
      async (taskId: string): Promise<void> => {
        try {
          await resumeRecurringTaskWithState(taskId);
          await updateSystemStatus();
        } catch (error) {
          console.error("Error in resumeRecurringTaskIntegrated:", error);
          throw error;
        }
      },
      [resumeRecurringTaskWithState, updateSystemStatus],
    );

    /**
     * Run full system optimization
     */
    const runFullSystemOptimization = useCallback(async (): Promise<void> => {
      try {
        await recurringTaskIntegration.runFullSystemOptimization();
        await updateSystemStatus();
      } catch (error) {
        console.error("Error in runFullSystemOptimization:", error);
        throw error;
      }
    }, [updateSystemStatus]);

    /**
     * Get system health report
     */
    const getSystemHealthReport = useCallback(async () => {
      try {
        const report = await recurringTaskIntegration.getSystemHealthReport();
        return report;
      } catch (error) {
        console.error("Error in getSystemHealthReport:", error);
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
    }, []);

    /**
     * Get system-wide statistics
     */
    const getSystemWideStatistics = useCallback(async () => {
      try {
        return await recurringTaskIntegration.getSystemWideStatistics();
      } catch (error) {
        console.error("Error in getSystemWideStatistics:", error);
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
    }, []);

    /**
     * Start background processing
     */
    const startBackgroundProcessing = useCallback((): {
      stopScheduling: () => void;
      stopGeneration: () => void;
      stopAll: () => void;
    } => {
      return recurringTaskIntegration.startBackgroundProcessing();
    }, []);

    /**
     * Validate system
     */
    const validateSystem = useCallback(async () => {
      try {
        return await recurringTaskIntegration.runSystemValidation();
      } catch (error) {
        console.error("Error in validateSystem:", error);
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
    }, []);

    /**
     * Export system configuration
     */
    const exportSystemConfiguration = useCallback((): string => {
      try {
        return recurringTaskIntegration.exportSystemConfiguration();
      } catch (error) {
        console.error("Error in exportSystemConfiguration:", error);
        return JSON.stringify({
          error: "Failed to export configuration",
          details: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }, []);

    /**
     * Import system configuration
     */
    const importSystemConfiguration = useCallback(
      (configData: string): { success: boolean; message: string } => {
        try {
          return recurringTaskIntegration.importSystemConfiguration(configData);
        } catch (error) {
          console.error("Error in importSystemConfiguration:", error);
          return {
            success: false,
            message: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      [],
    );

    /**
     * Get comprehensive task data
     */
    const getComprehensiveTaskData = useCallback(async (taskId: string) => {
      try {
        return await recurringTaskIntegration.getComprehensiveRecurringTaskData(
          taskId,
        );
      } catch (error) {
        console.error("Error in getComprehensiveTaskData:", error);
        return {
          task: null,
          instances: [],
          stats: {
            totalInstances: 0,
            completedInstances: 0,
            pendingInstances: 0,
          },
          schedulingInfo: {
            isScheduled: false,
          },
        };
      }
    }, []);

    /**
     * Get integration status
     */
    const getIntegrationStatus = useCallback(() => {
      try {
        return recurringTaskIntegration.getIntegrationStatus();
      } catch (error) {
        console.error("Error in getIntegrationStatus:", error);
        return {
          services: [],
          systemLoad: 0,
          memoryUsage: 0,
        };
      }
    }, []);

    /**
     * Update system status
     */
    const updateSystemStatus = useCallback(async () => {
      try {
        const healthReport = await getSystemHealthReport();
        setSystemStatus({
          healthScore: healthReport.healthScore,
          issuesCount: healthReport.issues.length,
          recommendationsCount: healthReport.recommendations.length,
        });

        // Notify health callbacks
        healthCallbacks.forEach((callback) =>
          callback(healthReport.healthScore),
        );

        // Notify status callbacks
        const status = getIntegrationStatus();
        statusCallbacks.forEach((callback) => callback(status));
      } catch (error) {
        console.error("Error updating system status:", error);
      }
    }, [
      getSystemHealthReport,
      getIntegrationStatus,
      healthCallbacks,
      statusCallbacks,
    ]);

    /**
     * Register health change callback
     */
    const onSystemHealthChange = useCallback(
      (callback: (score: number) => void) => {
        setHealthCallbacks((prev) => [...prev, callback]);
      },
      [],
    );

    /**
     * Register status change callback
     */
    const onSystemStatusChange = useCallback(
      (callback: (status: any) => void) => {
        setStatusCallbacks((prev) => [...prev, callback]);
      },
      [],
    );

    // Set up periodic system status updates
    useEffect(() => {
      const interval = setInterval(() => {
        updateSystemStatus();
      }, 30000); // Update every 30 seconds

      // Initial update
      updateSystemStatus();

      return () => clearInterval(interval);
    }, [updateSystemStatus]);

    return {
      // State
      recurringTasks,
      recurringTaskInstances,
      isLoading,
      error,
      systemStatus,

      // Comprehensive CRUD Operations
      createRecurringTaskIntegrated,
      updateRecurringTaskIntegrated,
      deleteRecurringTaskIntegrated,

      // Comprehensive Instance Management
      completeRecurringInstanceIntegrated,
      generateNextInstanceIntegrated,
      regenerateAllInstancesIntegrated,

      // Pattern Management
      updateRecurringPatternIntegrated,
      updateRecurringConfigIntegrated,

      // State Management
      pauseRecurringTaskIntegrated,
      resumeRecurringTaskIntegrated,

      // System Operations
      runFullSystemOptimization,
      getSystemHealthReport,
      getSystemWideStatistics,

      // Background Processing
      startBackgroundProcessing,

      // Validation and Diagnostics
      validateSystem,

      // Configuration Management
      exportSystemConfiguration,
      importSystemConfiguration,

      // Utility Methods
      getComprehensiveTaskData,
      getIntegrationStatus,

      // Event Handlers
      onSystemHealthChange,
      onSystemStatusChange,
    };
  };
