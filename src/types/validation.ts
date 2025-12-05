/**
 * Type guards and validation functions for Todone application
 * Contains comprehensive runtime type checking and validation utilities
 */

import {
  User,
  Project,
  Task,
  Label,
  Filter,
  Comment,
  Attachment,
  Section,
} from "./common";

import {
  PriorityLevel,
  TaskStatus,
  ViewType,
  RecurringPattern,
  ProjectColor,
  LabelColor,
  UserRole,
  AuthProvider,
  UserStatus,
  ProjectVisibility,
} from "./enums";

import {
  ApiResponse,
  ErrorResponse,
  PaginationResult,
  SortingOptions,
  FilteringOptions,
  QueryParams,
  RateLimitInfo,
} from "./api";

import {
  UiState,
  SidebarState,
  ModalState,
  ThemeSettings,
  LayoutSettings,
  NotificationState,
  LoadingState,
  ErrorState,
  SearchState,
  ContextMenuState,
  DragDropState,
  KeyboardShortcutsState,
} from "./ui";

/**
 * Type guard for User
 */
export function isUser(obj: any): obj is User {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "string" &&
    typeof obj.email === "string" &&
    typeof obj.name === "string" &&
    (obj.avatar === undefined ||
      typeof obj.avatar === "string" ||
      obj.avatar === null) &&
    (obj.createdAt instanceof Date || typeof obj.createdAt === "string") &&
    (obj.updatedAt instanceof Date || typeof obj.updatedAt === "string")
  );
}

/**
 * Type guard for Project
 */
export function isProject(obj: any): obj is Project {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "string" &&
    typeof obj.name === "string" &&
    (obj.description === undefined || typeof obj.description === "string") &&
    typeof obj.color === "string" &&
    typeof obj.viewType === "string" &&
    typeof obj.favorite === "boolean" &&
    typeof obj.shared === "boolean" &&
    (obj.parentProjectId === undefined ||
      typeof obj.parentProjectId === "string" ||
      obj.parentProjectId === null) &&
    (obj.createdAt instanceof Date || typeof obj.createdAt === "string") &&
    (obj.updatedAt instanceof Date || typeof obj.updatedAt === "string")
  );
}

/**
 * Type guard for Task
 */
export function isTask(obj: any): obj is Task {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "string" &&
    typeof obj.title === "string" &&
    (obj.description === undefined || typeof obj.description === "string") &&
    typeof obj.status === "string" &&
    typeof obj.priority === "string" &&
    (obj.dueDate === undefined ||
      obj.dueDate === null ||
      obj.dueDate instanceof Date ||
      typeof obj.dueDate === "string") &&
    (obj.dueTime === undefined ||
      obj.dueTime === null ||
      typeof obj.dueTime === "string") &&
    (obj.duration === undefined ||
      obj.duration === null ||
      typeof obj.duration === "number") &&
    (obj.recurringPattern === undefined ||
      obj.recurringPattern === null ||
      typeof obj.recurringPattern === "string") &&
    (obj.parentTaskId === undefined ||
      obj.parentTaskId === null ||
      typeof obj.parentTaskId === "string") &&
    typeof obj.order === "number" &&
    typeof obj.completed === "boolean" &&
    (obj.completedAt === undefined ||
      obj.completedAt === null ||
      obj.completedAt instanceof Date ||
      typeof obj.completedAt === "string") &&
    (obj.projectId === undefined ||
      obj.projectId === null ||
      typeof obj.projectId === "string") &&
    (obj.sectionId === undefined ||
      obj.sectionId === null ||
      typeof obj.sectionId === "string") &&
    (obj.assigneeId === undefined ||
      obj.assigneeId === null ||
      typeof obj.assigneeId === "string") &&
    (obj.labelIds === undefined || Array.isArray(obj.labelIds)) &&
    (obj.attachmentIds === undefined || Array.isArray(obj.attachmentIds)) &&
    (obj.commentIds === undefined || Array.isArray(obj.commentIds)) &&
    (obj.dependencies === undefined || Array.isArray(obj.dependencies)) &&
    (obj.tags === undefined || Array.isArray(obj.tags)) &&
    (obj.customFields === undefined || typeof obj.customFields === "object") &&
    (obj.createdAt instanceof Date || typeof obj.createdAt === "string") &&
    (obj.updatedAt instanceof Date || typeof obj.updatedAt === "string")
  );
}

