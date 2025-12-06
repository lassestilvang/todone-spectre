// @ts-nocheck
/**
 * Custom hook for recurring task management
 * Provides comprehensive state management, CRUD operations, and integration with task system
 */

import { useState, useEffect, useCallback } from "react";
import {
  Task,
  RecurringTaskConfig,
  RecurringTaskInstance,
  RecurringTaskStats,
} from "../types/task";
import { RecurringPattern, TaskStatus, PriorityLevel } from "../types/enums";
import { recurringTaskService } from "../services/recurringTaskService";
import { useTaskStore } from "../store/useTaskStore";
import { useTasks } from "./useTasks";
import { validateRecurringTaskConfiguration } from "../utils/recurringValidationUtils";
import { integrateRecurringTaskWithProject } from "../utils/recurringIntegrationUtils";

/**
 * Recurring task hook return type
 */
export interface UseRecurringTasksReturn {
  // State
  recurringTasks: Task[];
  recurringTaskInstances: RecurringTaskInstance[];
  isLoading: boolean;
  error: string | null;
  stats: RecurringTaskStats | null;

  // Data fetching
  fetchRecurringTasks: () => Promise<void>;
  fetchRecurringTaskById: (taskId: string) => Promise<Task | null>;
  fetchRecurringInstances: (taskId: string) => Promise<RecurringTaskInstance[]>;
  fetchRecurringTasksByProject: (projectId: string) => Promise<Task[]>;
  fetchRecurringTasksByPattern: (pattern: RecurringPattern) => Promise<Task[]>;
  fetchRecurringTasksByStatus: (status: TaskStatus) => Promise<Task[]>;
  fetchUpcomingRecurringInstances: (daysAhead?: number) => Promise<Task[]>;
  fetchOverdueRecurringInstances: () => Promise<Task[]>;
  fetchRecurringTaskCompletionStats: () => Promise<{
    totalRecurringTasks: number;
    activeRecurringTasks: number;
    pausedRecurringTasks: number;
    completedInstances: number;
    pendingInstances: number;
  }>;
  fetchRecurringTaskPatternDistribution: () => Promise<
    Record<RecurringPattern, number>
  >;

  // CRUD operations
  createRecurringTask: (
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "completed">,
    config: RecurringTaskConfig,
  ) => Promise<Task>;
  updateRecurringTask: (
    taskId: string,
    updates: Partial<Task>,
    configUpdates?: Partial<RecurringTaskConfig>,
  ) => Promise<Task>;
  deleteRecurringTask: (taskId: string, confirm?: boolean) => Promise<void>;
  createRecurringTaskWithProject: (
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "completed">,
    projectId: string,
    config: RecurringTaskConfig,
  ) => Promise<Task>;

  // Instance management
  completeRecurringInstance: (instanceId: string) => Promise<Task>;
  generateNextInstance: (taskId: string) => Promise<Task | null>;
  regenerateAllInstances: (taskId: string) => Promise<void>;
  updateRecurringInstancesStatus: (
    instanceIds: string[],
    newStatus: TaskStatus,
  ) => Promise<void>;
  completeRecurringInstances: (instanceIds: string[]) => Promise<void>;
  deleteRecurringInstances: (instanceIds: string[]) => Promise<void>;

  // State management
  pauseRecurringTask: (taskId: string) => Promise<Task>;
  resumeRecurringTask: (taskId: string) => Promise<Task>;

  // Advanced operations
  exportRecurringTaskConfig: (taskId: string) => string;
  importRecurringTaskConfig: (exportData: string) => Promise<Task>;
  createRecurringTaskTemplate: (
    taskId: string,
    templateName: string,
  ) => Promise<{
    templateId: string;
    templateName: string;
    recurringConfig: RecurringTaskConfig;
  }>;
  applyRecurringTaskTemplate: (
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "completed">,
    template: { templateId: string; recurringConfig: RecurringTaskConfig },
  ) => Promise<Task>;

