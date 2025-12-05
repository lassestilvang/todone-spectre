export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  settings?: UserSettings;
}

export interface UserSettings {
  notificationsEnabled: boolean;
  emailFrequency: "daily" | "weekly" | "monthly" | "never";
  themePreference: "light" | "dark" | "system";
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  token: string | null;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "completed" | "archived";
  priority: "low" | "medium" | "high" | "critical";
  dueDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  projectId?: string;
  completed: boolean;
}

export interface TaskState {
  tasks: Task[];
  filteredTasks: Task[];
  currentFilter: {
    status?: Task["status"];
    priority?: Task["priority"];
    searchQuery?: string;
  };
  sortBy: "dueDate" | "priority" | "createdAt" | "updatedAt";
  sortDirection: "asc" | "desc";
  taskError: string | null;
  currentPage: number;
  selectedTaskIds: string[];

  // Drag and Drop methods
  reorderTask: (
    taskId: string,
    targetTaskId: string,
    position?: "before" | "after",
  ) => void;
  moveTask: (taskId: string, targetId: string) => void;
  moveTaskToProject: (taskId: string, projectId: string) => void;
  moveTaskToColumn: (taskId: string, columnId: string) => void;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
  taskIds: string[];
}

export interface ProjectState {
  projects: Project[];
  currentProjectId: string | null;
}

export interface UiState {
  isSidebarOpen: boolean;
  theme: "light" | "dark" | "system";
  currentView: "dashboard" | "tasks" | "projects" | "settings";
  isTaskModalOpen: boolean;
  isProjectModalOpen: boolean;
  isSettingsModalOpen: boolean;
  isSearchModalOpen: boolean;
  isCommandPaletteOpen: boolean;
  searchQuery: string;
  searchResults: SearchResult[];
  commandHistory: string[];

  // View layout configurations
  listViewConfig?: {
    sortBy: string;
    groupBy: string;
  };
  boardViewConfig?: {
    columns: string[];
    showTaskCount: boolean;
  };
  calendarViewConfig?: {
    viewMode: string;
    showWeekends: boolean;
  };
}

