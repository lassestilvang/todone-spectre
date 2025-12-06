// @ts-nocheck
import { Task } from "../types/task";

/**
 * Task hierarchy utility functions
 */

/**
 * Build a complete task hierarchy tree from a flat list of tasks
 */
export const buildCompleteTaskHierarchy = (tasks: Task[]): Task[] => {
  const taskMap = new Map<string, Task & { children?: Task[] }>();
  const rootTasks: Task[] = [];

  // Create a map of all tasks and initialize children arrays
  tasks.forEach((task) => {
    taskMap.set(task.id, { ...task, children: [] });
  });

  // Build parent-child relationships
  tasks.forEach((task) => {
    if (task.parentTaskId) {
      const parent = taskMap.get(task.parentTaskId);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(taskMap.get(task.id)!);
      }
    }
  });

  // Find root tasks (tasks with no parent or parent not in the list)
  tasks.forEach((task) => {
    if (!task.parentTaskId || !taskMap.has(task.parentTaskId)) {
      rootTasks.push(taskMap.get(task.id)!);
    }
  });

  return rootTasks;
};

/**
 * Calculate completion percentage for entire hierarchy
 */
export const calculateHierarchyCompletion = (hierarchy: Task[]): number => {
  const allTasks = flattenHierarchy(hierarchy);
  if (allTasks.length === 0) return 0;

  const completedTasks = allTasks.filter((task) => task.completed).length;
  return Math.round((completedTasks / allTasks.length) * 100);
};

/**
 * Flatten a task hierarchy
 */
export const flattenHierarchy = (hierarchy: Task[]): Task[] => {
  const flatTasks: Task[] = [];

  const traverse = (tasks: Task[]) => {
    tasks.forEach((task) => {
      flatTasks.push(task);
      if (task.children && task.children.length > 0) {
        traverse(task.children);
      }
    });
  };

  traverse(hierarchy);
  return flatTasks;
};

/**
 * Find all descendants of a task in hierarchy
 */
export const findAllDescendants = (
  taskId: string,
  hierarchy: Task[],
): Task[] => {
  const descendants: Task[] = [];

  const findDescendants = (tasks: Task[]) => {
    tasks.forEach((task) => {
      if (task.id === taskId) {
        if (task.children) {
          descendants.push(...task.children);
          findDescendants(task.children);
        }
      } else if (task.children) {
        findDescendants(task.children);
      }
    });
  };

  findDescendants(hierarchy);
  return descendants;
};

/**
 * Find task by ID in hierarchy
 */
export const findTaskInHierarchy = (
  taskId: string,
  hierarchy: Task[],
): Task | undefined => {
  // Check current level
  const found = hierarchy.find((task) => task.id === taskId);
  if (found) return found;

  // Check children recursively
  for (const task of hierarchy) {
    if (task.children) {
      const result = findTaskInHierarchy(taskId, task.children);
      if (result) return result;
    }
  }

  return undefined;
};

/**
 * Get task path from root to task
 */
export const getTaskPathInHierarchy = (
  taskId: string,
  hierarchy: Task[],
): Task[] | null => {
  // Find the task first
  const task = findTaskInHierarchy(taskId, hierarchy);
  if (!task) return null;

  // If task has no parent, it's a root task
  if (!task.parentTaskId) return [task];

  // Find the path by traversing from root
  const path: Task[] = [];

  const findPath = (currentHierarchy: Task[], targetId: string): boolean => {
    for (const currentTask of currentHierarchy) {
      path.push(currentTask);

      if (currentTask.id === targetId) {
        return true;
      }

      if (currentTask.children) {
        if (findPath(currentTask.children, targetId)) {
          return true;
        }
      }

      path.pop(); // Remove from path if not in this branch
    }

    return false;
  };

  findPath(hierarchy, taskId);
  return path;
};

/**
 * Sort hierarchy by various criteria
 */
export const sortHierarchy = (
  hierarchy: Task[],
  sortBy: "priority" | "dueDate" | "createdAt" | "title" = "priority",
  sortDirection: "asc" | "desc" = "asc",
): Task[] => {
  const priorityOrder: Record<Task["priority"], number> = {
    critical: 1,
    high: 2,
    medium: 3,
    low: 4,
  };

  // Sort the current level
  const sortedHierarchy = [...hierarchy].sort((a, b) => {
    switch (sortBy) {
      case "priority":
        return (
          (priorityOrder[a.priority] - priorityOrder[b.priority]) *
          (sortDirection === "asc" ? 1 : -1)
        );
      case "dueDate":
        return (
          ((a.dueDate?.getTime() || 0) - (b.dueDate?.getTime() || 0)) *
          (sortDirection === "asc" ? 1 : -1)
        );
      case "createdAt":
        return (
          (a.createdAt.getTime() - b.createdAt.getTime()) *
          (sortDirection === "asc" ? 1 : -1)
        );
      case "title":
        return (
          a.title.localeCompare(b.title) * (sortDirection === "asc" ? 1 : -1)
        );
      default:
        return 0;
    }
  });

  // Recursively sort children
  return sortedHierarchy.map((task) => ({
    ...task,
    children: task.children
      ? sortHierarchy(task.children, sortBy, sortDirection)
      : [],
  }));
};

