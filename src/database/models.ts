
export interface User {
  id?: number;
  email: string;
  name: string;
  avatar?: string;
  settings?: {
    theme: string;
    notifications: boolean;
    language: string;
  };
  preferences?: {
    defaultView: string;
    taskSorting: string;
  };
  karmaStats?: {
    completedTasks: number;
    streakDays: number;
    totalPoints: number;
    level: number;
  };
}

export interface Project {
  id?: number;
  name: string;
  color: string;
  viewType: "list" | "board" | "calendar" | "timeline";
  favorite: boolean;
  shared: boolean;
  parentProjectId?: number;
}

export interface Section {
  id?: number;
  name: string;
  projectId: number;
  order: number;
}

export interface Task {
  id?: number;
  content: string;
  description?: string;
  projectId?: number;
  sectionId?: number;
  priority: "low" | "medium" | "high" | "urgent";
  labels?: string[];
  dueDate?: Date;
  dueTime?: string;
  duration?: number;
  recurringPattern?: string;
  assignee?: string;
  parentTaskId?: number;
  order: number;
  completed: boolean;
  createdDate: Date;
}

export interface Label {
  id?: number;
  name: string;
  color: string;
  isPersonal: boolean;
}

export interface Filter {
  id?: number;
  name: string;
  query: string;
  color: string;
  favorite: boolean;
}

export interface Comment {
  id?: number;
  taskId: number;
  user: string;
  content: string;
  attachments?: string[];
  timestamp: Date;
}

export interface Attachment {
  id?: number;
  fileName: string;
  url: string;
  type: string;
}

export interface SyncQueueItem {
  id?: number;
  operation: "create" | "update" | "delete";
  table: string;
  recordId: number;
  data?: any;
  timestamp: Date;
  status: "pending" | "completed" | "failed";
  attempts: number;
}

export interface SyncStatus {
  lastSync: Date;
  isSyncing: boolean;
  pendingOperations: number;
  lastError?: string;
}
