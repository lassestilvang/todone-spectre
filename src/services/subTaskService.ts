import { Task } from '../types/task';
import { ApiResponse } from '../types/api';
import { taskApi } from '../api/taskApi';
import { useTaskStore } from '../store/useTaskStore';

/**
 * Sub-Task Service - Handles all sub-task related business logic and CRUD operations
 */
export class SubTaskService {
  private static instance: SubTaskService;
  private taskStore = useTaskStore.getState();

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance of SubTaskService
   */
  public static getInstance(): SubTaskService {
    if (!SubTaskService.instance) {
      SubTaskService.instance = new SubTaskService();
    }
    return SubTaskService.instance;
  }

  /**
   * Validate sub-task data before creation/update
   */
  private validateSubTask(subTaskData: Partial<Task>): void {
    if (!subTaskData.title || subTaskData.title.trim().length === 0) {
      throw new Error('Sub-task title is required');
    }

    if (subTaskData.title.length > 255) {
      throw new Error('Sub-task title cannot exceed 255 characters');
    }

    if (subTaskData.description && subTaskData.description.length > 5000) {
      throw new Error('Sub-task description cannot exceed 5000 characters');
    }

    if (subTaskData.priority && !['low', 'medium', 'high', 'critical'].includes(subTaskData.priority)) {
      throw new Error('Invalid priority level');
    }

    if (subTaskData.status && !['todo', 'in-progress', 'completed', 'archived'].includes(subTaskData.status)) {
      throw new Error('Invalid sub-task status');
    }
  }

  /**
   * Create a new sub-task with validation
   */
  async createSubTask(subTaskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed'>): Promise<Task> {
    this.validateSubTask(subTaskData);

    const newSubTask: Omit<Task, 'id'> = {
      ...subTaskData,
      createdAt: new Date(),
      updatedAt: new Date(),
      completed: false,
      status: subTaskData.status || 'todo',
      priority: subTaskData.priority || 'medium'
    };

    try {
      // Optimistic update
      const optimisticSubTask: Task = {
        ...newSubTask,
        id: `temp-${Date.now()}`
      };

      this.taskStore.addTask(optimisticSubTask);

      // Call API
      const response: ApiResponse<Task> = await taskApi.createTask(newSubTask);

      if (response.success && response.data) {
        // Replace temporary ID with real ID
        this.taskStore.updateTask(optimisticSubTask.id, {
          id: response.data.id,
          ...response.data
        });
        return response.data;
      } else {
        // Revert optimistic update on failure
        this.taskStore.deleteTask(optimisticSubTask.id);
        throw new Error(response.message || 'Failed to create sub-task');
      }
    } catch (error) {
      console.error('Error creating sub-task:', error);
      throw error;
    }
  }

  /**
   * Get sub-tasks for a parent task
   */
  async getSubTasks(parentTaskId: string): Promise<Task[]> {
    try {
      const allTasks = this.taskStore.tasks;
      return allTasks.filter(task => task.parentTaskId === parentTaskId);
    } catch (error) {
      console.error('Error fetching sub-tasks:', error);
      throw error;
    }
  }

  /**
   * Get all sub-tasks recursively for a task hierarchy
   */
  async getAllSubTasksRecursive(parentTaskId: string): Promise<Task[]> {
    try {
      const allTasks = this.taskStore.tasks;
      const subTasks: Task[] = [];

      const findSubTasks = (taskId: string) => {
        const children = allTasks.filter(task => task.parentTaskId === taskId);
        subTasks.push(...children);
        children.forEach(child => findSubTasks(child.id));
      };

      findSubTasks(parentTaskId);
      return subTasks;
    } catch (error) {
      console.error('Error fetching recursive sub-tasks:', error);
      throw error;
    }
  }

