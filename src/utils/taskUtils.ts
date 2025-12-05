import { Task, TaskStatus, PriorityLevel } from "../types/task";

/**
 * Task validation functions
 */

/**
 * Validate task title
 */
export const validateTaskTitle = (
  title: string,
): { valid: boolean; message?: string } => {
  if (!title || title.trim().length === 0) {
    return { valid: false, message: "Task title is required" };
  }

  if (title.length > 255) {
    return { valid: false, message: "Task title cannot exceed 255 characters" };
  }

  return { valid: true };
};

/**
 * Validate task description
 */
export const validateTaskDescription = (
  description?: string,
): { valid: boolean; message?: string } => {
  if (description && description.length > 5000) {
    return {
      valid: false,
      message: "Task description cannot exceed 5000 characters",
    };
  }

  return { valid: true };
};

/**
 * Validate task priority
 */
export const validateTaskPriority = (
  priority: PriorityLevel,
): { valid: boolean; message?: string } => {
  const validPriorities: PriorityLevel[] = [
    "low",
    "medium",
    "high",
    "critical",
  ];
  if (!validPriorities.includes(priority)) {
    return { valid: false, message: "Invalid priority level" };
  }

  return { valid: true };
};

/**
 * Validate task status
 */
export const validateTaskStatus = (
  status: TaskStatus,
): { valid: boolean; message?: string } => {
  const validStatuses: TaskStatus[] = [
    "todo",
    "in-progress",
    "completed",
    "archived",
  ];
  if (!validStatuses.includes(status)) {
    return { valid: false, message: "Invalid task status" };
  }

  return { valid: true };
};

/**
 * Validate complete task data
 */
export const validateTask = (
  task: Partial<Task>,
): { valid: boolean; message?: string } => {
  const titleValidation = validateTaskTitle(task.title || "");
  if (!titleValidation.valid) return titleValidation;

  const descriptionValidation = validateTaskDescription(task.description);
  if (!descriptionValidation.valid) return descriptionValidation;

  if (task.priority) {
    const priorityValidation = validateTaskPriority(task.priority);
    if (!priorityValidation.valid) return priorityValidation;
  }

  if (task.status) {
    const statusValidation = validateTaskStatus(task.status);
    if (!statusValidation.valid) return statusValidation;
  }

  return { valid: true };
};

/**
 * Task transformation utilities
 */

/**
 * Transform API task data to client task format
 */
export const transformApiTask = (apiTask: any): Task => {
  return {
    id: apiTask.id,
    title: apiTask.title,
    description: apiTask.description || "",
    status: apiTask.status || "todo",
    priority: apiTask.priority || "medium",
    dueDate: apiTask.dueDate ? new Date(apiTask.dueDate) : null,
    createdAt: new Date(apiTask.createdAt),
    updatedAt: new Date(apiTask.updatedAt),
    completedAt: apiTask.completedAt ? new Date(apiTask.completedAt) : null,
    completed: apiTask.completed || false,
    projectId: apiTask.projectId,
    order: apiTask.order || 0,
  };
};

/**
 * Transform client task data to API format
 */
export const transformTaskToApi = (task: Partial<Task>): any => {
  const { id, createdAt, updatedAt, completedAt, ...rest } = task;

  return {
    ...rest,
    dueDate: task.dueDate?.toISOString(),
    createdAt: task.createdAt?.toISOString(),
    updatedAt: task.updatedAt?.toISOString(),
    completedAt: task.completedAt?.toISOString(),
  };
};

/**
 * Create default task object
 */
export const createDefaultTask = (
  overrides: Partial<Task> = {},
): Omit<Task, "id" | "createdAt" | "updatedAt" | "completed"> => {
  return {
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    dueDate: null,
    projectId: undefined,
    order: 0,
    ...overrides,
  };
};

/**
 * Task comparison functions
 */

/**
 * Compare tasks by priority
 */
