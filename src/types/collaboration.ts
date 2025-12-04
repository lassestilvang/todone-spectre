import { User } from './user';

/**
 * Collaboration Team Interface
 */
export interface CollaborationTeam {
  /**
   * Unique identifier for the team
   */
  id: string;

  /**
   * Team name
   */
  name: string;

  /**
   * Team description
   */
  description?: string;

  /**
   * Team privacy setting
   */
  privacySetting: 'public' | 'private' | 'team-only';

  /**
   * Team owner ID
   */
  ownerId: string;

  /**
   * Team creation date
   */
  createdAt: Date;

  /**
   * Last update date
   */
  updatedAt: Date;

  /**
   * Number of team members
   */
  memberCount: number;

  /**
   * Number of recent activities
   */
  activityCount: number;

  /**
   * Team members
   */
  members?: CollaborationMember[];

  /**
   * Team projects (if applicable)
   */
  projectIds?: string[];

  /**
   * Team settings
   */
  settings?: CollaborationSettings;
}

/**
 * Collaboration Member Interface
 */
export interface CollaborationMember {
  /**
   * Unique identifier for the member
   */
  id: string;

  /**
   * Team ID this member belongs to
   */
  teamId: string;

  /**
   * User ID
   */
  userId: string;

  /**
   * User reference
   */
  user?: User;

  /**
   * Member role in the team
   */
  role: 'admin' | 'member' | 'guest';

  /**
   * Member status
   */
  status: 'active' | 'inactive' | 'pending';

  /**
   * Date when member joined the team
   */
  joinedAt: Date;

  /**
   * Last activity date
   */
  lastActive?: Date;
}

/**
 * Collaboration Settings Interface
 */
export interface CollaborationSettings {
  /**
   * Team ID these settings belong to
   */
  teamId: string;

  /**
   * Notification settings
   */
  notificationSettings: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    mentionNotifications: boolean;
    dailyDigest: boolean;
  };

  /**
   * Permission settings
   */
  permissionSettings: {
    allowGuestInvites: boolean;
    allowPublicSharing: boolean;
    requireAdminApproval: boolean;
    allowMemberInvites: boolean;
  };

  /**
   * Privacy settings
   */
  privacySettings: {
    visibleToPublic: boolean;
    searchable: boolean;
    allowExternalAccess: boolean;
  };

  /**
   * Integration settings
   */
  integrationSettings: {
    calendarIntegration: boolean;
    taskIntegration: boolean;
    fileIntegration: boolean;
  };

  /**
   * Last updated date
   */
  updatedAt: Date;
}

/**
 * Collaboration Activity Interface
 */
export interface CollaborationActivity {
  /**
   * Unique identifier for the activity
   */
  id: string;

  /**
   * Team ID this activity belongs to
   */
  teamId: string;

  /**
   * User ID who performed the activity
   */
  userId: string;

  /**
   * User reference
   */
  user?: User;

  /**
   * Activity action description
   */
  action: string;

  /**
   * Activity type
   */
  type: 'message' | 'file' | 'task' | 'other' | 'member_added' | 'member_removed' | 'settings_updated';

  /**
   * Activity timestamp
   */
  timestamp: Date;

  /**
   * Additional details about the activity
   */
  details?: string;

  /**
   * Related entity ID (task, file, etc.)
   */
  entityId?: string;

  /**
   * Related entity type
   */
  entityType?: string;
}

/**
 * Create Team DTO
 */
export interface CreateTeamDto extends Omit<CollaborationTeam, 'id' | 'createdAt' | 'updatedAt' | 'memberCount' | 'activityCount' | 'members'> {
  /**
   * Initial team members
   */
  initialMembers?: Omit<CollaborationMember, 'id' | 'teamId' | 'joinedAt'>[];
}

/**
 * Update Team DTO
 */
export interface UpdateTeamDto extends Partial<Omit<CollaborationTeam, 'id' | 'createdAt' | 'updatedAt' | 'memberCount' | 'activityCount'>> {}

/**
 * Team Member Statistics
 */
export interface TeamMemberStatistics {
  totalMembers: number;
  activeMembers: number;
  pendingMembers: number;
  adminCount: number;
  memberCount: number;
  guestCount: number;
}

/**
 * Team Activity Statistics
 */
export interface TeamActivityStatistics {
  totalActivities: number;
  activitiesByType: Record<string, number>;
  activitiesByUser: Record<string, number>;
  recentActivities: CollaborationActivity[];
}

/**
 * Collaboration Event Types
 */
export type CollaborationEventType =
  | 'team_created'
  | 'team_updated'
  | 'team_deleted'
  | 'member_added'
  | 'member_removed'
  | 'member_role_updated'
  | 'activity_created'
  | 'settings_updated';

/**
 * Collaboration Event Interface
 */
export interface CollaborationEvent {
  type: CollaborationEventType;
  timestamp: Date;
  data: any;
  teamId?: string;
  userId?: string;
}