/**
 * Type guard for Label
 */
export function isLabel(obj: any): obj is Label {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "string" &&
    typeof obj.name === "string" &&
    typeof obj.color === "string" &&
    typeof obj.isPersonal === "boolean" &&
    (obj.createdAt instanceof Date || typeof obj.createdAt === "string") &&
    (obj.updatedAt instanceof Date || typeof obj.updatedAt === "string")
  );
}

/**
 * Type guard for Filter
 */
export function isFilter(obj: any): obj is Filter {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "string" &&
    typeof obj.name === "string" &&
    typeof obj.query === "string" &&
    typeof obj.color === "string" &&
    typeof obj.favorite === "boolean" &&
    (obj.createdAt instanceof Date || typeof obj.createdAt === "string") &&
    (obj.updatedAt instanceof Date || typeof obj.updatedAt === "string")
  );
}

/**
 * Type guard for Comment
 */
export function isComment(obj: any): obj is Comment {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "string" &&
    typeof obj.taskId === "string" &&
    typeof obj.user === "string" &&
    typeof obj.content === "string" &&
    (obj.attachments === undefined || Array.isArray(obj.attachments)) &&
    (obj.timestamp instanceof Date || typeof obj.timestamp === "string")
  );
}

/**
 * Type guard for Attachment
 */
export function isAttachment(obj: any): obj is Attachment {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "string" &&
    typeof obj.fileName === "string" &&
    typeof obj.url === "string" &&
    typeof obj.type === "string" &&
    (obj.createdAt instanceof Date || typeof obj.createdAt === "string") &&
    (obj.updatedAt instanceof Date || typeof obj.updatedAt === "string") &&
    (obj.metadata === undefined || typeof obj.metadata === "object")
  );
}

/**
 * Type guard for Section
 */
export function isSection(obj: any): obj is Section {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.id === "string" &&
    typeof obj.name === "string" &&
    typeof obj.projectId === "string" &&
    typeof obj.order === "number" &&
    (obj.createdAt instanceof Date || typeof obj.createdAt === "string") &&
    (obj.updatedAt instanceof Date || typeof obj.updatedAt === "string")
  );
}

/**
 * Type guard for ApiResponse
 */
export function isApiResponse<T>(obj: any): obj is ApiResponse<T> {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.success === "boolean" &&
    (obj.data === undefined || obj.data !== null) &&
    (obj.meta === undefined || typeof obj.meta === "object") &&
    (obj.error === undefined || isErrorResponse(obj.error)) &&
    (obj.pagination === undefined || isPaginationResult(obj.pagination)) &&
    (obj.rateLimit === undefined || isRateLimitInfo(obj.rateLimit)) &&
    typeof obj.timestamp === "string"
  );
}

/**
 * Type guard for ErrorResponse
 */
export function isErrorResponse(obj: any): obj is ErrorResponse {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.code === "string" &&
    typeof obj.message === "string" &&
    typeof obj.type === "string" &&
    typeof obj.timestamp === "string"
  );
}

/**
 * Type guard for PaginationResult
 */
export function isPaginationResult(obj: any): obj is PaginationResult {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.page === "number" &&
    typeof obj.pageSize === "number" &&
    typeof obj.totalItems === "number" &&
    typeof obj.totalPages === "number" &&
    typeof obj.itemCount === "number" &&
    typeof obj.hasPreviousPage === "boolean" &&
    typeof obj.hasNextPage === "boolean"
  );
}

