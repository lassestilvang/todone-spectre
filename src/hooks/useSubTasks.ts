import { useState, useEffect, useCallback } from 'react';
import { Task } from '../types/task';
import { subTaskService } from '../services/subTaskService';
import { useTaskStore } from '../store/useTaskStore';

/**
 * Custom hook for sub-task management with data fetching, mutations, filtering, and sorting
 */
export const useSubTasks = (parentTaskId: string) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [subTasks, setSubTasks] = useState<Task[]>([]);
  const { tasks } = useTaskStore();

  /**
   * Fetch sub-tasks for parent task
   */
  const fetchSubTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const fetchedSubTasks = await subTaskService.getSubTasks(parentTaskId);
      setSubTasks(fetchedSubTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sub-tasks');
    } finally {
      setIsLoading(false);
    }
  }, [parentTaskId]);

  /**
   * Create sub-task mutation
   */
  const createSubTask = useCallback(async (subTaskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed'>) => {
    try {
      setError(null);
      const newSubTask = await subTaskService.createSubTask(subTaskData);
      await fetchSubTasks(); // Refresh sub-tasks
      return newSubTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create sub-task');
      throw err;
    }
  }, [fetchSubTasks]);

  /**
   * Update sub-task mutation
   */
  const updateSubTask = useCallback(async (subTaskId: string, updates: Partial<Task>) => {
    try {
      setError(null);
      const updatedSubTask = await subTaskService.updateSubTask(subTaskId, updates);
      await fetchSubTasks(); // Refresh sub-tasks
      return updatedSubTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update sub-task');
      throw err;
    }
  }, [fetchSubTasks]);

  /**
   * Delete sub-task mutation
   */
  const deleteSubTask = useCallback(async (subTaskId: string) => {
    try {
      setError(null);
      await subTaskService.deleteSubTask(subTaskId);
      await fetchSubTasks(); // Refresh sub-tasks
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete sub-task');
      throw err;
    }
  }, [fetchSubTasks]);

  /**
   * Toggle sub-task completion mutation
   */
  const toggleSubTaskCompletion = useCallback(async (subTaskId: string) => {
    try {
      setError(null);
      const updatedSubTask = await subTaskService.toggleSubTaskCompletion(subTaskId);
      await fetchSubTasks(); // Refresh sub-tasks
      return updatedSubTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle sub-task completion');
      throw err;
    }
  }, [fetchSubTasks]);

  /**
   * Get completion percentage for sub-tasks
   */
  const getCompletionPercentage = useCallback(async (): Promise<number> => {
    try {
      return await subTaskService.getTaskCompletionPercentage(parentTaskId);
    } catch (err) {
      console.error('Failed to get completion percentage:', err);
      return 0;
    }
  }, [parentTaskId]);

  /**
   * Initialize sub-tasks on mount
   */
  useEffect(() => {
    fetchSubTasks();
  }, [fetchSubTasks]);

  /**
   * Re-fetch sub-tasks when parentTaskId changes
   */
  useEffect(() => {
    if (parentTaskId) {
      fetchSubTasks();
    }
  }, [parentTaskId, fetchSubTasks]);

  /**
   * Re-fetch sub-tasks when global tasks change
   */
  useEffect(() => {
    fetchSubTasks();
  }, [tasks, fetchSubTasks]);

  return {
    subTasks,
    isLoading,
    error,

    // Data fetching
    fetchSubTasks,
    refetch: fetchSubTasks,

    // Mutations
    createSubTask,
    updateSubTask,
    deleteSubTask,
    toggleSubTaskCompletion,

    // Utility
    getCompletionPercentage
  };
};