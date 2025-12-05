/**
 * Core application types for Todone
 * Contains fundamental application-level interfaces and types
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
import { PriorityLevel, ViewType, TaskStatus, RecurringPattern } from "./enums";
import { ApiResponse, ErrorResponse, PaginationResult } from "./api";
import { UiState, ModalState, ThemeSettings } from "./ui";

/**
 * Main application configuration interface
 */
export interface AppConfig {
  /**
   * Application version
   */
  version: string;

  /**
   * Environment (development, production, test)
   */
  environment: "development" | "production" | "test" | "staging";

  /**
   * Base API URL
   */
  apiBaseUrl: string;

  /**
   * Application name
   */
  appName: string;

  /**
   * Feature flags
   */
  features: {
    analytics: boolean;
    collaboration: boolean;
    offlineMode: boolean;
    experimentalFeatures: boolean;
  };

  /**
   * Default settings
   */
  defaults: {
    theme: ThemeSettings;
    viewType: ViewType;
    priorityLevel: PriorityLevel;
  };
}

/**
 * Application state interface
 */
export interface AppState {
  /**
   * Current user information
   */
  user: User | null;

  /**
   * Authentication status
   */
  isAuthenticated: boolean;

  /**
   * Application initialization status
   */
  isInitialized: boolean;

  /**
   * Current UI state
   */
  ui: UiState;

  /**
   * Error state
   */
  error: ErrorResponse | null;

  /**
   * Loading status
   */
  isLoading: boolean;

  /**
   * Online/offline status
   */
  isOnline: boolean;

  /**
   * Last sync timestamp
   */
  lastSync: Date | null;

  /**
   * Pending changes count
   */
  pendingChanges: number;
}

/**
 * Application context interface
 */
export interface AppContext {
  /**
   * Current application state
   */
  state: AppState;

  /**
   * Dispatch function for state updates
   */
  dispatch: (action: AppAction) => void;

  /**
   * API client instance
   */
  api: ApiClient;

  /**
   * Database instance
   */
  db: DatabaseInstance;

  /**
   * Analytics service
   */
  analytics?: AnalyticsService;
}

/**
 * Application action types
 */
export type AppAction =
  | { type: "INITIALIZE_APP"; payload: AppConfig }
  | { type: "SET_USER"; payload: User | null }
  | { type: "SET_AUTH_STATUS"; payload: boolean }
  | { type: "UPDATE_UI_STATE"; payload: Partial<UiState> }
  | { type: "SET_ERROR"; payload: ErrorResponse | null }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ONLINE_STATUS"; payload: boolean }
  | { type: "SYNC_COMPLETED"; payload: { timestamp: Date; changes: number } }
  | { type: "RESET_APP" };

/**
 * API client interface
 */
export interface ApiClient {
  /**
   * Base URL for API requests
   */
  baseUrl: string;

  /**
   * Authentication token
   */
  authToken: string | null;

  /**
   * Make authenticated API request
   */
  request<T>(
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH",
    endpoint: string,
    data?: any,
  ): Promise<ApiResponse<T>>;

  /**
   * User-related API methods
   */
  users: {
    getCurrentUser(): Promise<ApiResponse<User>>;
    updateUser(userData: Partial<User>): Promise<ApiResponse<User>>;
    getUserStats(userId: string): Promise<ApiResponse<UserStats>>;
  };

  /**
   * Project-related API methods
   */
  projects: {
    getAllProjects(): Promise<ApiResponse<Project[]>>;
    getProject(projectId: string): Promise<ApiResponse<Project>>;
    createProject(
      projectData: Omit<Project, "id">,
    ): Promise<ApiResponse<Project>>;
    updateProject(
      projectId: string,
      projectData: Partial<Project>,
    ): Promise<ApiResponse<Project>>;
    deleteProject(projectId: string): Promise<ApiResponse<void>>;
  };

  /**
   * Task-related API methods
   */
  tasks: {
    getTasks(projectId?: string): Promise<ApiResponse<Task[]>>;
    getTask(taskId: string): Promise<ApiResponse<Task>>;
    createTask(taskData: Omit<Task, "id">): Promise<ApiResponse<Task>>;
    updateTask(
      taskId: string,
      taskData: Partial<Task>,
    ): Promise<ApiResponse<Task>>;
    deleteTask(taskId: string): Promise<ApiResponse<void>>;
    completeTask(taskId: string): Promise<ApiResponse<Task>>;
    reopenTask(taskId: string): Promise<ApiResponse<Task>>;
  };

