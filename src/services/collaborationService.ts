import { CollaborationTeam, CollaborationMember, CollaborationSettings, CollaborationActivity } from '../types/collaboration';
import { ApiResponse } from '../types/api';
import { collaborationApi } from '../api/collaborationApi';
import { useCollaborationStore } from '../store/useCollaborationStore';

/**
 * Collaboration Service - Handles all collaboration-related business logic and CRUD operations
 */
export class CollaborationService {
  private static instance: CollaborationService;
  private collaborationStore = useCollaborationStore.getState();

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance of CollaborationService
   */
  public static getInstance(): CollaborationService {
    if (!CollaborationService.instance) {
      CollaborationService.instance = new CollaborationService();
    }
    return CollaborationService.instance;
  }

  /**
   * Validate team data before creation/update
   */
  private validateTeam(teamData: Partial<CollaborationTeam>): void {
    if (!teamData.name || teamData.name.trim().length === 0) {
      throw new Error('Team name is required');
    }

    if (teamData.name.length > 100) {
      throw new Error('Team name cannot exceed 100 characters');
    }

    if (teamData.description && teamData.description.length > 1000) {
      throw new Error('Team description cannot exceed 1000 characters');
    }

    if (teamData.privacySetting && !['public', 'private', 'team-only'].includes(teamData.privacySetting)) {
      throw new Error('Invalid privacy setting');
    }
  }

  /**
   * Validate member data
   */
  private validateMember(memberData: Partial<CollaborationMember>): void {
    if (!memberData.userId) {
      throw new Error('User ID is required');
    }

    if (memberData.role && !['admin', 'member', 'guest'].includes(memberData.role)) {
      throw new Error('Invalid member role');
    }

    if (memberData.status && !['active', 'inactive', 'pending'].includes(memberData.status)) {
      throw new Error('Invalid member status');
    }
  }

  /**
   * Create a new team with validation
   */
  async createTeam(teamData: Omit<CollaborationTeam, 'id' | 'createdAt' | 'updatedAt'>): Promise<CollaborationTeam> {
    this.validateTeam(teamData);

    const newTeam: Omit<CollaborationTeam, 'id'> = {
      ...teamData,
      createdAt: new Date(),
      updatedAt: new Date(),
      memberCount: teamData.members?.length || 0,
      activityCount: 0
    };

    try {
      // Optimistic update
      const optimisticTeam: CollaborationTeam = {
        ...newTeam,
        id: `temp-${Date.now()}`
      };

      this.collaborationStore.addTeam(optimisticTeam);

      // Call API
      const response: ApiResponse<CollaborationTeam> = await collaborationApi.createTeam(newTeam);

      if (response.success && response.data) {
        // Replace temporary ID with real ID
        this.collaborationStore.updateTeam(optimisticTeam.id, {
          id: response.data.id,
          ...response.data
        });
        return response.data;
      } else {
        // Revert optimistic update on failure
        this.collaborationStore.deleteTeam(optimisticTeam.id);
        throw new Error(response.message || 'Failed to create team');
      }
    } catch (error) {
      console.error('Error creating team:', error);
      throw error;
    }
  }

