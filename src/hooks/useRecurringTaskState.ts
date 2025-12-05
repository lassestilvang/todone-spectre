/**
 * Comprehensive Recurring Task State Management Hook
 * Integrates with Zustand store and provides advanced state management capabilities
 */
import { useState, useEffect, useCallback } from "react";
import { useRecurringTaskStore } from "../store/useRecurringTaskStore";
import { useRecurringTasks } from "./useRecurringTasks";
import { useRecurringPatterns } from "./useRecurringPatterns";
import {
  Task,
  RecurringTaskConfig,
  RecurringTaskInstance,
} from "../types/task";
import { RecurringPattern, TaskStatus } from "../types/enums";

/**
 * Recurring Task State Management Hook Return Type
 */
export interface UseRecurringTaskStateReturn {
  // State from store
  recurringTasks: Task[];
  recurringTaskInstances: RecurringTaskInstance[];
  isLoading: boolean;
  error: string | null;

  // CRUD Operations with State Management
  createRecurringTaskWithState: (
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "completed">,
    config: RecurringTaskConfig,
  ) => Promise<Task>;

  updateRecurringTaskWithState: (
    taskId: string,
    updates: Partial<Task>,
    configUpdates?: Partial<RecurringTaskConfig>,
  ) => Promise<Task>;

  deleteRecurringTaskWithState: (taskId: string) => Promise<void>;

  // Instance Management with State
  completeRecurringInstanceWithState: (instanceId: string) => Promise<Task>;
  generateNextInstanceWithState: (taskId: string) => Promise<Task | null>;
  regenerateAllInstancesWithState: (taskId: string) => Promise<void>;

  // Pattern Management
  updateRecurringPatternWithState: (
    taskId: string,
    pattern: RecurringPattern,
  ) => Promise<void>;
  updateRecurringConfigWithState: (
    taskId: string,
    config: RecurringTaskConfig,
  ) => Promise<void>;

  // State Management Operations
  pauseRecurringTaskWithState: (taskId: string) => Promise<void>;
  resumeRecurringTaskWithState: (taskId: string) => Promise<void>;

  // Bulk Operations
  bulkDeleteRecurringTasksWithState: (taskIds: string[]) => Promise<void>;
  bulkUpdateRecurringTaskStatusWithState: (
    taskIds: string[],
    status: TaskStatus,
  ) => Promise<void>;

  // Advanced State Management
  syncRecurringTasksWithStore: () => Promise<void>;
  resetRecurringTaskState: () => void;

  // Statistics and Analytics
  getRecurringTaskStatsWithState: (taskId: string) => {
    totalInstances: number;
    completedInstances: number;
    pendingInstances: number;
    nextInstanceDate?: Date;
  };

  // Filtering and Sorting
  filterRecurringTasksWithState: (
    pattern?: RecurringPattern,
    status?: TaskStatus,
    searchQuery?: string,
  ) => Task[];

  sortRecurringTasksWithState: (
    field: "title" | "priority" | "dueDate" | "createdAt",
    direction: "asc" | "desc",
  ) => Task[];
}

/**
 * Comprehensive Recurring Task State Management Hook
 */
