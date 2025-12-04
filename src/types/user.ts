/**
 * User-related types for Todone application
 * Contains comprehensive user management interfaces and types
 */

import { PriorityLevel, ViewType } from './enums';
import { ProjectListItem, TaskListItem } from './project';
import { DateTimeRange } from './common';

/**
 * Base user interface
 */
export interface BaseUser {
  /**
   * Unique user identifier
   */
  id: string;

  /**
   * User email address
   */
  email: string;

  /**
   * User full name
   */
  name: string;

  /**
   * User avatar URL
   */
  avatar?: string | null;

  /**
   * User bio/description
   */
  bio?: string | null;

  /**
   * Creation timestamp
   */
  createdAt: Date;

  /**
   * Last update timestamp
   */
  updatedAt: Date;

  /**
   * Last login timestamp
   */
  lastLogin?: Date | null;
}

/**
 * Extended user interface with all properties
 */
export interface User extends BaseUser {
  /**
   * User settings and preferences
   */
  settings?: UserSettings;

  /**
   * User preferences
   */
  preferences?: UserPreferences;

  /**
   * User statistics
   */
  stats?: UserStatistics;

  /**
   * User karma/achievement stats
   */
  karmaStats?: UserKarmaStats;

  /**
   * IDs of projects owned by this user
   */
  projectIds?: string[];

  /**
   * IDs of projects this user has access to
   */
  accessibleProjectIds?: string[];

  /**
   * IDs of labels created by this user
   */
  labelIds?: string[];

  /**
   * IDs of filters created by this user
   */
  filterIds?: string[];

  /**
   * User status
   */
  status?: 'active' | 'inactive' | 'suspended' | 'deleted';

  /**
   * User role
   */
  role?: 'user' | 'admin' | 'superadmin';

  /**
   * Authentication provider
   */
  authProvider?: 'email' | 'google' | 'github' | 'apple' | 'microsoft';

  /**
   * Email verification status
   */
  emailVerified?: boolean;

  /**
   * Custom user fields
   */
  customFields?: Record<string, any>;

  /**
   * User metadata
   */
  metadata?: {
    source?: string;
    lastActive?: Date;
    timeZone?: string;
    locale?: string;
  };
}

/**
 * User settings interface
 */
export interface UserSettings {
  /**
   * Theme preference
   */
  theme: 'light' | 'dark' | 'system';

  /**
   * Language preference
   */
  language: string;

  /**
   * Notification settings
   */
  notifications: {
    emailEnabled: boolean;
    pushEnabled: boolean;
    desktopEnabled: boolean;
    emailFrequency: 'daily' | 'weekly' | 'monthly' | 'never';
  };

  /**
   * Privacy settings
   */
  privacy: {
    profileVisibility: 'public' | 'contacts' | 'private';
    activityVisibility: 'public' | 'contacts' | 'private';
    searchVisibility: boolean;
  };

  /**
   * Security settings
   */
  security: {
    require2FA: boolean;
    sessionTimeout: number;
    rememberDevices: boolean;
  };
}

/**
 * User preferences interface
 */
export interface UserPreferences {
  /**
   * Default view type
   */
  defaultView: ViewType;

  /**
   * Default priority level for new tasks
   */
  defaultPriority: PriorityLevel;

  /**
   * Task sorting preference
   */
  taskSorting: {
    field: 'dueDate' | 'priority' | 'createdAt' | 'updatedAt';
    direction: 'asc' | 'desc';
  };

  /**
   * Project sorting preference
   */
  projectSorting: {
    field: 'name' | 'createdAt' | 'updatedAt' | 'taskCount';
    direction: 'asc' | 'desc';
  };

  /**
   * Date and time preferences
   */
  dateTime: {
    dateFormat: string;
    timeFormat: string;
    weekStartsOn: 'sunday' | 'monday';
    timeZone: string;
  };

  /**
   * UI preferences
   */
  ui: {
    density: 'comfortable' | 'compact' | 'cozy';
    animation: 'full' | 'reduced' | 'none';
    sidebarWidth: number;
    showCompletedTasks: boolean;
    showArchivedProjects: boolean;
  };

