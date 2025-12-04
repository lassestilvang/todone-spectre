import { Task, TaskStatus, PriorityLevel, RecurringPattern } from '../types/task';
import { ApiResponse } from '../types/api';
import { taskApi } from '../api/taskApi';
import { useTaskStore } from '../store/useTaskStore';
import { addDays, addWeeks, addMonths, addYears, isBefore, isAfter, parseISO } from 'date-fns';

/**
 * Recurring Task Service - Handles all recurring task-related business logic and operations
 */
export class RecurringTaskService {
  private static instance: RecurringTaskService;
  private taskStore = useTaskStore.getState();

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance of RecurringTaskService
   */
  public static getInstance(): RecurringTaskService {
    if (!RecurringTaskService.instance) {
      RecurringTaskService.instance = new RecurringTaskService();
    }
    return RecurringTaskService.instance;
  }

  /**
   * Create a new recurring task with validation
   */
  async createRecurringTask(taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed'>, config: RecurringTaskConfig): Promise<Task> {
    // Validate the task data
    this.validateTask(taskData);

    // Validate recurring configuration
    this.validateRecurringConfig(config);

    const newTask: Omit<Task, 'id'> = {
      ...taskData,
      createdAt: new Date(),
      updatedAt: new Date(),
      completed: false,
      status: taskData.status || 'active',
      priority: taskData.priority || 'P2',
      recurringPattern: config.pattern,
      customFields: {
        recurringConfig: config,
        ...(taskData.customFields || {})
      }
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

        // Generate initial recurring instances
        await this.generateRecurringInstances(response.data, config);

        return response.data;
      } else {
        // Revert optimistic update on failure
        this.taskStore.deleteTask(optimisticTask.id);
        throw new Error(response.message || 'Failed to create recurring task');
      }
    } catch (error) {
      console.error('Error creating recurring task:', error);
      throw error;
    }
  }

  /**
   * Get recurring tasks
   */
  async getRecurringTasks(): Promise<Task[]> {
    try {
      const allTasks = await taskApi.getTasks();
      if (allTasks.success && allTasks.data) {
        return allTasks.data.filter(task => task.recurringPattern);
      }
      return [];
    } catch (error) {
      console.error('Error fetching recurring tasks:', error);
      throw error;
    }
  }

  /**
   * Get recurring task by ID
   */
  async getRecurringTask(taskId: string): Promise<Task> {
    try {
      const response: ApiResponse<Task> = await taskApi.getTask(taskId);

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Recurring task not found');
      }
    } catch (error) {
      console.error('Error fetching recurring task:', error);
      throw error;
    }
  }

  /**
   * Update a recurring task with optimistic updates
   */
  async updateRecurringTask(taskId: string, updates: Partial<Task>, configUpdates?: Partial<RecurringTaskConfig>): Promise<Task> {
    this.validateTask(updates);

    try {
      // Get current task for optimistic update
      const currentTask = this.taskStore.tasks.find(task => task.id === taskId);
      if (!currentTask) {
        throw new Error('Recurring task not found');
      }

      // Optimistic update
      const optimisticUpdate = {
        ...updates,
        updatedAt: new Date(),
        customFields: {
          ...currentTask.customFields,
          ...(updates.customFields || {}),
          ...(configUpdates && {
            recurringConfig: {
              ...currentTask.customFields?.recurringConfig,
              ...configUpdates
            }
          })
        }
      };

      this.taskStore.updateTask(taskId, optimisticUpdate);

      // Call API
      const response: ApiResponse<Task> = await taskApi.updateTask(taskId, optimisticUpdate);

      if (response.success && response.data) {
        // Regenerate instances if config changed
        if (configUpdates) {
          const updatedConfig = {
            ...currentTask.customFields?.recurringConfig,
            ...configUpdates
          };
          await this.regenerateRecurringInstances(response.data, updatedConfig);
        }

        return response.data;
      } else {
        // Revert optimistic update on failure
        this.taskStore.updateTask(taskId, currentTask);
        throw new Error(response.message || 'Failed to update recurring task');
      }
    } catch (error) {
      console.error('Error updating recurring task:', error);
      throw error;
    }
  }

  /**
   * Delete a recurring task and all its generated instances
   */
  async deleteRecurringTask(taskId: string, confirm: boolean = true): Promise<void> {
    if (confirm) {
      // In a real app, this would show a confirmation dialog
      console.log('Recurring task deletion requires confirmation');
    }

    try {
      // Get the recurring task to find all generated instances
      const recurringTask = this.taskStore.tasks.find(task => task.id === taskId);
      if (!recurringTask) {
        throw new Error('Recurring task not found');
      }

      // Find all generated instances
      const generatedInstances = this.taskStore.tasks.filter(task =>
        task.customFields?.originalTaskId === taskId
      );

      // Delete all generated instances first
      for (const instance of generatedInstances) {
        await taskApi.deleteTask(instance.id);
        this.taskStore.deleteTask(instance.id);
      }

      // Delete the original recurring task
      await taskApi.deleteTask(taskId);
      this.taskStore.deleteTask(taskId);

    } catch (error) {
      console.error('Error deleting recurring task:', error);
      throw error;
    }
  }

  /**
   * Generate recurring task instances based on configuration
   */
  async generateRecurringInstances(task: Task, config: RecurringTaskConfig): Promise<RecurringTaskInstance[]> {
    if (!task.recurringPattern || !task.dueDate) {
      return [];
    }

    const instances: RecurringTaskInstance[] = [];
    const startDate = new Date(task.dueDate);
    const endDate = config.endDate ? new Date(config.endDate) : null;
    const maxCount = config.maxOccurrences || 10; // Default to 10 instances

    let currentDate = new Date(startDate);
    let count = 0;

    // Add the original task instance
    instances.push({
      id: task.id,
      taskId: task.id,
      date: currentDate,
      isGenerated: false,
      status: task.status,
      completed: task.completed,
      originalTaskId: task.id
    });

    // Generate future instances
    while (true) {
      if (endDate && isAfter(currentDate, endDate)) break;
      if (count >= maxCount) break;

      currentDate = this.getNextDate(currentDate, task.recurringPattern, config);
      if (isBefore(currentDate, new Date())) continue; // Skip past dates

      const instanceId = `${task.id}-instance-${count + 1}`;

      const generatedTask: Omit<Task, 'id'> = {
        ...task,
        id: instanceId,
        title: `${task.title} (Recurring)`,
        dueDate: currentDate,
        customFields: {
          ...task.customFields,
          originalTaskId: task.id,
          isRecurringInstance: true,
          instanceNumber: count + 1
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        completed: false,
        status: 'active'
      };

      // Create the generated task
      const response = await taskApi.createTask(generatedTask);
      if (response.success && response.data) {
        instances.push({
          id: instanceId,
          taskId: instanceId,
          date: currentDate,
          isGenerated: true,
          status: response.data.status,
          completed: response.data.completed,
          originalTaskId: task.id
        });
      }

      count++;
    }

    return instances;
  }

  /**
   * Regenerate all instances for a recurring task (when configuration changes)
   */
  async regenerateRecurringInstances(task: Task, config: RecurringTaskConfig): Promise<void> {
    // First delete all existing generated instances
    const existingInstances = this.taskStore.tasks.filter(t =>
      t.customFields?.originalTaskId === task.id && t.id !== task.id
    );

    for (const instance of existingInstances) {
      await taskApi.deleteTask(instance.id);
      this.taskStore.deleteTask(instance.id);
    }

    // Generate new instances
    await this.generateRecurringInstances(task, config);
  }

  /**
   * Get the next date based on recurring pattern
   */
  private getNextDate(currentDate: Date, pattern: RecurringPattern, config?: RecurringTaskConfig): Date {
    switch (pattern) {
      case 'daily':
        return addDays(currentDate, config?.customInterval || 1);
      case 'weekly':
        return addWeeks(currentDate, config?.customInterval || 1);
      case 'monthly':
        return addMonths(currentDate, config?.customInterval || 1);
      case 'yearly':
        return addYears(currentDate, config?.customInterval || 1);
      case 'custom':
      default:
        return addWeeks(currentDate, config?.customInterval || 1);
    }
  }

  /**
   * Complete a specific recurring instance
   */
  async completeRecurringInstance(instanceId: string): Promise<Task> {
    try {
      const response = await taskApi.completeTask(instanceId);

      if (response.success && response.data) {
        // Check if this was the last instance and if we should generate more
        const instance = response.data;
        const originalTask = this.taskStore.tasks.find(task =>
          task.id === instance.customFields?.originalTaskId
        );

        if (originalTask && originalTask.recurringPattern) {
          const config = originalTask.customFields?.recurringConfig;
          if (config && (!config.endDate || !config.maxOccurrences)) {
            // For infinite recurring tasks, generate next instance
            await this.generateNextRecurringInstance(originalTask);
          }
        }

        return response.data;
      } else {
        throw new Error(response.message || 'Failed to complete recurring instance');
      }
    } catch (error) {
      console.error('Error completing recurring instance:', error);
      throw error;
    }
  }

  /**
   * Generate the next instance for a recurring task
   */
  async generateNextRecurringInstance(task: Task): Promise<Task | null> {
    if (!task.recurringPattern || !task.dueDate) {
      return null;
    }

    const config = task.customFields?.recurringConfig;
    if (!config) {
      return null;
    }

    // Find the most recent instance
    const instances = this.taskStore.tasks.filter(t =>
      t.customFields?.originalTaskId === task.id
    ).sort((a, b) => b.dueDate?.getTime() || 0 - (a.dueDate?.getTime() || 0));

    const latestInstance = instances.length > 0 ? instances[0] : task;
    const nextDate = this.getNextDate(new Date(latestInstance.dueDate || task.dueDate), task.recurringPattern, config);

    // Check if we should generate more instances
    if (config.endDate && isAfter(nextDate, new Date(config.endDate))) {
      return null;
    }

    if (config.maxOccurrences) {
      const instanceCount = instances.length;
      if (instanceCount >= config.maxOccurrences) {
        return null;
      }
    }

    const instanceId = `${task.id}-instance-${instances.length + 1}`;

    const generatedTask: Omit<Task, 'id'> = {
      ...task,
      id: instanceId,
      title: `${task.title} (Recurring)`,
      dueDate: nextDate,
      customFields: {
        ...task.customFields,
        originalTaskId: task.id,
        isRecurringInstance: true,
        instanceNumber: instances.length + 1
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      completed: false,
      status: 'active'
    };

    const response = await taskApi.createTask(generatedTask);
    if (response.success && response.data) {
      return response.data;
    }

    return null;
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

    if (taskData.priority && !['P1', 'P2', 'P3', 'P4'].includes(taskData.priority)) {
      throw new Error('Invalid priority level');
    }

    if (taskData.status && !['active', 'completed', 'archived', 'pending', 'in-progress'].includes(taskData.status)) {
      throw new Error('Invalid task status');
    }
  }

  /**
   * Validate recurring configuration
   */
  private validateRecurringConfig(config: RecurringTaskConfig): void {
    if (!config.pattern) {
      throw new Error('Recurring pattern is required');
    }

    if (!config.startDate) {
      throw new Error('Start date is required for recurring tasks');
    }

    if (config.maxOccurrences && config.maxOccurrences < 1) {
      throw new Error('Maximum occurrences must be at least 1');
    }

    if (config.customInterval && config.customInterval < 1) {
      throw new Error('Custom interval must be at least 1');
    }
  }

  /**
   * Get all instances for a recurring task
   */
  getRecurringInstances(taskId: string): Task[] {
    return this.taskStore.tasks.filter(task =>
      task.customFields?.originalTaskId === taskId || task.id === taskId
    ).sort((a, b) => (a.dueDate?.getTime() || 0) - (b.dueDate?.getTime() || 0));
  }

  /**
   * Pause a recurring task (stop generating new instances)
   */
  async pauseRecurringTask(taskId: string): Promise<Task> {
    const task = this.taskStore.tasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const updates = {
      status: 'archived' as TaskStatus,
      customFields: {
        ...task.customFields,
        isPaused: true
      }
    };

    return this.updateRecurringTask(taskId, updates);
  }

  /**
   * Resume a paused recurring task
   */
  async resumeRecurringTask(taskId: string): Promise<Task> {
    const task = this.taskStore.tasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    const updates = {
      status: 'active' as TaskStatus,
      customFields: {
        ...task.customFields,
        isPaused: false
      }
    };

    return this.updateRecurringTask(taskId, updates);
  }

  /**
   * Get recurring task statistics
   */
  getRecurringTaskStats(taskId: string): {
    totalInstances: number;
    completedInstances: number;
    pendingInstances: number;
    nextInstanceDate?: Date;
  } {
    const instances = this.getRecurringInstances(taskId);
    const completedInstances = instances.filter(i => i.completed);
    const pendingInstances = instances.filter(i => !i.completed && i.status !== 'archived');

    const futureInstances = instances
      .filter(i => !i.completed && i.dueDate && isAfter(i.dueDate, new Date()))
      .sort((a, b) => (a.dueDate?.getTime() || 0) - (b.dueDate?.getTime() || 0));

    return {
      totalInstances: instances.length,
      completedInstances: completedInstances.length,
      pendingInstances: pendingInstances.length,
      nextInstanceDate: futureInstances.length > 0 ? futureInstances[0].dueDate : undefined
    };
  }

  /**
   * Get all recurring tasks for a specific project
   */
  async getRecurringTasksByProject(projectId: string): Promise<Task[]> {
    try {
      const allTasks = await taskApi.getTasks();
      if (allTasks.success && allTasks.data) {
        return allTasks.data.filter(task =>
          task.recurringPattern && task.projectId === projectId
        );
      }
      return [];
    } catch (error) {
      console.error('Error fetching recurring tasks by project:', error);
      throw error;
    }
  }

  /**
   * Get recurring tasks by pattern type
   */
  async getRecurringTasksByPattern(pattern: RecurringPattern): Promise<Task[]> {
    try {
      const allTasks = await taskApi.getTasks();
      if (allTasks.success && allTasks.data) {
        return allTasks.data.filter(task =>
          task.recurringPattern === pattern
        );
      }
      return [];
    } catch (error) {
      console.error('Error fetching recurring tasks by pattern:', error);
      throw error;
    }
  }

  /**
   * Get recurring tasks by status
   */
  async getRecurringTasksByStatus(status: TaskStatus): Promise<Task[]> {
    try {
      const allTasks = await taskApi.getTasks();
      if (allTasks.success && allTasks.data) {
        return allTasks.data.filter(task =>
          task.recurringPattern && task.status === status
        );
      }
      return [];
    } catch (error) {
      console.error('Error fetching recurring tasks by status:', error);
      throw error;
    }
  }

  /**
   * Get upcoming recurring task instances
   */
  async getUpcomingRecurringInstances(daysAhead: number = 30): Promise<Task[]> {
    try {
      const allTasks = await taskApi.getTasks();
      if (allTasks.success && allTasks.data) {
        const today = new Date();
        const futureDate = addDays(today, daysAhead);

        return allTasks.data.filter(task =>
          task.customFields?.isRecurringInstance &&
          task.dueDate &&
          isAfter(task.dueDate, today) &&
          isBefore(task.dueDate, futureDate)
        ).sort((a, b) => (a.dueDate?.getTime() || 0) - (b.dueDate?.getTime() || 0));
      }
      return [];
    } catch (error) {
      console.error('Error fetching upcoming recurring instances:', error);
      throw error;
    }
  }

  /**
   * Get overdue recurring task instances
   */
  async getOverdueRecurringInstances(): Promise<Task[]> {
    try {
      const allTasks = await taskApi.getTasks();
      if (allTasks.success && allTasks.data) {
        const today = new Date();

        return allTasks.data.filter(task =>
          task.customFields?.isRecurringInstance &&
          task.dueDate &&
          isBefore(task.dueDate, today) &&
          !task.completed
        ).sort((a, b) => (a.dueDate?.getTime() || 0) - (b.dueDate?.getTime() || 0));
      }
      return [];
    } catch (error) {
      console.error('Error fetching overdue recurring instances:', error);
      throw error;
    }
  }

  /**
   * Update status for multiple recurring instances
   */
  async updateRecurringInstancesStatus(instanceIds: string[], newStatus: TaskStatus): Promise<void> {
    try {
      for (const instanceId of instanceIds) {
        await taskApi.updateTask(instanceId, {
          status: newStatus,
          updatedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Error updating recurring instances status:', error);
      throw error;
    }
  }

  /**
   * Complete multiple recurring instances
   */
  async completeRecurringInstances(instanceIds: string[]): Promise<void> {
    try {
      for (const instanceId of instanceIds) {
        await this.completeRecurringInstance(instanceId);
      }
    } catch (error) {
      console.error('Error completing recurring instances:', error);
      throw error;
    }
  }

  /**
   * Delete multiple recurring instances
   */
  async deleteRecurringInstances(instanceIds: string[]): Promise<void> {
    try {
      for (const instanceId of instanceIds) {
        await taskApi.deleteTask(instanceId);
        this.taskStore.deleteTask(instanceId);
      }
    } catch (error) {
      console.error('Error deleting recurring instances:', error);
      throw error;
    }
  }

  /**
   * Get recurring task completion statistics
   */
  async getRecurringTaskCompletionStats(): Promise<{
    totalRecurringTasks: number;
    activeRecurringTasks: number;
    pausedRecurringTasks: number;
    completedInstances: number;
    pendingInstances: number;
  }> {
    try {
      const allTasks = await taskApi.getTasks();
      if (!allTasks.success || !allTasks.data) {
        return {
          totalRecurringTasks: 0,
          activeRecurringTasks: 0,
          pausedRecurringTasks: 0,
          completedInstances: 0,
          pendingInstances: 0
        };
      }

      const recurringTasks = allTasks.data.filter(task => task.recurringPattern);
      const recurringInstances = allTasks.data.filter(task => task.customFields?.isRecurringInstance);

      return {
        totalRecurringTasks: recurringTasks.length,
        activeRecurringTasks: recurringTasks.filter(t => t.status === 'active' && !t.customFields?.isPaused).length,
        pausedRecurringTasks: recurringTasks.filter(t => t.customFields?.isPaused).length,
        completedInstances: recurringInstances.filter(i => i.completed).length,
        pendingInstances: recurringInstances.filter(i => !i.completed).length
      };
    } catch (error) {
      console.error('Error getting recurring task completion stats:', error);
      throw error;
    }
  }

  /**
   * Get recurring task pattern distribution
   */
  async getRecurringTaskPatternDistribution(): Promise<Record<RecurringPattern, number>> {
    try {
      const allTasks = await taskApi.getTasks();
      if (allTasks.success && allTasks.data) {
        const patternCounts: Record<RecurringPattern, number> = {
          daily: 0,
          weekly: 0,
          monthly: 0,
          yearly: 0,
          custom: 0
        };

        allTasks.data.forEach(task => {
          if (task.recurringPattern) {
            patternCounts[task.recurringPattern]++;
          }
        });

        return patternCounts;
      }
      return {
        daily: 0,
        weekly: 0,
        monthly: 0,
        yearly: 0,
        custom: 0
      };
    } catch (error) {
      console.error('Error getting recurring task pattern distribution:', error);
      throw error;
    }
  }

  /**
   * Export recurring task configuration
   */
  exportRecurringTaskConfig(task: Task): string {
    if (!task.customFields?.recurringConfig) {
      throw new Error('Task has no recurring configuration to export');
    }

    return JSON.stringify({
      taskId: task.id,
      taskTitle: task.title,
      recurringConfig: task.customFields.recurringConfig,
      exportDate: new Date().toISOString()
    }, null, 2);
  }

  /**
   * Import recurring task configuration
   */
  async importRecurringTaskConfig(exportData: string): Promise<Task> {
    try {
      const configData = JSON.parse(exportData);

      if (!configData.taskId || !configData.recurringConfig) {
        throw new Error('Invalid recurring task export data');
      }

      // Find the original task
      const originalTask = this.taskStore.tasks.find(t => t.id === configData.taskId);
      if (!originalTask) {
        throw new Error('Original task not found');
      }

      // Update the task with the imported configuration
      return this.updateRecurringTask(configData.taskId, {
        recurringPattern: configData.recurringConfig.pattern,
        customFields: {
          ...originalTask.customFields,
          recurringConfig: configData.recurringConfig
        }
      });

    } catch (error) {
      console.error('Error importing recurring task configuration:', error);
      throw error;
    }
  }

  /**
   * Create a template from a recurring task
   */
  async createRecurringTaskTemplate(taskId: string, templateName: string): Promise<{
    templateId: string;
    templateName: string;
    recurringConfig: RecurringTaskConfig;
  }> {
    try {
      const task = await this.getRecurringTask(taskId);

      if (!task.customFields?.recurringConfig) {
        throw new Error('Task has no recurring configuration');
      }

      // In a real implementation, this would save to a template store
      return {
        templateId: `template-${Date.now()}`,
        templateName,
        recurringConfig: task.customFields.recurringConfig
      };

    } catch (error) {
      console.error('Error creating recurring task template:', error);
      throw error;
    }
  }

  /**
   * Apply a recurring task template
   */
  async applyRecurringTaskTemplate(
    taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed'>,
    template: {
      templateId: string;
      recurringConfig: RecurringTaskConfig;
    }
  ): Promise<Task> {
    return this.createRecurringTask(taskData, template.recurringConfig);
  }

  /**
   * Get recurring task history
   */
  async getRecurringTaskHistory(taskId: string, limit: number = 10): Promise<Array<{
    date: Date;
    action: string;
    details: any;
  }>> {
    try {
      const task = await this.getRecurringTask(taskId);
      const instances = this.getRecurringInstances(taskId);

      // Create a simple history based on instances
      const history = instances.map(instance => ({
        date: instance.updatedAt || new Date(),
        action: instance.completed ? 'completed' : 'created',
        details: {
          instanceId: instance.id,
          status: instance.status,
          dueDate: instance.dueDate
        }
      }));

      return history.slice(0, limit);

    } catch (error) {
      console.error('Error getting recurring task history:', error);
      throw error;
    }
  }

  /**
   * Get recurring task timeline
   */
  async getRecurringTaskTimeline(taskId: string): Promise<Array<{
    date: Date;
    type: 'original' | 'instance' | 'completion';
    title: string;
    details: any;
  }>> {
    try {
      const task = await this.getRecurringTask(taskId);
      const instances = this.getRecurringInstances(taskId);

      const timeline: Array<{
        date: Date;
        type: 'original' | 'instance' | 'completion';
        title: string;
        details: any;
      }> = [];

      // Add original task
      timeline.push({
        date: task.createdAt,
        type: 'original',
        title: 'Task Created',
        details: {
          taskId: task.id,
          title: task.title
        }
      });

      // Add instances
      instances.forEach(instance => {
        timeline.push({
          date: instance.createdAt,
          type: 'instance',
          title: instance.isGenerated ? 'Instance Generated' : 'Original Task',
          details: {
            instanceId: instance.id,
            dueDate: instance.dueDate,
            isGenerated: instance.isGenerated
          }
        });

        if (instance.completed) {
          timeline.push({
            date: instance.completedAt || new Date(),
            type: 'completion',
            title: 'Instance Completed',
            details: {
              instanceId: instance.id,
              completedAt: instance.completedAt
            }
          });
        }
      });

      // Sort by date
      return timeline.sort((a, b) => a.date.getTime() - b.date.getTime());

    } catch (error) {
      console.error('Error getting recurring task timeline:', error);
      throw error;
    }
  }

  /**
   * Get recurring task analytics
   */
  async getRecurringTaskAnalytics(taskId: string): Promise<{
    completionRate: number;
    averageCompletionTime: number;
    onTimeCompletionRate: number;
    patternConsistency: number;
  }> {
    try {
      const instances = this.getRecurringInstances(taskId);
      const completedInstances = instances.filter(i => i.completed);

      if (completedInstances.length === 0) {
        return {
          completionRate: 0,
          averageCompletionTime: 0,
          onTimeCompletionRate: 0,
          patternConsistency: 1
        };
      }

      // Calculate completion rate
      const completionRate = completedInstances.length / instances.length;

      // Calculate average completion time (simplified)
      const averageCompletionTime = 1; // Would calculate from actual data

      // Calculate on-time completion rate
      const onTimeCompletions = completedInstances.filter(instance =>
        instance.completedAt && instance.dueDate &&
        !isAfter(instance.completedAt, instance.dueDate)
      );
      const onTimeCompletionRate = onTimeCompletions.length / completedInstances.length;

      // Pattern consistency (simplified)
      const patternConsistency = 1; // Would calculate from actual pattern adherence

      return {
        completionRate,
        averageCompletionTime,
        onTimeCompletionRate,
        patternConsistency
      };

    } catch (error) {
      console.error('Error getting recurring task analytics:', error);
      throw error;
    }
  }

  /**
   * Get recurring task calendar view data
   */
  async getRecurringTaskCalendarData(
    taskId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{
    date: Date;
    instanceId: string;
    title: string;
    status: TaskStatus;
    isGenerated: boolean;
  }>> {
    try {
      const instances = this.getRecurringInstances(taskId);

      return instances
        .filter(instance =>
          instance.dueDate &&
          !isBefore(instance.dueDate, startDate) &&
          !isAfter(instance.dueDate, endDate)
        )
        .map(instance => ({
          date: instance.dueDate!,
          instanceId: instance.id,
          title: instance.isGenerated ? `${instance.title} (Recurring)` : instance.title,
          status: instance.status,
          isGenerated: instance.isGenerated
        }));

    } catch (error) {
      console.error('Error getting recurring task calendar data:', error);
      throw error;
    }
  }

  /**
   * Get recurring task Gantt chart data
   */
  async getRecurringTaskGanttData(taskId: string): Promise<Array<{
    instanceId: string;
    title: string;
    startDate: Date;
    endDate: Date;
    progress: number;
    isGenerated: boolean;
  }>> {
    try {
      const instances = this.getRecurringInstances(taskId);

      return instances.map(instance => ({
        instanceId: instance.id,
        title: instance.isGenerated ? `${instance.title} (Instance)` : instance.title,
        startDate: instance.createdAt,
        endDate: instance.dueDate || new Date(),
        progress: instance.completed ? 100 : 50,
        isGenerated: instance.isGenerated
      }));

    } catch (error) {
      console.error('Error getting recurring task Gantt data:', error);
      throw error;
    }
  }

  /**
   * Get recurring task dependency graph
   */
  async getRecurringTaskDependencyGraph(taskId: string): Promise<{
    nodes: Array<{ id: string; title: string; type: 'original' | 'instance' }>;
    edges: Array<{ from: string; to: string; type: 'generation' | 'dependency' }>;
  }> {
    try {
      const instances = this.getRecurringInstances(taskId);

      const nodes = instances.map(instance => ({
        id: instance.id,
        title: instance.isGenerated ? `${instance.title} (Instance)` : instance.title,
        type: instance.isGenerated ? 'instance' : 'original'
      }));

      const edges: Array<{ from: string; to: string; type: 'generation' | 'dependency' }> = [];

      // Add generation edges (original -> instances)
      const originalTask = instances.find(i => !i.isGenerated);
      if (originalTask) {
        instances
          .filter(i => i.isGenerated)
          .forEach(instance => {
            edges.push({
              from: originalTask.id,
              to: instance.id,
              type: 'generation'
            });
          });
      }

      return { nodes, edges };

    } catch (error) {
      console.error('Error getting recurring task dependency graph:', error);
      throw error;
    }
  }
}

// Singleton instance
export const recurringTaskService = RecurringTaskService.getInstance();