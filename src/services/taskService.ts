import { Task, TaskStatus, PriorityLevel } from '../types/task';
import { ApiResponse } from '../types/api';
import { taskApi } from '../api/taskApi';
import { useTaskStore } from '../store/useTaskStore';

/**
 * Task Service - Handles all task-related business logic and CRUD operations
 */
export class TaskService {
  private static instance: TaskService;
  private taskStore = useTaskStore.getState();

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance of TaskService
   */
  public static getInstance(): TaskService {
    if (!TaskService.instance) {
      TaskService.instance = new TaskService();
    }
    return TaskService.instance;
  }

  /**
   * Validate task data before creation/update
   */
  private validateTask(taskData: Partial<Task>): void {
    if (!taskData.title || taskData.title.trim().length === 0) {
      throw new Error('Task title is required');
    }

    if (taskData.title.length > 255) {
      throw new Error('Task title cannot exceed 255 characters');
    }

    if (taskData.description && taskData.description.length > 5000) {
      throw new Error('Task description cannot exceed 5000 characters');
    }

    if (taskData.priority && !['low', 'medium', 'high', 'critical'].includes(taskData.priority)) {
      throw new Error('Invalid priority level');
    }

    if (taskData.status && !['todo', 'in-progress', 'completed', 'archived'].includes(taskData.status)) {
      throw new Error('Invalid task status');
    }
  }

  /**
   * Create a new task with validation
   */
  async createTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed'>): Promise<Task> {
    this.validateTask(taskData);

    const newTask: Omit<Task, 'id'> = {
      ...taskData,
      createdAt: new Date(),
      updatedAt: new Date(),
      completed: false,
      status: taskData.status || 'todo',
      priority: taskData.priority || 'medium'
    };

    try {
      // Optimistic update
      const optimisticTask: Task = {
        ...newTask,
        id: `temp-${Date.now()}`
      };

      this.taskStore.addTask(optimisticTask);

      // Call API
      const response: ApiResponse<Task> = await taskApi.createTask(newTask);

      if (response.success && response.data) {
        // Replace temporary ID with real ID
        this.taskStore.updateTask(optimisticTask.id, {
          id: response.data.id,
          ...response.data
        });
        return response.data;
      } else {
        // Revert optimistic update on failure
        this.taskStore.deleteTask(optimisticTask.id);
        throw new Error(response.message || 'Failed to create task');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      throw error;
    }
  }

  /**
   * Get a single task by ID
   */
  async getTask(taskId: string): Promise<Task> {
    try {
      const response: ApiResponse<Task> = await taskApi.getTask(taskId);

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Task not found');
      }
    } catch (error) {
      console.error('Error fetching task:', error);
      throw error;
    }
  }

  /**
   * Get all tasks, optionally filtered by project
   */
  async getTasks(projectId?: string): Promise<Task[]> {
    try {
      const response: ApiResponse<Task[]> = await taskApi.getTasks(projectId);

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch tasks');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  }

  /**
   * Update a task with optimistic updates
   */
  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    this.validateTask(updates);

    try {
      // Get current task for optimistic update
      const currentTask = this.taskStore.tasks.find(task => task.id === taskId);
      if (!currentTask) {
        throw new Error('Task not found');
      }

      // Optimistic update
      const optimisticUpdate = {
        ...updates,
        updatedAt: new Date()
      };

      this.taskStore.updateTask(taskId, optimisticUpdate);

      // Call API
      const response: ApiResponse<Task> = await taskApi.updateTask(taskId, updates);

      if (response.success && response.data) {
        return response.data;
      } else {
        // Revert optimistic update on failure
        this.taskStore.updateTask(taskId, currentTask);
        throw new Error(response.message || 'Failed to update task');
      }
    } catch (error) {
      console.error('Error updating task:', error);
      throw error;
    }
  }

  /**
   * Delete a task with confirmation
   */
  async deleteTask(taskId: string, confirm: boolean = true): Promise<void> {
    if (confirm) {
      // In a real app, this would show a confirmation dialog
      console.log('Task deletion requires confirmation');
    }

    try {
      // Optimistic update
      this.taskStore.deleteTask(taskId);

      // Call API
      const response: ApiResponse<void> = await taskApi.deleteTask(taskId);

      if (!response.success) {
        // Revert optimistic update on failure
        // Note: We'd need to restore the task, but for simplicity we'll just log
        console.error('Failed to delete task:', response.message);
        throw new Error(response.message || 'Failed to delete task');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
      throw error;
    }
  }

  /**
   * Toggle task completion status
   */
  async toggleTaskCompletion(taskId: string): Promise<Task> {
    try {
      const currentTask = this.taskStore.tasks.find(task => task.id === taskId);
      if (!currentTask) {
        throw new Error('Task not found');
      }

      const newStatus = !currentTask.completed;
      const optimisticUpdate = {
        completed: newStatus,
        status: newStatus ? 'completed' : 'todo',
        updatedAt: new Date(),
        completedAt: newStatus ? new Date() : null
      };

      // Optimistic update
      this.taskStore.updateTask(taskId, optimisticUpdate);

      // Call appropriate API based on current status
      const response: ApiResponse<Task> = currentTask.completed
        ? await taskApi.reopenTask(taskId)
        : await taskApi.completeTask(taskId);

      if (response.success && response.data) {
        return response.data;
      } else {
        // Revert optimistic update on failure
        this.taskStore.updateTask(taskId, currentTask);
        throw new Error(response.message || 'Failed to toggle task completion');
      }
    } catch (error) {
      console.error('Error toggling task completion:', error);
      throw error;
    }
  }

  /**
   * Filter tasks by status
   */
  filterTasksByStatus(status: TaskStatus): Task[] {
    return this.taskStore.tasks.filter(task => task.status === status);
  }

  /**
   * Sort tasks by priority, due date, or creation date
   */
  sortTasks(sortBy: 'priority' | 'dueDate' | 'createdAt' = 'priority'): Task[] {
    const priorityOrder: Record<PriorityLevel, number> = {
      'critical': 1,
      'high': 2,
      'medium': 3,
      'low': 4
    };

    return [...this.taskStore.tasks].sort((a, b) => {
      switch (sortBy) {
        case 'priority':
          return (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0);
        case 'dueDate':
          return (a.dueDate?.getTime() || 0) - (b.dueDate?.getTime() || 0);
        case 'createdAt':
          return a.createdAt.getTime() - b.createdAt.getTime();
        default:
          return 0;
      }
    });
  }
}

// Singleton instance
export const taskService = TaskService.getInstance();