/**
 * Filter hierarchy by various criteria
 */
export const filterHierarchy = (
  hierarchy: Task[],
  filterFn: (task: Task) => boolean,
): Task[] => {
  return hierarchy
    .map((task) => {
      const filteredChildren = task.children
        ? filterHierarchy(task.children, filterFn)
        : [];

      // Include task if it matches filter or has matching children
      if (filterFn(task) || filteredChildren.length > 0) {
        return {
          ...task,
          children: filteredChildren,
        };
      }

      return null;
    })
    .filter(Boolean) as Task[];
};

/**
 * Get hierarchy statistics
 */
export const getHierarchyStatistics = (hierarchy: Task[]) => {
  const allTasks = flattenHierarchy(hierarchy);

  return {
    totalTasks: allTasks.length,
    completedTasks: allTasks.filter((task) => task.completed).length,
    incompleteTasks: allTasks.filter((task) => !task.completed).length,
    completionPercentage:
      allTasks.length > 0
        ? Math.round(
            (allTasks.filter((task) => task.completed).length /
              allTasks.length) *
              100,
          )
        : 0,
    byPriority: {
      critical: allTasks.filter((task) => task.priority === "critical").length,
      high: allTasks.filter((task) => task.priority === "high").length,
      medium: allTasks.filter((task) => task.priority === "medium").length,
      low: allTasks.filter((task) => task.priority === "low").length,
    },
    byStatus: {
      todo: allTasks.filter((task) => task.status === "todo").length,
      "in-progress": allTasks.filter((task) => task.status === "in-progress")
        .length,
      completed: allTasks.filter((task) => task.status === "completed").length,
      archived: allTasks.filter((task) => task.status === "archived").length,
    },
  };
};

/**
 * Validate hierarchy (check for circular references, etc.)
 */
export const validateHierarchy = (
  hierarchy: Task[],
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  const taskIds = new Set<string>();

  const checkCircularReferences = (
    task: Task,
    parentIds: string[] = [],
  ): boolean => {
    if (parentIds.includes(task.id)) {
      return true; // Circular reference found
    }

    if (task.children) {
      const newParentIds = [...parentIds, task.id];
      for (const child of task.children) {
        if (checkCircularReferences(child, newParentIds)) {
          errors.push(`Circular reference detected: ${child.id} -> ${task.id}`);
          return true;
        }
      }
    }

    return false;
  };

  const checkDuplicateIds = (tasks: Task[]): boolean => {
    let hasDuplicates = false;

    tasks.forEach((task) => {
      if (taskIds.has(task.id)) {
        errors.push(`Duplicate task ID found: ${task.id}`);
        hasDuplicates = true;
      } else {
        taskIds.add(task.id);
      }

      if (task.children) {
        hasDuplicates = checkDuplicateIds(task.children) || hasDuplicates;
      }
    });

    return hasDuplicates;
  };

  // Check for circular references
  hierarchy.forEach((task) => {
    checkCircularReferences(task);
  });

  // Check for duplicate IDs
  checkDuplicateIds(hierarchy);

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Convert hierarchy to nested structure for tree views
 */
export const convertHierarchyToTree = (hierarchy: Task[]): any[] => {
  return hierarchy.map((task) => ({
    id: task.id,
    title: task.title,
    completed: task.completed,
    priority: task.priority,
    status: task.status,
    children: task.children ? convertHierarchyToTree(task.children) : [],
  }));
};

/**
 * Find common ancestor of multiple tasks
 */
export const findCommonAncestor = (
  taskIds: string[],
  hierarchy: Task[],
): Task | null => {
  if (taskIds.length === 0) return null;

  const paths = taskIds.map((taskId) =>
    getTaskPathInHierarchy(taskId, hierarchy),
  );

  if (paths.some((path) => !path)) return null;

  // Find the longest common prefix
  let commonAncestor: Task | null = null;
  const firstPath = paths[0]!;

  for (let i = 0; i < firstPath.length; i++) {
    const currentTask = firstPath[i];

    if (
      paths.every((path) => path && path[i] && path[i].id === currentTask.id)
    ) {
      commonAncestor = currentTask;
    } else {
      break;
    }
  }

  return commonAncestor;
};
