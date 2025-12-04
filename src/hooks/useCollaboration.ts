import { useState, useEffect, useCallback } from 'react';
import { useCollaborationStore } from '../store/useCollaborationStore';
import { collaborationService } from '../services/collaborationService';
import { CollaborationTeam, CollaborationMember, CollaborationSettings } from '../types/collaboration';

/**
 * Custom hook for managing collaboration state and operations
 */
export const useCollaboration = () => {
  const {
    teams,
    members,
    settings,
    filteredTeams,
    currentFilter,
    sortBy,
    sortDirection,
    collaborationError,
    selectedTeamIds,
    selectedMemberIds,
    addTeam,
    updateTeam,
    deleteTeam,
    addMember,
    updateMember,
    deleteMember,
    updateSettings,
    setFilter,
    setSort,
    applyFilters,
    setSelectedTeamIds,
    setSelectedMemberIds,
    getTeamStatistics,
    setCollaborationError
  } = useCollaborationStore();

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(collaborationError);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  /**
   * Fetch all teams from API
   */
  const fetchTeams = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedTeams = await collaborationService.getTeams();
      // Teams are automatically added to store via service
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch teams');
      setCollaborationError(err instanceof Error ? err.message : 'Failed to fetch teams');
    } finally {
      setLoading(false);
    }
  }, [setCollaborationError]);

  /**
   * Create a new team
   */
  const createTeam = useCallback(async (teamData: Omit<CollaborationTeam, 'id' | 'createdAt' | 'updatedAt'>): Promise<CollaborationTeam> => {
    try {
      setLoading(true);
      setError(null);
      const newTeam = await collaborationService.createTeam(teamData);
      return newTeam;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create team');
      setCollaborationError(err instanceof Error ? err.message : 'Failed to create team');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setCollaborationError]);

  /**
   * Update an existing team
   */
  const updateTeamWithState = useCallback(async (teamId: string, updates: Partial<CollaborationTeam>): Promise<CollaborationTeam> => {
    try {
      setLoading(true);
      setError(null);
      const updatedTeam = await collaborationService.updateTeam(teamId, updates);
      return updatedTeam;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update team');
      setCollaborationError(err instanceof Error ? err.message : 'Failed to update team');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setCollaborationError]);

  /**
   * Delete a team
   */
  const deleteTeamWithState = useCallback(async (teamId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await collaborationService.deleteTeam(teamId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete team');
      setCollaborationError(err instanceof Error ? err.message : 'Failed to delete team');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setCollaborationError]);

  /**
   * Add a member to a team
   */
  const addMemberToTeam = useCallback(async (teamId: string, memberData: Omit<CollaborationMember, 'id' | 'teamId' | 'joinedAt'>): Promise<CollaborationMember> => {
    try {
      setLoading(true);
      setError(null);
      const newMember = await collaborationService.addMemberToTeam(teamId, memberData);
      return newMember;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add member');
      setCollaborationError(err instanceof Error ? err.message : 'Failed to add member');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setCollaborationError]);

  /**
   * Remove a member from a team
   */
  const removeMemberFromTeam = useCallback(async (teamId: string, memberId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      await collaborationService.removeMemberFromTeam(teamId, memberId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove member');
      setCollaborationError(err instanceof Error ? err.message : 'Failed to remove member');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setCollaborationError]);

  /**
   * Update member role
   */
  const updateMemberRole = useCallback(async (teamId: string, memberId: string, newRole: CollaborationMember['role']): Promise<CollaborationMember> => {
    try {
      setLoading(true);
      setError(null);
      const updatedMember = await collaborationService.updateMemberRole(teamId, memberId, newRole);
      return updatedMember;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update member role');
      setCollaborationError(err instanceof Error ? err.message : 'Failed to update member role');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setCollaborationError]);

  /**
   * Update team settings
   */
  const updateTeamSettings = useCallback(async (teamId: string, settings: Partial<CollaborationSettings>): Promise<CollaborationSettings> => {
    try {
      setLoading(true);
      setError(null);
      const updatedSettings = await collaborationService.updateTeamSettings(teamId, settings);
      return updatedSettings;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update team settings');
      setCollaborationError(err instanceof Error ? err.message : 'Failed to update team settings');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [setCollaborationError]);

  /**
   * Filter teams by privacy setting
   */
  const filterTeamsByPrivacy = useCallback((privacy: CollaborationTeam['privacySetting']): CollaborationTeam[] => {
    return collaborationService.filterTeamsByPrivacy(privacy);
  }, []);

  /**
   * Search teams by name
   */
  const searchTeamsByName = useCallback((searchTerm: string): CollaborationTeam[] => {
    return collaborationService.searchTeamsByName(searchTerm);
  }, []);

  /**
   * Get team statistics
   */
  const getTeamStats = useCallback((teamId: string) => {
    return getTeamStatistics(teamId);
  }, [getTeamStatistics]);

  /**
   * Refresh all collaboration data
   */
  const refreshCollaborationData = useCallback(async () => {
    try {
      setRefreshing(true);
      await fetchTeams();
    } finally {
      setRefreshing(false);
    }
  }, [fetchTeams]);

  /**
   * Initialize with sample data (for development)
   */
  const initializeWithSampleData = useCallback(() => {
    useCollaborationStore.getState().initializeWithSampleData();
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  // Sync error state with store
  useEffect(() => {
    setError(collaborationError);
  }, [collaborationError]);

  return {
    // State
    teams,
    members,
    settings,
    filteredTeams,
    currentFilter,
    sortBy,
    sortDirection,
    loading,
    error,
    refreshing,
    selectedTeamIds,
    selectedMemberIds,

    // CRUD Operations
    createTeam,
    updateTeamWithState,
    deleteTeamWithState,
    addMemberToTeam,
    removeMemberFromTeam,
    updateMemberRole,
    updateTeamSettings,

    // Filtering and Sorting
    setFilter,
    setSort,
    applyFilters,
    filterTeamsByPrivacy,
    searchTeamsByName,

    // Selection
    setSelectedTeamIds,
    setSelectedMemberIds,

    // Utilities
    getTeamStats,
    refreshCollaborationData,
    initializeWithSampleData
  };
};