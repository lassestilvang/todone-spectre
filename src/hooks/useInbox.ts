import { useState, useEffect, useCallback } from "react";
import { Task, TaskStatus } from "../types/task";
import { inboxService } from "../services/inboxService";
import { useTaskStore } from "../store/useTaskStore";

/**
 * Custom hook for Inbox view management
 */
export const useInbox = (projectId?: string) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<string | "all">("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { tasks: allTasks, setTasks } = useTaskStore();

  /**
   * Fetch inbox tasks
   */
  const fetchInboxTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const tasks = await inboxService.getInboxTasks(projectId);
      setTasks(tasks);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch inbox tasks",
      );
    } finally {
      setIsLoading(false);
    }
  }, [projectId, setTasks]);

  /**
   * Get filtered and processed inbox tasks
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

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((task) => task.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter !== "all") {
      result = result.filter((task) => task.priority === priorityFilter);
    }

    return result;
  }, [allTasks, searchQuery, statusFilter, priorityFilter]);

  /**
   * Get grouped tasks by status
   */
  const getGroupedTasks = useCallback((): Record<TaskStatus, Task[]> => {
    const processedTasks = getProcessedTasks();
    return inboxService.groupTasksByStatus(processedTasks);
  }, [getProcessedTasks]);

  /**
   * Get inbox statistics
   */
  const getStatistics = useCallback(async () => {
    try {
      return await inboxService.getInboxStatistics(projectId);
    } catch (err) {
      console.error("Error getting inbox statistics:", err);
      return null;
    }
  }, [projectId]);

  /**
   * Filter by status
   */
  const filterByStatus = useCallback((status: TaskStatus | "all") => {
    setStatusFilter(status);
  }, []);

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
    setStatusFilter("all");
    setPriorityFilter("all");
  }, []);

  /**
   * Initialize inbox data on mount
   */
  useEffect(() => {
    fetchInboxTasks();
  }, [fetchInboxTasks]);

  /**
   * Re-fetch when projectId changes
   */
  useEffect(() => {
    if (projectId) {
      fetchInboxTasks();
    }
  }, [projectId, fetchInboxTasks]);

  return {
    tasks: allTasks,
    isLoading,
    error,
    statusFilter,
    priorityFilter,
    searchQuery,

    // Data fetching
    fetchInboxTasks,
    refetch: fetchInboxTasks,

    // Filtering
    filterByStatus,
    filterByPriority,
    searchTasks,
    resetFilters,

    // State management
    setStatusFilter,
    setPriorityFilter,
    setSearchQuery,

    // Utility
    getProcessedTasks,
    getGroupedTasks,
    getStatistics,
  };
};
