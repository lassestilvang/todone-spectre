/**
 * API-related types for Todone application
 * Contains comprehensive API response and request interfaces
 */

import {
  User,
  Project,
  Task,
  Label,
  Filter,
  Comment,
  Attachment,
} from "./common";
import { PriorityLevel, TaskStatus, ViewType, RecurringPattern } from "./enums";

/**
 * Base API response interface
 */
export interface ApiResponse<T> {
  /**
   * Success status
   */
  success: boolean;

  /**
   * Response data
   */
  data?: T;

  /**
   * Response metadata
   */
  meta?: ApiResponseMeta;

  /**
   * Error information (if applicable)
   */
  error?: ErrorResponse;

  /**
   * Pagination information (if applicable)
   */
  pagination?: PaginationResult;

  /**
   * Rate limit information
   */
  rateLimit?: RateLimitInfo;

  /**
   * Response timestamp
   */
  timestamp: string;
}

/**
 * API response metadata
 */
export interface ApiResponseMeta {
  /**
   * Response version
   */
  version: string;

  /**
   * Request ID for tracking
   */
  requestId: string;

  /**
   * Response duration in ms
   */
  duration: number;

  /**
   * Cache information
   */
  cache?: {
    hit: boolean;
    ttl: number;
    key: string;
  };

  /**
   * Debug information (development only)
   */
  debug?: any;
}

/**
 * Error response interface
 */
export interface ErrorResponse {
  /**
   * Error code
   */
  code: string;

  /**
   * Error message
   */
  message: string;

  /**
   * Error details
   */
  details?: any;

  /**
   * Error type
   */
  type:
    | "validation"
    | "authentication"
    | "authorization"
    | "not_found"
    | "server"
    | "rate_limit"
    | "network"
    | "unknown";

  /**
   * Error timestamp
   */
  timestamp: string;

  /**
   * Error stack (development only)
   */
  stack?: string;

  /**
   * Suggested actions
   */
  suggestions?: string[];
}

/**
 * Success response interface
 */
export interface SuccessResponse<T> {
  /**
   * Success status
   */
  success: true;

  /**
   * Response data
   */
  data: T;

  /**
   * Response message
   */
  message?: string;

  /**
   * Response metadata
   */
  meta?: ApiResponseMeta;
}

/**
 * Pagination result interface
 */
export interface PaginationResult {
  /**
   * Current page number
   */
  page: number;

  /**
   * Number of items per page
   */
  pageSize: number;

  /**
   * Total number of items
   */
  totalItems: number;

  /**
   * Total number of pages
   */
  totalPages: number;

  /**
   * Number of items on current page
   */
  itemCount: number;

  /**
   * Has previous page
   */
  hasPreviousPage: boolean;

  /**
   * Has next page
   */
  hasNextPage: boolean;
}

/**
 * Sorting options interface
 */
export interface SortingOptions {
  /**
   * Field to sort by
   */
  field: string;

  /**
   * Sort direction
   */
  direction: "asc" | "desc";

  /**
   * Null handling
   */
  nullHandling?: "natural" | "nulls_first" | "nulls_last";
}

/**
 * Filtering options interface
 */
export interface FilteringOptions {
  /**
   * Filter field
   */
  field: string;

  /**
   * Filter operator
   */
  operator:
    | "eq"
    | "ne"
    | "gt"
    | "lt"
    | "gte"
    | "lte"
    | "in"
    | "nin"
    | "contains"
    | "startsWith"
    | "endsWith"
    | "regex";

  /**
   * Filter value
   */
  value: any;

  /**
   * Filter type
   */
  type?: "string" | "number" | "date" | "boolean" | "array";
}

/**
 * Query parameters interface
 */
export interface QueryParams {
  /**
   * Filter options
   */
  filters?: FilteringOptions[];

  /**
   * Sort options
   */
  sort?: SortingOptions;

  /**
   * Pagination options
   */
  pagination?: {
    page: number;
    pageSize: number;
  };

  /**
   * Search query
   */
  search?: string;

  /**
   * Include relations
   */
  include?: string[];

  /**
   * Field selection
   */
  fields?: string[];
}

/**
 * Rate limit information
 */
export interface RateLimitInfo {
  /**
   * Maximum allowed requests
   */
  limit: number;

  /**
   * Remaining requests
   */
  remaining: number;

  /**
   * Reset timestamp
   */
  reset: Date;

