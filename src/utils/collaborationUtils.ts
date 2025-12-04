import { CollaborationTeam, CollaborationMember, CollaborationSettings, CollaborationActivity, TeamMemberStatistics, TeamActivityStatistics } from '../types/collaboration';
import { User } from '../types/user';

/**
 * Collaboration Utilities - Helper functions for collaboration features
 */

/**
 * Generate a unique team ID
 */
export function generateTeamId(): string {
  return `team_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Generate a unique member ID
 */
export function generateMemberId(): string {
  return `member_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Generate a unique activity ID
 */
export function generateActivityId(): string {
  return `activity_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

/**
 * Create a new team with default values
 */
export function createDefaultTeam(teamData: {
  name: string;
  ownerId: string;
  description?: string;
  privacySetting?: CollaborationTeam['privacySetting'];
}): CollaborationTeam {
  return {
    id: generateTeamId(),
    name: teamData.name,
    description: teamData.description || '',
    privacySetting: teamData.privacySetting || 'team-only',
    ownerId: teamData.ownerId,
    createdAt: new Date(),
    updatedAt: new Date(),
    memberCount: 0,
    activityCount: 0,
    members: [],
    projectIds: [],
    settings: createDefaultSettings(teamData.ownerId)
  };
}

/**
 * Create default collaboration settings
 */
export function createDefaultSettings(teamId: string): CollaborationSettings {
  return {
    teamId,
    notificationSettings: {
      emailNotifications: true,
      pushNotifications: true,
      mentionNotifications: true,
      dailyDigest: false
    },
    permissionSettings: {
      allowGuestInvites: false,
      allowPublicSharing: false,
      requireAdminApproval: true,
      allowMemberInvites: false
    },
    privacySettings: {
      visibleToPublic: false,
      searchable: false,
      allowExternalAccess: false
    },
    integrationSettings: {
      calendarIntegration: false,
      taskIntegration: false,
      fileIntegration: false
    },
    updatedAt: new Date()
  };
}

/**
 * Create a new member with default values
 */
export function createDefaultMember(memberData: {
  teamId: string;
  userId: string;
  role?: CollaborationMember['role'];
  status?: CollaborationMember['status'];
}): CollaborationMember {
  return {
    id: generateMemberId(),
    teamId: memberData.teamId,
    userId: memberData.userId,
    role: memberData.role || 'member',
    status: memberData.status || 'active',
    joinedAt: new Date(),
    lastActive: new Date()
  };
}

/**
 * Create a new activity with default values
 */
export function createDefaultActivity(activityData: {
  teamId: string;
  userId: string;
  action: string;
  type?: CollaborationActivity['type'];
  details?: string;
  entityId?: string;
  entityType?: string;
}): CollaborationActivity {
  return {
    id: generateActivityId(),
    teamId: activityData.teamId,
    userId: activityData.userId,
    action: activityData.action,
    type: activityData.type || 'other',
    timestamp: new Date(),
    details: activityData.details,
    entityId: activityData.entityId,
    entityType: activityData.entityType
  };
}

/**
 * Check if user is team owner
 */
export function isTeamOwner(team: CollaborationTeam, userId: string): boolean {
  return team.ownerId === userId;
}

/**
 * Check if user is team admin
 */
export function isTeamAdmin(team: CollaborationTeam, userId: string): boolean {
  if (isTeamOwner(team, userId)) return true;

  const member = team.members?.find(m => m.userId === userId);
  return member?.role === 'admin';
}

/**
 * Check if user is team member
 */
export function isTeamMember(team: CollaborationTeam, userId: string): boolean {
  return team.members?.some(m => m.userId === userId) || isTeamOwner(team, userId);
}

/**
 * Check if user has admin privileges (owner or admin)
 */
export function hasAdminPrivileges(team: CollaborationTeam, userId: string): boolean {
  return isTeamOwner(team, userId) || isTeamAdmin(team, userId);
}

/**
 * Check if user can invite members based on team settings
 */
export function canInviteMembers(team: CollaborationTeam, userId: string): boolean {
  if (!team.settings) return false;

  if (hasAdminPrivileges(team, userId)) {
    return team.settings.permissionSettings.allowMemberInvites ||
           team.settings.permissionSettings.allowGuestInvites;
  }

  return false;
}

/**
 * Check if team is public
 */
export function isTeamPublic(team: CollaborationTeam): boolean {
  return team.privacySetting === 'public';
}

/**
 * Check if team is private
 */
export function isTeamPrivate(team: CollaborationTeam): boolean {
  return team.privacySetting === 'private';
}

/**
 * Check if team is team-only
 */
export function isTeamOnly(team: CollaborationTeam): boolean {
  return team.privacySetting === 'team-only';
}

/**
 * Get team member statistics
 */
export function getTeamMemberStats(team: CollaborationTeam): TeamMemberStatistics {
  const members = team.members || [];

  return {
    totalMembers: members.length,
    activeMembers: members.filter(m => m.status === 'active').length,
    pendingMembers: members.filter(m => m.status === 'pending').length,
    adminCount: members.filter(m => m.role === 'admin').length,
    memberCount: members.filter(m => m.role === 'member').length,
    guestCount: members.filter(m => m.role === 'guest').length
  };
}

/**
 * Get team activity statistics
 */
export function getTeamActivityStats(team: CollaborationTeam, activities: CollaborationActivity[]): TeamActivityStatistics {
  const teamActivities = activities.filter(a => a.teamId === team.id);

  const byType: Record<string, number> = {};
  const byUser: Record<string, number> = {};

  teamActivities.forEach(activity => {
    byType[activity.type] = (byType[activity.type] || 0) + 1;
    byUser[activity.userId] = (byUser[activity.userId] || 0) + 1;
  });

  return {
    totalActivities: teamActivities.length,
    activitiesByType: byType,
    activitiesByUser: byUser,
    recentActivities: teamActivities
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5)
  };
}

/**
 * Get user role in team
 */
export function getUserRoleInTeam(team: CollaborationTeam, userId: string): CollaborationMember['role'] | null {
  if (isTeamOwner(team, userId)) return 'admin';

  const member = team.members?.find(m => m.userId === userId);
  return member?.role || null;
}

/**
 * Get user status in team
 */
export function getUserStatusInTeam(team: CollaborationTeam, userId: string): CollaborationMember['status'] | null {
  const member = team.members?.find(m => m.userId === userId);
  return member?.status || null;
}

/**
 * Check if user can perform action based on role
 */
export function canPerformAction(
  team: CollaborationTeam,
  userId: string,
  action: 'manage_team' | 'manage_members' | 'manage_settings' | 'create_activity'
): boolean {
  const role = getUserRoleInTeam(team, userId);

  if (!role) return false;

  switch (action) {
    case 'manage_team':
      return role === 'admin' || isTeamOwner(team, userId);
    case 'manage_members':
      return role === 'admin' || isTeamOwner(team, userId);
    case 'manage_settings':
      return role === 'admin' || isTeamOwner(team, userId);
    case 'create_activity':
      return role === 'admin' || role === 'member' || role === 'guest';
    default:
      return false;
  }
}

/**
 * Format team name for display
 */
export function formatTeamName(team: CollaborationTeam): string {
  return team.name.length > 30 ? `${team.name.substring(0, 27)}...` : team.name;
}

/**
 * Format team description for display
 */
export function formatTeamDescription(team: CollaborationTeam): string {
  if (!team.description) return 'No description';

  return team.description.length > 100
    ? `${team.description.substring(0, 97)}...`
    : team.description;
}

/**
 * Format member role for display
 */
export function formatMemberRole(role: CollaborationMember['role']): string {
  const roleMap: Record<CollaborationMember['role'], string> = {
    admin: 'Admin',
    member: 'Member',
    guest: 'Guest'
  };

  return roleMap[role] || role;
}

/**
 * Format member status for display
 */
export function formatMemberStatus(status: CollaborationMember['status']): string {
  const statusMap: Record<CollaborationMember['status'], string> = {
    active: 'Active',
    inactive: 'Inactive',
    pending: 'Pending'
  };

  return statusMap[status] || status;
}

/**
 * Format privacy setting for display
 */
export function formatPrivacySetting(privacy: CollaborationTeam['privacySetting']): string {
  const privacyMap: Record<CollaborationTeam['privacySetting'], string> = {
    public: 'Public',
    private: 'Private',
    'team-only': 'Team Only'
  };

  return privacyMap[privacy] || privacy;
}

/**
 * Check if team has active members
 */
export function hasActiveMembers(team: CollaborationTeam): boolean {
  return team.members?.some(m => m.status === 'active') || false;
}

/**
 * Check if team has pending members
 */
export function hasPendingMembers(team: CollaborationTeam): boolean {
  return team.members?.some(m => m.status === 'pending') || false;
}

/**
 * Get team member count by role
 */
export function getMemberCountByRole(team: CollaborationTeam, role: CollaborationMember['role']): number {
  return team.members?.filter(m => m.role === role).length || 0;
}

/**
 * Get team member count by status
 */
export function getMemberCountByStatus(team: CollaborationTeam, status: CollaborationMember['status']): number {
  return team.members?.filter(m => m.status === status).length || 0;
}

/**
 * Check if team settings allow guest invites
 */
export function allowsGuestInvites(team: CollaborationTeam): boolean {
  return team.settings?.permissionSettings.allowGuestInvites || false;
}

/**
 * Check if team settings allow public sharing
 */
export function allowsPublicSharing(team: CollaborationTeam): boolean {
  return team.settings?.permissionSettings.allowPublicSharing || false;
}

/**
 * Check if team requires admin approval
 */
export function requiresAdminApproval(team: CollaborationTeam): boolean {
  return team.settings?.permissionSettings.requireAdminApproval || false;
}

/**
 * Check if team allows member invites
 */
export function allowsMemberInvites(team: CollaborationTeam): boolean {
  return team.settings?.permissionSettings.allowMemberInvites || false;
}

/**
 * Validate team name
 */
export function validateTeamName(name: string): { valid: boolean; message?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, message: 'Team name is required' };
  }

  if (name.length > 100) {
    return { valid: false, message: 'Team name cannot exceed 100 characters' };
  }

  return { valid: true };
}

/**
 * Validate team description
 */
export function validateTeamDescription(description: string): { valid: boolean; message?: string } {
  if (description && description.length > 1000) {
    return { valid: false, message: 'Team description cannot exceed 1000 characters' };
  }

  return { valid: true };
}

/**
 * Validate member role
 */
export function validateMemberRole(role: CollaborationMember['role']): { valid: boolean; message?: string } {
  const validRoles: CollaborationMember['role'][] = ['admin', 'member', 'guest'];

  if (!validRoles.includes(role)) {
    return { valid: false, message: 'Invalid member role' };
  }

  return { valid: true };
}

/**
 * Validate member status
 */
export function validateMemberStatus(status: CollaborationMember['status']): { valid: boolean; message?: string } {
  const validStatuses: CollaborationMember['status'][] = ['active', 'inactive', 'pending'];

  if (!validStatuses.includes(status)) {
    return { valid: false, message: 'Invalid member status' };
  }

  return { valid: true };
}

/**
 * Validate privacy setting
 */
export function validatePrivacySetting(privacy: CollaborationTeam['privacySetting']): { valid: boolean; message?: string } {
  const validSettings: CollaborationTeam['privacySetting'][] = ['public', 'private', 'team-only'];

  if (!validSettings.includes(privacy)) {
    return { valid: false, message: 'Invalid privacy setting' };
  }

  return { valid: true };
}

/**
 * Get team creation date formatted
 */
export function getFormattedCreationDate(team: CollaborationTeam): string {
  return team.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Get team last updated date formatted
 */
export function getFormattedUpdatedDate(team: CollaborationTeam): string {
  return team.updatedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Get member join date formatted
 */
export function getFormattedJoinDate(member: CollaborationMember): string {
  return member.joinedAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Get member last active date formatted
 */
export function getFormattedLastActiveDate(member: CollaborationMember): string {
  if (!member.lastActive) return 'Never';

  return member.lastActive.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Check if team has any activities
 */
export function hasActivities(team: CollaborationTeam): boolean {
  return team.activityCount > 0;
}

/**
 * Check if team has any members
 */
export function hasMembers(team: CollaborationTeam): boolean {
  return team.memberCount > 0;
}

/**
 * Get team member list sorted by role
 */
export function getMembersSortedByRole(team: CollaborationTeam): CollaborationMember[] {
  const roleOrder: Record<CollaborationMember['role'], number> = {
    admin: 1,
    member: 2,
    guest: 3
  };

  return [...(team.members || [])].sort((a, b) => {
    return (roleOrder[a.role] || 0) - (roleOrder[b.role] || 0);
  });
}

/**
 * Get team member list sorted by join date
 */
export function getMembersSortedByJoinDate(team: CollaborationTeam): CollaborationMember[] {
  return [...(team.members || [])].sort((a, b) =>
    new Date(b.joinedAt).getTime() - new Date(a.joinedAt).getTime()
  );
}

/**
 * Get team member list sorted by last active
 */
export function getMembersSortedByLastActive(team: CollaborationTeam): CollaborationMember[] {
  return [...(team.members || [])].sort((a, b) => {
    const aTime = a.lastActive ? new Date(a.lastActive).getTime() : 0;
    const bTime = b.lastActive ? new Date(b.lastActive).getTime() : 0;
    return bTime - aTime;
  });
}

/**
 * Get team member list sorted by name (using user reference if available)
 */
export function getMembersSortedByName(team: CollaborationTeam): CollaborationMember[] {
  return [...(team.members || [])].sort((a, b) => {
    const aName = a.user?.name || a.userId;
    const bName = b.user?.name || b.userId;
    return aName.localeCompare(bName);
  });
}

/**
 * Check if team is newly created (within last 7 days)
 */
export function isNewTeam(team: CollaborationTeam): boolean {
  const createdDate = new Date(team.createdAt);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
  return diffInDays <= 7;
}

/**
 * Check if team is inactive (no activities in last 30 days)
 */
export function isInactiveTeam(team: CollaborationTeam, activities: CollaborationActivity[]): boolean {
  if (!activities || activities.length === 0) return true;

  const teamActivities = activities.filter(a => a.teamId === team.id);
  if (teamActivities.length === 0) return true;

  const latestActivity = teamActivities.sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )[0];

  const latestActivityDate = new Date(latestActivity.timestamp);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - latestActivityDate.getTime()) / (1000 * 60 * 60 * 24));

  return diffInDays > 30;
}

/**
 * Get team health score based on activity and member engagement
 */
export function getTeamHealthScore(team: CollaborationTeam, activities: CollaborationActivity[]): number {
  const teamActivities = activities.filter(a => a.teamId === team.id);
  const activeMembers = team.members?.filter(m => m.status === 'active').length || 0;

  // Base score based on activity count (0-50 points)
  const activityScore = Math.min(teamActivities.length * 2, 50);

  // Member engagement score (0-30 points)
  const memberEngagementScore = Math.min(activeMembers * 3, 30);

  // Recent activity bonus (0-20 points)
  const recentActivities = teamActivities.filter(a => {
    const activityDate = new Date(a.timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60 * 24));
    return diffInDays <= 7;
  }).length;

  const recentActivityScore = Math.min(recentActivities * 2, 20);

  return activityScore + memberEngagementScore + recentActivityScore;
}

/**
 * Get team health status based on health score
 */
export function getTeamHealthStatus(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  if (score >= 20) return 'Poor';
  return 'Inactive';
}

/**
 * Get team health recommendation based on health score
 */
export function getTeamHealthRecommendation(score: number): string {
  if (score >= 80) return 'Keep up the great work! Your team is very active.';
  if (score >= 60) return 'Your team is doing well. Consider encouraging more participation.';
  if (score >= 40) return 'Your team could be more active. Try to engage members with new activities.';
  if (score >= 20) return 'Your team needs more engagement. Consider team-building activities.';
  return 'Your team is inactive. Consider reaching out to members or reorganizing.';
}

/**
 * Check if user can view team based on privacy settings and membership
 */
export function canViewTeam(team: CollaborationTeam, userId: string, isPublicAccessAllowed: boolean = false): boolean {
  // Team owners and members can always view
  if (isTeamMember(team, userId)) return true;

  // Public teams can be viewed by anyone if public access is allowed
  if (isTeamPublic(team) && isPublicAccessAllowed) return true;

  // Private teams and team-only teams require membership
  return false;
}

/**
 * Check if user can edit team based on role and settings
 */
export function canEditTeam(team: CollaborationTeam, userId: string): boolean {
  return hasAdminPrivileges(team, userId);
}

/**
 * Check if user can delete team based on role
 */
export function canDeleteTeam(team: CollaborationTeam, userId: string): boolean {
  return isTeamOwner(team, userId);
}

/**
 * Get team access level for user
 */
export function getTeamAccessLevel(team: CollaborationTeam, userId: string): 'owner' | 'admin' | 'member' | 'guest' | 'none' {
  if (isTeamOwner(team, userId)) return 'owner';
  if (isTeamAdmin(team, userId)) return 'admin';

  const member = team.members?.find(m => m.userId === userId);
  if (member) return member.role;

  return 'none';
}

/**
 * Check if team has specific integration enabled
 */
export function hasIntegrationEnabled(team: CollaborationTeam, integration: keyof CollaborationSettings['integrationSettings']): boolean {
  return team.settings?.integrationSettings[integration] || false;
}

/**
 * Check if team has specific notification enabled
 */
export function hasNotificationEnabled(team: CollaborationTeam, notification: keyof CollaborationSettings['notificationSettings']): boolean {
  return team.settings?.notificationSettings[notification] || false;
}

/**
 * Get team notification preferences summary
 */
export function getNotificationPreferencesSummary(team: CollaborationTeam): string {
  const settings = team.settings?.notificationSettings;
  if (!settings) return 'No notification preferences set';

  const preferences = [];
  if (settings.emailNotifications) preferences.push('Email');
  if (settings.pushNotifications) preferences.push('Push');
  if (settings.mentionNotifications) preferences.push('Mentions');
  if (settings.dailyDigest) preferences.push('Daily Digest');

  return preferences.length > 0
    ? `Notifications: ${preferences.join(', ')}`
    : 'No notifications enabled';
}

/**
 * Get team permission settings summary
 */
export function getPermissionSettingsSummary(team: CollaborationTeam): string {
  const settings = team.settings?.permissionSettings;
  if (!settings) return 'No permission settings configured';

  const permissions = [];
  if (settings.allowGuestInvites) permissions.push('Guest invites');
  if (settings.allowPublicSharing) permissions.push('Public sharing');
  if (settings.requireAdminApproval) permissions.push('Admin approval required');
  if (settings.allowMemberInvites) permissions.push('Member invites');

  return permissions.length > 0
    ? `Permissions: ${permissions.join(', ')}`
    : 'No special permissions';
}

/**
 * Get team privacy settings summary
 */
export function getPrivacySettingsSummary(team: CollaborationTeam): string {
  const settings = team.settings?.privacySettings;
  if (!settings) return formatPrivacySetting(team.privacySetting);

  const privacyDetails = [];
  if (settings.visibleToPublic) privacyDetails.push('Visible to public');
  if (settings.searchable) privacyDetails.push('Searchable');
  if (settings.allowExternalAccess) privacyDetails.push('External access');

  return privacyDetails.length > 0
    ? `Privacy: ${privacyDetails.join(', ')}`
    : formatPrivacySetting(team.privacySetting);
}

/**
 * Get team integration settings summary
 */
export function getIntegrationSettingsSummary(team: CollaborationTeam): string {
  const settings = team.settings?.integrationSettings;
  if (!settings) return 'No integrations configured';

  const integrations = [];
  if (settings.calendarIntegration) integrations.push('Calendar');
  if (settings.taskIntegration) integrations.push('Tasks');
  if (settings.fileIntegration) integrations.push('Files');

  return integrations.length > 0
    ? `Integrations: ${integrations.join(', ')}`
    : 'No integrations enabled';
}

/**
 * Check if team settings are at default values
 */
export function hasDefaultSettings(team: CollaborationTeam): boolean {
  if (!team.settings) return true;

  const defaultSettings = createDefaultSettings(team.id);

  return JSON.stringify(team.settings) === JSON.stringify(defaultSettings);
}

/**
 * Check if team has custom settings
 */
export function hasCustomSettings(team: CollaborationTeam): boolean {
  return !hasDefaultSettings(team);
}

/**
 * Get team settings comparison with defaults
 */
export function getSettingsComparison(team: CollaborationTeam): {
  changedSettings: string[];
  unchangedSettings: string[];
} {
  if (!team.settings) return { changedSettings: [], unchangedSettings: [] };

  const defaultSettings = createDefaultSettings(team.id);
  const changedSettings: string[] = [];
  const unchangedSettings: string[] = [];

  // Compare notification settings
  if (JSON.stringify(team.settings.notificationSettings) !== JSON.stringify(defaultSettings.notificationSettings)) {
    changedSettings.push('notificationSettings');
  } else {
    unchangedSettings.push('notificationSettings');
  }

  // Compare permission settings
  if (JSON.stringify(team.settings.permissionSettings) !== JSON.stringify(defaultSettings.permissionSettings)) {
    changedSettings.push('permissionSettings');
  } else {
    unchangedSettings.push('permissionSettings');
  }

  // Compare privacy settings
  if (JSON.stringify(team.settings.privacySettings) !== JSON.stringify(defaultSettings.privacySettings)) {
    changedSettings.push('privacySettings');
  } else {
    unchangedSettings.push('privacySettings');
  }

  // Compare integration settings
  if (JSON.stringify(team.settings.integrationSettings) !== JSON.stringify(defaultSettings.integrationSettings)) {
    changedSettings.push('integrationSettings');
  } else {
    unchangedSettings.push('integrationSettings');
  }

  return { changedSettings, unchangedSettings };
}

/**
 * Get team overview summary
 */
export function getTeamOverviewSummary(team: CollaborationTeam): string {
  return `${team.name} (${formatPrivacySetting(team.privacySetting)}) - ${team.memberCount} members, ${team.activityCount} activities`;
}

/**
 * Get team detailed summary
 */
export function getTeamDetailedSummary(team: CollaborationTeam, activities: CollaborationActivity[]): string {
  const stats = getTeamMemberStats(team);
  const healthScore = getTeamHealthScore(team, activities);
  const healthStatus = getTeamHealthStatus(healthScore);

  return `${team.name} - ${healthStatus} health (${healthScore}/100)\n` +
         `Members: ${stats.activeMembers} active, ${stats.pendingMembers} pending\n` +
         `Activities: ${team.activityCount}\n` +
         `Created: ${getFormattedCreationDate(team)}`;
}

/**
 * Export all collaboration utilities
 */
export const CollaborationUtils = {
  generateTeamId,
  generateMemberId,
  generateActivityId,
  createDefaultTeam,
  createDefaultSettings,
  createDefaultMember,
  createDefaultActivity,
  isTeamOwner,
  isTeamAdmin,
  isTeamMember,
  hasAdminPrivileges,
  canInviteMembers,
  isTeamPublic,
  isTeamPrivate,
  isTeamOnly,
  getTeamMemberStats,
  getTeamActivityStats,
  getUserRoleInTeam,
  getUserStatusInTeam,
  canPerformAction,
  formatTeamName,
  formatTeamDescription,
  formatMemberRole,
  formatMemberStatus,
  formatPrivacySetting,
  hasActiveMembers,
  hasPendingMembers,
  getMemberCountByRole,
  getMemberCountByStatus,
  allowsGuestInvites,
  allowsPublicSharing,
  requiresAdminApproval,
  allowsMemberInvites,
  validateTeamName,
  validateTeamDescription,
  validateMemberRole,
  validateMemberStatus,
  validatePrivacySetting,
  getFormattedCreationDate,
  getFormattedUpdatedDate,
  getFormattedJoinDate,
  getFormattedLastActiveDate,
  hasActivities,
  hasMembers,
  getMembersSortedByRole,
  getMembersSortedByJoinDate,
  getMembersSortedByLastActive,
  getMembersSortedByName,
  isNewTeam,
  isInactiveTeam,
  getTeamHealthScore,
  getTeamHealthStatus,
  getTeamHealthRecommendation,
  canViewTeam,
  canEditTeam,
  canDeleteTeam,
  getTeamAccessLevel,
  hasIntegrationEnabled,
  hasNotificationEnabled,
  getNotificationPreferencesSummary,
  getPermissionSettingsSummary,
  getPrivacySettingsSummary,
  getIntegrationSettingsSummary,
  hasDefaultSettings,
  hasCustomSettings,
  getSettingsComparison,
  getTeamOverviewSummary,
  getTeamDetailedSummary
};