  /**
   * Keyboard shortcuts
   */
  keyboardShortcuts: {
    createTask: string;
    search: string;
    toggleSidebar: string;
    quickAdd: string;
  };
}

/**
 * User statistics interface
 */
export interface UserStatistics {
  /**
   * Total tasks created
   */
  totalTasksCreated: number;

  /**
   * Total tasks completed
   */
  totalTasksCompleted: number;

  /**
   * Total projects created
   */
  totalProjectsCreated: number;

  /**
   * Total comments made
   */
  totalComments: number;

  /**
   * Total attachments uploaded
   */
  totalAttachments: number;

  /**
   * Tasks completed today
   */
  tasksCompletedToday: number;

  /**
   * Tasks completed this week
   */
  tasksCompletedThisWeek: number;

  /**
   * Tasks completed this month
   */
  tasksCompletedThisMonth: number;

  /**
   * Current streak (days)
   */
  currentStreak: number;

  /**
   * Longest streak (days)
   */
  longestStreak: number;

  /**
   * Average tasks completed per day
   */
  avgTasksPerDay?: number;

  /**
   * Productivity score (0-100)
   */
  productivityScore?: number;
}

/**
 * User karma/achievement statistics
 */
export interface UserKarmaStats {
  /**
   * Total karma points
   */
  totalPoints: number;

  /**
   * Current level
   */
  level: number;

  /**
   * Points to next level
   */
  pointsToNextLevel: number;

  /**
   * Total level ups
   */
  levelUps: number;

  /**
   * Achievements unlocked
   */
  achievements: string[];

  /**
   * Badges earned
   */
  badges: string[];

  /**
   * Streak bonuses earned
   */
  streakBonuses: number;

  /**
   * Completion bonuses earned
   */
  completionBonuses: number;

  /**
   * Collaboration points
   */
  collaborationPoints: number;
}

/**
 * User with full details including relationships
 */
export interface UserWithDetails extends User {
  /**
   * Projects owned by this user
   */
  projects?: ProjectListItem[];

  /**
   * Recent tasks
   */
  recentTasks?: TaskListItem[];

  /**
   * Recent activity
   */
  recentActivity?: UserActivityEvent[];

  /**
   * Team members (if applicable)
   */
  teamMembers?: User[];

  /**
   * Team projects
   */
  teamProjects?: ProjectListItem[];
}

/**
 * User profile interface
 */
export interface UserProfile {
  /**
   * User ID
   */
  userId: string;

  /**
   * Profile visibility
   */
  visibility: 'public' | 'contacts' | 'private';

  /**
   * Profile bio
   */
  bio?: string;

  /**
   * Profile website
   */
  website?: string;

  /**
   * Profile social links
   */
  socialLinks?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
    instagram?: string;
  };

  /**
   * Profile location
   */
  location?: string;

  /**
   * Profile job title
   */
  jobTitle?: string;

  /**
   * Profile company
   */
  company?: string;
}

/**
 * User authentication interface
 */
export interface UserAuth {
  /**
   * User ID
   */
  userId: string;

  /**
   * Authentication token
   */
  token: string;

  /**
   * Refresh token
   */
  refreshToken?: string;

  /**
   * Token expiration
   */
  expiresAt?: Date;

  /**
   * Authentication provider
   */
  provider: 'email' | 'google' | 'github' | 'apple' | 'microsoft';

  /**
   * Authentication scopes
   */
  scopes?: string[];

  /**
   * Device information
   */
  device?: {
    id: string;
    name: string;
    type: 'desktop' | 'mobile' | 'tablet';
    os: string;
    browser: string;
  };
}

/**
 * User session interface
 */
export interface UserSession {
  /**
   * Session ID
   */
  id: string;

  /**
   * User ID
   */
  userId: string;

  /**
   * Session token
   */
  token: string;

  /**
   * Session expiration
   */
  expiresAt: Date;

  /**
   * Session IP address
   */
  ipAddress?: string;

  /**
   * Session user agent
   */
  userAgent?: string;

