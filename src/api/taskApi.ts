import { Task } from '../types/task';
import { ApiResponse } from '../types/api';
import { API_BASE_URL } from '../config/app.config';

/**
 * Task API Service - Handles all API communication for task CRUD operations
 */
export class TaskApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/tasks`;
  }

  /**
   * Transform task data for API requests
   */
  private transformRequest(taskData: Partial<Task>): any {
    const { id, createdAt, updatedAt, completedAt, ...rest } = taskData;

    return {
      ...rest,
      dueDate: taskData.dueDate?.toISOString(),
      createdAt: taskData.createdAt?.toISOString(),
      updatedAt: taskData.updatedAt?.toISOString(),
      completedAt: taskData.completedAt?.toISOString()
    };
  }

  /**
   * Transform API response to Task object
   */
  private transformResponse(responseData: any): Task {
    return {
      ...responseData,
      id: responseData.id,
      title: responseData.title,
      description: responseData.description || '',
      status: responseData.status || 'todo',
      priority: responseData.priority || 'medium',
      dueDate: responseData.dueDate ? new Date(responseData.dueDate) : null,
      createdAt: new Date(responseData.createdAt),
      updatedAt: new Date(responseData.updatedAt),
      completedAt: responseData.completedAt ? new Date(responseData.completedAt) : null,
      completed: responseData.completed || false,
      projectId: responseData.projectId,
      order: responseData.order || 0
    };
  }

  /**
   * Handle API errors with retry logic
   */
  private async handleApiRequest<T>(requestFn: () => Promise<Response>): Promise<ApiResponse<T>> {
    const MAX_RETRIES = 3;
    let retryCount = 0;

    while (retryCount < MAX_RETRIES) {
      try {
        const response = await requestFn();

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          return {
            success: false,
            message: errorData.message || `HTTP error! status: ${response.status}`,
            data: null
          };
        }

        const data = await response.json();
        return {
          success: true,
          message: 'Success',
          data: data
        };
      } catch (error) {
        retryCount++;
        if (retryCount >= MAX_RETRIES) {
          return {
            success: false,
            message: error instanceof Error ? error.message : 'Unknown error',
            data: null
          };
        }
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * retryCount));
      }
    }

    return {
      success: false,
      message: 'Max retries exceeded',
      data: null
    };
  }

  /**
   * Create a new task
   */
  async createTask(taskData: Omit<Task, 'id'>): Promise<ApiResponse<Task>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(this.transformRequest(taskData))
        });
      });

      if (response.success && response.data) {
        return {
          ...response,
          data: this.transformResponse(response.data)
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to create task',
        data: null
      };
    }
  }

  /**
   * Get a single task by ID
   */
  async getTask(taskId: string): Promise<ApiResponse<Task>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}/${taskId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      });

      if (response.success && response.data) {
        return {
          ...response,
          data: this.transformResponse(response.data)
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch task',
        data: null
      };
    }
  }

  /**
   * Get all tasks, optionally filtered by project
   */
  async getTasks(projectId?: string): Promise<ApiResponse<Task[]>> {
    try {
      let url = this.baseUrl;
      if (projectId) {
        url += `?projectId=${projectId}`;
      }

      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      });

      if (response.success && response.data) {
        return {
          ...response,
          data: response.data.map((task: any) => this.transformResponse(task))
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to fetch tasks',
        data: null
      };
    }
  }

  /**
   * Update a task
   */
  async updateTask(taskId: string, taskData: Partial<Task>): Promise<ApiResponse<Task>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}/${taskId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(this.transformRequest(taskData))
        });
      });

      if (response.success && response.data) {
        return {
          ...response,
          data: this.transformResponse(response.data)
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to update task',
        data: null
      };
    }
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}/${taskId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      });

      return {
        success: response.success,
        message: response.message,
        data: undefined
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to delete task',
        data: undefined
      };
    }
  }

  /**
   * Complete a task
   */
  async completeTask(taskId: string): Promise<ApiResponse<Task>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}/${taskId}/complete`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      });

      if (response.success && response.data) {
        return {
          ...response,
          data: this.transformResponse(response.data)
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to complete task',
        data: null
      };
    }
  }

  /**
   * Reopen a completed task
   */
  async reopenTask(taskId: string): Promise<ApiResponse<Task>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}/${taskId}/reopen`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      });

      if (response.success && response.data) {
        return {
          ...response,
          data: this.transformResponse(response.data)
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to reopen task',
        data: null
      };
    }
  }
}

// Singleton instance
export const taskApi = new TaskApi();