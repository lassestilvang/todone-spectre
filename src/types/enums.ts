/**
 * Enums and constants for Todone application
 * Contains all the enumerated types used across the application
 */

/**
 * Priority levels for tasks
 */
export enum PriorityLevel {
  P1 = 'P1',
  P2 = 'P2',
  P3 = 'P3',
  P4 = 'P4'
}

/**
 * Priority level type
 */
export type PriorityLevel = 'P1' | 'P2' | 'P3' | 'P4';

/**
 * View types for projects and tasks
 */
export enum ViewType {
  LIST = 'list',
  BOARD = 'board',
  CALENDAR = 'calendar',
  TIMELINE = 'timeline'
}

/**
 * View type
 */
export type ViewType = 'list' | 'board' | 'calendar' | 'timeline';

/**
 * Task status values
 */
export enum TaskStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ARCHIVED = 'archived',
  PENDING = 'pending',
  IN_PROGRESS = 'in-progress'
}

/**
 * Task status type
 */
export type TaskStatus = 'active' | 'completed' | 'archived' | 'pending' | 'in-progress';

/**
 * Recurring pattern types
 */
export enum RecurringPattern {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  CUSTOM = 'custom'
}

/**
 * Recurring pattern type
 */
export type RecurringPattern = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';

/**
 * Color palette for projects
 */
export enum ProjectColorPalette {
  RED = 'red',
  ORANGE = 'orange',
  YELLOW = 'yellow',
  GREEN = 'green',
  TEAL = 'teal',
  BLUE = 'blue',
  INDIGO = 'indigo',
  PURPLE = 'purple',
  PINK = 'pink',
  GRAY = 'gray'
}

/**
 * Project color type
 */
export type ProjectColor = 'red' | 'orange' | 'yellow' | 'green' | 'teal' | 'blue' | 'indigo' | 'purple' | 'pink' | 'gray';

/**
 * Label color palette
 */
export enum LabelColorPalette {
  RED_500 = 'red-500',
  ORANGE_500 = 'orange-500',
  YELLOW_500 = 'yellow-500',
  GREEN_500 = 'green-500',
  TEAL_500 = 'teal-500',
  BLUE_500 = 'blue-500',
  INDIGO_500 = 'indigo-500',
  PURPLE_500 = 'purple-500',
  PINK_500 = 'pink-500',
  GRAY_500 = 'gray-500'
}

/**
 * Label color type
 */
export type LabelColor =
  | 'red-500'
  | 'orange-500'
  | 'yellow-500'
  | 'green-500'
  | 'teal-500'
  | 'blue-500'
  | 'indigo-500'
  | 'purple-500'
  | 'pink-500'
  | 'gray-500';

/**
 * Theme types
 */
export enum ThemeType {
  LIGHT = 'light',
  DARK = 'dark',
  SYSTEM = 'system'
}

/**
 * Theme type
 */
export type ThemeType = 'light' | 'dark' | 'system';

/**
 * Notification types
 */
export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error'
}

/**
 * Notification type
 */
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

/**
 * Sort direction
 */
export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc'
}

/**
 * Sort direction type
 */
export type SortDirection = 'asc' | 'desc';

/**
 * Filter operator types
 */
export enum FilterOperator {
  EQUALS = 'eq',
  NOT_EQUALS = 'ne',
  GREATER_THAN = 'gt',
  LESS_THAN = 'lt',
  GREATER_THAN_OR_EQUAL = 'gte',
  LESS_THAN_OR_EQUAL = 'lte',
  IN = 'in',
  NOT_IN = 'nin',
  CONTAINS = 'contains',
  STARTS_WITH = 'startsWith',
  ENDS_WITH = 'endsWith',
  REGEX = 'regex'
}

/**
 * Filter operator type
 */
export type FilterOperator =
  | 'eq'
  | 'ne'
  | 'gt'
  | 'lt'
  | 'gte'
  | 'lte'
  | 'in'
  | 'nin'
  | 'contains'
  | 'startsWith'
  | 'endsWith'
  | 'regex';

/**
 * Date format types
 */
