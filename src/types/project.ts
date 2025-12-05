/**
 * Project-related types for Todone application
 * Contains comprehensive project management interfaces and types
 */

import { ViewType } from "./enums";
import { User } from "./user";
import { TaskListItem } from "./task";
import { DateTimeRange } from "./common";

/**
 * Base project interface
 */
export interface BaseProject {
  /**
   * Unique project identifier
   */
  id: string;

  /**
   * Project name
   */
  name: string;

  /**
   * Project description
   */
  description?: string;

  /**
   * Project color for visual identification
   */
  color: string;

  /**
   * Default view type for this project
   */
  viewType: ViewType;

  /**
   * Favorite status
   */
  favorite: boolean;

  /**
   * Shared project status
   */
  shared: boolean;

  /**
   * Creation timestamp
   */
  createdAt: Date;

  /**
   * Last update timestamp
   */
  updatedAt: Date;
}

/**
 * Extended project interface with hierarchical structure
 */
export interface Project extends BaseProject {
  /**
   * ID of parent project (for nested projects)
   */
  parentProjectId?: string | null;

  /**
   * IDs of child projects
   */
  childProjectIds?: string[];

  /**
   * IDs of sections in this project
   */
  sectionIds?: string[];

  /**
   * IDs of tasks in this project
   */
  taskIds?: string[];

  /**
   * IDs of labels available in this project
   */
  labelIds?: string[];

  /**
   * IDs of users with access to this project
   */
  memberIds?: string[];

  /**
   * Project owner ID
   */
  ownerId?: string;

  /**
   * Project status
   */
  status?: "active" | "archived" | "completed";

  /**
   * Project visibility
   */
  visibility?: "private" | "team" | "public";

  /**
   * Project settings
   */
  settings?: {
    allowComments: boolean;
    allowAttachments: boolean;
    taskCreationRestricted: boolean;
    maxTaskSize: number;
  };

  /**
   * Custom fields for extended functionality
   */
  customFields?: Record<string, any>;

  /**
   * Project metadata
   */
  metadata?: {
    createdBy?: string;
    lastUpdatedBy?: string;
    version?: number;
    source?: string;
  };
}

/**
 * Project creation DTO
 */
export interface CreateProjectDto extends Omit<
  Project,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "childProjectIds"
  | "sectionIds"
  | "taskIds"
  | "labelIds"
  | "memberIds"
> {
  /**
   * Optional ID for client-side generation
   */
  id?: string;
}

/**
 * Project update DTO
 */
export interface UpdateProjectDto extends Partial<
  Omit<Project, "id" | "createdAt" | "updatedAt">
> {
  /**
   * Project ID (required for updates)
   */
  id: string;
}

/**
 * Project with full details including relationships
 */
export interface ProjectWithDetails extends Project {
  /**
   * Owner user object
   */
  owner?: User | null;

  /**
   * Member user objects
   */
  members?: User[];

  /**
   * Task count
   */
  taskCount?: number;

  /**
   * Completed task count
   */
  completedTaskCount?: number;

  /**
   * Section count
   */
  sectionCount?: number;

  /**
   * Label count
   */
  labelCount?: number;

  /**
   * Recent tasks
   */
  recentTasks?: TaskListItem[];

  /**
   * Project completion percentage (0-100)
   */
  completionPercentage?: number;
}

/**
 * Project list item (simplified for lists)
 */
export interface ProjectListItem {
  /**
   * Project ID
   */
  id: string;

  /**
   * Project name
   */
  name: string;

  /**
   * Project color
   */
  color: string;

  /**
   * Favorite status
   */
  favorite: boolean;

  /**
   * Task count
   */
  taskCount?: number;

  /**
   * Completed task count
   */
  completedTaskCount?: number;

  /**
   * Project status
   */
  status?: "active" | "archived" | "completed";

  /**
   * Last updated timestamp
   */
  updatedAt: Date;
}

/**
 * Section interface for project organization
 */
export interface Section {
  /**
   * Unique section identifier
   */
  id: string;

  /**
   * Section name
   */
  name: string;

  /**
   * ID of the project this section belongs to
   */
  projectId: string;

  /**
   * Order/position within the project
   */
  order: number;

  /**
   * Creation timestamp
   */
  createdAt: Date;

  /**
   * Last update timestamp
   */
  updatedAt: Date;

  /**
   * Task IDs in this section
   */
  taskIds?: string[];

  /**
   * Collapsed state
   */
  collapsed?: boolean;

  /**
   * Section color
   */
  color?: string;

  /**
   * Section description
   */
  description?: string;
}

/**
 * Section creation DTO
 */
export interface CreateSectionDto extends Omit<
  Section,
  "id" | "createdAt" | "updatedAt"
> {
  /**
   * Optional ID for client-side generation
   */
  id?: string;
}

