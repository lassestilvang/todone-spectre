import { useState, useEffect, useCallback } from "react";
import { Task, TaskStatus, PriorityLevel } from "../types/task";
import { taskService } from "../services/taskService";
import { useTaskStore } from "../store/useTaskStore";

/**
 * Custom hook for task management with data fetching, mutations, filtering, and sorting
 */
export const useTasks = (projectId?: string) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<PriorityLevel | "all">(
    "all",
  );
  const [sortBy, setSortBy] = useState<"priority" | "dueDate" | "createdAt">(
    "priority",
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const {
    tasks,
    filteredTasks,
    currentFilter,
    sortBy: storeSortBy,
    sortDirection: storeSortDirection,
    setFilter,
    setSort,
    applyFilters,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
  } = useTaskStore();

  /**
   * Fetch tasks from API
   */
  const fetchTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const fetchedTasks = await taskService.getTasks(projectId);
      useTaskStore.getState().setTasks(fetchedTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tasks");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  /**
   * Create task mutation
   */
  const createTask = useCallback(
    async (
      taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "completed">,
    ) => {
      try {
        setError(null);
        const newTask = await taskService.createTask(taskData);
        return newTask;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create task");
        throw err;
      }
    },
    [],
  );

  /**
   * Update task mutation
   */
  const updateTaskMutation = useCallback(
    async (taskId: string, updates: Partial<Task>) => {
      try {
        setError(null);
        const updatedTask = await taskService.updateTask(taskId, updates);
        return updatedTask;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update task");
        throw err;
      }
    },
    [],
  );

  /**
   * Delete task mutation
   */
  const deleteTaskMutation = useCallback(async (taskId: string) => {
    try {
      setError(null);
      await taskService.deleteTask(taskId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task");
      throw err;
    }
  }, []);

  /**
   * Toggle task completion mutation
   */
  const toggleCompletion = useCallback(async (taskId: string) => {
    try {
      setError(null);
      const updatedTask = await taskService.toggleTaskCompletion(taskId);
      return updatedTask;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to toggle task completion",
      );
      throw err;
    }
  }, []);

  /**
   * Apply filters based on current filter state
   */
  const applyCurrentFilters = useCallback(() => {
    const filters = {
      status: statusFilter === "all" ? undefined : statusFilter,
      priority: priorityFilter === "all" ? undefined : priorityFilter,
      searchQuery: searchQuery || undefined,
    };

    setFilter(filters);
    applyFilters();
  }, [statusFilter, priorityFilter, searchQuery, setFilter, applyFilters]);

  /**
   * Filter tasks by status
   */
  const filterByStatus = useCallback((status: TaskStatus | "all") => {
    setStatusFilter(status);
  }, []);

  /**
   * Filter tasks by priority
   */
  const filterByPriority = useCallback((priority: PriorityLevel | "all") => {
    setPriorityFilter(priority);
  }, []);

  /**
   * Sort tasks
   */
  const sortTasks = useCallback(
    (
      sortField: "priority" | "dueDate" | "createdAt",
      direction: "asc" | "desc" = "asc",
    ) => {
      setSortBy(sortField);
      setSortDirection(direction);
      setSort(sortField, direction);
    },
    [setSort],
  );

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
    setFilter({});
    applyFilters();
  }, [setFilter, applyFilters]);

  /**
   * Get filtered and sorted tasks
   */
  const getProcessedTasks = useCallback((): Task[] => {
    let result = [...tasks];

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

    // Apply sorting
    const priorityOrder: Record<PriorityLevel, number> = {
      critical: 1,
      high: 2,
      medium: 3,
      low: 4,
    };

    result.sort((a, b) => {
      switch (sortBy) {
        case "priority":
          return (
            (priorityOrder[a.priority] - priorityOrder[b.priority]) *
            (sortDirection === "asc" ? 1 : -1)
          );
        case "dueDate":
          return (
            ((a.dueDate?.getTime() || 0) - (b.dueDate?.getTime() || 0)) *
            (sortDirection === "asc" ? 1 : -1)
          );
        case "createdAt":
          return (
            (a.createdAt.getTime() - b.createdAt.getTime()) *
            (sortDirection === "asc" ? 1 : -1)
          );
        default:
          return 0;
      }
    });

    return result;
  }, [tasks, searchQuery, statusFilter, priorityFilter, sortBy, sortDirection]);

  /**
   * Initialize tasks on mount
   */
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  /**
   * Re-fetch tasks when projectId changes
   */
  useEffect(() => {
    if (projectId) {
      fetchTasks();
    }
  }, [projectId, fetchTasks]);

  return {
    tasks,
    filteredTasks,
    isLoading,
    error,
    searchQuery,
    statusFilter,
    priorityFilter,
    sortBy,
    sortDirection,

    // Data fetching
    fetchTasks,
    refetch: fetchTasks,

    // Mutations
    createTask,
    updateTask: updateTaskMutation,
    deleteTask: deleteTaskMutation,
    toggleCompletion,

    // Filtering
    filterByStatus,
    filterByPriority,
    searchTasks,
    resetFilters,
    applyCurrentFilters,

    // Sorting
    sortTasks,

    // State management
    setSearchQuery,
    setStatusFilter,
    setPriorityFilter,
    setSortBy,
    setSortDirection,

    // Utility
    getProcessedTasks,
  };
};

/**
 * Hook for single task management
 */
export const useTask = (taskId?: string) => {
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTask = useCallback(async () => {
    if (!taskId) return;

    try {
      setIsLoading(true);
      setError(null);
      const fetchedTask = await taskService.getTask(taskId);
      setTask(fetchedTask);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch task");
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (taskId) {
      fetchTask();
    }
  }, [taskId, fetchTask]);

  return {
    task,
    isLoading,
    error,
    refetch: fetchTask,
  };
};