export const compareTasksByPriority = (a: Task, b: Task): number => {
  const priorityOrder: Record<PriorityLevel, number> = {
    critical: 1,
    high: 2,
    medium: 3,
    low: 4,
  };

  return (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0);
};

/**
 * Compare tasks by due date
 */
export const compareTasksByDueDate = (a: Task, b: Task): number => {
  const aDate = a.dueDate?.getTime() || 0;
  const bDate = b.dueDate?.getTime() || 0;
  return aDate - bDate;
};

/**
 * Compare tasks by creation date
 */
export const compareTasksByCreationDate = (a: Task, b: Task): number => {
  return a.createdAt.getTime() - b.createdAt.getTime();
};

/**
 * Task status management
 */

/**
 * Get next status in workflow
 */
export const getNextStatus = (currentStatus: TaskStatus): TaskStatus => {
  const statusWorkflow: Record<TaskStatus, TaskStatus> = {
    todo: "in-progress",
    "in-progress": "completed",
    completed: "archived",
    archived: "archived", // No further progression
  };

  return statusWorkflow[currentStatus] || currentStatus;
};

/**
 * Get previous status in workflow
 */
export const getPreviousStatus = (currentStatus: TaskStatus): TaskStatus => {
  const statusWorkflow: Record<TaskStatus, TaskStatus> = {
    todo: "todo", // No previous status
    "in-progress": "todo",
    completed: "in-progress",
    archived: "completed",
  };

  return statusWorkflow[currentStatus] || currentStatus;
};

/**
 * Check if task is overdue
 */
export const isTaskOverdue = (task: Task): boolean => {
  if (!task.dueDate || task.completed) {
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(task.dueDate);
  dueDate.setHours(0, 0, 0, 0);

  return dueDate < today;
};

/**
 * Get task priority color
 */
export const getPriorityColor = (priority: PriorityLevel): string => {
  const priorityColors: Record<PriorityLevel, string> = {
    low: "text-green-600 bg-green-100",
    medium: "text-blue-600 bg-blue-100",
    high: "text-yellow-600 bg-yellow-100",
    critical: "text-red-600 bg-red-100",
  };

  return priorityColors[priority] || "text-gray-600 bg-gray-100";
};

/**
 * Get task status color
 */
export const getStatusColor = (status: TaskStatus): string => {
  const statusColors: Record<TaskStatus, string> = {
    todo: "text-gray-600 bg-gray-100",
    "in-progress": "text-blue-600 bg-blue-100",
    completed: "text-green-600 bg-green-100",
    archived: "text-purple-600 bg-purple-100",
  };

  return statusColors[status] || "text-gray-600 bg-gray-100";
};

/**
 * Filter tasks by search query
 */
export const filterTasksBySearch = (tasks: Task[], query: string): Task[] => {
  if (!query) return tasks;

  const lowerQuery = query.toLowerCase();
  return tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(lowerQuery) ||
      (task.description && task.description.toLowerCase().includes(lowerQuery)),
  );
};

/**
 * Sort tasks by field and direction
 */
export const sortTasks = (
  tasks: Task[],
  sortBy: "priority" | "dueDate" | "createdAt" = "priority",
  direction: "asc" | "desc" = "asc",
): Task[] => {
  const sortedTasks = [...tasks];

  switch (sortBy) {
    case "priority":
      sortedTasks.sort(
        (a, b) => compareTasksByPriority(a, b) * (direction === "asc" ? 1 : -1),
      );
      break;
    case "dueDate":
      sortedTasks.sort(
        (a, b) => compareTasksByDueDate(a, b) * (direction === "asc" ? 1 : -1),
      );
      break;
    case "createdAt":
      sortedTasks.sort(
        (a, b) =>
          compareTasksByCreationDate(a, b) * (direction === "asc" ? 1 : -1),
      );
      break;
  }

  return sortedTasks;
};