/**
 * Section update DTO
 */
export interface UpdateSectionDto extends Partial<
  Omit<Section, "id" | "createdAt" | "updatedAt" | "projectId">
> {
  /**
   * Section ID (required for updates)
   */
  id: string;
}

/**
 * Project filter criteria
 */
export interface ProjectFilterCriteria {
  /**
   * Filter by status
   */
  status?:
    | "active"
    | "archived"
    | "completed"
    | ("active" | "archived" | "completed")[];

  /**
   * Filter by favorite status
   */
  favorite?: boolean;

  /**
   * Filter by shared status
   */
  shared?: boolean;

  /**
   * Filter by owner ID
   */
  ownerId?: string | string[];

  /**
   * Filter by member ID
   */
  memberId?: string | string[];

  /**
   * Filter by parent project ID
   */
  parentProjectId?: string | string[];

  /**
   * Search query for name/description
   */
  searchQuery?: string;

  /**
   * Filter by visibility
   */
  visibility?:
    | "private"
    | "team"
    | "public"
    | ("private" | "team" | "public")[];

  /**
   * Custom filter criteria
   */
  custom?: Record<string, any>;
}

/**
 * Project sort options
 */
export interface ProjectSortOptions {
  /**
   * Field to sort by
   */
  field:
    | "name"
    | "createdAt"
    | "updatedAt"
    | "taskCount"
    | "completionPercentage"
    | "favorite";

  /**
   * Sort direction
   */
  direction: "asc" | "desc";
}

/**
 * Project query parameters
 */
export interface ProjectQueryParams {
  /**
   * Filter criteria
   */
  filter?: ProjectFilterCriteria;

  /**
   * Sort options
   */
  sort?: ProjectSortOptions;

  /**
   * Pagination options
   */
  pagination?: {
    page: number;
    pageSize: number;
  };
}

/**
 * Project statistics interface
 */
export interface ProjectStatistics {
  /**
   * Total project count
   */
  total: number;

  /**
   * Active project count
   */
  active: number;

  /**
   * Archived project count
   */
  archived: number;

  /**
   * Completed project count
   */
  completed: number;

  /**
   * Favorite project count
   */
  favorites: number;

  /**
   * Shared project count
   */
  shared: number;

  /**
   * Task count across all projects
   */
  totalTasks: number;

  /**
   * Completed task count across all projects
   */
  completedTasks: number;

  /**
   * Average tasks per project
   */
  avgTasksPerProject?: number;

  /**
   * Average completion rate (0-1)
   */
  avgCompletionRate?: number;
}

/**
 * Project member interface
 */
export interface ProjectMember {
  /**
   * Project ID
   */
  projectId: string;

  /**
   * User ID
   */
  userId: string;

  /**
   * Member role
   */
  role: "owner" | "admin" | "member" | "viewer";

  /**
   * Join date
   */
  joinedAt: Date;

  /**
   * Last activity date
   */
  lastActive?: Date;

  /**
   * Member permissions
   */
  permissions?: {
    canCreateTasks: boolean;
    canEditTasks: boolean;
    canDeleteTasks: boolean;
    canManageMembers: boolean;
    canEditProject: boolean;
    canDeleteProject: boolean;
  };
}

/**
 * Project activity event
 */
export interface ProjectActivityEvent {
  /**
   * Event ID
   */
  id: string;

  /**
   * Project ID
   */
  projectId: string;

  /**
   * Event type
   */
  type:
    | "created"
    | "updated"
    | "deleted"
    | "member_added"
    | "member_removed"
    | "task_created"
    | "task_completed";

  /**
   * Event timestamp
   */
  timestamp: Date;

  /**
   * User who performed the action
   */
  userId?: string;

  /**
   * Additional event data
   */
  data?: any;

  /**
   * Metadata
   */
  metadata?: Record<string, any>;
}

/**
 * Project timeline interface
 */
export interface ProjectTimeline {
  /**
   * Project ID
   */
  projectId: string;

  /**
   * Timeline events
   */
  events: ProjectActivityEvent[];

  /**
   * Timeline range
   */
  range: DateTimeRange;

  /**
   * Event statistics
   */
  statistics: {
    totalEvents: number;
    eventsByType: Record<string, number>;
    eventsByDate: Record<string, number>;
  };
}

/**
 * Project validation result
 */
export interface ProjectValidationResult {
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
 * Project hierarchy node for tree views
 */
export interface ProjectHierarchyNode {
  /**
   * Project ID
   */
  id: string;

  /**
   * Project name
   */
  name: string;

  /**
   * Project color
   */
  color: string;

  /**
   * Child projects
   */
  children: ProjectHierarchyNode[];

  /**
   * Depth in hierarchy
   */
  depth: number;

  /**
   * Path from root
   */
  path: string;

  /**
   * Task count
   */
  taskCount?: number;
}