/**
 * Type guard for SortingOptions
 */
export function isSortingOptions(obj: any): obj is SortingOptions {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.field === "string" &&
    typeof obj.direction === "string" &&
    (obj.nullHandling === undefined || typeof obj.nullHandling === "string")
  );
}

/**
 * Type guard for FilteringOptions
 */
export function isFilteringOptions(obj: any): obj is FilteringOptions {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.field === "string" &&
    typeof obj.operator === "string" &&
    obj.value !== undefined &&
    (obj.type === undefined || typeof obj.type === "string")
  );
}

/**
 * Type guard for QueryParams
 */
export function isQueryParams(obj: any): obj is QueryParams {
  return (
    obj &&
    typeof obj === "object" &&
    (obj.filters === undefined || Array.isArray(obj.filters)) &&
    (obj.sort === undefined || isSortingOptions(obj.sort)) &&
    (obj.pagination === undefined ||
      (typeof obj.pagination === "object" &&
        typeof obj.pagination.page === "number" &&
        typeof obj.pagination.pageSize === "number")) &&
    (obj.search === undefined || typeof obj.search === "string") &&
    (obj.include === undefined || Array.isArray(obj.include)) &&
    (obj.fields === undefined || Array.isArray(obj.fields))
  );
}

/**
 * Type guard for RateLimitInfo
 */
export function isRateLimitInfo(obj: any): obj is RateLimitInfo {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.limit === "number" &&
    typeof obj.remaining === "number" &&
    (obj.reset instanceof Date || typeof obj.reset === "string") &&
    typeof obj.resetIn === "number" &&
    typeof obj.window === "string"
  );
}

/**
 * Type guard for UiState
 */
export function isUiState(obj: any): obj is UiState {
  return (
    obj &&
    typeof obj === "object" &&
    isSidebarState(obj.sidebar) &&
    isModalState(obj.modals) &&
    typeof obj.currentView === "string" &&
    isThemeSettings(obj.theme) &&
    isLayoutSettings(obj.layout) &&
    isNotificationState(obj.notifications) &&
    isLoadingState(obj.loading) &&
    isErrorState(obj.errors) &&
    isSearchState(obj.search) &&
    isContextMenuState(obj.contextMenu) &&
    isDragDropState(obj.dragDrop) &&
    isKeyboardShortcutsState(obj.keyboardShortcuts)
  );
}

/**
 * Type guard for SidebarState
 */
export function isSidebarState(obj: any): obj is SidebarState {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.isOpen === "boolean" &&
    typeof obj.width === "number" &&
    typeof obj.activeTab === "string" &&
    (obj.collapsedSections === undefined ||
      typeof obj.collapsedSections === "object") &&
    (obj.pinnedProjects === undefined || Array.isArray(obj.pinnedProjects)) &&
    (obj.recentProjects === undefined || Array.isArray(obj.recentProjects))
  );
}

/**
 * Type guard for ModalState
 */
export function isModalState(obj: any): obj is ModalState {
  return (
    obj &&
    typeof obj === "object" &&
    isTaskModalState(obj.taskModal) &&
    isProjectModalState(obj.projectModal) &&
    isUserModalState(obj.userModal) &&
    isSettingsModalState(obj.settingsModal) &&
    isConfirmationModalState(obj.confirmationModal) &&
    isSearchModalState(obj.searchModal)
  );
}

/**
 * Type guard for TaskModalState
 */
function isTaskModalState(obj: any): boolean {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.isOpen === "boolean" &&
    (obj.taskId === undefined || typeof obj.taskId === "string") &&
    (obj.mode === undefined ||
      typeof obj.mode === "string" ||
      obj.mode === null)
  );
}

/**
 * Type guard for ProjectModalState
 */
function isProjectModalState(obj: any): boolean {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.isOpen === "boolean" &&
    (obj.projectId === undefined || typeof obj.projectId === "string") &&
    (obj.mode === undefined ||
      typeof obj.mode === "string" ||
      obj.mode === null)
  );
}