export enum DateFormat {
  ISO = 'YYYY-MM-DD',
  US = 'MM/DD/YYYY',
  EUROPEAN = 'DD/MM/YYYY',
  FULL_ISO = 'YYYY-MM-DD HH:mm:ss',
  FULL_US = 'MM/DD/YYYY HH:mm:ss',
  FULL_EUROPEAN = 'DD/MM/YYYY HH:mm:ss'
}

/**
 * Date format type
 */
export type DateFormat =
  | 'YYYY-MM-DD'
  | 'MM/DD/YYYY'
  | 'DD/MM/YYYY'
  | 'YYYY-MM-DD HH:mm:ss'
  | 'MM/DD/YYYY HH:mm:ss'
  | 'DD/MM/YYYY HH:mm:ss';

/**
 * Time format types
 */
export enum TimeFormat {
  TWELVE_HOUR = 'h:mm A',
  TWENTY_FOUR_HOUR = 'HH:mm',
  TWELVE_HOUR_WITH_SECONDS = 'h:mm:ss A',
  TWENTY_FOUR_HOUR_WITH_SECONDS = 'HH:mm:ss'
}

/**
 * Time format type
 */
export type TimeFormat = 'h:mm A' | 'HH:mm' | 'h:mm:ss A' | 'HH:mm:ss';

/**
 * Week start day
 */
export enum WeekStartDay {
  SUNDAY = 'sunday',
  MONDAY = 'monday'
}

/**
 * Week start day type
 */
export type WeekStartDay = 'sunday' | 'monday';

/**
 * Task size categories
 */
export enum TaskSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  XLARGE = 'xlarge'
}

/**
 * Task size type
 */
export type TaskSize = 'small' | 'medium' | 'large' | 'xlarge';

/**
 * Project size categories
 */
export enum ProjectSize {
  SMALL = 'small',
  MEDIUM = 'medium',
  LARGE = 'large',
  XLARGE = 'xlarge'
}

/**
 * Project size type
 */
export type ProjectSize = 'small' | 'medium' | 'large' | 'xlarge';

/**
 * User role types
 */
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin'
}

/**
 * User role type
 */
export type UserRole = 'user' | 'admin' | 'superadmin';

/**
 * Authentication provider types
 */
export enum AuthProvider {
  EMAIL = 'email',
  GOOGLE = 'google',
  GITHUB = 'github',
  APPLE = 'apple',
  MICROSOFT = 'microsoft'
}

/**
 * Authentication provider type
 */
export type AuthProvider = 'email' | 'google' | 'github' | 'apple' | 'microsoft';

/**
 * Task dependency types
 */
export enum TaskDependencyType {
  BLOCKS = 'blocks',
  DEPENDS_ON = 'depends_on',
  RELATED = 'related',
  DUPLICATE = 'duplicate'
}

/**
 * Task dependency type
 */
export type TaskDependencyType = 'blocks' | 'depends_on' | 'related' | 'duplicate';

/**
 * Project visibility types
 */
export enum ProjectVisibility {
  PRIVATE = 'private',
  TEAM = 'team',
  PUBLIC = 'public'
}

/**
 * Project visibility type
 */
export type ProjectVisibility = 'private' | 'team' | 'public';

/**
 * User status types
 */
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  DELETED = 'deleted'
}

/**
 * User status type
 */
export type UserStatus = 'active' | 'inactive' | 'suspended' | 'deleted';

/**
 * Sync status types
 */
export enum SyncStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  SYNCING = 'syncing'
}

/**
 * Sync status type
 */
export type SyncStatus = 'pending' | 'completed' | 'failed' | 'syncing';

/**
 * Cache strategy types
 */
export enum CacheStrategy {
  NONE = 'none',
  MEMORY = 'memory',
  LOCAL_STORAGE = 'localStorage',
  SESSION_STORAGE = 'sessionStorage',
  INDEXED_DB = 'indexedDB'
}

/**
 * Cache strategy type
 */
export type CacheStrategy = 'none' | 'memory' | 'localStorage' | 'sessionStorage' | 'indexedDB';

/**
 * Log level types
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical'
}

/**
 * Log level type
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

/**
 * Event types for analytics
 */
