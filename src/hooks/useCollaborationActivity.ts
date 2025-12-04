import { useState, useEffect, useCallback } from 'react';
import { useCollaborationStore } from '../store/useCollaborationStore';
import { collaborationActivityService } from '../services/collaborationActivityService';
import { CollaborationActivity } from '../types/collaboration';

/**
 * Custom hook for managing collaboration activity state and operations
 */
export const useCollaborationActivity = (teamId?: string) => {
  const {
    activities,
    addActivity,
    updateActivity,
    deleteActivity,
    selectedActivityIds,
    setSelectedActivityIds
  } = useCollaborationStore();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  /**
   * Fetch activities for a team
   */
  const fetchActivities = useCallback(async () => {
    if (!teamId) return;

    try {
      setLoading(true);
      setError(null);
      const fetchedActivities = await collaborationActivityService.getActivitiesByTeam(teamId);
      // Activities are automatically added to store via service
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activities');
    } finally {
      setLoading(false);
    }
  }, [teamId]);

  /**
   * Create a new activity
   */
  const createActivity = useCallback(async (activityData: Omit<CollaborationActivity, 'id' | 'timestamp'>): Promise<CollaborationActivity> => {
    try {
      setLoading(true);
      setError(null);
      const newActivity = await collaborationActivityService.createActivity(activityData);
      return newActivity;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create activity');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update an existing activity
   */
  const updateActivityWithState = useCallback(async (activityId: string, updates: Partial<CollaborationActivity>): Promise<CollaborationActivity> => {
    try {
      setLoading(true);
      setError(null);

      // Optimistic update
      const currentActivity = activities.find(a => a.id === activityId);
      if (currentActivity) {
        updateActivity(activityId, updates);
      }

      // Call service to update on backend
      const updatedActivity = await collaborationActivityService.createActivity({
        ...currentActivity,
        ...updates,
        timestamp: new Date()
      } as any);

      return updatedActivity;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update activity');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [activities, updateActivity]);

  /**
   * Delete an activity
   */
  const deleteActivityWithState = useCallback(async (activityId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Optimistic update
      deleteActivity(activityId);

      // Call service to delete on backend
      await collaborationActivityService.deleteActivity(activityId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete activity');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [deleteActivity]);

  /**
   * Get recent activities across all teams
   */
  const getRecentActivities = useCallback(async (limit: number = 10): Promise<CollaborationActivity[]> => {
    try {
      setLoading(true);
      setError(null);
      const recentActivities = await collaborationActivityService.getRecentActivities(limit);
      return recentActivities;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch recent activities');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get activities by user
   */
  const getActivitiesByUser = useCallback(async (userId: string): Promise<CollaborationActivity[]> => {
    try {
      setLoading(true);
      setError(null);
      const userActivities = await collaborationActivityService.getActivitiesByUser(userId);
      return userActivities;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user activities');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Filter activities by type
   */
  const filterActivitiesByType = useCallback((type: CollaborationActivity['type']): CollaborationActivity[] => {
    return collaborationActivityService.filterActivitiesByType(activities, type);
  }, [activities]);

  /**
   * Filter activities by date range
   */
  const filterActivitiesByDateRange = useCallback((startDate: Date, endDate: Date): CollaborationActivity[] => {
    return collaborationActivityService.filterActivitiesByDateRange(activities, startDate, endDate);
  }, [activities]);

  /**
   * Sort activities by timestamp (newest first)
   */
  const sortActivitiesByTimestamp = useCallback((): CollaborationActivity[] => {
    return collaborationActivityService.sortActivitiesByTimestamp(activities);
  }, [activities]);

  /**
   * Group activities by date
   */
  const groupActivitiesByDate = useCallback(): Record<string, CollaborationActivity[]> => {
    return collaborationActivityService.groupActivitiesByDate(activities);
  }, [activities]);

  /**
   * Get activity statistics
   */
  const getActivityStats = useCallback((): {
    total: number;
    byType: Record<string, number>;
    byUser: Record<string, number>;
    recent: CollaborationActivity[];
  } => {
    return collaborationActivityService.getActivityStatistics(activities);
  }, [activities]);

  /**
   * Search activities by content
   */
  const searchActivities = useCallback((searchTerm: string): CollaborationActivity[] => {
    return collaborationActivityService.searchActivities(activities, searchTerm);
  }, [activities]);

  /**
   * Format activity for display
   */
  const formatActivityForDisplay = useCallback((activity: CollaborationActivity): string => {
    return collaborationActivityService.formatActivityForDisplay(activity);
  }, []);

  /**
   * Refresh activity data
   */
  const refreshActivityData = useCallback(async () => {
    try {
      setRefreshing(true);
      if (teamId) {
        await fetchActivities();
      }
    } finally {
      setRefreshing(false);
    }
  }, [teamId, fetchActivities]);

  // Initial fetch if teamId is provided
  useEffect(() => {
    if (teamId) {
      fetchActivities();
    }
  }, [teamId, fetchActivities]);

  return {
    // State
    activities,
    loading,
    error,
    refreshing,
    selectedActivityIds,

    // CRUD Operations
    createActivity,
    updateActivityWithState,
    deleteActivityWithState,

    // Fetch Operations
    fetchActivities,
    getRecentActivities,
    getActivitiesByUser,

    // Filtering and Sorting
    filterActivitiesByType,
    filterActivitiesByDateRange,
    sortActivitiesByTimestamp,
    groupActivitiesByDate,
    searchActivities,

    // Utilities
    formatActivityForDisplay,
    getActivityStats,
    refreshActivityData,

    // Selection
    setSelectedActivityIds
  };
};