/**
 * Type guard for UserModalState
 */
function isUserModalState(obj: any): boolean {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.isOpen === "boolean" &&
    (obj.userId === undefined || typeof obj.userId === "string") &&
    (obj.mode === undefined ||
      typeof obj.mode === "string" ||
      obj.mode === null)
  );
}

/**
 * Type guard for SettingsModalState
 */
function isSettingsModalState(obj: any): boolean {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.isOpen === "boolean" &&
    (obj.activeTab === undefined ||
      typeof obj.activeTab === "string" ||
      obj.activeTab === null)
  );
}

/**
 * Type guard for ConfirmationModalState
 */
function isConfirmationModalState(obj: any): boolean {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.isOpen === "boolean" &&
    (obj.title === undefined || typeof obj.title === "string") &&
    (obj.message === undefined || typeof obj.message === "string") &&
    (obj.onConfirm === undefined || typeof obj.onConfirm === "function") &&
    (obj.onCancel === undefined || typeof obj.onCancel === "function") &&
    (obj.confirmText === undefined || typeof obj.confirmText === "string") &&
    (obj.cancelText === undefined || typeof obj.cancelText === "string") &&
    (obj.type === undefined || typeof obj.type === "string")
  );
}

/**
 * Type guard for SearchModalState
 */
function isSearchModalState(obj: any): boolean {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.isOpen === "boolean" &&
    (obj.query === undefined || typeof obj.query === "string") &&
    typeof obj.activeTab === "string"
  );
}

/**
 * Type guard for ThemeSettings
 */
export function isThemeSettings(obj: any): obj is ThemeSettings {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.current === "string" &&
    (obj.colors === undefined || typeof obj.colors === "object") &&
    (obj.preferences === undefined || typeof obj.preferences === "object")
  );
}

/**
 * Type guard for LayoutSettings
 */
export function isLayoutSettings(obj: any): obj is LayoutSettings {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.mode === "string" &&
    typeof obj.taskDensity === "string" &&
    typeof obj.projectDensity === "string" &&
    typeof obj.sidebarPosition === "string" &&
    typeof obj.contentLayout === "string" &&
    typeof obj.taskViewLayout === "string" &&
    typeof obj.showCompletedTasks === "boolean" &&
    typeof obj.showArchivedProjects === "boolean"
  );
}

/**
 * Type guard for NotificationState
 */
export function isNotificationState(obj: any): obj is NotificationState {
  return (
    obj &&
    typeof obj === "object" &&
    (obj.items === undefined || Array.isArray(obj.items)) &&
    (obj.preferences === undefined || typeof obj.preferences === "object")
  );
}

/**
 * Type guard for LoadingState
 */
export function isLoadingState(obj: any): obj is LoadingState {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.isLoading === "boolean" &&
    (obj.specific === undefined || typeof obj.specific === "object") &&
    (obj.messages === undefined || typeof obj.messages === "object")
  );
}

/**
 * Type guard for ErrorState
 */
export function isErrorState(obj: any): obj is ErrorState {
  return (
    obj &&
    typeof obj === "object" &&
    (obj.global === undefined || typeof obj.global === "string") &&
    (obj.specific === undefined || typeof obj.specific === "object") &&
    (obj.details === undefined || typeof obj.details === "object")
  );
}

/**
 * Type guard for SearchState
 */
export function isSearchState(obj: any): obj is SearchState {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.query === "string" &&
    (obj.results === undefined || typeof obj.results === "object") &&
    (obj.filters === undefined || typeof obj.filters === "object") &&
    (obj.history === undefined || Array.isArray(obj.history)) &&
    (obj.suggestions === undefined || Array.isArray(obj.suggestions))
  );
}

/**
 * Type guard for ContextMenuState
 */
