// @ts-nocheck
/**
 * UI-related types for Todone application
 * Contains comprehensive UI state and component interfaces
 */

import { ViewType } from "./enums";
import { User, Project, Task } from "./common";

/**
 * Main UI state interface
 */
export interface UiState {
  /**
   * Sidebar visibility state
   */
  sidebar: SidebarState;

  /**
   * Modal states
   */
  modals: ModalState;

  /**
   * Current view type
   */
  currentView: ViewType;

  /**
   * View-specific filters
   */
  viewFilters: {
    inbox: {
      status: string;
      priority: string;
      searchQuery: string;
    };
    today: {
      priority: string;
      searchQuery: string;
    };
    upcoming: {
      priority: string;
      timeRange: string;
      searchQuery: string;
    };
  };

  /**
   * View-specific sorting
   */
  viewSorting: {
    inbox: {
      field: string;
      direction: "asc" | "desc";
    };
    today: {
      field: string;
      direction: "asc" | "desc";
    };
    upcoming: {
      field: string;
      direction: "asc" | "desc";
    };
  };

  /**
   * View-specific grouping
   */
  viewGrouping: {
    inbox: string;
    today: string;
    upcoming: string;
  };

  /**
   * View-specific pagination
   */
  viewPagination: {
    inbox: {
      page: number;
      pageSize: number;
    };
    today: {
      page: number;
      pageSize: number;
    };
    upcoming: {
      page: number;
      pageSize: number;
    };
  };

  /**
   * Theme settings
   */
  theme: ThemeSettings;

  /**
   * Layout settings
   */
  layout: LayoutSettings;

  /**
   * Notification state
   */
  notifications: NotificationState;

  /**
   * Loading indicators
   */
  loading: LoadingState;

  /**
   * Error state
   */
  errors: ErrorState;

  /**
   * Search state
   */
  search: SearchState;

  /**
   * Context menu state
   */
  contextMenu: ContextMenuState;

  /**
   * Drag and drop state
   */
  dragDrop: DragDropState;

  /**
   * Keyboard shortcuts state
   */
  keyboardShortcuts: KeyboardShortcutsState;
}

/**
 * Sidebar state interface
 */
export interface SidebarState {
  /**
   * Sidebar visibility
   */
  isOpen: boolean;

  /**
   * Sidebar width
   */
  width: number;

  /**
   * Active sidebar tab
   */
  activeTab: "projects" | "labels" | "filters" | "settings" | "activity";

  /**
   * Collapsed sections
   */
  collapsedSections: Record<string, boolean>;

  /**
   * Pinned projects
   */
  pinnedProjects: string[];

  /**
   * Recent projects
   */
  recentProjects: string[];
}

/**
 * Modal state interface
 */
export interface ModalState {
  /**
   * Task modal state
   */
  taskModal: {
    isOpen: boolean;
    taskId?: string;
    mode: "create" | "edit" | "view" | null;
  };

  /**
   * Project modal state
   */
  projectModal: {
    isOpen: boolean;
    projectId?: string;
    mode: "create" | "edit" | "view" | "settings" | null;
  };

  /**
   * User modal state
   */
  userModal: {
    isOpen: boolean;
    userId?: string;
    mode: "profile" | "settings" | "preferences" | null;
  };

  /**
   * Settings modal state
   */
  settingsModal: {
    isOpen: boolean;
    activeTab:
      | "general"
      | "account"
      | "appearance"
      | "notifications"
      | "advanced"
      | null;
  };

  /**
   * Confirmation modal state
   */
  confirmationModal: {
    isOpen: boolean;
    title?: string;
    message?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    confirmText?: string;
    cancelText?: string;
    type?: "info" | "warning" | "danger";
  };

  /**
   * Search modal state
   */
  searchModal: {
    isOpen: boolean;
    query?: string;
    activeTab: "tasks" | "projects" | "users" | "all";
  };
}

/**
 * Theme settings interface
 */
export interface ThemeSettings {
  /**
   * Current theme
   */
  current: "light" | "dark" | "system";

  /**
   * Custom theme colors
   */
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    error: string;
    warning: string;
    success: string;
    info: string;
  };

  /**
   * Theme preferences
   */
  preferences: {
    useSystemTheme: boolean;
    customColorsEnabled: boolean;
    reducedMotion: boolean;
    highContrast: boolean;
  };
}

/**
 * Layout settings interface
 */
export interface LayoutSettings {
  /**
   * Current layout mode
   */
  mode: "default" | "compact" | "cozy";

  /**
   * Task list density
   */
  taskDensity: "comfortable" | "compact" | "cozy";

  /**
   * Project list density
   */
  projectDensity: "comfortable" | "compact" | "cozy";

  /**
   * Sidebar position
   */
  sidebarPosition: "left" | "right";

  /**
   * Main content layout
   */
  contentLayout: "single" | "split" | "grid";

  /**
   * Task view layout
   */
  taskViewLayout: "list" | "board" | "calendar" | "timeline";

  /**
   * Show completed tasks
   */
  showCompletedTasks: boolean;