export interface Filter {
  id: string;
  name: string;
  criteria: Record<string, any>;
  color: string;
  favorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Label {
  id: string;
  name: string;
  color: string;
  isPersonal: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FilterState {
  filters: Filter[];
  currentFilterId: string | null;
  searchQuery: string;
  filterError: string | null;
}

export interface LabelState {
  labels: Label[];
  currentLabelId: string | null;
  labelError: string | null;
}

export interface Comment {
  id: string;
  taskId: string;
  user: string;
  content: string;
  attachments?: string[];
  timestamp: Date;
  likes?: number;
  dislikes?: number;
}

export interface CommentState {
  comments: Comment[];
  filteredComments: Comment[];
  currentFilter: {
    taskId?: string;
    userId?: string;
    searchQuery?: string;
  };
  sortBy: "timestamp" | "likes" | "dislikes";
  sortDirection: "asc" | "desc";
  commentError: string | null;
  selectedCommentIds: string[];
  notifications: CommentNotification[];
}

export interface CommentNotification {
  id: string;
  commentId: string;
  type: "mention" | "reply" | "like" | "dislike";
  userId: string;
  read: boolean;
  createdAt: Date;
}

export interface CalendarState {
  events: CalendarEventType[];
  calendars: CalendarType[];
  calendarConfig: CalendarConfig;
  calendarSyncState: CalendarSyncState;
  calendarIntegrationState: CalendarIntegrationState;
  loading: boolean;
  error: string | null;

  // Event operations
  addEvent: (
    eventData: Omit<CalendarEventType, "id">,
  ) => Promise<CalendarEventType>;
  updateEvent: (
    eventId: string,
    updates: Partial<CalendarEventType>,
  ) => Promise<CalendarEventType | null>;
  deleteEvent: (eventId: string) => Promise<boolean>;
  fetchEvents: () => Promise<CalendarEventType[]>;

  // Calendar operations
  addCalendar: (
    calendarData: Omit<CalendarType, "id">,
  ) => Promise<CalendarType>;
  fetchCalendars: () => Promise<CalendarType[]>;
  updateCalendarConfig: (updates: Partial<CalendarConfig>) => void;

  // Sync operations
  syncCalendars: (
    calendarIds: string[],
  ) => Promise<{ success: boolean; syncedEvents: CalendarEventType[] }>;
  getSyncStatus: () => {
    status: CalendarSyncStatus;
    lastSynced?: Date;
    error?: Error | null;
  };

  // Integration operations
  linkTaskToEvent: (taskId: string, eventId: string) => Promise<boolean>;
  initializeWithSampleData: () => void;
}

export interface TemplateState {
  templates: Template[];
  categories: TemplateCategory[];
  filteredTemplates: Template[];
  currentFilter: {
    categoryId?: string;
    searchQuery?: string;
    isPublic?: boolean;
  };
  sortBy: "name" | "createdAt" | "usageCount" | "rating";
  sortDirection: "asc" | "desc";
  templateError: string | null;
  selectedTemplateIds: string[];
  previewTemplate?: {
    templateId: string;
    content: string;
    variables: Record<string, string>;
  };
}

export interface CollaborationState {
  teams: CollaborationTeam[];
  members: CollaborationMember[];
  activities: CollaborationActivity[];
  settings: CollaborationSettings[];
  filteredTeams: CollaborationTeam[];
  currentFilter: {
    teamId?: string;
    memberId?: string;
    activityType?: CollaborationActivity["type"];
    searchQuery?: string;
  };
  sortBy: "name" | "createdAt" | "memberCount" | "activityCount";
  sortDirection: "asc" | "desc";
  collaborationError: string | null;
  selectedTeamIds: string[];
  selectedMemberIds: string[];
  selectedActivityIds: string[];

  // CRUD Operations
  addTeam: (teamData: Omit<CollaborationTeam, "id">) => void;
  updateTeam: (teamId: string, updates: Partial<CollaborationTeam>) => void;
  deleteTeam: (teamId: string) => void;

  addMember: (memberData: Omit<CollaborationMember, "id">) => void;
  updateMember: (
    memberId: string,
    updates: Partial<CollaborationMember>,
  ) => void;
  deleteMember: (memberId: string) => void;

  addActivity: (activityData: Omit<CollaborationActivity, "id">) => void;
  updateActivity: (
    activityId: string,
    updates: Partial<CollaborationActivity>,
  ) => void;
  deleteActivity: (activityId: string) => void;

  // Filtering and Sorting
  setFilter: (filter: CollaborationState["currentFilter"]) => void;
  setSort: (
    sortBy: CollaborationState["sortBy"],
    sortDirection: CollaborationState["sortDirection"],
  ) => void;
  applyFilters: () => void;

  // Settings operations
  updateSettings: (
    teamId: string,
    settings: Partial<CollaborationSettings>,
  ) => void;

  // Selection operations
  setSelectedTeamIds: (teamIds: string[]) => void;
  setSelectedMemberIds: (memberIds: string[]) => void;
  setSelectedActivityIds: (activityIds: string[]) => void;

  // Statistics and utilities
  getTeamStatistics: (teamId: string) => {
    memberCount: number;
    activityCount: number;
    adminCount: number;
  };
  getActivityStatistics: () => {
    total: number;
    byType: Record<string, number>;
    byUser: Record<string, number>;
  };

  // Initialization
  initializeWithSampleData: () => void;
}

export interface AIState {
  aiAssistantEnabled: boolean;
  aiSuggestions: string[];
  aiTaskBreakdowns: Record<
    string,
    {
      steps: string[];
      estimatedTime: string;
      dependencies: string[];
      resources: string[];
    }
  >;
  aiActionableItems: Record<
    string,
    {
      id: string;
      title: string;
      description: string;
      priority: "low" | "medium" | "high";
      estimatedTime: string;
    }[]
  >;
  aiLoading: boolean;
  aiError: string | null;
  aiResponseCache: Record<string, string>;
  aiUsageStatistics: {
    totalRequests: number;
    successfulRequests: number;
    lastRequestTime: Date | null;
  };

  // AI Assistant operations
  enableAIAssistant: () => void;
  disableAIAssistant: () => void;
  setAISuggestions: (taskId: string, suggestions: string[]) => void;
  setAITaskBreakdown: (
    taskId: string,
    breakdown: {
      steps: string[];
      estimatedTime: string;
      dependencies: string[];
      resources: string[];
    },
  ) => void;
  setAIActionableItems: (
    taskId: string,
    items: {
      id: string;
      title: string;
      description: string;
      priority: "low" | "medium" | "high";
      estimatedTime: string;
    }[],
  ) => void;
  setAILoading: (loading: boolean) => void;
  setAIError: (error: string | null) => void;
  cacheAIResponse: (prompt: string, response: string) => void;
  recordAIUsage: (success: boolean) => void;
  clearAICache: () => void;
  getAISuggestionsForTask: (taskId: string) => string[];
  getAITaskBreakdown: (taskId: string) => {
    steps: string[];
    estimatedTime: string;
    dependencies: string[];
    resources: string[];
  } | null;
  getAIActionableItems: (taskId: string) => {
    id: string;
    title: string;
    description: string;
    priority: "low" | "medium" | "high";
    estimatedTime: string;
  }[];
  getCachedAIResponse: (prompt: string) => string | null;
}

export interface AppState {
  auth: AuthState;
  tasks: TaskState;
  projects: ProjectState;
  ui: UiState;
  filters: FilterState;
  labels: LabelState;
  comments: CommentState;
  calendar: CalendarState;
  templates: TemplateState;
  collaboration: CollaborationState;
  ai: AIState;
}