  // Analytics and reporting
  getRecurringTaskStats: (taskId: string) => RecurringTaskStats;
  getRecurringTaskHistory: (
    taskId: string,
    limit?: number,
  ) => Promise<
    Array<{
      date: Date;
      action: string;
      details: any;
    }>
  >;
  getRecurringTaskTimeline: (taskId: string) => Promise<
    Array<{
      date: Date;
      type: "original" | "instance" | "completion";
      title: string;
      details: any;
    }>
  >;
  getRecurringTaskAnalytics: (taskId: string) => Promise<{
    completionRate: number;
    averageCompletionTime: number;
    onTimeCompletionRate: number;
    patternConsistency: number;
  }>;
  getRecurringTaskCalendarData: (
    taskId: string,
    startDate: Date,
    endDate: Date,
  ) => Promise<
    Array<{
      date: Date;
      instanceId: string;
      title: string;
      status: TaskStatus;
      isGenerated: boolean;
    }>
  >;
  getRecurringTaskGanttData: (taskId: string) => Promise<
    Array<{
      instanceId: string;
      title: string;
      startDate: Date;
      endDate: Date;
      progress: number;
      isGenerated: boolean;
    }>
  >;
  getRecurringTaskDependencyGraph: (taskId: string) => Promise<{
    nodes: Array<{ id: string; title: string; type: "original" | "instance" }>;
    edges: Array<{
      from: string;
      to: string;
      type: "generation" | "dependency";
    }>;
  }>;

  // Utility functions
  getRecurringInstances: (taskId: string) => Task[];
  validateRecurringConfig: (config: RecurringTaskConfig) => {
    valid: boolean;
    errors: string[];
  };
  validateRecurringTaskConfiguration: (
    task: Partial<Task>,
    config: RecurringTaskConfig,
  ) => { valid: boolean; errors: string[]; warnings: string[] };

  // Filtering and sorting
  filterRecurringTasks: (
    pattern?: RecurringPattern,
    status?: TaskStatus,
  ) => Task[];
  sortRecurringTasks: (
    field: "title" | "priority" | "dueDate" | "createdAt",
    direction: "asc" | "desc",
  ) => Task[];
}

/**
 * Custom hook for recurring task management
 */
