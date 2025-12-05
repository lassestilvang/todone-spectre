/**
 * Offline Task Service - Handles offline task operations and synchronization
 */
import { Task } from "../types/task";
import { useOfflineStore } from "../store/useOfflineStore";
import { taskApi } from "../api/taskApi";
import { OfflineQueueItem } from "../types/offlineTypes";

export class OfflineTaskService {
  private static instance: OfflineTaskService;
  private offlineStore = useOfflineStore.getState();

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): OfflineTaskService {
    if (!OfflineTaskService.instance) {
      OfflineTaskService.instance = new OfflineTaskService();
    }
    return OfflineTaskService.instance;
  }

  /**
   * Create a task with offline support
   */
  async createTaskOffline(taskData: Omit<Task, "id">): Promise<Task> {
    const isOffline = this.offlineStore.status.isOffline;

    if (isOffline) {
      // Queue the operation for offline processing
      const queueItem: Omit<
        OfflineQueueItem,
        "id" | "timestamp" | "status" | "attempts"
      > = {
        operation: `Create task: ${taskData.title}`,
        type: "create",
        data: taskData,
        priority: "high",
      };

      this.offlineStore.addToQueue(queueItem);

      // Return a temporary task with local ID
      const tempTask: Task = {
        ...taskData,
        id: `temp-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        completed: false,
        status: "todo",
        priority: taskData.priority || "medium",
      };

      return tempTask;
    } else {
      // Online - use regular API
      const result = await taskApi.createTask(taskData);
      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error(result.message || "Failed to create task");
      }
    }
  }

  /**
   * Update a task with offline support
   */
  async updateTaskOffline(
    taskId: string,
    taskData: Partial<Task>,
  ): Promise<Task> {
    const isOffline = this.offlineStore.status.isOffline;

    if (isOffline) {
      // Queue the operation for offline processing
      const queueItem: Omit<
        OfflineQueueItem,
        "id" | "timestamp" | "status" | "attempts"
      > = {
        operation: `Update task: ${taskId}`,
        type: "update",
        data: {
          taskId,
          updates: taskData,
        },
        priority: "high",
      };

      this.offlineStore.addToQueue(queueItem);

      // Return an updated task with local changes
      const updatedTask: Task = {
        ...taskData,
        id: taskId,
        updatedAt: new Date(),
      } as Task;

      return updatedTask;
    } else {
      // Online - use regular API
      const result = await taskApi.updateTask(taskId, taskData);
      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error(result.message || "Failed to update task");
      }
    }
  }

  /**
   * Delete a task with offline support
   */
  async deleteTaskOffline(taskId: string): Promise<void> {
    const isOffline = this.offlineStore.status.isOffline;

    if (isOffline) {
      // Queue the operation for offline processing
      const queueItem: Omit<
        OfflineQueueItem,
        "id" | "timestamp" | "status" | "attempts"
      > = {
        operation: `Delete task: ${taskId}`,
        type: "delete",
        data: { taskId },
        priority: "medium",
      };

      this.offlineStore.addToQueue(queueItem);
    } else {
      // Online - use regular API
      const result = await taskApi.deleteTask(taskId);
      if (!result.success) {
        throw new Error(result.message || "Failed to delete task");
      }
    }
  }

  /**
   * Toggle task completion with offline support
   */
  async toggleTaskCompletionOffline(taskId: string): Promise<Task> {
    const isOffline = this.offlineStore.status.isOffline;

    if (isOffline) {
      // Queue the operation for offline processing
      const queueItem: Omit<
        OfflineQueueItem,
        "id" | "timestamp" | "status" | "attempts"
      > = {
        operation: `Toggle completion: ${taskId}`,
        type: "update",
        data: {
          taskId,
          operation: "toggleCompletion",
        },
        priority: "high",
      };

      this.offlineStore.addToQueue(queueItem);

      // Return a locally updated task
      const updatedTask: Task = {
        id: taskId,
        completed: true,
        completedAt: new Date(),
        updatedAt: new Date(),
      } as Task;

      return updatedTask;
    } else {
      // Online - use regular API
      const result = await taskApi.completeTask(taskId);
      if (result.success && result.data) {
        return result.data;
      } else {
        throw new Error(result.message || "Failed to toggle task completion");
      }
    }
  }

  /**
   * Process offline task queue
   */
  async processOfflineTaskQueue(): Promise<void> {
    if (this.offlineStore.status.isOffline) {
      throw new Error("Cannot process queue while offline");
    }

    const queueItems = this.offlineStore.queue.items.filter(
      (item) =>
        item.type === "create" ||
        item.type === "update" ||
        item.type === "delete",
    );

    if (queueItems.length === 0) {
      console.log("No task operations to process");
      return;
    }

    console.log(`Processing ${queueItems.length} offline task operations`);

    for (const item of queueItems) {
      try {
        switch (item.type) {
          case "create":
            await this.processCreateOperation(item);
            break;
          case "update":
            await this.processUpdateOperation(item);
            break;
          case "delete":
            await this.processDeleteOperation(item);
            break;
        }

        // Mark as completed
        this.offlineStore.removeQueueItem(item.id);
      } catch (error) {
        console.error(`Failed to process operation ${item.operation}:`, error);
        // Mark as failed for retry
        this.offlineStore.retryQueueItem(item.id);
      }
    }
  }

  /**
   * Process create operation
   */
  private async processCreateOperation(item: OfflineQueueItem): Promise<void> {
    const taskData = item.data as Omit<Task, "id">;
    const result = await taskApi.createTask(taskData);

    if (!result.success) {
      throw new Error(result.message || "Failed to create task");
    }
  }

  /**
   * Process update operation
   */
  private async processUpdateOperation(item: OfflineQueueItem): Promise<void> {
    const { taskId, updates } = item.data;

    if (updates.operation === "toggleCompletion") {
      const result = await taskApi.completeTask(taskId);
      if (!result.success) {
        throw new Error(result.message || "Failed to toggle task completion");
      }
    } else {
      const result = await taskApi.updateTask(taskId, updates);
      if (!result.success) {
        throw new Error(result.message || "Failed to update task");
      }
    }
  }

  /**
   * Process delete operation
   */
  private async processDeleteOperation(item: OfflineQueueItem): Promise<void> {
    const { taskId } = item.data;
    const result = await taskApi.deleteTask(taskId);

    if (!result.success) {
      throw new Error(result.message || "Failed to delete task");
    }
  }

  /**
   * Get offline task queue status
   */
  getOfflineTaskQueueStatus(): {
    pendingTasks: number;
    failedTasks: number;
    totalTasks: number;
  } {
    const queueItems = this.offlineStore.queue.items.filter(
      (item) =>
        item.type === "create" ||
        item.type === "update" ||
        item.type === "delete",
    );

    return {
      pendingTasks: queueItems.filter((item) => item.status === "pending")
        .length,
      failedTasks: queueItems.filter((item) => item.status === "failed").length,
      totalTasks: queueItems.length,
    };
  }

  /**
   * Check if there are pending offline task operations
   */
  hasPendingOfflineTaskOperations(): boolean {
    const queueItems = this.offlineStore.queue.items.filter(
      (item) =>
        (item.type === "create" ||
          item.type === "update" ||
          item.type === "delete") &&
        item.status === "pending",
    );

    return queueItems.length > 0;
  }
}

// Singleton instance
export const offlineTaskService = OfflineTaskService.getInstance();