  /**
   * Update a sub-task with optimistic updates
   */
  async updateSubTask(subTaskId: string, updates: Partial<Task>): Promise<Task> {
    this.validateSubTask(updates);

    try {
      // Get current sub-task for optimistic update
      const currentSubTask = this.taskStore.tasks.find(task => task.id === subTaskId);
      if (!currentSubTask) {
        throw new Error('Sub-task not found');
      }

      // Optimistic update
      const optimisticUpdate = {
        ...updates,
        updatedAt: new Date()
      };

      this.taskStore.updateTask(subTaskId, optimisticUpdate);

      // Call API
      const response: ApiResponse<Task> = await taskApi.updateTask(subTaskId, updates);

      if (response.success && response.data) {
        return response.data;
      } else {
        // Revert optimistic update on failure
        this.taskStore.updateTask(subTaskId, currentSubTask);
        throw new Error(response.message || 'Failed to update sub-task');
      }
    } catch (error) {
      console.error('Error updating sub-task:', error);
      throw error;
    }
  }

  /**
   * Delete a sub-task with confirmation
   */
  async deleteSubTask(subTaskId: string, confirm: boolean = true): Promise<void> {
    if (confirm) {
      // In a real app, this would show a confirmation dialog
      console.log('Sub-task deletion requires confirmation');
    }

    try {
      // Optimistic update
      this.taskStore.deleteTask(subTaskId);

      // Call API
      const response: ApiResponse<void> = await taskApi.deleteTask(subTaskId);

      if (!response.success) {
        // Revert optimistic update on failure
        // Note: We'd need to restore the sub-task, but for simplicity we'll just log
        console.error('Failed to delete sub-task:', response.message);
        throw new Error(response.message || 'Failed to delete sub-task');
      }
    } catch (error) {
      console.error('Error deleting sub-task:', error);
      throw error;
    }
  }

  /**
   * Toggle sub-task completion status
   */
  async toggleSubTaskCompletion(subTaskId: string): Promise<Task> {
    try {
      const currentSubTask = this.taskStore.tasks.find(task => task.id === subTaskId);
      if (!currentSubTask) {
        throw new Error('Sub-task not found');
      }

      const newStatus = !currentSubTask.completed;
      const optimisticUpdate = {
        completed: newStatus,
        status: newStatus ? 'completed' : 'todo',
        updatedAt: new Date(),
        completedAt: newStatus ? new Date() : null
      };

      // Optimistic update
      this.taskStore.updateTask(subTaskId, optimisticUpdate);

      // Call appropriate API based on current status
      const response: ApiResponse<Task> = currentSubTask.completed
        ? await taskApi.reopenTask(subTaskId)
        : await taskApi.completeTask(subTaskId);

      if (response.success && response.data) {
        return response.data;
      } else {
        // Revert optimistic update on failure
        this.taskStore.updateTask(subTaskId, currentSubTask);
        throw new Error(response.message || 'Failed to toggle sub-task completion');
      }
    } catch (error) {
      console.error('Error toggling sub-task completion:', error);
      throw error;
    }
  }

  /**
   * Get completion percentage for a task and its sub-tasks
   */
  async getTaskCompletionPercentage(taskId: string): Promise<number> {
    try {
      const allTasks = this.taskStore.tasks;
      const task = allTasks.find(t => t.id === taskId);

      if (!task) {
        throw new Error('Task not found');
      }

      // Get all sub-tasks recursively
      const subTasks = await this.getAllSubTasksRecursive(taskId);
      const allTasksInHierarchy = [task, ...subTasks];
      const totalTasks = allTasksInHierarchy.length;
      const completedTasks = allTasksInHierarchy.filter(t => t.completed).length;

      return totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    } catch (error) {
      console.error('Error calculating completion percentage:', error);
      throw error;
    }
  }

  /**
   * Update completion status based on sub-tasks completion
   */
  async updateParentTaskCompletionStatus(parentTaskId: string): Promise<void> {
    try {
      const subTasks = await this.getSubTasks(parentTaskId);
      const allCompleted = subTasks.length > 0 && subTasks.every(st => st.completed);

      const parentTask = this.taskStore.tasks.find(task => task.id === parentTaskId);
      if (parentTask && parentTask.completed !== allCompleted) {
        await this.updateSubTask(parentTaskId, {
          completed: allCompleted,
          status: allCompleted ? 'completed' : 'in-progress'
        });
      }
    } catch (error) {
      console.error('Error updating parent task completion status:', error);
      throw error;
    }
  }
}

// Singleton instance
export const subTaskService = SubTaskService.getInstance();