  /**
   * Get a single team by ID
   */
  async getTeam(teamId: string): Promise<CollaborationTeam> {
    try {
      const response: ApiResponse<CollaborationTeam> = await collaborationApi.getTeam(teamId);

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Team not found');
      }
    } catch (error) {
      console.error('Error fetching team:', error);
      throw error;
    }
  }

  /**
   * Get all teams
   */
  async getTeams(): Promise<CollaborationTeam[]> {
    try {
      const response: ApiResponse<CollaborationTeam[]> = await collaborationApi.getTeams();

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch teams');
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
  }

  /**
   * Update a team with optimistic updates
   */
  async updateTeam(teamId: string, updates: Partial<CollaborationTeam>): Promise<CollaborationTeam> {
    this.validateTeam(updates);

    try {
      // Get current team for optimistic update
      const currentTeam = this.collaborationStore.teams.find(team => team.id === teamId);
      if (!currentTeam) {
        throw new Error('Team not found');
      }

      // Optimistic update
      const optimisticUpdate = {
        ...updates,
        updatedAt: new Date()
      };

      this.collaborationStore.updateTeam(teamId, optimisticUpdate);

      // Call API
      const response: ApiResponse<CollaborationTeam> = await collaborationApi.updateTeam(teamId, updates);

      if (response.success && response.data) {
        return response.data;
      } else {
        // Revert optimistic update on failure
        this.collaborationStore.updateTeam(teamId, currentTeam);
        throw new Error(response.message || 'Failed to update team');
      }
    } catch (error) {
      console.error('Error updating team:', error);
      throw error;
    }
  }

  /**
   * Delete a team with confirmation
   */
  async deleteTeam(teamId: string, confirm: boolean = true): Promise<void> {
    if (confirm) {
      // In a real app, this would show a confirmation dialog
      console.log('Team deletion requires confirmation');
    }

    try {
      // Optimistic update
      this.collaborationStore.deleteTeam(teamId);

      // Call API
      const response: ApiResponse<void> = await collaborationApi.deleteTeam(teamId);

      if (!response.success) {
        // Revert optimistic update on failure
        console.error('Failed to delete team:', response.message);
        throw new Error(response.message || 'Failed to delete team');
      }
    } catch (error) {
      console.error('Error deleting team:', error);
      throw error;
    }
  }

  /**
   * Add a member to a team
   */
  async addMemberToTeam(teamId: string, memberData: Omit<CollaborationMember, 'id' | 'teamId' | 'joinedAt'>): Promise<CollaborationMember> {
    this.validateMember(memberData);

    const newMember: Omit<CollaborationMember, 'id'> = {
      ...memberData,
      teamId,
      joinedAt: new Date(),
      status: memberData.status || 'active',
      role: memberData.role || 'member'
    };

    try {
      const response: ApiResponse<CollaborationMember> = await collaborationApi.addMemberToTeam(teamId, newMember);

      if (response.success && response.data) {
        // Update team member count
        const currentTeam = this.collaborationStore.teams.find(team => team.id === teamId);
        if (currentTeam) {
          this.collaborationStore.updateTeam(teamId, {
            memberCount: (currentTeam.memberCount || 0) + 1
          });
        }

        return response.data;
      } else {
        throw new Error(response.message || 'Failed to add member');
      }
    } catch (error) {
      console.error('Error adding member:', error);
      throw error;
    }
  }

  /**
   * Remove a member from a team
   */
  async removeMemberFromTeam(teamId: string, memberId: string): Promise<void> {
    try {
      const response: ApiResponse<void> = await collaborationApi.removeMemberFromTeam(teamId, memberId);

      if (response.success) {
        // Update team member count
        const currentTeam = this.collaborationStore.teams.find(team => team.id === teamId);
        if (currentTeam) {
          this.collaborationStore.updateTeam(teamId, {
            memberCount: Math.max((currentTeam.memberCount || 0) - 1, 0)
          });
        }
      } else {
        throw new Error(response.message || 'Failed to remove member');
      }
    } catch (error) {
      console.error('Error removing member:', error);
      throw error;
    }
  }

  /**
   * Update member role
   */
  async updateMemberRole(teamId: string, memberId: string, newRole: CollaborationMember['role']): Promise<CollaborationMember> {
    try {
      const response: ApiResponse<CollaborationMember> = await collaborationApi.updateMemberRole(teamId, memberId, newRole);

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update member role');
      }
    } catch (error) {
      console.error('Error updating member role:', error);
      throw error;
    }
  }

  /**
   * Get team members
   */
  async getTeamMembers(teamId: string): Promise<CollaborationMember[]> {
    try {
      const response: ApiResponse<CollaborationMember[]> = await collaborationApi.getTeamMembers(teamId);

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch team members');
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
      throw error;
    }
  }

  /**
   * Update team settings
   */
  async updateTeamSettings(teamId: string, settings: Partial<CollaborationSettings>): Promise<CollaborationSettings> {
    try {
      const response: ApiResponse<CollaborationSettings> = await collaborationApi.updateTeamSettings(teamId, settings);

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to update team settings');
      }
    } catch (error) {
      console.error('Error updating team settings:', error);
      throw error;
    }
  }

  /**
   * Get team settings
   */
  async getTeamSettings(teamId: string): Promise<CollaborationSettings> {
    try {
      const response: ApiResponse<CollaborationSettings> = await collaborationApi.getTeamSettings(teamId);

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch team settings');
      }
    } catch (error) {
      console.error('Error fetching team settings:', error);
      throw error;
    }
  }

  /**
   * Filter teams by privacy setting
   */
  filterTeamsByPrivacy(privacy: CollaborationTeam['privacySetting']): CollaborationTeam[] {
    return this.collaborationStore.teams.filter(team => team.privacySetting === privacy);
  }

  /**
   * Search teams by name
   */
  searchTeamsByName(searchTerm: string): CollaborationTeam[] {
    return this.collaborationStore.teams.filter(team =>
      team.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  /**
   * Get team statistics
   */
  getTeamStatistics(teamId: string): {
    memberCount: number;
    activityCount: number;
    adminCount: number;
  } {
    const team = this.collaborationStore.teams.find(t => t.id === teamId);
    if (!team) return { memberCount: 0, activityCount: 0, adminCount: 0 };

    return {
      memberCount: team.memberCount || 0,
      activityCount: team.activityCount || 0,
      adminCount: team.members?.filter(m => m.role === 'admin').length || 0
    };
  }
}

// Singleton instance
export const collaborationService = CollaborationService.getInstance();