// @ts-nocheck
/**
 * Custom hook for offline task management integration
 */
import { useState, useEffect, useCallback } from "react";
import { useOfflineStore } from "../store/useOfflineStore";
import { offlineTaskService } from "../services/offlineTaskService";
import { Task } from "../types/task";
import { useTasks } from "./useTasks";

export const useOfflineTasks = (projectId?: string) => {
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [pendingOfflineOperations, setPendingOfflineOperations] =
    useState<number>(0);
  const [offlineError, setOfflineError] = useState<string | null>(null);

  // Get offline store state
  const offlineStore = useOfflineStore.getState();

  // Get regular task hooks
  const {
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleCompletion,
    fetchTasks,
  } = useTasks(projectId);

  /**
   * Check offline status
   */
  const checkOfflineStatus = useCallback(() => {
    const offline = offlineStore.status.isOffline;
    setIsOffline(offline);
    return offline;
  }, [offlineStore.status.isOffline]);

  /**
   * Initialize offline task management
   */
  const initializeOfflineTasks = useCallback(() => {
    checkOfflineStatus();

    // Set up listener for network status changes
    const unsubscribe = useOfflineStore.subscribe(
      (state) => state.status.isOffline,
      (isOffline) => {
        setIsOffline(isOffline);
        if (
          !isOffline &&
          offlineTaskService.hasPendingOfflineTaskOperations()
        ) {
          // Automatically process queue when coming back online
          processOfflineQueue();
        }
      },
    );

    return unsubscribe;
  }, [checkOfflineStatus]);

  /**
   * Create task with offline support
   */
  const createTaskOffline = useCallback(
    async (taskData: Omit<Task, "id">): Promise<Task> => {
      try {
        setOfflineError(null);
        const task = await offlineTaskService.createTaskOffline(taskData);

        // Update pending operations count
        const queueStatus = offlineTaskService.getOfflineTaskQueueStatus();
        setPendingOfflineOperations(queueStatus.pendingTasks);

        return task;
      } catch (error) {
        setOfflineError(
          error instanceof Error
            ? error.message
            : "Failed to create task offline",
        );
        throw error;
      }
    },
    [],
  );

  /**
   * Update task with offline support
   */
  const updateTaskOffline = useCallback(
    async (taskId: string, taskData: Partial<Task>): Promise<Task> => {
      try {
        setOfflineError(null);
        const task = await offlineTaskService.updateTaskOffline(
          taskId,
          taskData,
        );

        // Update pending operations count
        const queueStatus = offlineTaskService.getOfflineTaskQueueStatus();
        setPendingOfflineOperations(queueStatus.pendingTasks);

        return task;
      } catch (error) {
        setOfflineError(
          error instanceof Error
            ? error.message
            : "Failed to update task offline",
        );
        throw error;
      }
    },
    [],
  );

  /**
   * Delete task with offline support
   */
  const deleteTaskOffline = useCallback(
    async (taskId: string): Promise<void> => {
      try {
        setOfflineError(null);
        await offlineTaskService.deleteTaskOffline(taskId);

        // Update pending operations count
        const queueStatus = offlineTaskService.getOfflineTaskQueueStatus();
        setPendingOfflineOperations(queueStatus.pendingTasks);
      } catch (error) {
        setOfflineError(
          error instanceof Error
            ? error.message
            : "Failed to delete task offline",
        );
        throw error;
      }
    },
    [],
  );

  /**
   * Toggle task completion with offline support
   */
  const toggleCompletionOffline = useCallback(
    async (taskId: string): Promise<Task> => {
      try {
        setOfflineError(null);
        const task =
          await offlineTaskService.toggleTaskCompletionOffline(taskId);

        // Update pending operations count
        const queueStatus = offlineTaskService.getOfflineTaskQueueStatus();
        setPendingOfflineOperations(queueStatus.pendingTasks);

        return task;
      } catch (error) {
        setOfflineError(
          error instanceof Error
            ? error.message
            : "Failed to toggle task completion offline",
        );
        throw error;
      }
    },
    [],
  );

  /**
   * Process offline task queue
   */
  const processOfflineQueue = useCallback(async (): Promise<void> => {
    try {
      setOfflineError(null);
      await offlineTaskService.processOfflineTaskQueue();

      // Update pending operations count
      const queueStatus = offlineTaskService.getOfflineTaskQueueStatus();
      setPendingOfflineOperations(queueStatus.pendingTasks);
    } catch (error) {
      setOfflineError(
        error instanceof Error
          ? error.message
          : "Failed to process offline queue",
      );
      throw error;
    }
  }, []);

  /**
   * Get offline task queue status
   */
  const getOfflineQueueStatus = useCallback((): {
    pendingTasks: number;
    failedTasks: number;
    totalTasks: number;
  } => {
    return offlineTaskService.getOfflineTaskQueueStatus();
  }, []);

  /**
   * Check if there are pending offline operations
   */
  const hasPendingOperations = useCallback((): boolean => {
    return offlineTaskService.hasPendingOfflineTaskOperations();
  }, []);

  /**
   * Clear offline error
   */
  const clearOfflineError = useCallback((): void => {
    setOfflineError(null);
  }, []);

  // Initialize on mount
  useEffect(() => {
    const unsubscribe = initializeOfflineTasks();
    return () => unsubscribe();
  }, [initializeOfflineTasks]);

  // Update pending operations count when offline store changes
  useEffect(() => {
    const queueStatus = offlineTaskService.getOfflineTaskQueueStatus();
    setPendingOfflineOperations(queueStatus.pendingTasks);
  }, [offlineStore.queue.items]);

  return {
    // Regular task operations
    tasks,
    isLoading,
    error,
    createTask,
    updateTask,
    deleteTask,
    toggleCompletion,
    fetchTasks,

    // Offline-specific operations
    isOffline,
    pendingOfflineOperations,
    offlineError,
    createTaskOffline,
    updateTaskOffline,
    deleteTaskOffline,
    toggleCompletionOffline,
    processOfflineQueue,
    getOfflineQueueStatus,
    hasPendingOperations,
    clearOfflineError,

    // Utility methods
    checkOfflineStatus,
    initializeOfflineTasks,
  };
};
