/**
 * Common utility types for Todone application
 * Contains shared interfaces and utility types used across the application
 */

import { PriorityLevel, TaskStatus, ViewType, RecurringPattern } from './enums';

/**
 * Base entity interface
 */
export interface BaseEntity {
  /**
   * Unique identifier
   */
  id: string;

  /**
   * Creation timestamp
   */
  createdAt: Date;

  /**
   * Last update timestamp
   */
  updatedAt: Date;

  /**
   * Entity metadata
   */
  metadata?: Record<string, any>;
}

/**
 * User interface
 */
export interface User {
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
   * User settings
   */
  settings?: any;

  /**
   * User preferences
   */
  preferences?: any;

  /**
   * User statistics
   */
  stats?: any;

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
 * Project interface
 */
export interface Project {
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
   * Project color
   */
  color: string;

  /**
   * Project view type
   */
  viewType: ViewType;

  /**
   * Favorite status
   */
  favorite: boolean;

  /**
   * Shared status
   */
  shared: boolean;

  /**
   * Parent project ID
   */
  parentProjectId?: string | null;

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
 * Task interface
 */
export interface Task {
  /**
   * Unique task identifier
   */
  id: string;

  /**
   * Task title/content
   */
  title: string;

  /**
   * Task description
   */
  description?: string;

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
   * Due time
   */
  dueTime?: string | null;

  /**
   * Estimated duration in minutes
   */
  duration?: number | null;

  /**
   * Recurring pattern
   */
  recurringPattern?: RecurringPattern | null;

  /**
   * Parent task ID
   */
  parentTaskId?: string | null;

  /**
   * Order/position
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

  /**
   * Project ID
   */
  projectId?: string | null;

  /**
   * Section ID
   */
  sectionId?: string | null;

  /**
   * Assignee ID
   */
  assigneeId?: string | null;

  /**
   * Label IDs
   */
  labelIds?: string[];

  /**
   * Attachment IDs
   */
  attachmentIds?: string[];

  /**
   * Comment IDs
   */
  commentIds?: string[];

  /**
   * Task dependencies
   */
  dependencies?: string[];

  /**
   * Task tags
   */
  tags?: string[];

  /**
   * Custom fields
   */
  customFields?: Record<string, any>;
}

/**
 * Label interface
 */
export interface Label {
  /**
   * Unique label identifier
   */
  id: string;

  /**
   * Label name
   */
  name: string;

  /**
   * Label color
   */
  color: string;

  /**
   * Personal label flag
   */
  isPersonal: boolean;

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
 * Filter interface
 */
export interface Filter {
  /**
   * Unique filter identifier
   */
  id: string;

  /**
   * Filter name
   */
  name: string;

  /**
   * Filter criteria
   */
  criteria: Record<string, any>;

  /**
   * Filter color
   */
  color: string;

  /**
   * Favorite status
   */
  favorite: boolean;

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
 * Comment interface
 */
export interface Comment {
  /**
   * Unique comment identifier
   */
  id: string;

  /**
   * Task ID this comment belongs to
   */
  taskId: string;

  /**
   * User who made the comment
   */
  user: string;

  /**
   * Comment content
   */
  content: string;

  /**
   * Attachment IDs
   */
  attachments?: string[];

  /**
   * Comment timestamp
   */
  timestamp: Date;
}

/**
 * Attachment interface
 */
export interface Attachment {
  /**
   * Unique attachment identifier
   */
  id: string;

  /**
   * File name
   */
  fileName: string;

  /**
   * File URL
   */
  url: string;

  /**
   * File type
   */
  type: string;

  /**
   * Creation timestamp
   */
  createdAt: Date;

  /**
   * Last update timestamp
   */
  updatedAt: Date;

  /**
   * Attachment metadata
   */
  metadata?: {
    size: number;
    mimeType: string;
    previewUrl?: string;
    taskId?: string;
    userId?: string;
  };
}

/**
 * Date/time range interface
 */
export interface DateTimeRange {
  /**
   * Start date/time
   */
  start: Date;

