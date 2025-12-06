// @ts-nocheck
/**
 * Task-related types for Todone application
 * Contains comprehensive task management interfaces and types
 */

import { PriorityLevel, TaskStatus, RecurringPattern } from "./enums";
import { User } from "./user";
import { Label } from "./common";
import { DateTimeRange } from "./common";

/**
 * Base task interface
 */
export interface BaseTask {
  /**
   * Unique task identifier
   */
  id: string;

  /**
   * Task title/content
   */
  title: string;

  /**
   * Detailed task description
   */
  description?: string;

  /**
   * Task status
   */
  status: TaskStatus;

  /**
   * Task priority level
   */
  priority: PriorityLevel;

  /**
   * Due date for the task
   */
  dueDate?: Date | null;

  /**
   * Due time for the task
   */
  dueTime?: string | null;

  /**
   * Estimated duration in minutes
   */
  duration?: number | null;

  /**
   * Recurring pattern for repeating tasks
   */
  recurringPattern?: RecurringPattern | null;

  /**
   * Parent task ID for subtasks
   */
  parentTaskId?: string | null;

  /**
   * Order/position within its container
   */
  order: number;

  /**
   * Completion status
   */
  completed: boolean;

  /**
   * Creation timestamp
   */
  createdAt: Date;

  /**
   * Last update timestamp
   */
  updatedAt: Date;

  /**
   * Completion timestamp
   */
  completedAt?: Date | null;
}

/**
 * Extended task interface with project and section relationships
 */
export interface Task extends BaseTask {
  /**
   * ID of the project this task belongs to
   */
  projectId?: string | null;

  /**
   * ID of the section this task belongs to
   */
  sectionId?: string | null;

  /**
   * User assigned to this task
   */
  assigneeId?: string | null;

  /**
   * Labels associated with this task
   */
  labelIds?: string[];

  /**
   * Attachments associated with this task
   */
  attachmentIds?: string[];

  /**
   * Comments associated with this task
   */
  commentIds?: string[];

  /**
   * Task dependencies (other task IDs)
   */
  dependencies?: string[];

  /**
   * Task tags for categorization
   */
  tags?: string[];

  /**
   * Custom fields for extended functionality
   */
  customFields?: Record<string, any>;

  /**
   * Task metadata
   */
  metadata?: {
    source?: string;
    createdBy?: string;
    lastUpdatedBy?: string;
    version?: number;
  };
}

/**
 * Task creation DTO (Data Transfer Object)
 */
export interface CreateTaskDto extends Omit<
  Task,
  "id" | "createdAt" | "updatedAt" | "completedAt"
> {
  /**
   * Optional ID for client-side generation
   */
  id?: string;
}

/**
 * Task update DTO
 */
export interface UpdateTaskDto extends Partial<
  Omit<Task, "id" | "createdAt" | "updatedAt" | "completedAt">
> {
  /**
   * Task ID (required for updates)
   */
  id: string;
}

/**
 * Task completion DTO
 */
export interface CompleteTaskDto {
  /**
   * Task ID to complete
   */
  taskId: string;

  /**
   * Completion timestamp
   */
  completedAt?: Date;

  /**
   * Additional completion metadata
   */
  metadata?: {
    completedBy?: string;
    completionMethod?: "manual" | "automatic" | "recurring";
  };
}

/**
 * Task reopen DTO
 */
export interface ReopenTaskDto {
  /**
   * Task ID to reopen
   */
  taskId: string;

  /**
   * Reason for reopening
   */
  reason?: string;
}

/**
 * Task with full details including relationships
 */
export interface TaskWithDetails extends Task {
  /**
   * Assignee user object
   */
  assignee?: User | null;

  /**
   * Label objects
   */
  labels?: Label[];

  /**
   * Attachment count
   */
  attachmentCount?: number;

  /**
   * Comment count
   */
  commentCount?: number;

  /**
   * Subtask count
   */
  subtaskCount?: number;

  /**
   * Completion percentage (0-100)
   */
  completionPercentage?: number;
}

/**
 * Task list item (simplified for lists)
 */
export interface TaskListItem {
  /**
   * Task ID
   */
  id: string;

  /**
   * Task title
   */
  title: string;

  /**
   * Task status
   */
  status: TaskStatus;

  /**
   * Task priority
   */
  priority: PriorityLevel;

  /**
   * Due date
   */
  dueDate?: Date | null;

  /**
   * Completion status
   */
  completed: boolean;

  /**
   * Project ID
   */
  projectId?: string | null;

  /**
   * Label IDs
   */
  labelIds?: string[];

  /**
   * Assignee ID
   */
  assigneeId?: string | null;
}

/**
 * Task filter criteria
 */
export interface TaskFilterCriteria {
  /**
   * Filter by status
   */
  status?: TaskStatus | TaskStatus[];

  /**
   * Filter by priority
   */
  priority?: PriorityLevel | PriorityLevel[];

  /**
   * Filter by project ID
   */
  projectId?: string | string[];

  /**
   * Filter by section ID
   */
  sectionId?: string | string[];

  /**
   * Filter by assignee ID
   */
  assigneeId?: string | string[];

  /**
   * Filter by label IDs
   */
  labelIds?: string | string[];

  /**
   * Filter by due date range
   */
  dueDate?: DateTimeRange;

