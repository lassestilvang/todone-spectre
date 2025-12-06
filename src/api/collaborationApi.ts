import {
  CollaborationTeam,
  CollaborationMember,
  CollaborationSettings,
  CollaborationActivity,
} from "../types/collaboration";
import { ApiResponse } from "../types/api";
import { API_BASE_URL } from "../config/app.config";

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
  private transformTeamRequest(
    teamData: Partial<CollaborationTeam>,
  ): Record<string, unknown> {
    const { id, createdAt, updatedAt, members, ...rest } = teamData;

    return {
      ...rest,
      createdAt: teamData.createdAt?.toISOString(),
      updatedAt: teamData.updatedAt?.toISOString(),
    };
  }

  /**
   * Transform API response to CollaborationTeam object
   */
  private transformTeamResponse(
    responseData: Record<string, unknown>,
  ): CollaborationTeam {
    return {
      ...responseData,
      id: responseData.id as string,
      name: responseData.name as string,
      description: (responseData.description || "") as string,
      privacySetting: (responseData.privacySetting ||
        "team-only") as CollaborationTeam["privacySetting"],
      ownerId: responseData.ownerId as string,
      createdAt: new Date(responseData.createdAt as string),
      updatedAt: new Date(responseData.updatedAt as string),
      memberCount: (responseData.memberCount || 0) as number,
      activityCount: (responseData.activityCount || 0) as number,
      members:
        ((responseData.members as Array<Record<string, unknown>>) || [])?.map(
          (member: Record<string, unknown>) =>
            this.transformMemberResponse(member),
        ) || [],
      projectIds: (responseData.projectIds || []) as string[],
      settings: responseData.settings
        ? this.transformSettingsResponse(
            responseData.settings as Record<string, unknown>,
          )
        : undefined,
    };
  }

  /**
   * Transform member data for API requests
   */
  private transformMemberRequest(
    memberData: Partial<CollaborationMember>,
  ): Record<string, unknown> {
    const { id, joinedAt, lastActive, ...rest } = memberData;

    return {
      ...rest,
      joinedAt: memberData.joinedAt?.toISOString(),
      lastActive: memberData.lastActive?.toISOString(),
    };
  }

  /**
   * Transform API response to CollaborationMember object
   */
  private transformMemberResponse(
    responseData: Record<string, unknown>,
  ): CollaborationMember {
    return {
      ...responseData,
      id: responseData.id as string,
      teamId: responseData.teamId as string,
      userId: responseData.userId as string,
      user: responseData.user as unknown,
      role: (responseData.role || "member") as CollaborationMember["role"],
      status: (responseData.status ||
        "active") as CollaborationMember["status"],
      joinedAt: new Date(responseData.joinedAt as string),
      lastActive: responseData.lastActive
        ? new Date(responseData.lastActive as string)
        : undefined,
    };
  }

  /**
   * Transform settings data for API requests
   */
  private transformSettingsRequest(
    settingsData: Partial<CollaborationSettings>,
  ): Record<string, unknown> {
    const { teamId, updatedAt, ...rest } = settingsData;

    return {
      ...rest,
      updatedAt: settingsData.updatedAt?.toISOString(),
    };
  }

  /**
   * Transform API response to CollaborationSettings object
   */
  private transformSettingsResponse(
    responseData: Record<string, unknown>,
  ): CollaborationSettings {
    return {
      ...responseData,
      teamId: responseData.teamId as string,
      notificationSettings:
        (responseData.notificationSettings as CollaborationSettings["notificationSettings"]) || {
          emailNotifications: true,
          pushNotifications: true,
          mentionNotifications: true,
          dailyDigest: false,
        },
      permissionSettings:
        (responseData.permissionSettings as CollaborationSettings["permissionSettings"]) || {
          allowGuestInvites: false,
          allowPublicSharing: false,
          requireAdminApproval: true,
          allowMemberInvites: false,
        },
      privacySettings:
        (responseData.privacySettings as CollaborationSettings["privacySettings"]) || {
          visibleToPublic: false,
          searchable: false,
          allowExternalAccess: false,
        },
      integrationSettings:
        (responseData.integrationSettings as CollaborationSettings["integrationSettings"]) || {
          calendarIntegration: false,
          taskIntegration: false,
          fileIntegration: false,
        },
      updatedAt: new Date(responseData.updatedAt as string),
    };
  }

  /**
   * Transform activity data for API requests
   */
  private transformActivityRequest(
    activityData: Partial<CollaborationActivity>,
  ): Record<string, unknown> {
    const { id, timestamp, ...rest } = activityData;

    return {
      ...rest,
      timestamp: activityData.timestamp?.toISOString(),
    };
  }

  /**
   * Transform API response to CollaborationActivity object
   */
  private transformActivityResponse(
    responseData: Record<string, unknown>,
  ): CollaborationActivity {
    return {
      ...responseData,
      id: responseData.id as string,
      teamId: responseData.teamId as string,
      userId: responseData.userId as string,
      user: responseData.user as unknown,
      action: responseData.action as string,
      type: (responseData.type || "other") as CollaborationActivity["type"],
      timestamp: new Date(responseData.timestamp as string),
      details: responseData.details as unknown,
      entityId: responseData.entityId as string,
      entityType: responseData.entityType as string,
    };
  }

  /**
   * Handle API errors with retry logic
   */
  private async handleApiRequest<T>(
    requestFn: () => Promise<Response>,
  ): Promise<ApiResponse<T>> {
    const MAX_RETRIES = 3;
    let retryCount = 0;

    while (retryCount < MAX_RETRIES) {
      try {
        const response = await requestFn();

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          return {
            success: false,
            message:
              errorData.message || `HTTP error! status: ${response.status}`,
            data: null,
          };
        }

        const data = await response.json();
        return {
          success: true,
          message: "Success",
          data: data,
        };
      } catch (error) {
        retryCount++;
        if (retryCount >= MAX_RETRIES) {
          return {
            success: false,
            message: error instanceof Error ? error.message : "Unknown error",
            data: null,
          };
        }
        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
      }
    }

    return {
      success: false,
      message: "Max retries exceeded",
      data: null,
    };
  }

  /**
   * Create a new team
   */
  async createTeam(
    teamData: Omit<CollaborationTeam, "id">,
  ): Promise<ApiResponse<CollaborationTeam>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}/teams`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(this.transformTeamRequest(teamData)),
        });
      });

      if (response.success && response.data) {
        return {
          ...response,
          data: this.transformTeamResponse(response.data),
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to create team",
        data: null,
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
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      });

      if (response.success && response.data) {
        return {
          ...response,
          data: this.transformTeamResponse(response.data),
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch team",
        data: null,
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
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      });

      if (response.success && response.data) {
        return {
          ...response,
          data: response.data.map((team: Record<string, unknown>) =>
            this.transformTeamResponse(team),
          ),
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch teams",
        data: null,
      };
    }
  }

  /**
   * Update a team
   */
  async updateTeam(
    teamId: string,
    teamData: Partial<CollaborationTeam>,
  ): Promise<ApiResponse<CollaborationTeam>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}/teams/${teamId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(this.transformTeamRequest(teamData)),
        });
      });

      if (response.success && response.data) {
        return {
          ...response,
          data: this.transformTeamResponse(response.data),
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to update team",
        data: null,
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
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      });

      return {
        success: response.success,
        message: response.message,
        data: undefined,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to delete team",
        data: undefined,
      };
    }
  }

  /**
   * Add a member to a team
   */
  async addMemberToTeam(
    teamId: string,
    memberData: Omit<CollaborationMember, "id">,
  ): Promise<ApiResponse<CollaborationMember>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}/teams/${teamId}/members`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(this.transformMemberRequest(memberData)),
        });
      });

      if (response.success && response.data) {
        return {
          ...response,
          data: this.transformMemberResponse(response.data),
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to add member",
        data: null,
      };
    }
  }

  /**
   * Remove a member from a team
   */
  async removeMemberFromTeam(
    teamId: string,
    memberId: string,
  ): Promise<ApiResponse<void>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(
          `${this.baseUrl}/teams/${teamId}/members/${memberId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
      });

      return {
        success: response.success,
        message: response.message,
        data: undefined,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to remove member",
        data: undefined,
      };
    }
  }

  /**
   * Update member role
   */
  async updateMemberRole(
    teamId: string,
    memberId: string,
    newRole: CollaborationMember["role"],
  ): Promise<ApiResponse<CollaborationMember>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(
          `${this.baseUrl}/teams/${teamId}/members/${memberId}/role`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: JSON.stringify({ role: newRole }),
          },
        );
      });

      if (response.success && response.data) {
        return {
          ...response,
          data: this.transformMemberResponse(response.data),
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update member role",
        data: null,
      };
    }
  }

  /**
   * Get team members
   */
  async getTeamMembers(
    teamId: string,
  ): Promise<ApiResponse<CollaborationMember[]>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}/teams/${teamId}/members`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      });

      if (response.success && response.data) {
        return {
          ...response,
          data: response.data.map((member: Record<string, unknown>) =>
            this.transformMemberResponse(member),
          ),
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch team members",
        data: null,
      };
    }
  }

  /**
   * Update team settings
   */
  async updateTeamSettings(
    teamId: string,
    settings: Partial<CollaborationSettings>,
  ): Promise<ApiResponse<CollaborationSettings>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}/teams/${teamId}/settings`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(this.transformSettingsRequest(settings)),
        });
      });

      if (response.success && response.data) {
        return {
          ...response,
          data: this.transformSettingsResponse(response.data),
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update team settings",
        data: null,
      };
    }
  }

  /**
   * Get team settings
   */
  async getTeamSettings(
    teamId: string,
  ): Promise<ApiResponse<CollaborationSettings>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}/teams/${teamId}/settings`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      });

      if (response.success && response.data) {
        return {
          ...response,
          data: this.transformSettingsResponse(response.data),
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch team settings",
        data: null,
      };
    }
  }

  /**
   * Create a new activity
   */
  async createActivity(
    activityData: Omit<CollaborationActivity, "id">,
  ): Promise<ApiResponse<CollaborationActivity>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}/activities`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(this.transformActivityRequest(activityData)),
        });
      });

      if (response.success && response.data) {
        return {
          ...response,
          data: this.transformActivityResponse(response.data),
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to create activity",
        data: null,
      };
    }
  }

  /**
   * Get activities by team ID
   */
  async getActivitiesByTeam(
    teamId: string,
  ): Promise<ApiResponse<CollaborationActivity[]>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}/activities?teamId=${teamId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      });

      if (response.success && response.data) {
        return {
          ...response,
          data: response.data.map((activity: Record<string, unknown>) =>
            this.transformActivityResponse(activity),
          ),
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch activities",
        data: null,
      };
    }
  }

  /**
   * Get recent activities across all teams
   */
  async getRecentActivities(
    limit: number = 10,
  ): Promise<ApiResponse<CollaborationActivity[]>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}/activities/recent?limit=${limit}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      });

      if (response.success && response.data) {
        return {
          ...response,
          data: response.data.map((activity: Record<string, unknown>) =>
            this.transformActivityResponse(activity),
          ),
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch recent activities",
        data: null,
      };
    }
  }

  /**
   * Get activities by user
   */
  async getActivitiesByUser(
    userId: string,
  ): Promise<ApiResponse<CollaborationActivity[]>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}/activities?userId=${userId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      });

      if (response.success && response.data) {
        return {
          ...response,
          data: response.data.map((activity: Record<string, unknown>) =>
            this.transformActivityResponse(activity),
          ),
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch user activities",
        data: null,
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
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      });

      return {
        success: response.success,
        message: response.message,
        data: undefined,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to delete activity",
        data: undefined,
      };
    }
  }
}

// Singleton instance
export const collaborationApi = new CollaborationApi();