  /**
   * End date/time
   */
  end: Date;
}

/**
 * Nullable type utility
 */
export type Nullable<T> = T | null;

/**
 * Optional type utility
 */
export type Optional<T> = T | undefined;

/**
 * Dictionary type utility
 */
export type Dictionary<T> = Record<string, T>;

/**
 * Result type for success/error handling
 */
export type Result<T, E = Error> =
  | { success: true; data: T; error?: never }
  | { success: false; data?: never; error: E };

/**
 * Async result type
 */
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>;

/**
 * Function type
 */
export type Func<Args extends any[] = any[], Return = any> = (...args: Args) => Return;

/**
 * Async function type
 */
export type AsyncFunc<Args extends any[] = any[], Return = any> = (...args: Args) => Promise<Return>;

/**
 * Predicate function type
 */
export type Predicate<T> = (value: T, index: number, array: T[]) => boolean;

/**
 * Comparator function type
 */
export type Comparator<T> = (a: T, b: T) => number;

/**
 * Deep partial type utility
 */
export type DeepPartial<T> = T extends object
  ? T extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T extends ReadonlyArray<infer U>
      ? ReadonlyArray<DeepPartial<U>>
      : {
          [K in keyof T]?: DeepPartial<T[K]>;
        }
  : T;

/**
 * Deep readonly type utility
 */
export type DeepReadonly<T> = T extends object
  ? T extends Array<infer U>
    ? ReadonlyArray<DeepReadonly<U>>
    : T extends ReadonlyArray<infer U>
      ? ReadonlyArray<DeepReadonly<U>>
      : {
          readonly [K in keyof T]: DeepReadonly<T[K]>;
        }
  : T;

/**
 * Deep required type utility
 */
export type DeepRequired<T> = T extends object
  ? {
      [K in keyof T]-?: DeepRequired<T[K]>;
    }
  : T;

/**
 * Omit properties from type
 */
export type OmitStrict<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * Pick properties from type with different types
 */
export type PickWithTypes<T, K extends keyof T, U> = Pick<T, K> & {
  [P in K]: U;
};

/**
 * Non-empty array type
 */
export type NonEmptyArray<T> = [T, ...T[]];

/**
 * Brand type utility for nominal typing
 */
export type Brand<T, B> = T & { __brand: B };

/**
 * Optional keys of an object
 */
export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never;
}[keyof T];

/**
 * Required keys of an object
 */
export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K;
}[keyof T];

/**
 * Writable keys of an object
 */
export type WritableKeys<T> = {
  [P in keyof T]-?: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P, never>;
}[keyof T];

/**
 * Readonly keys of an object
 */
export type ReadonlyKeys<T> = {
  [P in keyof T]-?: IfEquals<{ [Q in P]: T[Q] }, { -readonly [Q in P]: T[Q] }, never, P>;
}[keyof T];

/**
 * Function property names of an object
 */
export type FunctionPropertyNames<T> = {
  [K in keyof T]-?: T[K] extends Function ? K : never;
}[keyof T];

/**
 * Non-function property names of an object
 */
export type NonFunctionPropertyNames<T> = {
  [K in keyof T]-?: T[K] extends Function ? never : K;
}[keyof T];

/**
 * Event handler type
 */
export type EventHandler<T = any> = (event: T) => void;

/**
 * Subscription type
 */
export interface Subscription {
  /**
   * Unsubscribe function
   */
  unsubscribe: () => void;

  /**
   * Subscription ID
   */
  id: string;

  /**
   * Subscription active status
   */
  active: boolean;
}

/**
 * Observer interface
 */
export interface Observer<T> {
  /**
   * Next callback
   */
  next: (value: T) => void;

  /**
   * Error callback
   */
  error: (error: any) => void;

  /**
   * Complete callback
   */
  complete: () => void;
}

/**
 * Observable interface
 */
export interface Observable<T> {
  /**
   * Subscribe to observable
   */
  subscribe: (observer: Observer<T>) => Subscription;

