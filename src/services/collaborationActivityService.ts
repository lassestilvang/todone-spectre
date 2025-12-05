import { CollaborationActivity } from "../types/collaboration";
import { ApiResponse } from "../types/api";
import { collaborationApi } from "../api/collaborationApi";
import { useCollaborationStore } from "../store/useCollaborationStore";

/**
 * Collaboration Activity Service - Handles all collaboration activity-related business logic
 */
export class CollaborationActivityService {
  private static instance: CollaborationActivityService;
  private collaborationStore = useCollaborationStore.getState();

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance of CollaborationActivityService
   */
  public static getInstance(): CollaborationActivityService {
    if (!CollaborationActivityService.instance) {
      CollaborationActivityService.instance =
        new CollaborationActivityService();
    }
    return CollaborationActivityService.instance;
  }

  /**
   * Validate activity data
   */
  private validateActivity(activityData: Partial<CollaborationActivity>): void {
    if (!activityData.userId) {
      throw new Error("User ID is required");
    }

    if (!activityData.teamId) {
      throw new Error("Team ID is required");
    }

    if (!activityData.action || activityData.action.trim().length === 0) {
      throw new Error("Activity action is required");
    }

    if (activityData.action.length > 500) {
      throw new Error("Activity action cannot exceed 500 characters");
    }

    if (
      activityData.type &&
      ![
        "message",
        "file",
        "task",
        "other",
        "member_added",
        "member_removed",
        "settings_updated",
      ].includes(activityData.type)
    ) {
      throw new Error("Invalid activity type");
    }
  }

  /**
   * Create a new activity
   */
  async createActivity(
    activityData: Omit<CollaborationActivity, "id" | "timestamp">,
  ): Promise<CollaborationActivity> {
    this.validateActivity(activityData);

    const newActivity: Omit<CollaborationActivity, "id"> = {
      ...activityData,
      timestamp: new Date(),
    };

    try {
      const response: ApiResponse<CollaborationActivity> =
        await collaborationApi.createActivity(newActivity);

      if (response.success && response.data) {
        // Update team activity count
        const currentTeam = this.collaborationStore.teams.find(
          (team) => team.id === activityData.teamId,
        );
        if (currentTeam) {
          this.collaborationStore.updateTeam(activityData.teamId, {
            activityCount: (currentTeam.activityCount || 0) + 1,
          });
        }

        return response.data;
      } else {
        throw new Error(response.message || "Failed to create activity");
      }
    } catch (error) {
      console.error("Error creating activity:", error);
      throw error;
    }
  }

  /**
   * Get activities by team ID
   */
  async getActivitiesByTeam(teamId: string): Promise<CollaborationActivity[]> {
    try {
      const response: ApiResponse<CollaborationActivity[]> =
        await collaborationApi.getActivitiesByTeam(teamId);

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to fetch activities");
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
      throw error;
    }
  }

  /**
   * Get recent activities across all teams
   */
  async getRecentActivities(
    limit: number = 10,
  ): Promise<CollaborationActivity[]> {
    try {
      const response: ApiResponse<CollaborationActivity[]> =
        await collaborationApi.getRecentActivities(limit);

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(
          response.message || "Failed to fetch recent activities",
        );
      }
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      throw error;
    }
  }

  /**
   * Get activities by user
   */
  async getActivitiesByUser(userId: string): Promise<CollaborationActivity[]> {
    try {
      const response: ApiResponse<CollaborationActivity[]> =
        await collaborationApi.getActivitiesByUser(userId);

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to fetch user activities");
      }
    } catch (error) {
      console.error("Error fetching user activities:", error);
      throw error;
    }
  }

  /**
   * Delete an activity
   */
  async deleteActivity(activityId: string): Promise<void> {
    try {
      const response: ApiResponse<void> =
        await collaborationApi.deleteActivity(activityId);

      if (!response.success) {
        throw new Error(response.message || "Failed to delete activity");
      }
    } catch (error) {
      console.error("Error deleting activity:", error);
      throw error;
    }
  }

  /**
   * Filter activities by type
   */
  filterActivitiesByType(
    activities: CollaborationActivity[],
    type: CollaborationActivity["type"],
  ): CollaborationActivity[] {
    return activities.filter((activity) => activity.type === type);
  }

  /**
   * Filter activities by date range
   */
  filterActivitiesByDateRange(
    activities: CollaborationActivity[],
    startDate: Date,
    endDate: Date,
  ): CollaborationActivity[] {
    return activities.filter((activity) => {
      const activityDate = new Date(activity.timestamp);
      return activityDate >= startDate && activityDate <= endDate;
    });
  }

  /**
   * Sort activities by timestamp (newest first)
   */
  sortActivitiesByTimestamp(
    activities: CollaborationActivity[],
  ): CollaborationActivity[] {
    return [...activities].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }

  /**
   * Group activities by date
   */
  groupActivitiesByDate(
    activities: CollaborationActivity[],
  ): Record<string, CollaborationActivity[]> {
    const grouped: Record<string, CollaborationActivity[]> = {};

    activities.forEach((activity) => {
      const date = new Date(activity.timestamp);
      const dateKey = date.toDateString();

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(activity);
    });

    return grouped;
  }

  /**
   * Get activity statistics
   */
  getActivityStatistics(activities: CollaborationActivity[]): {
    total: number;
    byType: Record<string, number>;
    byUser: Record<string, number>;
    recent: CollaborationActivity[];
  } {
    const byType: Record<string, number> = {};
    const byUser: Record<string, number> = {};
    const recent = [...activities]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, 5);

    activities.forEach((activity) => {
      byType[activity.type] = (byType[activity.type] || 0) + 1;
      byUser[activity.userId] = (byUser[activity.userId] || 0) + 1;
    });

    return {
      total: activities.length,
      byType,
      byUser,
      recent,
    };
  }

  /**
   * Search activities by content
   */
  searchActivities(
    activities: CollaborationActivity[],
    searchTerm: string,
  ): CollaborationActivity[] {
    return activities.filter(
      (activity) =>
        activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (activity.details &&
          activity.details.toLowerCase().includes(searchTerm.toLowerCase())),
    );
  }

  /**
   * Format activity for display
   */
  formatActivityForDisplay(activity: CollaborationActivity): string {
    const userName = this.getUserName(activity.userId);
    const date = new Date(activity.timestamp).toLocaleString();

    return `${userName} ${activity.action} (${date})`;
  }

  /**
   * Get user name from user ID (placeholder - would be implemented with user service)
   */
  private getUserName(userId: string): string {
    // In a real implementation, this would fetch from user service
    return `User ${userId.substring(0, 8)}`;
  }
}

// Singleton instance
export const collaborationActivityService =
  CollaborationActivityService.getInstance();