  /**
   * Reset time in seconds
   */
  resetIn: number;

  /**
   * Rate limit window
   */
  window: "second" | "minute" | "hour" | "day";
}

/**
 * API request options
 */
export interface ApiRequestOptions {
  /**
   * Request timeout in ms
   */
  timeout?: number;

  /**
   * Request headers
   */
  headers?: Record<string, string>;

  /**
   * Request query parameters
   */
  query?: Record<string, any>;

  /**
   * Cache options
   */
  cache?: {
    enabled: boolean;
    ttl: number;
    key: string;
  };

  /**
   * Retry options
   */
  retry?: {
    maxAttempts: number;
    delay: number;
    backoff: "linear" | "exponential";
  };

  /**
   * Request priority
   */
  priority?: "low" | "normal" | "high" | "critical";
}

/**
 * Authentication API interfaces
 */
export interface AuthApiResponse {
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
  expiresAt?: string;

  /**
   * User data
   */
  user?: User;

  /**
   * Authentication metadata
   */
  metadata?: {
    provider?: string;
    deviceId?: string;
    ipAddress?: string;
  };
}

export interface LoginRequest {
  /**
   * Email address
   */
  email: string;

  /**
   * Password
   */
  password: string;

  /**
   * Remember me flag
   */
  rememberMe?: boolean;

  /**
   * Device information
   */
  device?: {
    id?: string;
    name?: string;
    type?: string;
  };
}

export interface RegisterRequest {
  /**
   * Email address
   */
  email: string;

  /**
   * Password
   */
  password: string;

  /**
   * Full name
   */
  name: string;

  /**
   * Accept terms flag
   */
  acceptTerms: boolean;

  /**
   * Marketing opt-in flag
   */
  marketingOptIn?: boolean;

  /**
   * Referral code
   */
  referralCode?: string;
}

export interface PasswordResetRequest {
  /**
   * Email address
   */
  email: string;

  /**
   * Reset token
   */
  token: string;

  /**
   * New password
   */
  newPassword: string;
}

/**
 * User API interfaces
 */
export interface UserApiResponse {
  /**
   * User data
   */
  user: User;

  /**
   * User statistics
   */
  stats?: UserStatistics;

  /**
   * User preferences
   */
  preferences?: UserPreferences;

  /**
   * User settings
   */
  settings?: UserSettings;
}

export interface UpdateUserRequest {
  /**
   * User ID
   */
  userId: string;

  /**
   * User data to update
   */
  data: Partial<User>;

  /**
   * Update metadata
   */
  metadata?: {
    reason?: string;
    source?: string;
  };
}

/**
 * Project API interfaces
 */
export interface ProjectApiResponse {
  /**
   * Project data
   */
  project: Project;

  /**
   * Project statistics
   */
  stats?: ProjectStatistics;

  /**
   * Project members
   */
  members?: User[];

  /**
   * Project tasks
   */
  tasks?: Task[];
}

export interface CreateProjectRequest {
  /**
   * Project data
   */
  project: Omit<Project, "id" | "createdAt" | "updatedAt">;

  /**
   * Parent project ID
   */
  parentProjectId?: string;

  /**
   * Copy settings from another project
   */
  copySettingsFrom?: string;
}

export interface UpdateProjectRequest {
  /**
   * Project ID
   */
  projectId: string;

  /**
   * Project data to update
   */
  data: Partial<Project>;

  /**
   * Update metadata
   */
  metadata?: {
    reason?: string;
    notifyMembers?: boolean;
  };
}

/**
 * Task API interfaces
 */
export interface TaskApiResponse {
  /**
   * Task data
   */
  task: Task;

  /**
   * Task details
   */
  details?: TaskWithDetails;

  /**
   * Task statistics
   */
  stats?: TaskStatistics;

  /**
   * Task timeline
   */
  timeline?: TaskTimelineEvent[];
}

export interface CreateTaskRequest {
  /**
   * Task data
   */
  task: Omit<Task, "id" | "createdAt" | "updatedAt" | "completedAt">;

  /**
   * Project ID
   */
  projectId?: string;

  /**
   * Section ID
   */
  sectionId?: string;

  /**
   * Parent task ID
   */
  parentTaskId?: string;

  /**
   * Task dependencies
   */
  dependencies?: string[];
}

export interface UpdateTaskRequest {
  /**
   * Task ID
   */
  taskId: string;

  /**
   * Task data to update
   */
  data: Partial<Task>;

