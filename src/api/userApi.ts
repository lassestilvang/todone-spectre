// @ts-nocheck
import { User } from "../types/user";
import { ApiResponse } from "../types/api";
import { API_BASE_URL } from "../config/app.config";

/**
 * User API Service - Handles all API communication for user CRUD operations
 */
export class UserApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/users`;
  }

  /**
   * Transform user data for API requests
   */
  private transformRequest(userData: Partial<User>): any {
    const { id, createdAt, updatedAt, lastLogin, ...rest } = userData;

    return {
      ...rest,
      createdAt: userData.createdAt?.toISOString(),
      updatedAt: userData.updatedAt?.toISOString(),
      lastLogin: userData.lastLogin?.toISOString(),
    };
  }

  /**
   * Transform API response to User object
   */
  private transformResponse(responseData: any): User {
    return {
      ...responseData,
      id: responseData.id,
      email: responseData.email,
      name: responseData.name,
      avatar: responseData.avatar || null,
      bio: responseData.bio || null,
      createdAt: new Date(responseData.createdAt),
      updatedAt: new Date(responseData.updatedAt),
      lastLogin: responseData.lastLogin
        ? new Date(responseData.lastLogin)
        : null,
      settings: responseData.settings || {
        theme: "system",
        language: "en",
        notifications: {
          emailEnabled: true,
          pushEnabled: true,
          desktopEnabled: true,
          emailFrequency: "daily",
        },
        privacy: {
          profileVisibility: "public",
          activityVisibility: "public",
          searchVisibility: true,
        },
        security: {
          require2FA: false,
          sessionTimeout: 30,
          rememberDevices: true,
        },
      },
      preferences: responseData.preferences || {
        defaultView: "list",
        defaultPriority: "medium",
        taskSorting: {
          field: "dueDate",
          direction: "asc",
        },
        projectSorting: {
          field: "name",
          direction: "asc",
        },
        dateTime: {
          dateFormat: "MMMM d, yyyy",
          timeFormat: "h:mm a",
          weekStartsOn: "sunday",
          timeZone: "UTC",
        },
        ui: {
          density: "comfortable",
          animation: "full",
          sidebarWidth: 240,
          showCompletedTasks: true,
          showArchivedProjects: false,
        },
        keyboardShortcuts: {
          createTask: "Ctrl+N",
          search: "Ctrl+K",
          toggleSidebar: "Ctrl+B",
          quickAdd: "Ctrl+Q",
        },
      },
      stats: responseData.stats || {
        totalTasksCreated: 0,
        totalTasksCompleted: 0,
        totalProjectsCreated: 0,
        totalComments: 0,
        totalAttachments: 0,
        tasksCompletedToday: 0,
        tasksCompletedThisWeek: 0,
        tasksCompletedThisMonth: 0,
        currentStreak: 0,
        longestStreak: 0,
        avgTasksPerDay: 0,
        productivityScore: 0,
      },
      karmaStats: responseData.karmaStats || {
        totalPoints: 0,
        level: 1,
        pointsToNextLevel: 100,
        levelUps: 0,
        achievements: [],
        badges: [],
        streakBonuses: 0,
        completionBonuses: 0,
        collaborationPoints: 0,
      },
      projectIds: responseData.projectIds || [],
      accessibleProjectIds: responseData.accessibleProjectIds || [],
      labelIds: responseData.labelIds || [],
      filterIds: responseData.filterIds || [],
      status: responseData.status || "active",
      role: responseData.role || "user",
      authProvider: responseData.authProvider || "email",
      emailVerified: responseData.emailVerified || false,
      customFields: responseData.customFields || {},
      metadata: responseData.metadata || {},
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
   * Get a single user by ID
   */
  async getUser(userId: string): Promise<ApiResponse<User>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}/${userId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      });

      if (response.success && response.data) {
        return {
          ...response,
          data: this.transformResponse(response.data),
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch user",
        data: null,
      };
    }
  }

  /**
   * Get all users
   */
  async getUsers(): Promise<ApiResponse<User[]>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      });

      if (response.success && response.data) {
        return {
          ...response,
          data: response.data.map((user: any) => this.transformResponse(user)),
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? err.message : "Failed to fetch users",
        data: null,
      };
    }
  }

  /**
   * Update a user
   */
  async updateUser(
    userId: string,
    userData: Partial<User>,
  ): Promise<ApiResponse<User>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}/${userId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(this.transformRequest(userData)),
        });
      });

      if (response.success && response.data) {
        return {
          ...response,
          data: this.transformResponse(response.data),
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to update user",
        data: null,
      };
    }
  }
}

// Singleton instance
export const userApi = new UserApi();
