import { Task } from "../types/task";
import { subTaskService } from "./subTaskService";
import { useTaskStore } from "../store/useTaskStore";

/**
 * Task Hierarchy Service - Handles task hierarchy operations and tree management
 */
export class TaskHierarchyService {
  private static instance: TaskHierarchyService;
  private taskStore = useTaskStore.getState();

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance of TaskHierarchyService
   */
  public static getInstance(): TaskHierarchyService {
    if (!TaskHierarchyService.instance) {
      TaskHierarchyService.instance = new TaskHierarchyService();
    }
    return TaskHierarchyService.instance;
  }

  /**
   * Get all sub-tasks for a parent task
   */
  async getSubTasks(parentTaskId: string): Promise<Task[]> {
    return subTaskService.getSubTasks(parentTaskId);
  }

  /**
   * Get the entire task hierarchy tree for a parent task
   */
  async getTaskHierarchyTree(parentTaskId: string): Promise<Task[]> {
    try {
      const allTasks = this.taskStore.tasks;
      const hierarchy: Task[] = [];

      const buildHierarchy = (taskId: string, depth: number = 0): Task[] => {
        const children = allTasks.filter(
          (task) => task.parentTaskId === taskId,
        );
        return children.map((child) => ({
          ...child,
          depth,
          children: buildHierarchy(child.id, depth + 1),
        }));
      };

      return buildHierarchy(parentTaskId);
    } catch (error) {
      console.error("Error building task hierarchy:", error);
      throw error;
    }
  }

  /**
   * Get flat list of all tasks in hierarchy (including parent)
   */
  async getFlatHierarchy(parentTaskId: string): Promise<Task[]> {
    try {
      const allTasks = this.taskStore.tasks;
      const hierarchyTasks: Task[] = [];

      const collectHierarchy = (taskId: string) => {
        const task = allTasks.find((t) => t.id === taskId);
        if (task) {
          hierarchyTasks.push(task);
          const children = allTasks.filter((t) => t.parentTaskId === taskId);
          children.forEach((child) => collectHierarchy(child.id));
        }
      };

      collectHierarchy(parentTaskId);
      return hierarchyTasks;
    } catch (error) {
      console.error("Error collecting flat hierarchy:", error);
      throw error;
    }
  }

  /**
   * Create a new sub-task in the hierarchy
   */
  async createSubTaskInHierarchy(
    parentTaskId: string,
    subTaskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "completed">,
  ): Promise<Task> {
    return subTaskService.createSubTask({
      ...subTaskData,
      parentTaskId,
    });
  }

  /**
   * Update sub-task position in hierarchy (reordering)
   */
  async updateSubTaskPosition(
    subTaskId: string,
    newParentTaskId: string,
    newOrder: number,
  ): Promise<Task> {
    try {
      // Get the sub-task
      const subTask = this.taskStore.tasks.find(
        (task) => task.id === subTaskId,
      );
      if (!subTask) {
        throw new Error("Sub-task not found");
      }

      // Update parent and order
      const updatedSubTask = await subTaskService.updateSubTask(subTaskId, {
        parentTaskId: newParentTaskId,
        order: newOrder,
      });

      return updatedSubTask;
    } catch (error) {
      console.error("Error updating sub-task position:", error);
      throw error;
    }
  }

  /**
   * Move sub-task to different parent
   */
  async moveSubTask(subTaskId: string, newParentTaskId: string): Promise<Task> {
    try {
      const subTask = this.taskStore.tasks.find(
        (task) => task.id === subTaskId,
      );
      if (!subTask) {
        throw new Error("Sub-task not found");
      }

      // Prevent circular references
      if (subTask.id === newParentTaskId) {
        throw new Error("Cannot move task to be its own parent");
      }

      // Check if new parent would create circular reference
      const newParent = this.taskStore.tasks.find(
        (task) => task.id === newParentTaskId,
      );
      if (
        newParent &&
        this.wouldCreateCircularReference(newParentTaskId, subTaskId)
      ) {
        throw new Error("Moving this task would create a circular reference");
      }

      return subTaskService.updateSubTask(subTaskId, {
        parentTaskId: newParentTaskId,
      });
    } catch (error) {
      console.error("Error moving sub-task:", error);
      throw error;
    }
  }