  /**
   * Update metadata
   */
  metadata?: {
    reason?: string;
    notifyAssignee?: boolean;
    createTimelineEvent?: boolean;
  };
}

export interface CompleteTaskRequest {
  /**
   * Task ID
   */
  taskId: string;

  /**
   * Completion timestamp
   */
  completedAt?: string;

  /**
   * Completion metadata
   */
  metadata?: {
    completedBy?: string;
    completionMethod?: "manual" | "automatic" | "recurring";
    notes?: string;
  };
}

/**
 * Label API interfaces
 */
export interface LabelApiResponse {
  /**
   * Label data
   */
  label: Label;

  /**
   * Label statistics
   */
  stats?: LabelStatistics;
}

export interface CreateLabelRequest {
  /**
   * Label data
   */
  label: Omit<Label, "id">;

  /**
   * Project ID (if project-specific)
   */
  projectId?: string;
}

export interface UpdateLabelRequest {
  /**
   * Label ID
   */
  labelId: string;

  /**
   * Label data to update
   */
  data: Partial<Label>;

  /**
   * Update metadata
   */
  metadata?: {
    reason?: string;
  };
}

/**
 * Filter API interfaces
 */
export interface FilterApiResponse {
  /**
   * Filter data
   */
  filter: Filter;

  /**
   * Filter statistics
   */
  stats?: FilterStatistics;
}

export interface CreateFilterRequest {
  /**
   * Filter data
   */
  filter: Omit<Filter, "id">;

  /**
   * User ID
   */
  userId: string;
}

export interface UpdateFilterRequest {
  /**
   * Filter ID
   */
  filterId: string;

  /**
   * Filter data to update
   */
  data: Partial<Filter>;

  /**
   * Update metadata
   */
  metadata?: {
    reason?: string;
  };
}

/**
 * Comment API interfaces
 */
export interface CommentApiResponse {
  /**
   * Comment data
   */
  comment: Comment;

  /**
   * Comment attachments
   */
  attachments?: Attachment[];
}

export interface CreateCommentRequest {
  /**
   * Comment data
   */
  comment: Omit<Comment, "id" | "timestamp">;

  /**
   * Task ID
   */
  taskId: string;

  /**
   * Attachment IDs
   */
  attachmentIds?: string[];
}

/**
 * Attachment API interfaces
 */
export interface AttachmentApiResponse {
  /**
   * Attachment data
   */
  attachment: Attachment;

  /**
   * Attachment metadata
   */
  metadata?: {
    size: number;
    type: string;
    previewUrl?: string;
  };
}

export interface UploadAttachmentRequest {
  /**
   * File data
   */
  file: File | Blob;

  /**
   * Task ID
   */
  taskId: string;

  /**
   * Attachment metadata
   */
  metadata?: {
    name?: string;
    description?: string;
    tags?: string[];
  };
}

/**
 * Search API interfaces
 */
export interface SearchRequest {
  /**
   * Search query
   */
  query: string;

  /**
   * Search filters
   */
  filters?: {
    types?: ("tasks" | "projects" | "users" | "comments" | "attachments")[];
    status?: TaskStatus[];
    priority?: PriorityLevel[];
    projectId?: string;
    assigneeId?: string;
    labelIds?: string[];
  };

  /**
   * Search options
   */
  options?: {
    limit?: number;
    offset?: number;
    includeCompleted?: boolean;
    includeArchived?: boolean;
  };
}

export interface SearchResponse {
  /**
   * Search results
   */
  results: {
    tasks: Task[];
    projects: Project[];
    users: User[];
    comments: Comment[];
    attachments: Attachment[];
  };

  /**
   * Search statistics
   */
  stats: {
    total: number;
    byType: Record<string, number>;
    duration: number;
  };

  /**
   * Search suggestions
   */
  suggestions?: string[];
}

/**
 * Sync API interfaces
 */
export interface SyncRequest {
  /**
   * Last sync timestamp
   */
  lastSync?: string;

  /**
   * Device ID
   */
  deviceId?: string;

  /**
   * Sync token
   */
  syncToken?: string;

  /**
   * Changes to sync
   */
  changes?: Array<{
    type: "create" | "update" | "delete";
    entity: "task" | "project" | "user" | "label" | "comment" | "attachment";
    data: any;
    timestamp: string;
  }>;
}

export interface SyncResponse {
  /**
   * Sync success status
   */
  success: boolean;

