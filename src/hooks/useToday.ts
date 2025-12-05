import { useState, useEffect, useCallback } from "react";
import { Task } from "../types/task";
import { todayService } from "../services/todayService";
import { useTaskStore } from "../store/useTaskStore";

/**
 * Custom hook for Today view management
 */
export const useToday = (projectId?: string) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | "all">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { tasks: allTasks, setTasks } = useTaskStore();

  /**
   * Fetch today tasks
   */
  const fetchTodayTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const tasks = await todayService.getTodayTasks(projectId);
      setTasks(tasks);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch today tasks",
      );
    } finally {
      setIsLoading(false);
    }
  }, [projectId, setTasks]);

  /**
   * Get filtered and processed today tasks
   */
  const getProcessedTasks = useCallback((): Task[] => {
    let result = [...allTasks];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (task) =>
          task.title.toLowerCase().includes(query) ||
          (task.description && task.description.toLowerCase().includes(query)),
      );
    }

    // Apply priority filter
    if (priorityFilter !== "all") {
      result = result.filter((task) => task.priority === priorityFilter);
    }

    return result;
  }, [allTasks, searchQuery, priorityFilter]);

  /**
   * Separate tasks into overdue and due today
   */
  const getSeparatedTasks = useCallback((): {
    overdue: Task[];
    today: Task[];
  } => {
    const processedTasks = getProcessedTasks();
    return todayService.separateOverdueAndTodayTasks(processedTasks);
  }, [getProcessedTasks]);

  /**
   * Get today statistics
   */
  const getStatistics = useCallback(async () => {
    try {
      return await todayService.getTodayStatistics(projectId);
    } catch (err) {
      console.error("Error getting today statistics:", err);
      return null;
    }
  }, [projectId]);

  /**
   * Filter by priority
   */
  const filterByPriority = useCallback((priority: string | "all") => {
    setPriorityFilter(priority);
  }, []);

  /**
   * Search tasks
   */
  const searchTasks = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  /**
   * Reset all filters
   */
  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setPriorityFilter("all");
  }, []);

  /**
   * Check if task is overdue
   */
  const isTaskOverdue = useCallback((task: Task): boolean => {
    return todayService.isTaskOverdue(task);
  }, []);

  /**
   * Get task urgency score
   */
  const getTaskUrgencyScore = useCallback((task: Task): number => {
    return todayService.getTaskUrgencyScore(task);
  }, []);

  /**
   * Initialize today data on mount
   */
  useEffect(() => {
    fetchTodayTasks();
  }, [fetchTodayTasks]);

  /**
   * Re-fetch when projectId changes
   */
  useEffect(() => {
    if (projectId) {
      fetchTodayTasks();
    }
  }, [projectId, fetchTodayTasks]);

  return {
    tasks: allTasks,
    isLoading,
    error,
    priorityFilter,
    searchQuery,

    // Data fetching
    fetchTodayTasks,
    refetch: fetchTodayTasks,

    // Filtering
    filterByPriority,
    searchTasks,
    resetFilters,

    // State management
    setPriorityFilter,
    setSearchQuery,

    // Utility
    getProcessedTasks,
    getSeparatedTasks,
    getStatistics,
    isTaskOverdue,
    getTaskUrgencyScore,
  };
};