  /**
   * Check if moving a task would create circular reference
   */
  private wouldCreateCircularReference(
    parentTaskId: string,
    taskId: string,
  ): boolean {
    const allTasks = this.taskStore.tasks;
    let currentTaskId = parentTaskId;

    while (currentTaskId) {
      const task = allTasks.find((t) => t.id === currentTaskId);
      if (!task) break;

      if (task.id === taskId) {
        return true; // Circular reference detected
      }

      currentTaskId = task.parentTaskId || "";
    }

    return false;
  }

  /**
   * Get task depth in hierarchy
   */
  async getTaskDepth(taskId: string): Promise<number> {
    try {
      const allTasks = this.taskStore.tasks;
      let depth = 0;
      let currentTaskId = taskId;

      while (currentTaskId) {
        const task = allTasks.find((t) => t.id === currentTaskId);
        if (!task || !task.parentTaskId) break;

        depth++;
        currentTaskId = task.parentTaskId;
      }

      return depth;
    } catch (error) {
      console.error("Error calculating task depth:", error);
      throw error;
    }
  }

  /**
   * Get task path (all parent tasks from root to current)
   */
  async getTaskPath(taskId: string): Promise<Task[]> {
    try {
      const allTasks = this.taskStore.tasks;
      const path: Task[] = [];
      let currentTaskId = taskId;

      while (currentTaskId) {
        const task = allTasks.find((t) => t.id === currentTaskId);
        if (!task) break;

        path.unshift(task); // Add to beginning to maintain order
        currentTaskId = task.parentTaskId || "";
      }

      return path;
    } catch (error) {
      console.error("Error getting task path:", error);
      throw error;
    }
  }

  /**
   * Calculate completion percentage for entire hierarchy
   */
  async calculateHierarchyCompletion(taskId: string): Promise<number> {
    try {
      const hierarchy = await this.getFlatHierarchy(taskId);
      const totalTasks = hierarchy.length;
      const completedTasks = hierarchy.filter((task) => task.completed).length;

      return totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0;
    } catch (error) {
      console.error("Error calculating hierarchy completion:", error);
      throw error;
    }
  }

  /**
   * Get tasks by hierarchy level
   */
  async getTasksByLevel(level: number): Promise<Task[]> {
    try {
      const allTasks = this.taskStore.tasks;
      return allTasks.filter((task) => {
        try {
          const depth = this.getTaskDepthSync(task.id);
          return depth === level;
        } catch {
          return false;
        }
      });
    } catch (error) {
      console.error("Error getting tasks by level:", error);
      throw error;
    }
  }

  /**
   * Synchronous version of getTaskDepth for filtering
   */
  private getTaskDepthSync(taskId: string): number {
    const allTasks = this.taskStore.tasks;
    let depth = 0;
    let currentTaskId = taskId;

    while (currentTaskId) {
      const task = allTasks.find((t) => t.id === currentTaskId);
      if (!task || !task.parentTaskId) break;

      depth++;
      currentTaskId = task.parentTaskId;
    }

    return depth;
  }

  /**
   * Find root parent task
   */
  async findRootParent(taskId: string): Promise<Task | null> {
    try {
      const allTasks = this.taskStore.tasks;
      let currentTaskId = taskId;

      while (currentTaskId) {
        const task = allTasks.find((t) => t.id === currentTaskId);
        if (!task || !task.parentTaskId) {
          return task || null;
        }
        currentTaskId = task.parentTaskId;
      }

      return null;
    } catch (error) {
      console.error("Error finding root parent:", error);
      throw error;
    }
  }
}

// Singleton instance
export const taskHierarchyService = TaskHierarchyService.getInstance();