export function isContextMenuState(obj: any): obj is ContextMenuState {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.isOpen === "boolean" &&
    (obj.position === undefined || typeof obj.position === "object") &&
    (obj.target === undefined || typeof obj.target === "object") &&
    (obj.items === undefined || Array.isArray(obj.items))
  );
}

/**
 * Type guard for DragDropState
 */
export function isDragDropState(obj: any): obj is DragDropState {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.isDragging === "boolean" &&
    (obj.draggedItem === undefined || typeof obj.draggedItem === "object") &&
    (obj.dropTarget === undefined || typeof obj.dropTarget === "object") &&
    typeof obj.isAllowed === "boolean" &&
    (obj.message === undefined || typeof obj.message === "string")
  );
}

/**
 * Type guard for KeyboardShortcutsState
 */
export function isKeyboardShortcutsState(
  obj: any,
): obj is KeyboardShortcutsState {
  return (
    obj &&
    typeof obj === "object" &&
    (obj.registered === undefined || typeof obj.registered === "object") &&
    (obj.active === undefined || typeof obj.active === "object") &&
    (obj.preferences === undefined || typeof obj.preferences === "object")
  );
}

/**
 * Data validation functions
 */
export class DataValidator {
  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  /**
   * Validate URL format
   */
  static validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate date format
   */
  static validateDate(date: any): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Validate priority level
   */
  static validatePriority(priority: any): priority is PriorityLevel {
    return ["P1", "P2", "P3", "P4"].includes(priority);
  }

  /**
   * Validate task status
   */
  static validateTaskStatus(status: any): status is TaskStatus {
    return [
      "active",
      "completed",
      "archived",
      "pending",
      "in-progress",
    ].includes(status);
  }

  /**
   * Validate view type
   */
  static validateViewType(viewType: any): viewType is ViewType {
    return ["list", "board", "calendar", "timeline"].includes(viewType);
  }

  /**
   * Validate recurring pattern
   */
  static validateRecurringPattern(pattern: any): pattern is RecurringPattern {
    return ["daily", "weekly", "monthly", "yearly", "custom"].includes(pattern);
  }

  /**
   * Validate project color
   */
  static validateProjectColor(color: any): color is ProjectColor {
    const validColors = [
      "red",
      "orange",
      "yellow",
      "green",
      "teal",
      "blue",
      "indigo",
      "purple",
      "pink",
      "gray",
    ];
    return validColors.includes(color);
  }

  /**
   * Validate label color
   */
  static validateLabelColor(color: any): color is LabelColor {
    const validColors = [
      "red-500",
      "orange-500",
      "yellow-500",
      "green-500",
      "teal-500",
      "blue-500",
      "indigo-500",
      "purple-500",
      "pink-500",
      "gray-500",
    ];
    return validColors.includes(color);
  }

  /**
   * Validate user role
   */
  static validateUserRole(role: any): role is UserRole {
    return ["user", "admin", "superadmin"].includes(role);
  }

  /**
   * Validate auth provider
   */
  static validateAuthProvider(provider: any): provider is AuthProvider {
    return ["email", "google", "github", "apple", "microsoft"].includes(
      provider,
    );
  }

  /**
   * Validate user status
   */
  static validateUserStatus(status: any): status is UserStatus {
    return ["active", "inactive", "suspended", "deleted"].includes(status);
  }

  /**
   * Validate project visibility
   */
  static validateProjectVisibility(
    visibility: any,
  ): visibility is ProjectVisibility {
    return ["private", "team", "public"].includes(visibility);
  }
}

/**
 * Type assertion functions
 */
export class TypeAssertions {
  /**
   * Assert that value is a User
   */
  static assertUser(value: any): asserts value is User {
    if (!isUser(value)) {
      throw new Error("Value is not a valid User");
    }
  }

  /**
   * Assert that value is a Project
   */
  static assertProject(value: any): asserts value is Project {
    if (!isProject(value)) {
      throw new Error("Value is not a valid Project");
    }
  }

