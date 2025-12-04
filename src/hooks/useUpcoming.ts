import { useState, useEffect, useCallback } from 'react';
import { Task } from '../types/task';
import { upcomingService } from '../services/upcomingService';
import { useTaskStore } from '../store/useTaskStore';

/**
 * Custom hook for Upcoming view management
 */
export const useUpcoming = (projectId?: string) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [priorityFilter, setPriorityFilter] = useState<string | 'all'>('all');
  const [timeRangeFilter, setTimeRangeFilter] = useState<'next-week' | 'next-month' | 'next-3-months' | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { tasks: allTasks, setTasks } = useTaskStore();

  /**
   * Fetch upcoming tasks
   */
  const fetchUpcomingTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const tasks = await upcomingService.getUpcomingTasks(projectId);
      setTasks(tasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch upcoming tasks');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, setTasks]);

  /**
   * Get filtered and processed upcoming tasks
   */
  const getProcessedTasks = useCallback((): Task[] => {
    let result = [...allTasks];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(task =>
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query))
      );
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      result = result.filter(task => task.priority === priorityFilter);
    }

    // Apply time range filter
    result = upcomingService.filterByTimeRange(result, timeRangeFilter);

    return result;
  }, [allTasks, searchQuery, priorityFilter, timeRangeFilter]);

  /**
   * Get grouped tasks by time period
   */
  const getGroupedTasks = useCallback((): {
    nextWeek: Record<string, Task[]>;
    futureMonths: Record<string, Task[]>;
  } => {
    const processedTasks = getProcessedTasks();
    return upcomingService.groupUpcomingTasks(processedTasks);
  }, [getProcessedTasks]);

  /**
   * Get upcoming statistics
   */
  const getStatistics = useCallback(async () => {
    try {
      return await upcomingService.getUpcomingStatistics(projectId);
    } catch (err) {
      console.error('Error getting upcoming statistics:', err);
      return null;
    }
  }, [projectId]);

  /**
   * Filter by priority
   */
  const filterByPriority = useCallback((priority: string | 'all') => {
    setPriorityFilter(priority);
  }, []);

  /**
   * Filter by time range
   */
  const filterByTimeRange = useCallback((range: 'next-week' | 'next-month' | 'next-3-months' | 'all') => {
    setTimeRangeFilter(range);
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
    setSearchQuery('');
    setPriorityFilter('all');
    setTimeRangeFilter('all');
  }, []);

  /**
   * Get tasks in specific date range
   */
  const getTasksInDateRange = useCallback(async (startDate: Date, endDate: Date): Promise<Task[]> => {
    try {
      return await upcomingService.getTasksInDateRange(startDate, endDate, projectId);
    } catch (err) {
      console.error('Error getting tasks in date range:', err);
      return [];
    }
  }, [projectId]);

  /**
   * Initialize upcoming data on mount
   */
  useEffect(() => {
    fetchUpcomingTasks();
  }, [fetchUpcomingTasks]);

  /**
   * Re-fetch when projectId changes
   */
  useEffect(() => {
    if (projectId) {
      fetchUpcomingTasks();
    }
  }, [projectId, fetchUpcomingTasks]);

  return {
    tasks: allTasks,
    isLoading,
    error,
    priorityFilter,
    timeRangeFilter,
    searchQuery,

    // Data fetching
    fetchUpcomingTasks,
    refetch: fetchUpcomingTasks,

    // Filtering
    filterByPriority,
    filterByTimeRange,
    searchTasks,
    resetFilters,

    // State management
    setPriorityFilter,
    setTimeRangeFilter,
    setSearchQuery,

    // Utility
    getProcessedTasks,
    getGroupedTasks,
    getStatistics,
    getTasksInDateRange
  };
};