  /**
   * Show archived projects
   */
  showArchivedProjects: boolean;
}

/**
 * Notification state interface
 */
export interface NotificationState {
  /**
   * Active notifications
   */
  items: NotificationItem[];

  /**
   * Notification preferences
   */
  preferences: {
    showDesktopNotifications: boolean;
    showToastNotifications: boolean;
    notificationDuration: number;
    maxVisibleNotifications: number;
  };
}

/**
 * Individual notification item
 */
export interface NotificationItem {
  /**
   * Notification ID
   */
  id: string;

  /**
   * Notification type
   */
  type: "info" | "success" | "warning" | "error";

  /**
   * Notification title
   */
  title: string;

  /**
   * Notification message
   */
  message: string;

  /**
   * Notification timestamp
   */
  timestamp: Date;

  /**
   * Notification duration (ms)
   */
  duration?: number;

  /**
   * Notification action
   */
  action?: {
    label: string;
    onClick: () => void;
  };

  /**
   * Notification dismissible
   */
  dismissible: boolean;

  /**
   * Notification icon
   */
  icon?: string;
}

/**
 * Loading state interface
 */
export interface LoadingState {
  /**
   * Global loading state
   */
  isLoading: boolean;

  /**
   * Specific loading states
   */
  specific: {
    tasks: boolean;
    projects: boolean;
    user: boolean;
    auth: boolean;
    sync: boolean;
    search: boolean;
  };

  /**
   * Loading messages
   */
  messages: Record<string, string>;
}

/**
 * Error state interface
 */
export interface ErrorState {
  /**
   * Global error
   */
  global?: string;

  /**
   * Specific errors
   */
  specific: {
    tasks?: string;
    projects?: string;
    user?: string;
    auth?: string;
    sync?: string;
    network?: string;
  };

  /**
   * Error details
   */
  details: Record<string, any>;
}

/**
 * Search state interface
 */
export interface SearchState {
  /**
   * Current search query
   */
  query: string;

  /**
   * Search results
   */
  results: {
    tasks: Task[];
    projects: Project[];
    users: User[];
    all: Array<Task | Project | User>;
  };

  /**
   * Search filters
   */
  filters: {
    includeTasks: boolean;
    includeProjects: boolean;
    includeUsers: boolean;
    includeCompleted: boolean;
    includeArchived: boolean;
  };

  /**
   * Search history
   */
  history: string[];

  /**
   * Search suggestions
   */
  suggestions: string[];
}

/**
 * Context menu state interface
 */
export interface ContextMenuState {
  /**
   * Context menu visibility
   */
  isOpen: boolean;

  /**
   * Context menu position
   */
  position: {
    x: number;
    y: number;
  };

  /**
   * Context menu target
   */
  target: {
    type: "task" | "project" | "user" | "label" | "section" | "empty";
    id?: string;
    data?: any;
  };

  /**
   * Context menu items
   */
  items: ContextMenuItem[];
}

/**
 * Context menu item interface
 */
export interface ContextMenuItem {
  /**
   * Item ID
   */
  id: string;

  /**
   * Item label
   */
  label: string;

  /**
   * Item icon
   */
  icon?: string;

  /**
   * Item action
   */
  action: () => void;

  /**
   * Item disabled state
   */
  disabled: boolean;

  /**
   * Item type
   */
  type: "action" | "divider" | "submenu";

  /**
   * Submenu items (if type is submenu)
   */
  submenuItems?: ContextMenuItem[];

  /**
   * Item shortcut
   */
  shortcut?: string;
}

/**
 * Drag and drop state interface
 */
export interface DragDropState {
  /**
   * Drag operation in progress
   */
  isDragging: boolean;

  /**
   * Dragged item
   */
  draggedItem: {
    type: "task" | "project" | "section" | "label" | null;
    id?: string;
    data?: any;
  };

  /**
   * Drop target
   */
  dropTarget: {
    type: "task" | "project" | "section" | "label" | "area" | null;
    id?: string;
    position?: "before" | "after" | "inside";
  };

  /**
   * Drag operation allowed
   */
  isAllowed: boolean;

  /**
   * Drag operation message
   */
  message?: string;
}

/**
 * Keyboard shortcuts state interface
 */
export interface KeyboardShortcutsState {
  /**
   * Registered shortcuts
   */
  registered: Record<string, KeyboardShortcut>;

  /**
   * Active shortcuts
   */
  active: Record<string, boolean>;

  /**
   * Shortcut preferences
   */
  preferences: {
    enabled: boolean;
    showHints: boolean;
    conflictResolution: "override" | "ignore" | "warn";
  };
}

/**
 * Individual keyboard shortcut interface
 */
export interface KeyboardShortcut {
  /**
   * Shortcut ID
   */
  id: string;

  /**
   * Shortcut description
   */
  description: string;

  /**
   * Key combination
   */
  keys: string;

  /**
   * Shortcut action
   */
  action: () => void;

  /**
   * Shortcut category
   */
  category: "global" | "tasks" | "projects" | "navigation" | "modals";

