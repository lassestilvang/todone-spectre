import { Task } from '../types/task';

/**
 * Sub-task utility functions
 */

/**
 * Filter sub-tasks by completion status
 */
export const filterSubTasksByCompletion = (subTasks: Task[], completed: boolean): Task[] => {
  return subTasks.filter(subTask => subTask.completed === completed);
};

/**
 * Sort sub-tasks by priority, due date, or creation date
 */
export const sortSubTasks = (
  subTasks: Task[],
  sortBy: 'priority' | 'dueDate' | 'createdAt' = 'priority',
  sortDirection: 'asc' | 'desc' = 'asc'
): Task[] => {
  const priorityOrder: Record<Task['priority'], number> = {
    'critical': 1,
    'high': 2,
    'medium': 3,
    'low': 4
  };

  return [...subTasks].sort((a, b) => {
    switch (sortBy) {
      case 'priority':
        return (priorityOrder[a.priority] - priorityOrder[b.priority]) * (sortDirection === 'asc' ? 1 : -1);
      case 'dueDate':
        return ((a.dueDate?.getTime() || 0) - (b.dueDate?.getTime() || 0)) * (sortDirection === 'asc' ? 1 : -1);
      case 'createdAt':
        return (a.createdAt.getTime() - b.createdAt.getTime()) * (sortDirection === 'asc' ? 1 : -1);
      default:
        return 0;
    }
  });
};

/**
 * Calculate sub-task completion percentage
 */
export const calculateSubTaskCompletion = (subTasks: Task[]): number => {
  if (subTasks.length === 0) return 0;

  const completedCount = subTasks.filter(subTask => subTask.completed).length;
  return Math.round((completedCount / subTasks.length) * 100);
};

/**
 * Find sub-task by ID in a hierarchy
 */
export const findSubTaskInHierarchy = (taskId: string, hierarchy: Task[]): Task | undefined => {
  // Check if the task is in the current level
  const found = hierarchy.find(task => task.id === taskId);
  if (found) return found;

  // Recursively search in children
  for (const task of hierarchy) {
    if (task.children && task.children.length > 0) {
      const result = findSubTaskInHierarchy(taskId, task.children);
      if (result) return result;
    }
  }

  return undefined;
};

/**
 * Flatten task hierarchy
 */
export const flattenTaskHierarchy = (hierarchy: Task[]): Task[] => {
  const flatTasks: Task[] = [];

  const flatten = (tasks: Task[]) => {
    tasks.forEach(task => {
      flatTasks.push(task);
      if (task.children && task.children.length > 0) {
        flatten(task.children);
      }
    });
  };

  flatten(hierarchy);
  return flatTasks;
};

/**
 * Build task hierarchy tree from flat list
 */
export const buildTaskHierarchy = (tasks: Task[], rootTaskId: string): Task[] => {
  const taskMap = new Map<string, Task>();
  const hierarchy: Task[] = [];

  // Create a map of all tasks
  tasks.forEach(task => {
    taskMap.set(task.id, { ...task, children: [] });
  });

  // Build the hierarchy
  tasks.forEach(task => {
    if (task.parentTaskId) {
      const parent = taskMap.get(task.parentTaskId);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(taskMap.get(task.id)!);
      }
    }
  });

  // Find root tasks (tasks with the specified rootTaskId or no parent)
  const rootTask = taskMap.get(rootTaskId);
  if (rootTask) {
    return [rootTask];
  }

  return [];
};

/**
 * Get all parent task IDs for a sub-task
 */
export const getParentTaskIds = (taskId: string, tasks: Task[]): string[] => {
  const parentIds: string[] = [];
  let currentTaskId = taskId;

  while (currentTaskId) {
    const task = tasks.find(t => t.id === currentTaskId);
    if (!task || !task.parentTaskId) break;

    parentIds.push(task.parentTaskId);
    currentTaskId = task.parentTaskId;
  }

  return parentIds;
};

/**
 * Check if a task is a descendant of another task
 */
export const isDescendantTask = (taskId: string, potentialAncestorId: string, tasks: Task[]): boolean => {
  let currentTaskId = taskId;

  while (currentTaskId) {
    const task = tasks.find(t => t.id === currentTaskId);
    if (!task) break;

    if (task.id === potentialAncestorId) {
      return true;
    }

    currentTaskId = task.parentTaskId || '';
  }

  return false;
};

/**
 * Validate sub-task data
 */
export const validateSubTaskData = (subTaskData: Partial<Task>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!subTaskData.title || subTaskData.title?.trim().length === 0) {
    errors.push('Title is required');
  }

  if (subTaskData.title && subTaskData.title.length > 255) {
    errors.push('Title cannot exceed 255 characters');
  }

  if (subTaskData.description && subTaskData.description.length > 5000) {
    errors.push('Description cannot exceed 5000 characters');
  }

  if (subTaskData.priority && !['low', 'medium', 'high', 'critical'].includes(subTaskData.priority)) {
    errors.push('Invalid priority level');
  }

  if (subTaskData.status && !['todo', 'in-progress', 'completed', 'archived'].includes(subTaskData.status)) {
    errors.push('Invalid status');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Generate sub-task from template
 */
export const generateSubTaskFromTemplate = (template: Partial<Task>, overrides: Partial<Task> = {}): Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed'> => {
  return {
    title: overrides.title || template.title || 'New Sub-Task',
    description: overrides.description || template.description || '',
    status: (overrides.status || template.status || 'todo') as Task['status'],
    priority: (overrides.priority || template.priority || 'medium') as Task['priority'],
    dueDate: overrides.dueDate || template.dueDate || null,
    parentTaskId: overrides.parentTaskId || template.parentTaskId,
    projectId: overrides.projectId || template.projectId,
    order: overrides.order || template.order || 0
  };
};