  /**
   * Session device information
   */
  device?: {
    id: string;
    name: string;
    type: 'desktop' | 'mobile' | 'tablet';
  };

  /**
   * Session location
   */
  location?: {
    country?: string;
    city?: string;
    timezone?: string;
  };

  /**
   * Session status
   */
  status: 'active' | 'expired' | 'revoked';
}

/**
 * User activity event
 */
export interface UserActivityEvent {
  /**
   * Event ID
   */
  id: string;

  /**
   * User ID
   */
  userId: string;

  /**
   * Event type
   */
  type: 'login' | 'logout' | 'task_created' | 'task_completed' | 'project_created' | 'comment_added' | 'profile_updated';

  /**
   * Event timestamp
   */
  timestamp: Date;

  /**
   * Additional event data
   */
  data?: any;

  /**
   * Event metadata
   */
  metadata?: {
    ipAddress?: string;
    userAgent?: string;
    deviceId?: string;
  };
}

/**
 * User filter criteria
 */
export interface UserFilterCriteria {
  /**
   * Filter by status
   */
  status?: 'active' | 'inactive' | 'suspended' | 'deleted' | ('active' | 'inactive' | 'suspended' | 'deleted')[];

  /**
   * Filter by role
   */
  role?: 'user' | 'admin' | 'superadmin' | ('user' | 'admin' | 'superadmin')[];

  /**
   * Filter by email verification status
   */
  emailVerified?: boolean;

  /**
   * Search query for name/email
   */
  searchQuery?: string;

  /**
   * Filter by creation date range
   */
  createdAt?: DateTimeRange;

  /**
   * Filter by last login date range
   */
  lastLogin?: DateTimeRange;

  /**
   * Custom filter criteria
   */
  custom?: Record<string, any>;
}

/**
 * User sort options
 */
export interface UserSortOptions {
  /**
   * Field to sort by
   */
  field: 'name' | 'email' | 'createdAt' | 'updatedAt' | 'lastLogin' | 'taskCount' | 'projectCount';

  /**
   * Sort direction
   */
  direction: 'asc' | 'desc';
}

/**
 * User query parameters
 */
export interface UserQueryParams {
  /**
   * Filter criteria
   */
  filter?: UserFilterCriteria;

  /**
   * Sort options
   */
  sort?: UserSortOptions;

  /**
   * Pagination options
   */
  pagination?: {
    page: number;
    pageSize: number;
  };
}

/**
 * User validation result
 */
export interface UserValidationResult {
  /**
   * Validation success status
   */
  isValid: boolean;

  /**
   * Validation errors
   */
  errors: Record<string, string>;

  /**
   * Validation warnings
   */
  warnings: string[];

  /**
   * Validation messages
   */
  messages: string[];
}

/**
 * User authentication result
 */
export interface UserAuthResult {
  /**
   * Authentication success status
   */
  success: boolean;

  /**
   * User object (if successful)
   */
  user?: User;

  /**
   * Authentication token
   */
  token?: string;

  /**
   * Refresh token
   */
  refreshToken?: string;

  /**
   * Error message (if failed)
   */
  error?: string;

  /**
   * Error code
   */
  errorCode?: string;

  /**
   * Authentication metadata
   */
  metadata?: {
    provider?: string;
    deviceId?: string;
    ipAddress?: string;
  };
}

/**
 * User password reset interface
 */
export interface UserPasswordReset {
  /**
   * User ID or email
   */
  identifier: string;

  /**
   * Reset token
   */
  token: string;

  /**
   * New password
   */
  newPassword: string;

  /**
   * Token expiration
   */
  expiresAt: Date;

  /**
   * Reset status
   */
  status: 'pending' | 'completed' | 'expired';
}

/**
 * User email verification interface
 */
export interface UserEmailVerification {
  /**
   * User ID
   */
  userId: string;

  /**
   * Verification token
   */
  token: string;

  /**
   * Email address
   */
  email: string;

  /**
   * Token expiration
   */
  expiresAt: Date;

  /**
   * Verification status
   */
  status: 'pending' | 'completed' | 'expired';
}