export const useRecurringTaskState = (): UseRecurringTaskStateReturn => {
  // Get store methods and state
  const {
    recurringTasks,
    recurringTaskInstances,
    isLoading,
    error,
    addRecurringTask,
    updateRecurringTask,
    deleteRecurringTask,
    addRecurringInstance,
    updateRecurringInstance,
    deleteRecurringInstance,
    deleteAllInstancesForTask,
    updateRecurringPattern,
    updateRecurringConfig,
    pauseRecurringTask,
    resumeRecurringTask,
    setRecurringTasks,
    setRecurringTaskInstances,
    setLoading,
    setError,
    getRecurringInstancesForTask,
    getTaskById,
    getInstanceById,
    getRecurringTaskStats,
    bulkDeleteRecurringTasks,
    bulkUpdateRecurringTaskStatus,
    setFilter,
    setSort,
    applyFilters,
  } = useRecurringTaskStore();

  // Get existing hook functionality
  const {
    createRecurringTask,
    updateRecurringTask: updateRecurringTaskOriginal,
    deleteRecurringTask: deleteRecurringTaskOriginal,
    completeRecurringInstance: completeRecurringInstanceOriginal,
    generateNextInstance: generateNextInstanceOriginal,
    regenerateAllInstances: regenerateAllInstancesOriginal,
    fetchRecurringTasks,
    fetchRecurringTaskInstances,
  } = useRecurringTasks();

  const { generateRecurringDates } = useRecurringPatterns();

  /**
   * Create recurring task with comprehensive state management
   */
  const createRecurringTaskWithState = useCallback(
    async (
      taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "completed">,
      config: RecurringTaskConfig,
    ): Promise<Task> => {
      try {
        setLoading(true);
        setError(null);

        // Create task using original service
        const newTask = await createRecurringTask(taskData, config);

        // Add to store
        addRecurringTask(newTask);

        // Generate and add instances to store
        const instances = generateRecurringDates(
          config.startDate,
          config,
          config.maxOccurrences || 10,
        ).map((instance, index) => ({
          id: `${newTask.id}-instance-${index + 1}`,
          taskId: newTask.id,
          date: instance.date,
          isGenerated: instance.isGenerated,
          status: "active" as TaskStatus,
          completed: false,
          originalTaskId: newTask.id,
        }));

        instances.forEach((instance) => addRecurringInstance(instance));

        return newTask;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to create recurring task with state",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [
      createRecurringTask,
      addRecurringTask,
      addRecurringInstance,
      setLoading,
      setError,
      generateRecurringDates,
    ],
  );

  /**
   * Update recurring task with comprehensive state management
   */
  const updateRecurringTaskWithState = useCallback(
    async (
      taskId: string,
      updates: Partial<Task>,
      configUpdates?: Partial<RecurringTaskConfig>,
    ): Promise<Task> => {
      try {
        setLoading(true);
        setError(null);

        // Update task using original service
        const updatedTask = await updateRecurringTaskOriginal(
          taskId,
          updates,
          configUpdates,
        );

        // Update in store
        updateRecurringTask(taskId, updates);

        // If config changed, regenerate instances
        if (configUpdates) {
          const task = getTaskById(taskId);
          if (task) {
            const updatedConfig = {
              ...task.customFields?.recurringConfig,
              ...configUpdates,
            };

            // Delete old instances
            deleteAllInstancesForTask(taskId);

            // Generate new instances
            const instances = generateRecurringDates(
              updatedConfig.startDate || new Date(),
              updatedConfig,
              updatedConfig.maxOccurrences || 10,
            ).map((instance, index) => ({
              id: `${taskId}-instance-${index + 1}`,
              taskId: taskId,
              date: instance.date,
              isGenerated: instance.isGenerated,
              status: "active" as TaskStatus,
              completed: false,
              originalTaskId: taskId,
            }));

            instances.forEach((instance) => addRecurringInstance(instance));
          }
        }

        return updatedTask;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to update recurring task with state",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [
      updateRecurringTaskOriginal,
      updateRecurringTask,
      deleteAllInstancesForTask,
      addRecurringInstance,
      setLoading,
      setError,
      getTaskById,
      generateRecurringDates,
    ],
  );

  /**
   * Delete recurring task with comprehensive state management
   */
  const deleteRecurringTaskWithState = useCallback(
    async (taskId: string): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        // Delete using original service
        await deleteRecurringTaskOriginal(taskId);

        // Remove from store
        deleteRecurringTask(taskId);
        deleteAllInstancesForTask(taskId);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to delete recurring task with state",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [
      deleteRecurringTaskOriginal,
      deleteRecurringTask,
      deleteAllInstancesForTask,
      setLoading,
      setError,
    ],
  );

  /**
   * Complete recurring instance with state management
   */
  const completeRecurringInstanceWithState = useCallback(
    async (instanceId: string): Promise<Task> => {
      try {
        setLoading(true);
        setError(null);

        // Complete using original service
        const completedInstance =
          await completeRecurringInstanceOriginal(instanceId);

        // Update in store
        updateRecurringInstance(instanceId, {
          completed: true,
          status: "completed" as TaskStatus,
        });

        // Check if we need to generate next instance
        const instance = getInstanceById(instanceId);
        if (instance) {
          const task = getTaskById(instance.originalTaskId);
          if (task && task.recurringPattern) {
            const config = task.customFields?.recurringConfig;
            if (config && (!config.endDate || !config.maxOccurrences)) {
              // Generate next instance for infinite recurring tasks
              await generateNextInstanceWithState(instance.originalTaskId);
            }
          }
        }

        return completedInstance;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to complete recurring instance with state",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [
      completeRecurringInstanceOriginal,
      updateRecurringInstance,
      getInstanceById,
      getTaskById,
      generateNextInstanceWithState,
      setLoading,
      setError,
    ],
  );

  /**
   * Generate next instance with state management
   */
  const generateNextInstanceWithState = useCallback(
    async (taskId: string): Promise<Task | null> => {
      try {
        setLoading(true);
        setError(null);

        // Generate using original service
        const newInstance = await generateNextInstanceOriginal(taskId);

        if (newInstance) {
          // Add to store
          addRecurringInstance({
            id: newInstance.id,
            taskId: taskId,
            date: newInstance.dueDate || new Date(),
            isGenerated: true,
            status: newInstance.status,
            completed: newInstance.completed,
            originalTaskId: taskId,
          });
        }

        return newInstance;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to generate next instance with state",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [generateNextInstanceOriginal, addRecurringInstance, setLoading, setError],
  );

  /**
   * Regenerate all instances with state management
   */
  const regenerateAllInstancesWithState = useCallback(
    async (taskId: string): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        // Regenerate using original service
        await regenerateAllInstancesOriginal(taskId);

        // Delete old instances from store
        deleteAllInstancesForTask(taskId);

        // Fetch fresh instances and add to store
        const task = getTaskById(taskId);
        if (task) {
          const config = task.customFields?.recurringConfig;
          if (config) {
            const instances = generateRecurringDates(
              config.startDate,
              config,
              config.maxOccurrences || 10,
            ).map((instance, index) => ({
              id: `${taskId}-instance-${index + 1}`,
              taskId: taskId,
              date: instance.date,
              isGenerated: instance.isGenerated,
              status: "active" as TaskStatus,
              completed: false,
              originalTaskId: taskId,
            }));

            instances.forEach((instance) => addRecurringInstance(instance));
          }
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to regenerate instances with state",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [
      regenerateAllInstancesOriginal,
      deleteAllInstancesForTask,
      addRecurringInstance,
      getTaskById,
      generateRecurringDates,
      setLoading,
      setError,
    ],
  );

  /**
   * Update recurring pattern with state management
   */
  const updateRecurringPatternWithState = useCallback(
    async (taskId: string, pattern: RecurringPattern): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        // Update pattern in store
        updateRecurringPattern(taskId, pattern);

        // Update the task to trigger regeneration
        const task = getTaskById(taskId);
        if (task) {
          await updateRecurringTaskWithState(
            taskId,
            {},
            {
              pattern,
              ...task.customFields?.recurringConfig,
            },
          );
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to update recurring pattern with state",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [
      updateRecurringPattern,
      updateRecurringTaskWithState,
      getTaskById,
      setLoading,
      setError,
    ],
  );

  /**
   * Update recurring config with state management
   */
  const updateRecurringConfigWithState = useCallback(
    async (taskId: string, config: RecurringTaskConfig): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        // Update config in store
        updateRecurringConfig(taskId, config);

        // Update the task to trigger regeneration
        await updateRecurringTaskWithState(taskId, {}, config);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to update recurring config with state",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [updateRecurringConfig, updateRecurringTaskWithState, setLoading, setError],
  );

  /**
   * Pause recurring task with state management
   */
  const pauseRecurringTaskWithState = useCallback(
    async (taskId: string): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        // Pause in store
        pauseRecurringTask(taskId);

        // Update task status
        await updateRecurringTaskWithState(taskId, {
          status: "archived" as TaskStatus,
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to pause recurring task with state",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [pauseRecurringTask, updateRecurringTaskWithState, setLoading, setError],
  );

  /**
   * Resume recurring task with state management
   */
  const resumeRecurringTaskWithState = useCallback(
    async (taskId: string): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        // Resume in store
        resumeRecurringTask(taskId);

        // Update task status
        await updateRecurringTaskWithState(taskId, {
          status: "active" as TaskStatus,
        });
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to resume recurring task with state",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [resumeRecurringTask, updateRecurringTaskWithState, setLoading, setError],
  );

  /**
   * Bulk delete recurring tasks with state management
   */
  const bulkDeleteRecurringTasksWithState = useCallback(
    async (taskIds: string[]): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        // Delete each task
        for (const taskId of taskIds) {
          await deleteRecurringTaskWithState(taskId);
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to bulk delete recurring tasks with state",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [deleteRecurringTaskWithState, setLoading, setError],
  );

  /**
   * Bulk update recurring task status with state management
   */
  const bulkUpdateRecurringTaskStatusWithState = useCallback(
    async (taskIds: string[], status: TaskStatus): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        // Update status in store
        bulkUpdateRecurringTaskStatus(taskIds, status);

        // Update each task
        for (const taskId of taskIds) {
          await updateRecurringTaskWithState(taskId, { status });
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to bulk update recurring task status with state",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [
      bulkUpdateRecurringTaskStatus,
      updateRecurringTaskWithState,
      setLoading,
      setError,
    ],
  );

  /**
   * Sync recurring tasks with store
   */
  const syncRecurringTasksWithStore = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Fetch latest data
      const tasks = await fetchRecurringTasks();

      // Update store
      setRecurringTasks(tasks);

      // Fetch and update instances
      const allInstances: RecurringTaskInstance[] = [];
      for (const task of tasks) {
        const instances = await fetchRecurringTaskInstances(task.id);
        allInstances.push(...instances);
      }

      setRecurringTaskInstances(allInstances);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to sync recurring tasks with store",
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, [
    fetchRecurringTasks,
    fetchRecurringTaskInstances,
    setRecurringTasks,
    setRecurringTaskInstances,
    setLoading,
    setError,
  ]);

  /**
   * Reset recurring task state
   */
  const resetRecurringTaskState = useCallback((): void => {
    setRecurringTasks([]);
    setRecurringTaskInstances([]);
    setError(null);
    setLoading(false);
  }, [setRecurringTasks, setRecurringTaskInstances, setError, setLoading]);

  /**
   * Get recurring task stats with state
   */
  const getRecurringTaskStatsWithState = useCallback(
    (taskId: string) => {
      return getRecurringTaskStats(taskId);
    },
    [getRecurringTaskStats],
  );

  /**
   * Filter recurring tasks with state
   */
  const filterRecurringTasksWithState = useCallback(
    (
      pattern?: RecurringPattern,
      status?: TaskStatus,
      searchQuery?: string,
    ): Task[] => {
      setFilter({
        pattern,
        status,
        searchQuery,
      });

      return recurringTasks.filter((task) => {
        const patternMatch = pattern ? task.recurringPattern === pattern : true;
        const statusMatch = status ? task.status === status : true;
        const searchMatch = searchQuery
          ? task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (task.description &&
              task.description
                .toLowerCase()
                .includes(searchQuery.toLowerCase()))
          : true;

        return patternMatch && statusMatch && searchMatch;
      });
    },
    [setFilter, recurringTasks],
  );

  /**
   * Sort recurring tasks with state
   */
  const sortRecurringTasksWithState = useCallback(
    (
      field: "title" | "priority" | "dueDate" | "createdAt",
      direction: "asc" | "desc" = "asc",
    ): Task[] => {
      setSort(field, direction);

      const priorityOrder: Record<string, number> = {
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
    [setSort, recurringTasks],
  );

  // Initialize by syncing with store
  useEffect(() => {
    syncRecurringTasksWithStore();
  }, [syncRecurringTasksWithStore]);

  return {
    // State
    recurringTasks,
    recurringTaskInstances,
    isLoading,
    error,

    // CRUD Operations with State Management
    createRecurringTaskWithState,
    updateRecurringTaskWithState,
    deleteRecurringTaskWithState,

    // Instance Management with State
    completeRecurringInstanceWithState,
    generateNextInstanceWithState,
    regenerateAllInstancesWithState,

    // Pattern Management
    updateRecurringPatternWithState,
    updateRecurringConfigWithState,

    // State Management Operations
    pauseRecurringTaskWithState,
    resumeRecurringTaskWithState,

    // Bulk Operations
    bulkDeleteRecurringTasksWithState,
    bulkUpdateRecurringTaskStatusWithState,

    // Advanced State Management
    syncRecurringTasksWithStore,
    resetRecurringTaskState,

    // Statistics and Analytics
    getRecurringTaskStatsWithState,

    // Filtering and Sorting
    filterRecurringTasksWithState,
    sortRecurringTasksWithState,
  };
};