  /**
   * Assert that value is a Task
   */
  static assertTask(value: any): asserts value is Task {
    if (!isTask(value)) {
      throw new Error("Value is not a valid Task");
    }
  }

  /**
   * Assert that value is a Label
   */
  static assertLabel(value: any): asserts value is Label {
    if (!isLabel(value)) {
      throw new Error("Value is not a valid Label");
    }
  }

  /**
   * Assert that value is a Filter
   */
  static assertFilter(value: any): asserts value is Filter {
    if (!isFilter(value)) {
      throw new Error("Value is not a valid Filter");
    }
  }

  /**
   * Assert that value is a Comment
   */
  static assertComment(value: any): asserts value is Comment {
    if (!isComment(value)) {
      throw new Error("Value is not a valid Comment");
    }
  }

  /**
   * Assert that value is an Attachment
   */
  static assertAttachment(value: any): asserts value is Attachment {
    if (!isAttachment(value)) {
      throw new Error("Value is not a valid Attachment");
    }
  }

  /**
   * Assert that value is a Section
   */
  static assertSection(value: any): asserts value is Section {
    if (!isSection(value)) {
      throw new Error("Value is not a valid Section");
    }
  }

  /**
   * Assert that value is an ApiResponse
   */
  static assertApiResponse<T>(value: any): asserts value is ApiResponse<T> {
    if (!isApiResponse(value)) {
      throw new Error("Value is not a valid ApiResponse");
    }
  }
}

/**
 * Data transformation functions
 */
export class DataTransformer {
  /**
   * Transform string to PriorityLevel
   */
  static stringToPriorityLevel(value: string): PriorityLevel {
    const priority = value.toUpperCase();
    if (["P1", "P2", "P3", "P4"].includes(priority)) {
      return priority as PriorityLevel;
    }
    return "P3";
  }

  /**
   * Transform string to TaskStatus
   */
  static stringToTaskStatus(value: string): TaskStatus {
    const status = value.toLowerCase();
    if (
      ["active", "completed", "archived", "pending", "in-progress"].includes(
        status,
      )
    ) {
      return status as TaskStatus;
    }
    return "active";
  }

  /**
   * Transform string to ViewType
   */
  static stringToViewType(value: string): ViewType {
    const viewType = value.toLowerCase();
    if (["list", "board", "calendar", "timeline"].includes(viewType)) {
      return viewType as ViewType;
    }
    return "list";
  }

  /**
   * Transform string to RecurringPattern
   */
  static stringToRecurringPattern(value: string): RecurringPattern {
    const pattern = value.toLowerCase();
    if (["daily", "weekly", "monthly", "yearly", "custom"].includes(pattern)) {
      return pattern as RecurringPattern;
    }
    return "daily";
  }

  /**
   * Transform string to ProjectColor
   */
  static stringToProjectColor(value: string): ProjectColor {
    const color = value.toLowerCase();
    const validColors = [
      "red",
      "orange",
      "yellow",
      "green",
      "teal",
      "blue",
      "indigo",
      "purple",
      "pink",
      "gray",
    ];
    if (validColors.includes(color)) {
      return color as ProjectColor;
    }
    return "blue";
  }

  /**
   * Transform string to LabelColor
   */
  static stringToLabelColor(value: string): LabelColor {
    const color = value.toLowerCase();
    const validColors = [
      "red-500",
      "orange-500",
      "yellow-500",
      "green-500",
      "teal-500",
      "blue-500",
      "indigo-500",
      "purple-500",
      "pink-500",
      "gray-500",
    ];
    if (validColors.includes(color)) {
      return color as LabelColor;
    }
    return "blue-500";
  }

  /**
   * Transform Date string to Date object
   */
  static stringToDate(value: string | Date | null | undefined): Date | null {
    if (!value) return null;
    if (value instanceof Date) return value;
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
  }