  /**
   * Applied changes
   */
  appliedChanges: number;

  /**
   * Conflicts resolved
   */
  conflictsResolved: number;

  /**
   * Sync timestamp
   */
  timestamp: string;

  /**
   * Next sync token
   */
  nextSyncToken?: string;

  /**
   * Sync statistics
   */
  stats?: {
    tasks: {
      created: number;
      updated: number;
      deleted: number;
    };
    projects: {
      created: number;
      updated: number;
      deleted: number;
    };
    users: {
      created: number;
      updated: number;
      deleted: number;
    };
  };
}

/**
 * Webhook API interfaces
 */
export interface Webhook {
  /**
   * Webhook ID
   */
  id: string;

  /**
   * Webhook URL
   */
  url: string;

  /**
   * Webhook events
   */
  events: string[];

  /**
   * Webhook secret
   */
  secret?: string;

  /**
   * Webhook status
   */
  status: "active" | "inactive" | "failed";

  /**
   * Webhook metadata
   */
  metadata?: {
    createdAt: Date;
    updatedAt: Date;
    lastDelivery?: Date;
    lastError?: string;
  };
}

export interface CreateWebhookRequest {
  /**
   * Webhook data
   */
  webhook: Omit<Webhook, "id" | "metadata">;

  /**
   * User ID
   */
  userId: string;
}

/**
 * Analytics API interfaces
 */
export interface AnalyticsEvent {
  /**
   * Event ID
   */
  id: string;

  /**
   * Event type
   */
  type: string;

  /**
   * Event data
   */
  data: Record<string, any>;

  /**
   * Event timestamp
   */
  timestamp: Date;

  /**
   * User ID
   */
  userId?: string;

  /**
   * Session ID
   */
  sessionId?: string;

  /**
   * Device information
   */
  device?: {
    id?: string;
    type?: string;
    os?: string;
  };
}

export interface TrackEventRequest {
  /**
   * Event data
   */
  event: Omit<AnalyticsEvent, "id" | "timestamp">;

  /**
   * Context
   */
  context?: {
    page?: string;
    referrer?: string;
    userAgent?: string;
  };
}

/**
 * API health check response
 */
export interface ApiHealthCheckResponse {
  /**
   * Service status
   */
  status: "healthy" | "degraded" | "unhealthy";

  /**
   * Service version
   */
  version: string;

  /**
   * Service uptime
   */
  uptime: number;

  /**
   * Database status
   */
  database: {
    status: "healthy" | "degraded" | "unhealthy";
    connection: boolean;
    lastError?: string;
  };

  /**
   * Cache status
   */
  cache?: {
    status: "healthy" | "degraded" | "unhealthy";
    hitRate?: number;
  };

  /**
   * Dependencies status
   */
  dependencies: Record<
    string,
    {
      status: "healthy" | "degraded" | "unhealthy";
      responseTime?: number;
    }
  >;

  /**
   * Timestamp
   */
  timestamp: string;
}

/**
 * API configuration response
 */
export interface ApiConfigResponse {
  /**
   * API version
   */
  version: string;

  /**
   * Available endpoints
   */
  endpoints: Record<
    string,
    {
      path: string;
      methods: string[];
      description: string;
      authenticated: boolean;
    }
  >;

  /**
   * Rate limits
   */
  rateLimits: {
    global: RateLimitInfo;
    byEndpoint: Record<string, RateLimitInfo>;
  };

  /**
   * Feature flags
   */
  features: Record<string, boolean>;

  /**
   * API documentation URL
   */
  documentationUrl?: string;

  /**
   * Support contact
   */
  supportContact?: string;
}

/**
 * API batch request
 */
export interface ApiBatchRequest {
  /**
   * Batch operations
   */
  operations: Array<{
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    endpoint: string;
    data?: any;
    headers?: Record<string, string>;
  }>;

  /**
   * Batch options
   */
  options?: {
    atomic: boolean;
    continueOnError: boolean;
    timeout: number;
  };
}

/**
 * API batch response
 */
export interface ApiBatchResponse {
  /**
   * Batch success status
   */
  success: boolean;

  /**
   * Individual operation responses
   */
  responses: Array<{
    operationIndex: number;
    success: boolean;
    data?: any;
    error?: ErrorResponse;
  }>;

  /**
   * Batch statistics
   */
  stats: {
    totalOperations: number;
    successfulOperations: number;
    failedOperations: number;
    duration: number;
  };
}