export enum AnalyticsEventType {
  TASK_CREATED = 'task_created',
  TASK_COMPLETED = 'task_completed',
  TASK_UPDATED = 'task_updated',
  TASK_DELETED = 'task_deleted',
  PROJECT_CREATED = 'project_created',
  PROJECT_UPDATED = 'project_updated',
  PROJECT_DELETED = 'project_deleted',
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  USER_REGISTERED = 'user_registered'
}

/**
 * Analytics event type
 */
export type AnalyticsEventType =
  | 'task_created'
  | 'task_completed'
  | 'task_updated'
  | 'task_deleted'
  | 'project_created'
  | 'project_updated'
  | 'project_deleted'
  | 'user_login'
  | 'user_logout'
  | 'user_registered';

/**
 * Error types
 */
export enum ErrorType {
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  NOT_FOUND = 'not_found',
  SERVER = 'server',
  RATE_LIMIT = 'rate_limit',
  NETWORK = 'network',
  UNKNOWN = 'unknown'
}

/**
 * Error type
 */
export type ErrorType =
  | 'validation'
  | 'authentication'
  | 'authorization'
  | 'not_found'
  | 'server'
  | 'rate_limit'
  | 'network'
  | 'unknown';

/**
 * HTTP method types
 */
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS'
}

/**
 * HTTP method type
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

/**
 * Storage key types
 */
export enum StorageKey {
  USER = 'user',
  TOKEN = 'token',
  THEME = 'theme',
  SETTINGS = 'settings',
  CACHE = 'cache',
  LAST_SYNC = 'last_sync'
}

/**
 * Storage key type
 */
export type StorageKey = 'user' | 'token' | 'theme' | 'settings' | 'cache' | 'last_sync';

/**
 * Database table names
 */
export enum DatabaseTable {
  USERS = 'users',
  PROJECTS = 'projects',
  TASKS = 'tasks',
  LABELS = 'labels',
  FILTERS = 'filters',
  COMMENTS = 'comments',
  ATTACHMENTS = 'attachments',
  SYNC_QUEUE = 'sync_queue'
}

/**
 * Database table type
 */
export type DatabaseTable =
  | 'users'
  | 'projects'
  | 'tasks'
  | 'labels'
  | 'filters'
  | 'comments'
  | 'attachments'
  | 'sync_queue';

/**
 * Task repeat frequency for recurring tasks
 */
export enum TaskRepeatFrequency {
  DAILY = 'daily',
  WEEKDAYS = 'weekdays',
  WEEKLY = 'weekly',
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
  CUSTOM = 'custom'
}

/**
 * Task repeat frequency type
 */
export type TaskRepeatFrequency =
  | 'daily'
  | 'weekdays'
  | 'weekly'
  | 'biweekly'
  | 'monthly'
  | 'quarterly'
  | 'yearly'
  | 'custom';

/**
 * Task repeat end condition
 */
export enum TaskRepeatEnd {
  NEVER = 'never',
  ON_DATE = 'on_date',
  AFTER_OCCURRENCES = 'after_occurrences'
}

/**
 * Task repeat end type
 */
export type TaskRepeatEnd = 'never' | 'on_date' | 'after_occurrences';

/**
 * Task notification types
 */
export enum TaskNotificationType {
  DUE_SOON = 'due_soon',
  OVERDUE = 'overdue',
  COMPLETED = 'completed',
  ASSIGNED = 'assigned',
  COMMENT_ADDED = 'comment_added',
  ATTACHMENT_ADDED = 'attachment_added'
}

/**
 * Task notification type
 */
export type TaskNotificationType =
  | 'due_soon'
  | 'overdue'
  | 'completed'
  | 'assigned'
  | 'comment_added'
  | 'attachment_added';

/**
 * Project notification types
 */
export enum ProjectNotificationType {
  TASK_ADDED = 'task_added',
  TASK_COMPLETED = 'task_completed',
  MEMBER_ADDED = 'member_added',
  MEMBER_REMOVED = 'member_removed',
  PROJECT_UPDATED = 'project_updated'
}

/**
 * Project notification type
 */
export type ProjectNotificationType =
  | 'task_added'
  | 'task_completed'
  | 'member_added'
  | 'member_removed'
  | 'project_updated';