  /**
   * Shortcut enabled state
   */
  enabled: boolean;

  /**
   * Shortcut conflict status
   */
  hasConflict: boolean;
}

/**
 * Task view state interface
 */
export interface TaskViewState {
  /**
   * Current task view mode
   */
  mode: "list" | "board" | "calendar" | "timeline" | "gantt";

  /**
   * Task grouping
   */
  grouping: {
    field:
      | "project"
      | "status"
      | "priority"
      | "dueDate"
      | "assignee"
      | "label"
      | "none";
    direction: "asc" | "desc";
  };

  /**
   * Task filtering
   */
  filtering: {
    status: string[];
    priority: string[];
    project: string[];
    assignee: string[];
    label: string[];
    dueDate: Date | null;
  };

  /**
   * Task sorting
   */
  sorting: {
    field:
      | "title"
      | "priority"
      | "dueDate"
      | "createdAt"
      | "updatedAt"
      | "status";
    direction: "asc" | "desc";
  };

  /**
   * Task display options
   */
  display: {
    showCompleted: boolean;
    showArchived: boolean;
    showSubtasks: boolean;
    showDependencies: boolean;
    compactView: boolean;
  };
}

/**
 * Project view state interface
 */
export interface ProjectViewState {
  /**
   * Current project view mode
   */
  mode: "list" | "board" | "calendar" | "timeline" | "gantt";

  /**
   * Project grouping
   */
  grouping: {
    field: "status" | "priority" | "assignee" | "label" | "dueDate" | "none";
    direction: "asc" | "desc";
  };

  /**
   * Project filtering
   */
  filtering: {
    status: string[];
    priority: string[];
    assignee: string[];
    label: string[];
    dueDate: Date | null;
  };

  /**
   * Project sorting
   */
  sorting: {
    field: "name" | "createdAt" | "updatedAt" | "taskCount" | "completion";
    direction: "asc" | "desc";
  };

  /**
   * Project display options
   */
  display: {
    showCompletedTasks: boolean;
    showArchived: boolean;
    showSubprojects: boolean;
    compactView: boolean;
  };
}

/**
 * UI component props interfaces
 */
export interface TaskCardProps {
  /**
   * Task data
   */
  task: Task;

  /**
   * Selected state
   */
  selected?: boolean;

  /**
   * Draggable state
   */
  draggable?: boolean;

  /**
   * On task click handler
   */
  onClick?: (task: Task) => void;

  /**
   * On task select handler
   */
  onSelect?: (task: Task, selected: boolean) => void;

  /**
   * On task drag start handler
   */
  onDragStart?: (task: Task) => void;

  /**
   * On task drop handler
   */
  onDrop?: (task: Task, target: any) => void;
}

export interface ProjectCardProps {
  /**
   * Project data
   */
  project: Project;

  /**
   * Selected state
   */
  selected?: boolean;

  /**
   * On project click handler
   */
  onClick?: (project: Project) => void;

  /**
   * On project select handler
   */
  onSelect?: (project: Project, selected: boolean) => void;
}

export interface UserAvatarProps {
  /**
   * User data
   */
  user: User;

  /**
   * Size of avatar
   */
  size?: "small" | "medium" | "large";

  /**
   * Show online status
   */
  showStatus?: boolean;

  /**
   * On click handler
   */
  onClick?: (user: User) => void;
}

/**
 * UI event handlers interface
 */
export interface UiEventHandlers {
  /**
   * Task event handlers
   */
  onTaskCreate?: (task: Task) => void;
  onTaskUpdate?: (task: Task) => void;
  onTaskDelete?: (taskId: string) => void;
  onTaskComplete?: (taskId: string) => void;
  onTaskReopen?: (taskId: string) => void;

  /**
   * Project event handlers
   */
  onProjectCreate?: (project: Project) => void;
  onProjectUpdate?: (project: Project) => void;
  onProjectDelete?: (projectId: string) => void;

  /**
   * UI event handlers
   */
  onThemeChange?: (theme: ThemeSettings) => void;
  onLayoutChange?: (layout: LayoutSettings) => void;
  onViewChange?: (view: ViewType) => void;

  /**
   * Navigation handlers
   */
  onNavigate?: (path: string) => void;
  onGoBack?: () => void;
  onGoForward?: () => void;
}

/**
 * UI component state interface
 */
export interface UiComponentState {
  /**
   * Task components state
   */
  tasks: {
    selectedTaskIds: string[];
    expandedTaskIds: string[];
    editedTaskIds: string[];
  };

  /**
   * Project components state
   */
  projects: {
    selectedProjectIds: string[];
    expandedProjectIds: string[];
    editedProjectIds: string[];
  };

  /**
   * User components state
   */
  users: {
    selectedUserIds: string[];
    onlineUserIds: string[];
  };

  /**
   * Form state
   */
  forms: {
    taskForm: {
      isValid: boolean;
      errors: Record<string, string>;
    };
    projectForm: {
      isValid: boolean;
      errors: Record<string, string>;
    };
    userForm: {
      isValid: boolean;
      errors: Record<string, string>;
    };
  };
}