  /**
   * Filter by completion status
   */
  completed?: boolean;

  /**
   * Search query for title/description
   */
  searchQuery?: string;

  /**
   * Filter by tags
   */
  tags?: string | string[];

  /**
   * Custom filter criteria
   */
  custom?: Record<string, any>;
}

/**
 * Task sort options
 */
export interface TaskSortOptions {
  /**
   * Field to sort by
   */
  field:
    | "title"
    | "priority"
    | "dueDate"
    | "createdAt"
    | "updatedAt"
    | "completed"
    | "status";

  /**
   * Sort direction
   */
  direction: "asc" | "desc";
}

/**
 * Task query parameters
 */
export interface TaskQueryParams {
  /**
   * Filter criteria
   */
  filter?: TaskFilterCriteria;

  /**
   * Sort options
   */
  sort?: TaskSortOptions;

  /**
   * Pagination options
   */
  pagination?: {
    page: number;
    pageSize: number;
  };

  /**
   * Include completed tasks
   */
  includeCompleted?: boolean;

  /**
   * Include archived tasks
   */
  includeArchived?: boolean;
}

/**
 * Task statistics interface
 */
export interface TaskStatistics {
  /**
   * Total task count
   */
  total: number;

  /**
   * Completed task count
   */
  completed: number;

  /**
   * Active task count
   */
  active: number;

  /**
   * Overdue task count
   */
  overdue: number;

  /**
   * Task count by status
   */
  byStatus: Record<TaskStatus, number>;

  /**
   * Task count by priority
   */
  byPriority: Record<PriorityLevel, number>;

  /**
   * Average completion time (minutes)
   */
  avgCompletionTime?: number;

  /**
   * Completion rate (0-1)
   */
  completionRate?: number;
}

/**
 * Task timeline event
 */
export interface TaskTimelineEvent {
  /**
   * Event ID
   */
  id: string;

  /**
   * Task ID
   */
  taskId: string;

  /**
   * Event type
   */
  type:
    | "created"
    | "updated"
    | "completed"
    | "reopened"
    | "deleted"
    | "comment_added"
    | "attachment_added";

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
 * Task dependency graph node
 */
export interface TaskDependencyNode {
  /**
   * Task ID
   */
  id: string;

  /**
   * Task title
   */
  title: string;

  /**
   * Task status
   */
  status: TaskStatus;

  /**
   * Dependencies (task IDs)
   */
  dependencies: string[];

  /**
   * Dependents (task IDs that depend on this task)
   */
  dependents: string[];
}

/**
 * Task batch operation result
 */
export interface TaskBatchOperationResult {
  /**
   * Successfully processed task IDs
   */
  success: string[];

  /**
   * Failed task IDs with error messages
   */
  failures: Record<string, string>;

  /**
   * Total count
   */
  total: number;

  /**
   * Success count
   */
  successCount: number;

  /**
   * Failure count
   */
  failureCount: number;
}

/**
 * Task validation result
 */
export interface TaskValidationResult {
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
 * Recurring task instance
 */
export interface RecurringTaskInstance {
  /**
   * Instance ID
   */
  id: string;

  /**
   * Task ID
   */
  taskId: string;

  /**
   * Instance date
   */
  date: Date;

  /**
   * Whether this instance was generated
   */
  isGenerated: boolean;

  /**
   * Original task ID
   */
  originalTaskId: string;

  /**
   * Instance status
   */
  status: TaskStatus;

  /**
   * Completion status
   */
  completed: boolean;
}

/**
 * Recurring task configuration
 */
export interface RecurringTaskConfig {
  /**
   * Recurring pattern
   */
  pattern: RecurringPattern;

  /**
   * Start date
   */
  startDate: Date;

  /**
   * End date (optional)
   */
  endDate?: Date | null;

  /**
   * Maximum occurrences (optional)
   */
  maxOccurrences?: number | null;

  /**
   * Custom interval (optional)
   */
  customInterval?: number | null;

  /**
   * Custom unit (optional)
   */
  customUnit?: "days" | "weeks" | "months" | "years" | null;
}

/**
 * Recurring pattern configuration
 */
export interface RecurringPatternConfig {
  /**
   * Pattern type
   */
  pattern: RecurringPattern;

  /**
   * Frequency type
   */
  frequency?: TaskRepeatFrequency;

  /**
   * End condition
   */
  endCondition?: TaskRepeatEnd;

  /**
   * End date
   */
  endDate?: Date | null;

  /**
   * Maximum occurrences
   */
  maxOccurrences?: number | null;

  /**
   * Interval
   */
  interval?: number;

  /**
   * Custom days for weekly patterns
   */
  customDays?: number[];

  /**
   * Custom days for monthly patterns
   */
  customMonthDays?: number[];

  /**
   * Custom month position
   */
  customMonthPosition?: "first" | "second" | "third" | "fourth" | "last";

  /**
   * Custom month day
   */
  customMonthDay?:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday";
}

/**
 * Recurring task statistics
 */
export interface RecurringTaskStats {
  /**
   * Total instances count
   */
  totalInstances: number;

  /**
   * Completed instances count
   */
  completedInstances: number;

  /**
   * Pending instances count
   */
  pendingInstances: number;

  /**
   * Next instance date
   */
  nextInstanceDate?: Date;
}
