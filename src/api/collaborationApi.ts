import { CollaborationTeam, CollaborationMember, CollaborationSettings, CollaborationActivity } from '../types/collaboration';
import { ApiResponse } from '../types/api';
import { API_BASE_URL } from '../config/app.config';

/**
 * Collaboration API Service - Handles all API communication for collaboration features
 */
export class CollaborationApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/collaboration`;
  }

  /**
   * Transform team data for API requests
   */
  private transformTeamRequest(teamData: Partial<CollaborationTeam>): any {
    const { id, createdAt, updatedAt, members, ...rest } = teamData;

    return {
      ...rest,
      createdAt: teamData.createdAt?.toISOString(),
      updatedAt: teamData.updatedAt?.toISOString()
    };
  }

  /**
   * Transform API response to CollaborationTeam object
   */
  private transformTeamResponse(responseData: any): CollaborationTeam {
    return {
      ...responseData,
      id: responseData.id,
      name: responseData.name,
      description: responseData.description || '',
      privacySetting: responseData.privacySetting || 'team-only',
      ownerId: responseData.ownerId,
      createdAt: new Date(responseData.createdAt),
      updatedAt: new Date(responseData.updatedAt),
      memberCount: responseData.memberCount || 0,
      activityCount: responseData.activityCount || 0,
      members: responseData.members?.map((member: any) => this.transformMemberResponse(member)) || [],
      projectIds: responseData.projectIds || [],
      settings: responseData.settings ? this.transformSettingsResponse(responseData.settings) : undefined
    };
  }

  /**
   * Transform member data for API requests
   */
  private transformMemberRequest(memberData: Partial<CollaborationMember>): any {
    const { id, joinedAt, lastActive, ...rest } = memberData;

    return {
      ...rest,
      joinedAt: memberData.joinedAt?.toISOString(),
      lastActive: memberData.lastActive?.toISOString()
    };
  }

  /**
   * Transform API response to CollaborationMember object
   */
  private transformMemberResponse(responseData: any): CollaborationMember {
    return {
      ...responseData,
      id: responseData.id,
      teamId: responseData.teamId,
      userId: responseData.userId,
      user: responseData.user,
      role: responseData.role || 'member',
      status: responseData.status || 'active',
      joinedAt: new Date(responseData.joinedAt),
      lastActive: responseData.lastActive ? new Date(responseData.lastActive) : undefined
    };
  }

  /**
   * Transform settings data for API requests
   */
  private transformSettingsRequest(settingsData: Partial<CollaborationSettings>): any {
    const { teamId, updatedAt, ...rest } = settingsData;

    return {
      ...rest,
      updatedAt: settingsData.updatedAt?.toISOString()
    };
  }

  /**
   * Transform API response to CollaborationSettings object
   */
  private transformSettingsResponse(responseData: any): CollaborationSettings {
    return {
      ...responseData,
      teamId: responseData.teamId,
      notificationSettings: responseData.notificationSettings || {
        emailNotifications: true,
        pushNotifications: true,
        mentionNotifications: true,
        dailyDigest: false
      },
      permissionSettings: responseData.permissionSettings || {
        allowGuestInvites: false,
        allowPublicSharing: false,
        requireAdminApproval: true,
        allowMemberInvites: false
      },
      privacySettings: responseData.privacySettings || {
        visibleToPublic: false,
        searchable: false,
        allowExternalAccess: false
      },
      integrationSettings: responseData.integrationSettings || {
        calendarIntegration: false,
        taskIntegration: false,
        fileIntegration: false
      },
      updatedAt: new Date(responseData.updatedAt)
    };
  }

  /**
   * Transform activity data for API requests
   */
  private transformActivityRequest(activityData: Partial<CollaborationActivity>): any {
    const { id, timestamp, ...rest } = activityData;

    return {
      ...rest,
      timestamp: activityData.timestamp?.toISOString()
    };
  }

  /**
   * Transform API response to CollaborationActivity object
   */
  private transformActivityResponse(responseData: any): CollaborationActivity {
    return {
      ...responseData,
      id: responseData.id,
      teamId: responseData.teamId,
      userId: responseData.userId,
      user: responseData.user,
      action: responseData.action,
      type: responseData.type || 'other',
      timestamp: new Date(responseData.timestamp),
      details: responseData.details,
      entityId: responseData.entityId,
      entityType: responseData.entityType
    };
  }

  /**
   * Handle API errors with retry logic
   */
  private async handleApiRequest<T>(requestFn: () => Promise<Response>): Promise<ApiResponse<T>> {
    const MAX_RETRIES = 3;
    let retryCount = 0;

    while (retryCount < MAX_RETRIES) {
      try {
        const response = await requestFn();

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          return {
            success: false,
            message: errorData.message || `HTTP error! status: ${response.status}`,
            data: null
          };
        }

        const data = await response.json();
        return {
          success: true,
          message: 'Success',
          data: data
        };
      } catch (error) {
        retryCount++;
        if (retryCount >= MAX_RETRIES) {
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error',
            data: null
          };
        }
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }

    return {
      success: false,
      message: 'Max retries exceeded',
      data: null
    };
  }

  /**
   * Create a new team
   */
  async createTeam(teamData: Omit<CollaborationTeam, 'id'>): Promise<ApiResponse<CollaborationTeam>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}/teams`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(this.transformTeamRequest(teamData))
        });
      });

      if (response.success && response.data) {
        return {
          ...response,
          data: this.transformTeamResponse(response.data)
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create team',
        data: null
      };
    }
  }

  /**
   * Get a single team by ID
   */
  async getTeam(teamId: string): Promise<ApiResponse<CollaborationTeam>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}/teams/${teamId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      });

      if (response.success && response.data) {
        return {
          ...response,
          data: this.transformTeamResponse(response.data)
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch team',
        data: null
      };
    }
  }

  /**
   * Get all teams
   */
  async getTeams(): Promise<ApiResponse<CollaborationTeam[]>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}/teams`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      });

      if (response.success && response.data) {
        return {
          ...response,
          data: response.data.map((team: any) => this.transformTeamResponse(team))
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch teams',
        data: null
      };
    }
  }

  /**
   * Update a team
   */
  async updateTeam(teamId: string, teamData: Partial<CollaborationTeam>): Promise<ApiResponse<CollaborationTeam>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}/teams/${teamId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(this.transformTeamRequest(teamData))
        });
      });

      if (response.success && response.data) {
        return {
          ...response,
          data: this.transformTeamResponse(response.data)
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update team',
        data: null
      };
    }
  }

  /**
   * Delete a team
   */
  async deleteTeam(teamId: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}/teams/${teamId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      });

      return {
        success: response.success,
        message: response.message,
        data: undefined
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete team',
        data: undefined
      };
    }
  }

  /**
   * Add a member to a team
   */
  async addMemberToTeam(teamId: string, memberData: Omit<CollaborationMember, 'id'>): Promise<ApiResponse<CollaborationMember>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}/teams/${teamId}/members`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(this.transformMemberRequest(memberData))
        });
      });

      if (response.success && response.data) {
        return {
          ...response,
          data: this.transformMemberResponse(response.data)
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to add member',
        data: null
      };
    }
  }

  /**
   * Remove a member from a team
   */
  async removeMemberFromTeam(teamId: string, memberId: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}/teams/${teamId}/members/${memberId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      });

      return {
        success: response.success,
        message: response.message,
        data: undefined
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to remove member',
        data: undefined
      };
    }
  }

  /**
   * Update member role
   */
  async updateMemberRole(teamId: string, memberId: string, newRole: CollaborationMember['role']): Promise<ApiResponse<CollaborationMember>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}/teams/${teamId}/members/${memberId}/role`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ role: newRole })
        });
      });

      if (response.success && response.data) {
        return {
          ...response,
          data: this.transformMemberResponse(response.data)
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update member role',
        data: null
      };
    }
  }

  /**
   * Get team members
   */
  async getTeamMembers(teamId: string): Promise<ApiResponse<CollaborationMember[]>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}/teams/${teamId}/members`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      });

      if (response.success && response.data) {
        return {
          ...response,
          data: response.data.map((member: any) => this.transformMemberResponse(member))
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch team members',
        data: null
      };
    }
  }

  /**
   * Update team settings
   */
  async updateTeamSettings(teamId: string, settings: Partial<CollaborationSettings>): Promise<ApiResponse<CollaborationSettings>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}/teams/${teamId}/settings`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(this.transformSettingsRequest(settings))
        });
      });

      if (response.success && response.data) {
        return {
          ...response,
          data: this.transformSettingsResponse(response.data)
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update team settings',
        data: null
      };
    }
  }

  /**
   * Get team settings
   */
  async getTeamSettings(teamId: string): Promise<ApiResponse<CollaborationSettings>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}/teams/${teamId}/settings`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      });

      if (response.success && response.data) {
        return {
          ...response,
          data: this.transformSettingsResponse(response.data)
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch team settings',
        data: null
      };
    }
  }

  /**
   * Create a new activity
   */
  async createActivity(activityData: Omit<CollaborationActivity, 'id'>): Promise<ApiResponse<CollaborationActivity>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}/activities`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(this.transformActivityRequest(activityData))
        });
      });

      if (response.success && response.data) {
        return {
          ...response,
          data: this.transformActivityResponse(response.data)
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create activity',
        data: null
      };
    }
  }

  /**
   * Get activities by team ID
   */
  async getActivitiesByTeam(teamId: string): Promise<ApiResponse<CollaborationActivity[]>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}/activities?teamId=${teamId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      });

      if (response.success && response.data) {
        return {
          ...response,
          data: response.data.map((activity: any) => this.transformActivityResponse(activity))
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch activities',
        data: null
      };
    }
  }

  /**
   * Get recent activities across all teams
   */
  async getRecentActivities(limit: number = 10): Promise<ApiResponse<CollaborationActivity[]>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}/activities/recent?limit=${limit}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      });

      if (response.success && response.data) {
        return {
          ...response,
          data: response.data.map((activity: any) => this.transformActivityResponse(activity))
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch recent activities',
        data: null
      };
    }
  }

  /**
   * Get activities by user
   */
  async getActivitiesByUser(userId: string): Promise<ApiResponse<CollaborationActivity[]>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}/activities?userId=${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      });

      if (response.success && response.data) {
        return {
          ...response,
          data: response.data.map((activity: any) => this.transformActivityResponse(activity))
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch user activities',
        data: null
      };
    }
  }

  /**
   * Delete an activity
   */
  async deleteActivity(activityId: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}/activities/${activityId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      });

      return {
        success: response.success,
        message: response.message,
        data: undefined
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete activity',
        data: undefined
      };
    }
  }
}

// Singleton instance
export const collaborationApi = new CollaborationApi();