  /**
   * Label-related API methods
   */
  labels: {
    getLabels(): Promise<ApiResponse<Label[]>>;
    createLabel(labelData: Omit<Label, "id">): Promise<ApiResponse<Label>>;
    updateLabel(
      labelId: string,
      labelData: Partial<Label>,
    ): Promise<ApiResponse<Label>>;
    deleteLabel(labelId: string): Promise<ApiResponse<void>>;
  };

  /**
   * Database instance interface
   */
  db: DatabaseInstance;
}

/**
 * Database instance interface
 */
export interface DatabaseInstance {
  /**
   * Initialize database
   */
  initialize(): Promise<void>;

  /**
   * Close database connection
   */
  close(): Promise<void>;

  /**
   * CRUD operations for users
   */
  users: {
    get(id: string): Promise<User | undefined>;
    getAll(): Promise<User[]>;
    create(user: Omit<User, "id">): Promise<string>;
    update(id: string, user: Partial<User>): Promise<void>;
    delete(id: string): Promise<void>;
  };

  /**
   * CRUD operations for projects
   */
  projects: {
    get(id: string): Promise<Project | undefined>;
    getAll(): Promise<Project[]>;
    create(project: Omit<Project, "id">): Promise<string>;
    update(id: string, project: Partial<Project>): Promise<void>;
    delete(id: string): Promise<void>;
  };

  /**
   * CRUD operations for tasks
   */
  tasks: {
    get(id: string): Promise<Task | undefined>;
    getByProject(projectId: string): Promise<Task[]>;
    getAll(): Promise<Task[]>;
    create(task: Omit<Task, "id">): Promise<string>;
    update(id: string, task: Partial<Task>): Promise<void>;
    delete(id: string): Promise<void>;
    complete(id: string): Promise<void>;
    reopen(id: string): Promise<void>;
  };

  /**
   * CRUD operations for labels
   */
  labels: {
    get(id: string): Promise<Label | undefined>;
    getAll(): Promise<Label[]>;
    create(label: Omit<Label, "id">): Promise<string>;
    update(id: string, label: Partial<Label>): Promise<void>;
    delete(id: string): Promise<void>;
  };

  /**
   * Analytics service interface
   */
  analytics?: AnalyticsService;
}

/**
 * Analytics service interface
 */
export interface AnalyticsService {
  /**
   * Track an event
   */
  track(event: string, properties?: Record<string, any>): void;

  /**
   * Identify user
   */
  identify(userId: string, traits?: Record<string, any>): void;

  /**
   * Set user properties
   */
  setUserProperties(properties: Record<string, any>): void;

  /**
   * Get analytics configuration
   */
  getConfig(): AnalyticsConfig;
}

/**
 * Analytics configuration interface
 */
export interface AnalyticsConfig {
  /**
   * Analytics enabled status
   */
  enabled: boolean;

  /**
   * Tracking ID
   */
  trackingId: string;

  /**
   * Sample rate (0-1)
   */
  sampleRate: number;

  /**
   * Data collection preferences
   */
  dataCollection: {
    events: boolean;
    userProperties: boolean;
    sessionTracking: boolean;
  };
}

/**
 * User statistics interface
 */
export interface UserStats {
  /**
   * Total tasks completed
   */
  completedTasks: number;

  /**
   * Current streak (days)
   */
  currentStreak: number;

  /**
   * Longest streak (days)
   */
  longestStreak: number;

  /**
   * Total points earned
   */
  totalPoints: number;

  /**
   * Current level
   */
  level: number;

  /**
   * Tasks completed today
   */
  tasksToday: number;

  /**
   * Tasks completed this week
   */
  tasksThisWeek: number;

  /**
   * Productivity score (0-100)
   */
  productivityScore: number;
}

/**
 * Application initialization options
 */
export interface AppInitOptions {
  /**
   * Configuration object
   */
  config: AppConfig;

  /**
   * Initial user data
   */
  initialUser?: User | null;

  /**
   * Initial state overrides
   */
  initialState?: Partial<AppState>;

  /**
   * Database initialization options
   */
  dbOptions?: {
    name: string;
    version: number;
    stores: Record<string, string>;
  };

  /**
   * Analytics configuration
   */
  analyticsConfig?: AnalyticsConfig;
}

/**
 * Application lifecycle hooks
 */
export interface AppLifecycleHooks {
  /**
   * Called when app is initialized
   */
  onInit?: (app: AppContext) => void;

  /**
   * Called when user logs in
   */
  onLogin?: (user: User, app: AppContext) => void;

  /**
   * Called when user logs out
   */
  onLogout?: (app: AppContext) => void;

  /**
   * Called when error occurs
   */
  onError?: (error: ErrorResponse, app: AppContext) => void;

  /**
   * Called when sync completes
   */
  onSync?: (changes: number, app: AppContext) => void;
}