  /**
   * Observable active status
   */
  active: boolean;
}

/**
 * Disposable interface
 */
export interface Disposable {
  /**
   * Dispose function
   */
  dispose: () => void;

  /**
   * Disposed status
   */
  disposed: boolean;
}

/**
 * Cache interface
 */
export interface Cache<T> {
  /**
   * Get item from cache
   */
  get: (key: string) => T | undefined;

  /**
   * Set item in cache
   */
  set: (key: string, value: T, ttl?: number) => void;

  /**
   * Remove item from cache
   */
  delete: (key: string) => void;

  /**
   * Clear cache
   */
  clear: () => void;

  /**
   * Cache size
   */
  size: number;

  /**
   * Cache hit rate
   */
  hitRate: number;
}

/**
 * Queue interface
 */
export interface Queue<T> {
  /**
   * Add item to queue
   */
  enqueue: (item: T) => void;

  /**
   * Remove item from queue
   */
  dequeue: () => T | undefined;

  /**
   * Peek at next item
   */
  peek: () => T | undefined;

  /**
   * Queue size
   */
  size: number;

  /**
   * Queue is empty
   */
  isEmpty: boolean;

  /**
   * Clear queue
   */
  clear: () => void;
}

/**
 * Stack interface
 */
export interface Stack<T> {
  /**
   * Push item onto stack
   */
  push: (item: T) => void;

  /**
   * Pop item from stack
   */
  pop: () => T | undefined;

  /**
   * Peek at top item
   */
  peek: () => T | undefined;

  /**
   * Stack size
   */
  size: number;

  /**
   * Stack is empty
   */
  isEmpty: boolean;

  /**
   * Clear stack
   */
  clear: () => void;
}

/**
 * Tree node interface
 */
export interface TreeNode<T> {
  /**
   * Node value
   */
  value: T;

  /**
   * Child nodes
   */
  children: TreeNode<T>[];

  /**
   * Parent node
   */
  parent?: TreeNode<T> | null;

  /**
   * Node depth
   */
  depth: number;

  /**
   * Node path
   */
  path: string;

  /**
   * Node metadata
   */
  metadata?: Record<string, any>;
}

/**
 * Graph node interface
 */
export interface GraphNode<T> {
  /**
   * Node ID
   */
  id: string;

  /**
   * Node value
   */
  value: T;

  /**
   * Node edges
   */
  edges: GraphEdge[];

  /**
   * Node metadata
   */
  metadata?: Record<string, any>;
}

/**
 * Graph edge interface
 */
export interface GraphEdge {
  /**
   * Edge ID
   */
  id: string;

  /**
   * Source node ID
   */
  source: string;

  /**
   * Target node ID
   */
  target: string;

  /**
   * Edge weight
   */
  weight?: number;

  /**
   * Edge type
   */
  type?: string;

  /**
   * Edge metadata
   */
  metadata?: Record<string, any>;
}

/**
 * Coordinate interface
 */
export interface Coordinate {
  /**
   * X coordinate
   */
  x: number;

  /**
   * Y coordinate
   */
  y: number;
}

/**
 * Size interface
 */
export interface Size {
  /**
   * Width
   */
  width: number;

  /**
   * Height
   */
  height: number;
}

/**
 * Rectangle interface
 */
export interface Rectangle {
  /**
   * X position
   */
  x: number;

  /**
   * Y position
   */
  y: number;

  /**
   * Width
   */
  width: number;

  /**
   * Height
   */
  height: number;
}

/**
 * Position interface
 */
export interface Position {
  /**
   * Top position
   */
  top?: number;

  /**
   * Right position
   */
  right?: number;

  /**
   * Bottom position
   */
  bottom?: number;

  /**
   * Left position
   */
  left?: number;
}

/**
 * Color interface
 */
export interface Color {
  /**
   * Red component (0-255)
   */
  r: number;

  /**
   * Green component (0-255)
   */
  g: number;

  /**
   * Blue component (0-255)
   */
  b: number;

  /**
   * Alpha component (0-1)
   */
  a?: number;

  /**
   * Hex representation
   */
  hex: string;

  /**
   * RGB representation
   */
  rgb: string;

