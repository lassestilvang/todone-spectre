import { useState, useEffect, useCallback } from 'react';
import { Task } from '../types/task';
import { taskHierarchyService } from '../services/taskHierarchyService';
import { useTaskStore } from '../store/useTaskStore';

/**
 * Custom hook for task hierarchy management
 */
export const useTaskHierarchy = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hierarchyTree, setHierarchyTree] = useState<Task[]>([]);
  const [flatHierarchy, setFlatHierarchy] = useState<Task[]>([]);
  const [completionPercentage, setCompletionPercentage] = useState<number>(0);
  const { tasks } = useTaskStore();

  /**
   * Get sub-tasks for a parent task
   */
  const getSubTasks = useCallback(async (parentTaskId: string): Promise<Task[]> => {
    try {
      return await taskHierarchyService.getSubTasks(parentTaskId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get sub-tasks');
      return [];
    }
  }, []);

  /**
   * Get task hierarchy tree
   */
  const getTaskHierarchyTree = useCallback(async (parentTaskId: string): Promise<Task[]> => {
    try {
      setIsLoading(true);
      const tree = await taskHierarchyService.getTaskHierarchyTree(parentTaskId);
      setHierarchyTree(tree);
      setIsLoading(false);
      return tree;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get hierarchy tree');
      setIsLoading(false);
      return [];
    }
  }, []);

  /**
   * Get flat hierarchy
   */
  const getFlatHierarchy = useCallback(async (parentTaskId: string): Promise<Task[]> => {
    try {
      setIsLoading(true);
      const flat = await taskHierarchyService.getFlatHierarchy(parentTaskId);
      setFlatHierarchy(flat);
      setIsLoading(false);
      return flat;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get flat hierarchy');
      setIsLoading(false);
      return [];
    }
  }, []);

  /**
   * Create sub-task in hierarchy
   */
  const createSubTask = useCallback(async (
    parentTaskId: string,
    subTaskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed'>
  ): Promise<Task> => {
    try {
      setError(null);
      const newSubTask = await taskHierarchyService.createSubTaskInHierarchy(parentTaskId, subTaskData);

      // Refresh hierarchies
      if (hierarchyTree.some(task => task.id === parentTaskId)) {
        await getTaskHierarchyTree(parentTaskId);
      }

      return newSubTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create sub-task');
      throw err;
    }
  }, [getTaskHierarchyTree, hierarchyTree]);

  /**
   * Update sub-task position
   */
  const updateSubTaskPosition = useCallback(async (
    subTaskId: string,
    newParentTaskId: string,
    newOrder: number
  ): Promise<Task> => {
    try {
      setError(null);
      const updatedSubTask = await taskHierarchyService.updateSubTaskPosition(
        subTaskId,
        newParentTaskId,
        newOrder
      );

      // Refresh hierarchies that might be affected
      await refreshAffectedHierarchies(subTaskId, newParentTaskId);

      return updatedSubTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update sub-task position');
      throw err;
    }
  }, []);

  /**
   * Move sub-task to different parent
   */
  const moveSubTask = useCallback(async (
    subTaskId: string,
    newParentTaskId: string
  ): Promise<Task> => {
    try {
      setError(null);
      const movedSubTask = await taskHierarchyService.moveSubTask(subTaskId, newParentTaskId);

      // Refresh hierarchies that might be affected
      await refreshAffectedHierarchies(subTaskId, newParentTaskId);

      return movedSubTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move sub-task');
      throw err;
    }
  }, []);

  /**
   * Get task depth
   */
  const getTaskDepth = useCallback(async (taskId: string): Promise<number> => {
    try {
      return await taskHierarchyService.getTaskDepth(taskId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get task depth');
      return 0;
    }
  }, []);

  /**
   * Get task path
   */
  const getTaskPath = useCallback(async (taskId: string): Promise<Task[]> => {
    try {
      return await taskHierarchyService.getTaskPath(taskId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get task path');
      return [];
    }
  }, []);

  /**
   * Calculate hierarchy completion
   */
  const calculateHierarchyCompletion = useCallback(async (taskId: string): Promise<number> => {
    try {
      const percentage = await taskHierarchyService.calculateHierarchyCompletion(taskId);
      setCompletionPercentage(percentage);
      return percentage;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to calculate completion');
      return 0;
    }
  }, []);

  /**
   * Get tasks by hierarchy level
   */
  const getTasksByLevel = useCallback(async (level: number): Promise<Task[]> => {
    try {
      return await taskHierarchyService.getTasksByLevel(level);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get tasks by level');
      return [];
    }
  }, []);

  /**
   * Find root parent
   */
  const findRootParent = useCallback(async (taskId: string): Promise<Task | null> => {
    try {
      return await taskHierarchyService.findRootParent(taskId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to find root parent');
      return null;
    }
  }, []);

  /**
   * Refresh hierarchies affected by sub-task movement
   */
  const refreshAffectedHierarchies = useCallback(async (subTaskId: string, newParentTaskId: string) => {
    try {
      // Get old parent (if any)
      const subTask = tasks.find(task => task.id === subTaskId);
      const oldParentId = subTask?.parentTaskId;

      // Refresh old parent hierarchy if it exists
      if (oldParentId) {
        await getTaskHierarchyTree(oldParentId);
        await getFlatHierarchy(oldParentId);
      }

      // Refresh new parent hierarchy
      await getTaskHierarchyTree(newParentTaskId);
      await getFlatHierarchy(newParentTaskId);

      // Refresh completion percentages
      if (oldParentId) {
        await calculateHierarchyCompletion(oldParentId);
      }
      await calculateHierarchyCompletion(newParentTaskId);
    } catch (err) {
      console.error('Failed to refresh affected hierarchies:', err);
    }
  }, [tasks, getTaskHierarchyTree, getFlatHierarchy, calculateHierarchyCompletion]);

  /**
   * Initialize hierarchies when tasks change
   */
  useEffect(() => {
    // Reset hierarchies when tasks change
    setHierarchyTree([]);
    setFlatHierarchy([]);
  }, [tasks]);

  return {
    hierarchyTree,
    flatHierarchy,
    completionPercentage,
    isLoading,
    error,

    // Data fetching
    getSubTasks,
    getTaskHierarchyTree,
    getFlatHierarchy,
    getTaskDepth,
    getTaskPath,
    getTasksByLevel,
    findRootParent,

    // Mutations
    createSubTask,
    updateSubTaskPosition,
    moveSubTask,

    // Utility
    calculateHierarchyCompletion,

    // State management
    setHierarchyTree,
    setFlatHierarchy,
    setCompletionPercentage
  };
};