export const useRecurringTasks = (): UseRecurringTasksReturn => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [recurringTasks, setRecurringTasks] = useState<Task[]>([]);
  const [recurringTaskInstances, setRecurringTaskInstances] = useState<
    RecurringTaskInstance[]
  >([]);
  const [stats, setStats] = useState<RecurringTaskStats | null>(null);

  const { tasks: allTasks, fetchTasks } = useTasks();
  const { tasks: storeTasks } = useTaskStore();

  /**
   * Fetch all recurring tasks
   */
  const fetchRecurringTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const tasks = await recurringTaskService.getRecurringTasks();
      setRecurringTasks(tasks);

      // Fetch instances for all recurring tasks
      const allInstances: RecurringTaskInstance[] = [];
      for (const task of tasks) {
        const instances = await recurringTaskService.generateRecurringInstances(
          task,
          task.customFields?.recurringConfig,
        );
        allInstances.push(...instances);
      }
      setRecurringTaskInstances(allInstances);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch recurring tasks",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch recurring task by ID
   */
  const fetchRecurringTaskById = useCallback(
    async (taskId: string): Promise<Task | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const task = await recurringTaskService.getRecurringTask(taskId);
        return task;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch recurring task",
        );
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * Fetch recurring instances for a specific task
   */
  const fetchRecurringInstances = useCallback(
    async (taskId: string): Promise<RecurringTaskInstance[]> => {
      try {
        setIsLoading(true);
        setError(null);

        const task = storeTasks.find((t) => t.id === taskId);
        if (!task) {
          throw new Error("Task not found");
        }

        const config = task.customFields?.recurringConfig;
        if (!config) {
          throw new Error("No recurring configuration found");
        }

        const instances = await recurringTaskService.generateRecurringInstances(
          task,
          config,
        );
        return instances;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch recurring instances",
        );
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [storeTasks],
  );

  /**
   * Fetch recurring tasks by project
   */
  const fetchRecurringTasksByProject = useCallback(
    async (projectId: string): Promise<Task[]> => {
      try {
        setIsLoading(true);
        setError(null);

        const tasks =
          await recurringTaskService.getRecurringTasksByProject(projectId);
        return tasks;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch recurring tasks by project",
        );
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * Fetch recurring tasks by pattern
   */
  const fetchRecurringTasksByPattern = useCallback(
    async (pattern: RecurringPattern): Promise<Task[]> => {
      try {
        setIsLoading(true);
        setError(null);

        const tasks =
          await recurringTaskService.getRecurringTasksByPattern(pattern);
        return tasks;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch recurring tasks by pattern",
        );
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * Fetch recurring tasks by status
   */
  const fetchRecurringTasksByStatus = useCallback(
    async (status: TaskStatus): Promise<Task[]> => {
      try {
        setIsLoading(true);
        setError(null);

        const tasks =
          await recurringTaskService.getRecurringTasksByStatus(status);
        return tasks;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch recurring tasks by status",
        );
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * Fetch upcoming recurring instances
   */
  const fetchUpcomingRecurringInstances = useCallback(
    async (daysAhead: number = 30): Promise<Task[]> => {
      try {
        setIsLoading(true);
        setError(null);

        const instances =
          await recurringTaskService.getUpcomingRecurringInstances(daysAhead);
        return instances;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to fetch upcoming recurring instances",
        );
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * Fetch overdue recurring instances
   */
  const fetchOverdueRecurringInstances = useCallback(async (): Promise<
    Task[]
  > => {
    try {
      setIsLoading(true);
      setError(null);

      const instances =
        await recurringTaskService.getOverdueRecurringInstances();
      return instances;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch overdue recurring instances",
      );
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch recurring task completion statistics
   */
  const fetchRecurringTaskCompletionStats = useCallback(async (): Promise<{
    totalRecurringTasks: number;
    activeRecurringTasks: number;
    pausedRecurringTasks: number;
    completedInstances: number;
    pendingInstances: number;
  }> => {
    try {
      setIsLoading(true);
      setError(null);

      const stats =
        await recurringTaskService.getRecurringTaskCompletionStats();
      return stats;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch recurring task completion stats",
      );
      return {
        totalRecurringTasks: 0,
        activeRecurringTasks: 0,
        pausedRecurringTasks: 0,
        completedInstances: 0,
        pendingInstances: 0,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch recurring task pattern distribution
   */
  const fetchRecurringTaskPatternDistribution = useCallback(async (): Promise<
    Record<RecurringPattern, number>
  > => {
    try {
      setIsLoading(true);
      setError(null);

      const distribution =
        await recurringTaskService.getRecurringTaskPatternDistribution();
      return distribution;
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch recurring task pattern distribution",
      );
      return {
        daily: 0,
        weekly: 0,
        monthly: 0,
        yearly: 0,
        custom: 0,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create a new recurring task
   */
  const createRecurringTask = useCallback(
    async (
      taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "completed">,
      config: RecurringTaskConfig,
    ): Promise<Task> => {
      try {
        setError(null);
        setIsLoading(true);

        // Validate configuration
        const validation = validateRecurringConfig(config);
        if (!validation.valid) {
          throw new Error(
            `Invalid recurring configuration: ${validation.errors.join(", ")}`,
          );
        }

        const newTask = await recurringTaskService.createRecurringTask(
          taskData,
          config,
        );

        // Update local state
        setRecurringTasks((prev) => [...prev, newTask]);
        await fetchRecurringTasks();

        return newTask;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to create recurring task",
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchRecurringTasks],
  );

  /**
   * Create a new recurring task with project integration
   */
  const createRecurringTaskWithProject = useCallback(
    async (
      taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "completed">,
      projectId: string,
      config: RecurringTaskConfig,
    ): Promise<Task> => {
      try {
        setError(null);
        setIsLoading(true);

        // Integrate task with project
        const integratedTaskData = integrateRecurringTaskWithProject(
          taskData,
          projectId,
          config,
        );

        const newTask = await recurringTaskService.createRecurringTask(
          integratedTaskData,
          config,
        );

        // Update local state
        setRecurringTasks((prev) => [...prev, newTask]);
        await fetchRecurringTasks();

        return newTask;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to create recurring task with project",
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchRecurringTasks],
  );

  /**
   * Update a recurring task
   */
  const updateRecurringTask = useCallback(
    async (
      taskId: string,
      updates: Partial<Task>,
      configUpdates?: Partial<RecurringTaskConfig>,
    ): Promise<Task> => {
      try {
        setError(null);
        setIsLoading(true);

        // Validate updates
        if (configUpdates) {
          const validation = validateRecurringConfig({
            ...recurringTasks.find((t) => t.id === taskId)?.customFields
              ?.recurringConfig,
            ...configUpdates,
          } as RecurringTaskConfig);

          if (!validation.valid) {
            throw new Error(
              `Invalid recurring configuration: ${validation.errors.join(", ")}`,
            );
          }
        }

        const updatedTask = await recurringTaskService.updateRecurringTask(
          taskId,
          updates,
          configUpdates,
        );

        // Update local state
        setRecurringTasks((prev) =>
          prev.map((task) => (task.id === taskId ? updatedTask : task)),
        );

        await fetchRecurringTasks();
        await fetchTasks();

        return updatedTask;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to update recurring task",
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchRecurringTasks, fetchTasks, recurringTasks],
  );

  /**
   * Delete a recurring task and all its instances
   */
  const deleteRecurringTask = useCallback(
    async (taskId: string, confirm: boolean = true): Promise<void> => {
      try {
        setError(null);
        setIsLoading(true);

        await recurringTaskService.deleteRecurringTask(taskId, confirm);

        // Update local state
        setRecurringTasks((prev) => prev.filter((task) => task.id !== taskId));
        setRecurringTaskInstances((prev) =>
          prev.filter((instance) => instance.originalTaskId !== taskId),
        );

        await fetchRecurringTasks();
        await fetchTasks();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to delete recurring task",
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchRecurringTasks, fetchTasks],
  );

  /**
   * Complete a specific recurring instance
   */
  const completeRecurringInstance = useCallback(
    async (instanceId: string): Promise<Task> => {
      try {
        setError(null);
        setIsLoading(true);

        const completedInstance =
          await recurringTaskService.completeRecurringInstance(instanceId);

        // Update local state
        setRecurringTaskInstances((prev) =>
          prev.map((instance) =>
            instance.id === instanceId
              ? {
                  ...instance,
                  completed: true,
                  status: "completed",
                }
              : instance,
          ),
        );

        await fetchRecurringTasks();
        await fetchTasks();

        return completedInstance;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to complete recurring instance",
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchRecurringTasks, fetchTasks],
  );

  /**
   * Generate the next instance for a recurring task
   */
  const generateNextInstance = useCallback(
    async (taskId: string): Promise<Task | null> => {
      try {
        setError(null);
        setIsLoading(true);

        const task = storeTasks.find((t) => t.id === taskId);
        if (!task) {
          throw new Error("Task not found");
        }

        const newInstance =
          await recurringTaskService.generateNextRecurringInstance(task);

        if (newInstance) {
          await fetchRecurringTasks();
          await fetchTasks();
        }

        return newInstance;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to generate next instance",
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchRecurringTasks, fetchTasks, storeTasks],
  );

  /**
   * Regenerate all instances for a recurring task
   */
  const regenerateAllInstances = useCallback(
    async (taskId: string): Promise<void> => {
      try {
        setError(null);
        setIsLoading(true);

        const task = storeTasks.find((t) => t.id === taskId);
        if (!task) {
          throw new Error("Task not found");
        }

        const config = task.customFields?.recurringConfig;
        if (!config) {
          throw new Error("No recurring configuration found");
        }

        await recurringTaskService.regenerateRecurringInstances(task, config);

        await fetchRecurringTasks();
        await fetchTasks();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to regenerate instances",
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchRecurringTasks, fetchTasks, storeTasks],
  );

  /**
   * Update status for multiple recurring instances
   */
  const updateRecurringInstancesStatus = useCallback(
    async (instanceIds: string[], newStatus: TaskStatus): Promise<void> => {
      try {
        setError(null);
        setIsLoading(true);

        await recurringTaskService.updateRecurringInstancesStatus(
          instanceIds,
          newStatus,
        );

        // Refresh data
        await fetchRecurringTasks();
        await fetchTasks();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to update recurring instances status",
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchRecurringTasks, fetchTasks],
  );

  /**
   * Complete multiple recurring instances
   */
  const completeRecurringInstances = useCallback(
    async (instanceIds: string[]): Promise<void> => {
      try {
        setError(null);
        setIsLoading(true);

        await recurringTaskService.completeRecurringInstances(instanceIds);

        // Refresh data
        await fetchRecurringTasks();
        await fetchTasks();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to complete recurring instances",
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchRecurringTasks, fetchTasks],
  );

  /**
   * Delete multiple recurring instances
   */
  const deleteRecurringInstances = useCallback(
    async (instanceIds: string[]): Promise<void> => {
      try {
        setError(null);
        setIsLoading(true);

        await recurringTaskService.deleteRecurringInstances(instanceIds);

        // Refresh data
        await fetchRecurringTasks();
        await fetchTasks();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to delete recurring instances",
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchRecurringTasks, fetchTasks],
  );

  /**
   * Pause a recurring task
   */
  const pauseRecurringTask = useCallback(
    async (taskId: string): Promise<Task> => {
      try {
        setError(null);
        setIsLoading(true);

        const pausedTask =
          await recurringTaskService.pauseRecurringTask(taskId);

        // Update local state
        setRecurringTasks((prev) =>
          prev.map((task) => (task.id === taskId ? pausedTask : task)),
        );

        return pausedTask;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to pause recurring task",
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * Resume a paused recurring task
   */
  const resumeRecurringTask = useCallback(
    async (taskId: string): Promise<Task> => {
      try {
        setError(null);
        setIsLoading(true);

        const resumedTask =
          await recurringTaskService.resumeRecurringTask(taskId);

        // Update local state
        setRecurringTasks((prev) =>
          prev.map((task) => (task.id === taskId ? resumedTask : task)),
        );

        return resumedTask;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to resume recurring task",
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * Export recurring task configuration
   */
  const exportRecurringTaskConfig = useCallback(
    (taskId: string): string => {
      try {
        const task = storeTasks.find((t) => t.id === taskId);
        if (!task) {
          throw new Error("Task not found");
        }

        return recurringTaskService.exportRecurringTaskConfig(task);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to export recurring task config",
        );
        throw err;
      }
    },
    [storeTasks],
  );

  /**
   * Import recurring task configuration
   */
  const importRecurringTaskConfig = useCallback(
    async (exportData: string): Promise<Task> => {
      try {
        setError(null);
        setIsLoading(true);

        const importedTask =
          await recurringTaskService.importRecurringTaskConfig(exportData);

        // Refresh data
        await fetchRecurringTasks();
        await fetchTasks();

        return importedTask;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to import recurring task config",
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchRecurringTasks, fetchTasks],
  );

  /**
   * Create recurring task template
   */
  const createRecurringTaskTemplate = useCallback(
    async (
      taskId: string,
      templateName: string,
    ): Promise<{
      templateId: string;
      templateName: string;
      recurringConfig: RecurringTaskConfig;
    }> => {
      try {
        setError(null);
        setIsLoading(true);

        const template = await recurringTaskService.createRecurringTaskTemplate(
          taskId,
          templateName,
        );
        return template;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to create recurring task template",
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * Apply recurring task template
   */
  const applyRecurringTaskTemplate = useCallback(
    async (
      taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "completed">,
      template: { templateId: string; recurringConfig: RecurringTaskConfig },
    ): Promise<Task> => {
      try {
        setError(null);
        setIsLoading(true);

        const newTask = await recurringTaskService.applyRecurringTaskTemplate(
          taskData,
          template,
        );

        // Refresh data
        await fetchRecurringTasks();
        await fetchTasks();

        return newTask;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to apply recurring task template",
        );
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [fetchRecurringTasks, fetchTasks],
  );

  /**
   * Get recurring task statistics
   */
  const getRecurringTaskStats = useCallback(
    (taskId: string): RecurringTaskStats => {
      try {
        const stats = recurringTaskService.getRecurringTaskStats(taskId);
        setStats(stats);
        return stats;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to get recurring task stats",
        );
        return {
          totalInstances: 0,
          completedInstances: 0,
          pendingInstances: 0,
          nextInstanceDate: undefined,
        };
      }
    },
    [],
  );

  /**
   * Get recurring task history
   */
  const getRecurringTaskHistory = useCallback(
    async (
      taskId: string,
      limit: number = 10,
    ): Promise<
      Array<{
        date: Date;
        action: string;
        details: any;
      }>
    > => {
      try {
        setError(null);
        setIsLoading(true);

        const history = await recurringTaskService.getRecurringTaskHistory(
          taskId,
          limit,
        );
        return history;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to get recurring task history",
        );
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * Get recurring task timeline
   */
  const getRecurringTaskTimeline = useCallback(
    async (
      taskId: string,
    ): Promise<
      Array<{
        date: Date;
        type: "original" | "instance" | "completion";
        title: string;
        details: any;
      }>
    > => {
      try {
        setError(null);
        setIsLoading(true);

        const timeline =
          await recurringTaskService.getRecurringTaskTimeline(taskId);
        return timeline;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to get recurring task timeline",
        );
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * Get recurring task analytics
   */
  const getRecurringTaskAnalytics = useCallback(
    async (
      taskId: string,
    ): Promise<{
      completionRate: number;
      averageCompletionTime: number;
      onTimeCompletionRate: number;
      patternConsistency: number;
    }> => {
      try {
        setError(null);
        setIsLoading(true);

        const analytics =
          await recurringTaskService.getRecurringTaskAnalytics(taskId);
        return analytics;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to get recurring task analytics",
        );
        return {
          completionRate: 0,
          averageCompletionTime: 0,
          onTimeCompletionRate: 0,
          patternConsistency: 0,
        };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * Get recurring task calendar data
   */
  const getRecurringTaskCalendarData = useCallback(
    async (
      taskId: string,
      startDate: Date,
      endDate: Date,
    ): Promise<
      Array<{
        date: Date;
        instanceId: string;
        title: string;
        status: TaskStatus;
        isGenerated: boolean;
      }>
    > => {
      try {
        setError(null);
        setIsLoading(true);

        const calendarData =
          await recurringTaskService.getRecurringTaskCalendarData(
            taskId,
            startDate,
            endDate,
          );
        return calendarData;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to get recurring task calendar data",
        );
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * Get recurring task Gantt data
   */
  const getRecurringTaskGanttData = useCallback(
    async (
      taskId: string,
    ): Promise<
      Array<{
        instanceId: string;
        title: string;
        startDate: Date;
        endDate: Date;
        progress: number;
        isGenerated: boolean;
      }>
    > => {
      try {
        setError(null);
        setIsLoading(true);

        const ganttData =
          await recurringTaskService.getRecurringTaskGanttData(taskId);
        return ganttData;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to get recurring task Gantt data",
        );
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * Get recurring task dependency graph
   */
  const getRecurringTaskDependencyGraph = useCallback(
    async (
      taskId: string,
    ): Promise<{
      nodes: Array<{
        id: string;
        title: string;
        type: "original" | "instance";
      }>;
      edges: Array<{
        from: string;
        to: string;
        type: "generation" | "dependency";
      }>;
    }> => {
      try {
        setError(null);
        setIsLoading(true);

        const graphData =
          await recurringTaskService.getRecurringTaskDependencyGraph(taskId);
        return graphData;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to get recurring task dependency graph",
        );
        return { nodes: [], edges: [] };
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  /**
   * Get all recurring instances for a task
   */
  const getRecurringInstances = useCallback((taskId: string): Task[] => {
    try {
      return recurringTaskService.getRecurringInstances(taskId);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to get recurring instances",
      );
      return [];
    }
  }, []);

  /**
   * Validate recurring configuration
   */
  const validateRecurringConfig = useCallback(
    (config: RecurringTaskConfig): { valid: boolean; errors: string[] } => {
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

      return {
        valid: errors.length === 0,
        errors,
      };
    },
    [],
  );

  /**
   * Validate complete recurring task configuration
   */
  const validateRecurringTaskConfiguration = useCallback(
    (
      task: Partial<Task>,
      config: RecurringTaskConfig,
    ): { valid: boolean; errors: string[]; warnings: string[] } => {
      return validateRecurringTaskConfiguration(task, config);
    },
    [],
  );

  /**
   * Filter recurring tasks by pattern and status
   */
  const filterRecurringTasks = useCallback(
    (pattern?: RecurringPattern, status?: TaskStatus): Task[] => {
      return recurringTasks.filter((task) => {
        const patternMatch = pattern ? task.recurringPattern === pattern : true;
        const statusMatch = status ? task.status === status : true;
        return patternMatch && statusMatch;
      });
    },
    [recurringTasks],
  );

  /**
   * Sort recurring tasks
   */
  const sortRecurringTasks = useCallback(
    (
      field: "title" | "priority" | "dueDate" | "createdAt",
      direction: "asc" | "desc" = "asc",
    ): Task[] => {
      const priorityOrder: Record<PriorityLevel, number> = {
        P1: 1,
        P2: 2,
        P3: 3,
        P4: 4,
      };

      return [...recurringTasks].sort((a, b) => {
        switch (field) {
          case "title":
            return (
              a.title.localeCompare(b.title) * (direction === "asc" ? 1 : -1)
            );
          case "priority":
            return (
              (priorityOrder[a.priority] - priorityOrder[b.priority]) *
              (direction === "asc" ? 1 : -1)
            );
          case "dueDate":
            return (
              ((a.dueDate?.getTime() || 0) - (b.dueDate?.getTime() || 0)) *
              (direction === "asc" ? 1 : -1)
            );
          case "createdAt":
            return (
              (a.createdAt.getTime() - b.createdAt.getTime()) *
              (direction === "asc" ? 1 : -1)
            );
          default:
            return 0;
        }
      });
    },
    [recurringTasks],
  );

  /**
   * Initialize recurring tasks on mount
   */
  useEffect(() => {
    fetchRecurringTasks();
  }, [fetchRecurringTasks]);

  /**
   * Update recurring tasks when global tasks change
   */
  useEffect(() => {
    if (allTasks.length > 0) {
      const updatedRecurringTasks = allTasks.filter(
        (task) => task.recurringPattern,
      );
      setRecurringTasks(updatedRecurringTasks);
    }
  }, [allTasks]);

  return {
    // State
    recurringTasks,
    recurringTaskInstances,
    isLoading,
    error,
    stats,

    // Data fetching
    fetchRecurringTasks,
    fetchRecurringTaskById,
    fetchRecurringInstances,
    fetchRecurringTasksByProject,
    fetchRecurringTasksByPattern,
    fetchRecurringTasksByStatus,
    fetchUpcomingRecurringInstances,
    fetchOverdueRecurringInstances,
    fetchRecurringTaskCompletionStats,
    fetchRecurringTaskPatternDistribution,

    // CRUD operations
    createRecurringTask,
    createRecurringTaskWithProject,
    updateRecurringTask,
    deleteRecurringTask,

    // Instance management
    completeRecurringInstance,
    generateNextInstance,
    regenerateAllInstances,
    updateRecurringInstancesStatus,
    completeRecurringInstances,
    deleteRecurringInstances,

    // State management
    pauseRecurringTask,
    resumeRecurringTask,

    // Advanced operations
    exportRecurringTaskConfig,
    importRecurringTaskConfig,
    createRecurringTaskTemplate,
    applyRecurringTaskTemplate,

    // Analytics and reporting
    getRecurringTaskStats,
    getRecurringTaskHistory,
    getRecurringTaskTimeline,
    getRecurringTaskAnalytics,
    getRecurringTaskCalendarData,
    getRecurringTaskGanttData,
    getRecurringTaskDependencyGraph,

    // Utility functions
    getRecurringInstances,
    validateRecurringConfig,
    validateRecurringTaskConfiguration,

    // Filtering and sorting
    filterRecurringTasks,
    sortRecurringTasks,
  };
};