  /**
   * Transform any value to boolean
   */
  static toBoolean(value: any): boolean {
    if (typeof value === "boolean") return value;
    if (typeof value === "string") {
      return value.toLowerCase() === "true";
    }
    return !!value;
  }

  /**
   * Transform any value to number
   */
  static toNumber(value: any): number {
    if (typeof value === "number") return value;
    if (typeof value === "string") {
      const num = parseFloat(value);
      return isNaN(num) ? 0 : num;
    }
    return 0;
  }
}

/**
 * Schema validation functions
 */
export class SchemaValidator {
  /**
   * Validate user schema
   */
  static validateUserSchema(user: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!user || typeof user !== "object") {
      errors.push("User must be an object");
      return { valid: false, errors };
    }

    if (!user.id || typeof user.id !== "string") {
      errors.push("User ID must be a string");
    }

    if (
      !user.email ||
      typeof user.email !== "string" ||
      !DataValidator.validateEmail(user.email)
    ) {
      errors.push("User email must be a valid email address");
    }

    if (!user.name || typeof user.name !== "string" || user.name.length > 100) {
      errors.push("User name must be a string with maximum 100 characters");
    }

    if (
      user.avatar !== undefined &&
      typeof user.avatar !== "string" &&
      user.avatar !== null
    ) {
      errors.push("User avatar must be a string or null");
    }

    if (
      user.createdAt !== undefined &&
      !(user.createdAt instanceof Date) &&
      typeof user.createdAt !== "string"
    ) {
      errors.push("User createdAt must be a Date or string");
    }

    if (
      user.updatedAt !== undefined &&
      !(user.updatedAt instanceof Date) &&
      typeof user.updatedAt !== "string"
    ) {
      errors.push("User updatedAt must be a Date or string");
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate project schema
   */
  static validateProjectSchema(project: any): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!project || typeof project !== "object") {
      errors.push("Project must be an object");
      return { valid: false, errors };
    }

    if (!project.id || typeof project.id !== "string") {
      errors.push("Project ID must be a string");
    }

    if (
      !project.name ||
      typeof project.name !== "string" ||
      project.name.length > 100
    ) {
      errors.push("Project name must be a string with maximum 100 characters");
    }

    if (
      project.description !== undefined &&
      typeof project.description !== "string"
    ) {
      errors.push("Project description must be a string");
    }

    if (
      !project.color ||
      typeof project.color !== "string" ||
      !DataValidator.validateProjectColor(project.color)
    ) {
      errors.push("Project color must be a valid project color");
    }

    if (
      !project.viewType ||
      typeof project.viewType !== "string" ||
      !DataValidator.validateViewType(project.viewType)
    ) {
      errors.push("Project viewType must be a valid view type");
    }

    if (typeof project.favorite !== "boolean") {
      errors.push("Project favorite must be a boolean");
    }

    if (typeof project.shared !== "boolean") {
      errors.push("Project shared must be a boolean");
    }

    if (
      project.parentProjectId !== undefined &&
      typeof project.parentProjectId !== "string" &&
      project.parentProjectId !== null
    ) {
      errors.push("Project parentProjectId must be a string or null");
    }

    if (
      project.createdAt !== undefined &&
      !(project.createdAt instanceof Date) &&
      typeof project.createdAt !== "string"
    ) {
      errors.push("Project createdAt must be a Date or string");
    }