  /**
   * RGBA representation
   */
  rgba: string;
}

/**
 * Date range interface
 */
export interface DateRange {
  /**
   * Start date
   */
  start: Date;

  /**
   * End date
   */
  end: Date;
}

/**
 * Time range interface
 */
export interface TimeRange {
  /**
   * Start time
   */
  start: string;

  /**
   * End time
   */
  end: string;
}

/**
 * Date/time range interface
 */
export interface DateTimeRange {
  /**
   * Start date/time
   */
  start: Date;

  /**
   * End date/time
   */
  end: Date;
}

/**
 * Pagination options interface
 */
export interface PaginationOptions {
  /**
   * Page number (1-based)
   */
  page: number;

  /**
   * Items per page
   */
  pageSize: number;

  /**
   * Total items
   */
  totalItems?: number;

  /**
   * Total pages
   */
  totalPages?: number;
}

/**
 * Sort options interface
 */
export interface SortOptions {
  /**
   * Field to sort by
   */
  field: string;

  /**
   * Sort direction
   */
  direction: 'asc' | 'desc';
}

/**
 * Filter options interface
 */
export interface FilterOptions {
  /**
   * Filter field
   */
  field: string;

  /**
   * Filter value
   */
  value: any;

  /**
   * Filter operator
   */
  operator?: 'eq' | 'ne' | 'gt' | 'lt' | 'contains' | 'startsWith' | 'endsWith';
}

/**
 * Query result interface
 */
export interface QueryResult<T> {
  /**
   * Query results
   */
  data: T[];

  /**
   * Total count
   */
  total: number;

  /**
   * Pagination info
   */
  pagination: PaginationOptions;

  /**
   * Query metadata
   */
  metadata?: Record<string, any>;
}

/**
 * Validation result interface
 */
export interface ValidationResult {
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
 * Transformation result interface
 */
export interface TransformationResult<T> {
  /**
   * Transformation success status
   */
  success: boolean;

  /**
   * Transformed data
   */
  data?: T;

  /**
   * Transformation errors
   */
  errors: string[];

  /**
   * Transformation warnings
   */
  warnings: string[];

  /**
   * Transformation metadata
   */
  metadata?: Record<string, any>;
}

/**
 * Async operation result interface
 */
export interface AsyncOperationResult<T> {
  /**
   * Operation success status
   */
  success: boolean;

  /**
   * Operation result data
   */
  data?: T;

  /**
   * Operation error
   */
  error?: Error;

  /**
   * Operation duration in ms
   */
  duration: number;

  /**
   * Operation timestamp
   */
  timestamp: Date;

  /**
   * Operation metadata
   */
  metadata?: Record<string, any>;
}

/**
 * Batch operation result interface
 */
export interface BatchOperationResult<T> {
  /**
   * Successfully processed items
   */
  success: T[];

  /**
   * Failed items with error messages
   */
  failures: Array<{
    item: T;
    error: string;
  }>;

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

  /**
   * Operation duration in ms
   */
  duration: number;
}

/**
 * File upload result interface
 */
export interface FileUploadResult {
  /**
   * Upload success status
   */
  success: boolean;

  /**
   * Uploaded file URL
   */
  url?: string;

  /**
   * File ID
   */
  fileId?: string;

  /**
   * File metadata
   */
  metadata?: {
    name: string;
    size: number;
    type: string;
    previewUrl?: string;
  };

  /**
   * Upload error
   */
  error?: string;

  /**
   * Upload duration in ms
   */
  duration: number;
}

/**
 * Image processing result interface
 */
export interface ImageProcessingResult {
  /**
   * Processing success status
   */
  success: boolean;

  /**
   * Processed image URL
   */
  url?: string;

  /**
   * Original image URL
   */
  originalUrl?: string;

  /**
   * Thumbnail URL
   */
  thumbnailUrl?: string;

  /**
   * Image metadata
   */
  metadata?: {
    width: number;
    height: number;
    format: string;
    size: number;
  };

  /**
   * Processing error
   */
  error?: string;
}