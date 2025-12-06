import { Task, TaskStatus } from "../types/task";

/**
 * View utilities for Todone application
 * Shared utilities for view components
 */

/**
 * Group tasks by status
 */
export const groupTasksByStatus = (
  tasks: Task[],
): Record<TaskStatus, Task[]> => {
  const grouped: Record<TaskStatus, Task[]> = {
    todo: [],
    "in-progress": [],
    completed: [],
    archived: [],
  };

  tasks.forEach((task) => {
    grouped[task.status].push(task);
  });

  return grouped;
};

/**
 * Group tasks by project
 */
export const groupTasksByProject = (tasks: Task[]): Record<string, Task[]> => {
  const grouped: Record<string, Task[]> = {};

  tasks.forEach((task) => {
    const projectId = task.projectId || "no-project";
    if (!grouped[projectId]) {
      grouped[projectId] = [];
    }
    grouped[projectId].push(task);
  });

  return grouped;
};

/**
 * Group tasks by due date period
 */
export const groupTasksByDatePeriod = (
  tasks: Task[],
): {
  overdue: Task[];
  today: Task[];
  nextWeek: Task[];
  future: Task[];
} => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdue: Task[] = [];
  const todayTasks: Task[] = [];
  const nextWeek: Task[] = [];
  const future: Task[] = [];

  const oneWeekLater = new Date(today);
  oneWeekLater.setDate(today.getDate() + 7);

  tasks.forEach((task) => {
    if (!task.dueDate) {
      future.push(task);
      return;
    }

    const taskDueDate = new Date(task.dueDate);
    taskDueDate.setHours(0, 0, 0, 0);

    if (taskDueDate < today) {
      overdue.push(task);
    } else if (taskDueDate <= oneWeekLater) {
      todayTasks.push(task);
    } else {
      future.push(task);
    }
  });

  return { overdue, today: todayTasks, nextWeek, future };
};

/**
 * Sort tasks for view display
 */
export const sortViewTasks = (
  tasks: Task[],
  sortBy: "priority" | "dueDate" | "createdAt" = "priority",
  sortDirection: "asc" | "desc" = "asc",
): Task[] => {
  const priorityOrder: Record<string, number> = {
    critical: 1,
    high: 2,
    medium: 3,
    low: 4,
  };

  return [...tasks].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "priority":
        comparison =
          (priorityOrder[a.priority] || 5) - (priorityOrder[b.priority] || 5);
        break;
      case "dueDate":
        comparison = (a.dueDate?.getTime() || 0) - (b.dueDate?.getTime() || 0);
        break;
      case "createdAt":
        comparison = a.createdAt.getTime() - b.createdAt.getTime();
        break;
    }

    return sortDirection === "asc" ? comparison : -comparison;
  });
};

/**
 * Filter tasks for view display
 */
export const filterViewTasks = (
  tasks: Task[],
  filters: {
    status?: TaskStatus | "all";
    priority?: string | "all";
    searchQuery?: string;
    completed?: boolean | "all";
  } = {},
): Task[] => {
  let result = [...tasks];

  // Filter by status
  if (filters.status && filters.status !== "all") {
    result = result.filter((task) => task.status === filters.status);
  }

  // Filter by priority
  if (filters.priority && filters.priority !== "all") {
    result = result.filter((task) => task.priority === filters.priority);
  }

  // Filter by completion status
  if (filters.completed !== "all" && filters.completed !== undefined) {
    result = result.filter((task) => task.completed === filters.completed);
  }

  // Filter by search query
  if (filters.searchQuery) {
    const query = filters.searchQuery.toLowerCase();
    result = result.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query)),
    );
  }

  return result;
};

/**
 * Get view statistics
 */
export const getViewStatistics = (
  tasks: Task[],
): {
  total: number;
  completed: number;
  active: number;
  overdue: number;
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<string, number>;
} => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const statistics = {
    total: tasks.length,
    completed: 0,
    active: 0,
    overdue: 0,
    byStatus: {
      todo: 0,
      "in-progress": 0,
      completed: 0,
      archived: 0,
    },
    byPriority: {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    },
  };

  tasks.forEach((task) => {
    // Count by status
    statistics.byStatus[task.status]++;

    // Count by priority
    statistics.byPriority[task.priority]++;

    // Count completion status
    if (task.completed) {
      statistics.completed++;
    } else {
      statistics.active++;
    }

    // Check for overdue tasks
    if (task.dueDate && !task.completed) {
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      if (dueDate < today) {
        statistics.overdue++;
      }
    }
  });

  return statistics;
};

/**
 * Get task urgency score (0-100)
 */
export const getTaskUrgencyScore = (task: Task): number => {
  if (!task.dueDate) return 0;

  const today = new Date();
  const dueDate = new Date(task.dueDate);
  const timeDiff = dueDate.getTime() - today.getTime();
  const daysUntilDue = timeDiff / (1000 * 60 * 60 * 24);

  // Priority weights
  const priorityWeights: Record<string, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1,
  };

  // Calculate urgency score (0-100)
  const priorityWeight = priorityWeights[task.priority] || 1;
  const timeFactor = daysUntilDue > 0 ? Math.min(1 / (daysUntilDue + 1), 1) : 2; // Overdue tasks get higher score

  const urgencyScore = Math.min(priorityWeight * timeFactor * 25, 100);

  return Math.round(urgencyScore);
};

/**
 * Format task count for display
 */
export const formatTaskCount = (
  count: number,
  singular: string,
  plural: string,
): string => {
  return count === 1 ? `${count} ${singular}` : `${count} ${plural}`;
};

/**
 * Get empty state message for view
 */
export const getEmptyStateMessage = (
  viewType: "inbox" | "today" | "upcoming",
): {
  title: string;
  description: string;
  cta?: string;
} => {
  switch (viewType) {
    case "inbox":
      return {
        title: "No tasks in your inbox",
        description: "Start by creating a new task",
        cta: "Create Task",
      };
    case "today":
      return {
        title: "No tasks due today",
        description: "Great job! You're all caught up.",
        cta: "View Upcoming Tasks",
      };
    case "upcoming":
      return {
        title: "No upcoming tasks",
        description: "Plan ahead by scheduling future tasks",
        cta: "Create Upcoming Task",
      };
    default:
      return {
        title: "No tasks found",
        description: "Try adjusting your filters",
        cta: "Reset Filters",
      };
  }
};