    if (
      project.updatedAt !== undefined &&
      !(project.updatedAt instanceof Date) &&
      typeof project.updatedAt !== "string"
    ) {
      errors.push("Project updatedAt must be a Date or string");
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Validate task schema
   */
  static validateTaskSchema(task: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!task || typeof task !== "object") {
      errors.push("Task must be an object");
      return { valid: false, errors };
    }

    if (!task.id || typeof task.id !== "string") {
      errors.push("Task ID must be a string");
    }

    if (
      !task.title ||
      typeof task.title !== "string" ||
      task.title.length > 200
    ) {
      errors.push("Task title must be a string with maximum 200 characters");
    }

    if (
      task.description !== undefined &&
      typeof task.description !== "string"
    ) {
      errors.push("Task description must be a string");
    }

    if (
      !task.status ||
      typeof task.status !== "string" ||
      !DataValidator.validateTaskStatus(task.status)
    ) {
      errors.push("Task status must be a valid task status");
    }

    if (
      !task.priority ||
      typeof task.priority !== "string" ||
      !DataValidator.validatePriority(task.priority)
    ) {
      errors.push("Task priority must be a valid priority level");
    }

    if (
      task.dueDate !== undefined &&
      task.dueDate !== null &&
      !(task.dueDate instanceof Date) &&
      typeof task.dueDate !== "string"
    ) {
      errors.push("Task dueDate must be a Date, string, or null");
    }

    if (
      task.dueTime !== undefined &&
      task.dueTime !== null &&
      typeof task.dueTime !== "string"
    ) {
      errors.push("Task dueTime must be a string or null");
    }

    if (
      task.duration !== undefined &&
      task.duration !== null &&
      typeof task.duration !== "number"
    ) {
      errors.push("Task duration must be a number or null");
    }

    if (
      task.recurringPattern !== undefined &&
      task.recurringPattern !== null &&
      typeof task.recurringPattern !== "string"
    ) {
      errors.push("Task recurringPattern must be a string or null");
    }

    if (
      task.parentTaskId !== undefined &&
      task.parentTaskId !== null &&
      typeof task.parentTaskId !== "string"
    ) {
      errors.push("Task parentTaskId must be a string or null");
    }

    if (typeof task.order !== "number") {
      errors.push("Task order must be a number");
    }

    if (typeof task.completed !== "boolean") {
      errors.push("Task completed must be a boolean");
    }

    if (
      task.completedAt !== undefined &&
      task.completedAt !== null &&
      !(task.completedAt instanceof Date) &&
      typeof task.completedAt !== "string"
    ) {
      errors.push("Task completedAt must be a Date, string, or null");
    }

    if (
      task.projectId !== undefined &&
      task.projectId !== null &&
      typeof task.projectId !== "string"
    ) {
      errors.push("Task projectId must be a string or null");
    }

    if (
      task.sectionId !== undefined &&
      task.sectionId !== null &&
      typeof task.sectionId !== "string"
    ) {
      errors.push("Task sectionId must be a string or null");
    }

    if (
      task.assigneeId !== undefined &&
      task.assigneeId !== null &&
      typeof task.assigneeId !== "string"
    ) {
      errors.push("Task assigneeId must be a string or null");
    }

    if (task.labelIds !== undefined && !Array.isArray(task.labelIds)) {
      errors.push("Task labelIds must be an array");
    }

    if (
      task.attachmentIds !== undefined &&
      !Array.isArray(task.attachmentIds)
    ) {
      errors.push("Task attachmentIds must be an array");
    }

    if (task.commentIds !== undefined && !Array.isArray(task.commentIds)) {
      errors.push("Task commentIds must be an array");
    }

    if (task.dependencies !== undefined && !Array.isArray(task.dependencies)) {
      errors.push("Task dependencies must be an array");
    }

    if (task.tags !== undefined && !Array.isArray(task.tags)) {
      errors.push("Task tags must be an array");
    }

    if (
      task.customFields !== undefined &&
      (typeof task.customFields !== "object" || task.customFields === null)
    ) {
      errors.push("Task customFields must be an object");
    }

    if (
      task.createdAt !== undefined &&
      !(task.createdAt instanceof Date) &&
      typeof task.createdAt !== "string"
    ) {
      errors.push("Task createdAt must be a Date or string");
    }

    if (
      task.updatedAt !== undefined &&
      !(task.updatedAt instanceof Date) &&
      typeof task.updatedAt !== "string"
    ) {
      errors.push("Task updatedAt must be a Date or string");
    }

    return { valid: errors.length === 0, errors };
  }
}
