// @ts-nocheck
import {
  CollaborationActivity,
  CollaborationEvent,
  CollaborationEventType,
} from "../types/collaboration";
import { User } from "../types/user";

/**
 * Collaboration Activity Utilities - Helper functions for collaboration activity features
 */

/**
 * Generate a unique activity ID
 */
export function generateActivityId(): string {
  return `activity_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Generate a unique event ID
 */
export function generateEventId(): string {
  return `event_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Create a new activity with default values
 */
export function createDefaultActivity(activityData: {
  teamId: string;
  userId: string;
  action: string;
  type?: CollaborationActivity["type"];
  details?: string;
  entityId?: string;
  entityType?: string;
}): CollaborationActivity {
  return {
    id: generateActivityId(),
    teamId: activityData.teamId,
    userId: activityData.userId,
    action: activityData.action,
    type: activityData.type || "other",
    timestamp: new Date(),
    details: activityData.details,
    entityId: activityData.entityId,
    entityType: activityData.entityType,
  };
}

/**
 * Create a new collaboration event
 */
export function createCollaborationEvent(eventData: {
  type: CollaborationEventType;
  teamId?: string;
  userId?: string;
  data: any;
}): CollaborationEvent {
  return {
    type: eventData.type,
    timestamp: new Date(),
    data: eventData.data,
    teamId: eventData.teamId,
    userId: eventData.userId,
  };
}

/**
 * Format activity for display
 */
export function formatActivityForDisplay(
  activity: CollaborationActivity,
  userMap?: Record<string, string>,
): string {
  const userName = userMap?.[activity.userId] || getUserName(activity.userId);
  const date = new Date(activity.timestamp).toLocaleString();

  return `${userName} ${activity.action} (${date})`;
}

/**
 * Format activity timestamp for display
 */
export function formatActivityTimestamp(
  activity: CollaborationActivity,
): string {
  return new Date(activity.timestamp).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Format activity date for display (date only)
 */
export function formatActivityDate(activity: CollaborationActivity): string {
  return new Date(activity.timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Format activity time for display (time only)
 */
export function formatActivityTime(activity: CollaborationActivity): string {
  return new Date(activity.timestamp).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Get user name from user ID (placeholder - would be implemented with user service)
 */
export function getUserName(userId: string): string {
  // In a real implementation, this would fetch from user service
  return `User ${userId.substring(0, 8)}`;
}

/**
 * Get activity type label for display
 */
export function getActivityTypeLabel(
  type: CollaborationActivity["type"],
): string {
  const typeLabels: Record<CollaborationActivity["type"], string> = {
    message: "Message",
    file: "File",
    task: "Task",
    other: "Other",
    member_added: "Member Added",
    member_removed: "Member Removed",
    settings_updated: "Settings Updated",
  };

  return typeLabels[type] || type;
}

/**
 * Get activity icon based on type
 */
export function getActivityIcon(type: CollaborationActivity["type"]): string {
  const icons: Record<CollaborationActivity["type"], string> = {
    message: "💬",
    file: "📁",
    task: "📋",
    other: "⚡",
    member_added: "👤",
    member_removed: "👥",
    settings_updated: "⚙️",
  };

  return icons[type] || "⚡";
}

/**
 * Get activity color based on type
 */
export function getActivityColor(type: CollaborationActivity["type"]): string {
  const colors: Record<CollaborationActivity["type"], string> = {
    message: "#4285F4", // Blue
    file: "#34A853", // Green
    task: "#FBBC05", // Yellow
    other: "#EA4335", // Red
    member_added: "#673AB7", // Purple
    member_removed: "#9C27B0", // Deep Purple
    settings_updated: "#009688", // Teal
  };

  return colors[type] || "#666666";
}

/**
 * Filter activities by type
 */
export function filterActivitiesByType(
  activities: CollaborationActivity[],
  type: CollaborationActivity["type"],
): CollaborationActivity[] {
  return activities.filter((activity) => activity.type === type);
}

/**
 * Filter activities by user
 */
export function filterActivitiesByUser(
  activities: CollaborationActivity[],
  userId: string,
): CollaborationActivity[] {
  return activities.filter((activity) => activity.userId === userId);
}

/**
 * Filter activities by team
 */
export function filterActivitiesByTeam(
  activities: CollaborationActivity[],
  teamId: string,
): CollaborationActivity[] {
  return activities.filter((activity) => activity.teamId === teamId);
}

/**
 * Filter activities by date range
 */
export function filterActivitiesByDateRange(
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
 * Filter activities by entity type
 */
export function filterActivitiesByEntityType(
  activities: CollaborationActivity[],
  entityType: string,
): CollaborationActivity[] {
  return activities.filter((activity) => activity.entityType === entityType);
}

/**
 * Filter activities by entity ID
 */
export function filterActivitiesByEntityId(
  activities: CollaborationActivity[],
  entityId: string,
): CollaborationActivity[] {
  return activities.filter((activity) => activity.entityId === entityId);
}

/**
 * Sort activities by timestamp (newest first)
 */
export function sortActivitiesByTimestamp(
  activities: CollaborationActivity[],
): CollaborationActivity[] {
  return [...activities].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

/**
 * Sort activities by timestamp (oldest first)
 */
export function sortActivitiesByTimestampAsc(
  activities: CollaborationActivity[],
): CollaborationActivity[] {
  return [...activities].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
  );
}

/**
 * Group activities by date
 */
export function groupActivitiesByDate(
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
 * Group activities by type
 */
export function groupActivitiesByType(
  activities: CollaborationActivity[],
): Record<string, CollaborationActivity[]> {
  const grouped: Record<string, CollaborationActivity[]> = {};

  activities.forEach((activity) => {
    if (!grouped[activity.type]) {
      grouped[activity.type] = [];
    }
    grouped[activity.type].push(activity);
  });

  return grouped;
}

/**
 * Group activities by user
 */
export function groupActivitiesByUser(
  activities: CollaborationActivity[],
): Record<string, CollaborationActivity[]> {
  const grouped: Record<string, CollaborationActivity[]> = {};

  activities.forEach((activity) => {
    if (!grouped[activity.userId]) {
      grouped[activity.userId] = [];
    }
    grouped[activity.userId].push(activity);
  });

  return grouped;
}

/**
 * Get activity statistics
 */
export function getActivityStatistics(activities: CollaborationActivity[]): {
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
 * Get activity statistics by type
 */
export function getActivityStatsByType(
  activities: CollaborationActivity[],
): Record<string, number> {
  const stats: Record<string, number> = {};

  activities.forEach((activity) => {
    stats[activity.type] = (stats[activity.type] || 0) + 1;
  });

  return stats;
}

/**
 * Get activity statistics by user
 */
export function getActivityStatsByUser(
  activities: CollaborationActivity[],
): Record<string, number> {
  const stats: Record<string, number> = {};

  activities.forEach((activity) => {
    stats[activity.userId] = (stats[activity.userId] || 0) + 1;
  });

  return stats;
}

/**
 * Get most active users
 */
export function getMostActiveUsers(
  activities: CollaborationActivity[],
  limit: number = 5,
): Array<{ userId: string; count: number }> {
  const stats = getActivityStatsByUser(activities);

  return Object.entries(stats)
    .map(([userId, count]) => ({ userId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Get most common activity types
 */
export function getMostCommonActivityTypes(
  activities: CollaborationActivity[],
  limit: number = 5,
): Array<{ type: string; count: number }> {
  const stats = getActivityStatsByType(activities);

  return Object.entries(stats)
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

/**
 * Get activity timeline (grouped by time periods)
 */
export function getActivityTimeline(
  activities: CollaborationActivity[],
  period: "day" | "week" | "month" = "day",
): Record<string, number> {
  const timeline: Record<string, number> = {};

  activities.forEach((activity) => {
    const date = new Date(activity.timestamp);
    let periodKey: string;

    switch (period) {
      case "week":
        // Get year and week number
        const weekNumber = Math.floor((date.getDate() - 1) / 7) + 1;
        periodKey = `${date.getFullYear()}-W${weekNumber.toString().padStart(2, "0")}`;
        break;

      case "month":
        periodKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
        break;

      case "day":
      default:
        periodKey = date.toISOString().split("T")[0];
        break;
    }

    timeline[periodKey] = (timeline[periodKey] || 0) + 1;
  });

  return timeline;
}

/**
 * Get activity heatmap data
 */
export function getActivityHeatmap(
  activities: CollaborationActivity[],
): Array<{ date: string; count: number }> {
  const heatmap: Record<string, number> = {};

  activities.forEach((activity) => {
    const date = new Date(activity.timestamp);
    const dateKey = date.toISOString().split("T")[0];

    heatmap[dateKey] = (heatmap[dateKey] || 0) + 1;
  });

  return Object.entries(heatmap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

/**
 * Search activities by content
 */
export function searchActivities(
  activities: CollaborationActivity[],
  searchTerm: string,
): CollaborationActivity[] {
  const term = searchTerm.toLowerCase();

  return activities.filter(
    (activity) =>
      activity.action.toLowerCase().includes(term) ||
      (activity.details && activity.details.toLowerCase().includes(term)) ||
      (activity.entityType &&
        activity.entityType.toLowerCase().includes(term)) ||
      (activity.entityId && activity.entityId.toLowerCase().includes(term)),
  );
}

/**
 * Get activity summary for display
 */
export function getActivitySummary(activity: CollaborationActivity): string {
  const userName = getUserName(activity.userId);
  const typeLabel = getActivityTypeLabel(activity.type);
  const formattedDate = formatActivityDate(activity);

  return `${userName} performed a ${typeLabel.toLowerCase()} activity: ${activity.action} on ${formattedDate}`;
}

/**
 * Get activity detailed summary
 */
export function getActivityDetailedSummary(
  activity: CollaborationActivity,
): string {
  const userName = getUserName(activity.userId);
  const typeLabel = getActivityTypeLabel(activity.type);
  const formattedDate = formatActivityDate(activity);
  const formattedTime = formatActivityTime(activity);

  let summary = `${userName} (${typeLabel}) - ${activity.action}\n`;
  summary += `Date: ${formattedDate} at ${formattedTime}\n`;

  if (activity.details) {
    summary += `Details: ${activity.details}\n`;
  }

  if (activity.entityType && activity.entityId) {
    summary += `Entity: ${activity.entityType} (${activity.entityId})\n`;
  }

  return summary;
}

/**
 * Get activity type statistics summary
 */
export function getActivityTypeStatsSummary(
  activities: CollaborationActivity[],
): string {
  const stats = getActivityStatsByType(activities);
  const total = activities.length;

  const summaryParts = Object.entries(stats).map(([type, count]) => {
    const percentage = Math.round((count / total) * 100);
    return `${getActivityTypeLabel(type as CollaborationActivity["type"])}: ${count} (${percentage}%)`;
  });

  return summaryParts.join(", ");
}

/**
 * Get activity user statistics summary
 */
export function getActivityUserStatsSummary(
  activities: CollaborationActivity[],
  userMap?: Record<string, string>,
): string {
  const stats = getActivityStatsByUser(activities);
  const total = activities.length;

  const summaryParts = Object.entries(stats).map(([userId, count]) => {
    const userName = userMap?.[userId] || getUserName(userId);
    const percentage = Math.round((count / total) * 100);
    return `${userName}: ${count} (${percentage}%)`;
  });

  return summaryParts.join(", ");
}

/**
 * Check if activity is recent (within last 24 hours)
 */
export function isRecentActivity(activity: CollaborationActivity): boolean {
  const activityDate = new Date(activity.timestamp);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - activityDate.getTime()) / (1000 * 60 * 60),
  );

  return diffInHours <= 24;
}

/**
 * Check if activity is from today
 */
export function isTodayActivity(activity: CollaborationActivity): boolean {
  const activityDate = new Date(activity.timestamp);
  const now = new Date();

  return (
    activityDate.getFullYear() === now.getFullYear() &&
    activityDate.getMonth() === now.getMonth() &&
    activityDate.getDate() === now.getDate()
  );
}

/**
 * Check if activity is from this week
 */
export function isThisWeekActivity(activity: CollaborationActivity): boolean {
  const activityDate = new Date(activity.timestamp);
  const now = new Date();

  // Get the start of this week (Monday)
  const startOfWeek = new Date(now);
  startOfWeek.setDate(
    now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1),
  );

  return activityDate >= startOfWeek;
}

/**
 * Check if activity is from this month
 */
export function isThisMonthActivity(activity: CollaborationActivity): boolean {
  const activityDate = new Date(activity.timestamp);
  const now = new Date();

  return (
    activityDate.getFullYear() === now.getFullYear() &&
    activityDate.getMonth() === now.getMonth()
  );
}

/**
 * Get activity age in human-readable format
 */
export function getActivityAge(activity: CollaborationActivity): string {
  const activityDate = new Date(activity.timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor(
    (now.getTime() - activityDate.getTime()) / 1000,
  );

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} days ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} weeks ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths} months ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears} years ago`;
}

/**
 * Get activity age in short format
 */
export function getActivityAgeShort(activity: CollaborationActivity): string {
  const activityDate = new Date(activity.timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor(
    (now.getTime() - activityDate.getTime()) / 1000,
  );

  if (diffInSeconds < 60) return `${diffInSeconds}s`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;

  const diffInDays = Math.floor(diffInSeconds / 86400);
  if (diffInDays < 30) return `${diffInDays}d`;

  return formatActivityDate(activity);
}

/**
 * Validate activity data
 */
export function validateActivity(activity: Partial<CollaborationActivity>): {
  valid: boolean;
  message?: string;
} {
  if (!activity.userId) {
    return { valid: false, message: "User ID is required" };
  }

  if (!activity.teamId) {
    return { valid: false, message: "Team ID is required" };
  }

  if (!activity.action || activity.action.trim().length === 0) {
    return { valid: false, message: "Activity action is required" };
  }

  if (activity.action.length > 500) {
    return {
      valid: false,
      message: "Activity action cannot exceed 500 characters",
    };
  }

  if (
    activity.type &&
    ![
      "message",
      "file",
      "task",
      "other",
      "member_added",
      "member_removed",
      "settings_updated",
    ].includes(activity.type)
  ) {
    return { valid: false, message: "Invalid activity type" };
  }

  return { valid: true };
}

/**
 * Validate activity type
 */
export function validateActivityType(type: CollaborationActivity["type"]): {
  valid: boolean;
  message?: string;
} {
  const validTypes: CollaborationActivity["type"][] = [
    "message",
    "file",
    "task",
    "other",
    "member_added",
    "member_removed",
    "settings_updated",
  ];

  if (!validTypes.includes(type)) {
    return { valid: false, message: "Invalid activity type" };
  }

  return { valid: true };
}

/**
 * Get activity event type from activity
 */
export function getActivityEventType(
  activity: CollaborationActivity,
): CollaborationEventType {
  const eventTypeMap: Record<
    CollaborationActivity["type"],
    CollaborationEventType
  > = {
    message: "activity_created",
    file: "activity_created",
    task: "activity_created",
    other: "activity_created",
    member_added: "member_added",
    member_removed: "member_removed",
    settings_updated: "settings_updated",
  };

  return eventTypeMap[activity.type] || "activity_created";
}

/**
 * Create collaboration event from activity
 */
export function createEventFromActivity(
  activity: CollaborationActivity,
): CollaborationEvent {
  return {
    type: getActivityEventType(activity),
    timestamp: activity.timestamp,
    data: activity,
    teamId: activity.teamId,
    userId: activity.userId,
  };
}

/**
 * Get activity notification message
 */
export function getActivityNotificationMessage(
  activity: CollaborationActivity,
): string {
  const userName = getUserName(activity.userId);
  const typeLabel = getActivityTypeLabel(activity.type);

  return `${userName} performed a ${typeLabel.toLowerCase()} activity: ${activity.action}`;
}

/**
 * Get activity notification title
 */
export function getActivityNotificationTitle(
  activity: CollaborationActivity,
): string {
  const userName = getUserName(activity.userId);
  const typeLabel = getActivityTypeLabel(activity.type);

  return `${userName} - ${typeLabel}`;
}

/**
 * Get activity notification body
 */
export function getActivityNotificationBody(
  activity: CollaborationActivity,
): string {
  return activity.action + (activity.details ? `\n\n${activity.details}` : "");
}

/**
 * Get activity feed item
 */
export function getActivityFeedItem(activity: CollaborationActivity): {
  id: string;
  title: string;
  subtitle: string;
  timestamp: string;
  icon: string;
  color: string;
} {
  const userName = getUserName(activity.userId);
  const typeLabel = getActivityTypeLabel(activity.type);

  return {
    id: activity.id,
    title: `${userName} ${activity.action}`,
    subtitle: typeLabel,
    timestamp: formatActivityTimestamp(activity),
    icon: getActivityIcon(activity.type),
    color: getActivityColor(activity.type),
  };
}

/**
 * Get activity list item
 */
export function getActivityListItem(activity: CollaborationActivity): {
  id: string;
  user: string;
  action: string;
  type: string;
  timestamp: string;
  isRecent: boolean;
} {
  const userName = getUserName(activity.userId);

  return {
    id: activity.id,
    user: userName,
    action: activity.action,
    type: getActivityTypeLabel(activity.type),
    timestamp: formatActivityTimestamp(activity),
    isRecent: isRecentActivity(activity),
  };
}

/**
 * Get activity card data
 */
export function getActivityCardData(activity: CollaborationActivity): {
  id: string;
  title: string;
  subtitle: string;
  timestamp: string;
  icon: string;
  color: string;
  details: string;
  age: string;
} {
  const userName = getUserName(activity.userId);
  const typeLabel = getActivityTypeLabel(activity.type);

  return {
    id: activity.id,
    title: `${userName} ${activity.action}`,
    subtitle: typeLabel,
    timestamp: formatActivityTimestamp(activity),
    icon: getActivityIcon(activity.type),
    color: getActivityColor(activity.type),
    details: activity.details || "No additional details",
    age: getActivityAgeShort(activity),
  };
}

/**
 * Get activity statistics dashboard data
 */
export function getActivityDashboardData(activities: CollaborationActivity[]): {
  totalActivities: number;
  recentActivities: number;
  activityTypes: Array<{ type: string; count: number; percentage: number }>;
  userActivity: Array<{ userId: string; count: number; percentage: number }>;
  timeline: Array<{ date: string; count: number }>;
} {
  const stats = getActivityStatistics(activities);
  const total = stats.total;
  const byType = stats.byType;
  const byUser = stats.byUser;
  const timeline = getActivityHeatmap(activities);

  const activityTypes = Object.entries(byType)
    .map(([type, count]) => ({
      type: getActivityTypeLabel(type as CollaborationActivity["type"]),
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  const userActivity = Object.entries(byUser)
    .map(([userId, count]) => ({
      userId,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  const recentActivities = activities.filter(isRecentActivity).length;

  return {
    totalActivities: total,
    recentActivities,
    activityTypes,
    userActivity,
    timeline,
  };
}

/**
 * Get activity export data (for CSV/JSON export)
 */
export function getActivityExportData(
  activities: CollaborationActivity[],
): Array<{
  id: string;
  teamId: string;
  userId: string;
  action: string;
  type: string;
  timestamp: string;
  details: string;
  entityId: string;
  entityType: string;
}> {
  return activities.map((activity) => ({
    id: activity.id,
    teamId: activity.teamId,
    userId: activity.userId,
    action: activity.action,
    type: activity.type,
    timestamp: activity.timestamp.toISOString(),
    details: activity.details || "",
    entityId: activity.entityId || "",
    entityType: activity.entityType || "",
  }));
}

/**
 * Get activity import validation
 */
export function validateActivityImportData(data: any): {
  valid: boolean;
  message?: string;
} {
  if (
    !data.id ||
    !data.teamId ||
    !data.userId ||
    !data.action ||
    !data.type ||
    !data.timestamp
  ) {
    return { valid: false, message: "Missing required activity fields" };
  }

  if (
    typeof data.id !== "string" ||
    typeof data.teamId !== "string" ||
    typeof data.userId !== "string" ||
    typeof data.action !== "string" ||
    typeof data.type !== "string"
  ) {
    return { valid: false, message: "Invalid activity field types" };
  }

  try {
    new Date(data.timestamp);
  } catch (error) {
    return { valid: false, message: "Invalid timestamp format" };
  }

  return { valid: true };
}

/**
 * Get activity change summary (for activity updates)
 */
export function getActivityChangeSummary(
  oldActivity: CollaborationActivity,
  newActivity: CollaborationActivity,
): string {
  const changes: string[] = [];

  if (oldActivity.action !== newActivity.action) {
    changes.push(
      `Action changed from "${oldActivity.action}" to "${newActivity.action}"`,
    );
  }

  if (oldActivity.type !== newActivity.type) {
    changes.push(
      `Type changed from "${oldActivity.type}" to "${newActivity.type}"`,
    );
  }

  if (oldActivity.details !== newActivity.details) {
    changes.push(
      `Details changed from "${oldActivity.details || "none"}" to "${newActivity.details || "none"}"`,
    );
  }

  if (oldActivity.entityId !== newActivity.entityId) {
    changes.push(
      `Entity ID changed from "${oldActivity.entityId || "none"}" to "${newActivity.entityId || "none"}"`,
    );
  }

  if (oldActivity.entityType !== newActivity.entityType) {
    changes.push(
      `Entity type changed from "${oldActivity.entityType || "none"}" to "${newActivity.entityType || "none"}"`,
    );
  }

  return changes.length > 0
    ? `Activity changes: ${changes.join("; ")}`
    : "No changes detected";
}

/**
 * Get activity comparison data
 */
export function getActivityComparison(
  oldActivity: CollaborationActivity,
  newActivity: CollaborationActivity,
): {
  fieldChanges: Record<string, { oldValue: any; newValue: any }>;
  hasChanges: boolean;
} {
  const fieldChanges: Record<string, { oldValue: any; newValue: any }> = {};

  if (oldActivity.action !== newActivity.action) {
    fieldChanges.action = {
      oldValue: oldActivity.action,
      newValue: newActivity.action,
    };
  }

  if (oldActivity.type !== newActivity.type) {
    fieldChanges.type = {
      oldValue: oldActivity.type,
      newValue: newActivity.type,
    };
  }

  if (oldActivity.details !== newActivity.details) {
    fieldChanges.details = {
      oldValue: oldActivity.details,
      newValue: newActivity.details,
    };
  }

  if (oldActivity.entityId !== newActivity.entityId) {
    fieldChanges.entityId = {
      oldValue: oldActivity.entityId,
      newValue: newActivity.entityId,
    };
  }

  if (oldActivity.entityType !== newActivity.entityType) {
    fieldChanges.entityType = {
      oldValue: oldActivity.entityType,
      newValue: newActivity.entityType,
    };
  }

  return {
    fieldChanges,
    hasChanges: Object.keys(fieldChanges).length > 0,
  };
}

/**
 * Get activity audit log entry
 */
export function getActivityAuditLogEntry(
  activity: CollaborationActivity,
  action: "created" | "updated" | "deleted",
): string {
  const userName = getUserName(activity.userId);
  const timestamp = formatActivityTimestamp(activity);

  return `[${timestamp}] ${userName} ${action} activity: ${activity.action} (${activity.id})`;
}

/**
 * Get activity history entry
 */
export function getActivityHistoryEntry(activity: CollaborationActivity): {
  timestamp: string;
  user: string;
  action: string;
  type: string;
  details: string;
} {
  return {
    timestamp: formatActivityTimestamp(activity),
    user: getUserName(activity.userId),
    action: activity.action,
    type: getActivityTypeLabel(activity.type),
    details: activity.details || "No details",
  };
}

/**
 * Get activity analytics data
 */
export function getActivityAnalyticsData(activities: CollaborationActivity[]): {
  totalActivities: number;
  activitiesPerDay: number;
  activitiesPerUser: number;
  activityTypeDistribution: Record<string, number>;
  mostActiveDay: string;
  mostActiveUser: string;
} {
  if (activities.length === 0) {
    return {
      totalActivities: 0,
      activitiesPerDay: 0,
      activitiesPerUser: 0,
      activityTypeDistribution: {},
      mostActiveDay: "",
      mostActiveUser: "",
    };
  }

  const totalActivities = activities.length;
  const activitiesPerDay = totalActivities / getUniqueDays(activities).length;
  const activitiesPerUser = totalActivities / getUniqueUsers(activities).length;

  const activityTypeDistribution = getActivityStatsByType(activities);
  const mostActiveDay = getMostActiveDay(activities);
  const mostActiveUser = getMostActiveUser(activities);

  return {
    totalActivities,
    activitiesPerDay,
    activitiesPerUser,
    activityTypeDistribution,
    mostActiveDay,
    mostActiveUser,
  };
}

/**
 * Get unique days from activities
 */
function getUniqueDays(activities: CollaborationActivity[]): string[] {
  const days = new Set<string>();

  activities.forEach((activity) => {
    const date = new Date(activity.timestamp);
    days.add(date.toISOString().split("T")[0]);
  });

  return Array.from(days);
}

/**
 * Get unique users from activities
 */
function getUniqueUsers(activities: CollaborationActivity[]): string[] {
  const users = new Set<string>();

  activities.forEach((activity) => {
    users.add(activity.userId);
  });

  return Array.from(users);
}

/**
 * Get most active day
 */
function getMostActiveDay(activities: CollaborationActivity[]): string {
  const dayCounts: Record<string, number> = {};

  activities.forEach((activity) => {
    const date = new Date(activity.timestamp);
    const dayKey = date.toISOString().split("T")[0];
    dayCounts[dayKey] = (dayCounts[dayKey] || 0) + 1;
  });

  return Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
}

/**
 * Get most active user
 */
function getMostActiveUser(activities: CollaborationActivity[]): string {
  const userCounts: Record<string, number> = {};

  activities.forEach((activity) => {
    userCounts[activity.userId] = (userCounts[activity.userId] || 0) + 1;
  });

  return Object.entries(userCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
}

/**
 * Export all collaboration activity utilities
 */
export const CollaborationActivityUtils = {
  generateActivityId,
  generateEventId,
  createDefaultActivity,
  createCollaborationEvent,
  formatActivityForDisplay,
  formatActivityTimestamp,
  formatActivityDate,
  formatActivityTime,
  getUserName,
  getActivityTypeLabel,
  getActivityIcon,
  getActivityColor,
  filterActivitiesByType,
  filterActivitiesByUser,
  filterActivitiesByTeam,
  filterActivitiesByDateRange,
  filterActivitiesByEntityType,
  filterActivitiesByEntityId,
  sortActivitiesByTimestamp,
  sortActivitiesByTimestampAsc,
  groupActivitiesByDate,
  groupActivitiesByType,
  groupActivitiesByUser,
  getActivityStatistics,
  getActivityStatsByType,
  getActivityStatsByUser,
  getMostActiveUsers,
  getMostCommonActivityTypes,
  getActivityTimeline,
  getActivityHeatmap,
  searchActivities,
  getActivitySummary,
  getActivityDetailedSummary,
  getActivityTypeStatsSummary,
  getActivityUserStatsSummary,
  isRecentActivity,
  isTodayActivity,
  isThisWeekActivity,
  isThisMonthActivity,
  getActivityAge,
  getActivityAgeShort,
  validateActivity,
  validateActivityType,
  getActivityEventType,
  createEventFromActivity,
  getActivityNotificationMessage,
  getActivityNotificationTitle,
  getActivityNotificationBody,
  getActivityFeedItem,
  getActivityListItem,
  getActivityCardData,
  getActivityDashboardData,
  getActivityExportData,
  validateActivityImportData,
  getActivityChangeSummary,
  getActivityComparison,
  getActivityAuditLogEntry,
  getActivityHistoryEntry,
  getActivityAnalyticsData,
};
