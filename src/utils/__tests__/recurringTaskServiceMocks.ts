/**
 * Recurring Task Service Mocks
 * Comprehensive mock implementations for recurring task services
 * Provides realistic mock behavior for testing without real service dependencies
 */

import { Task, RecurringTaskConfig, RecurringPatternConfig } from '../../types/task';
import { RecurringPattern, TaskStatus, PriorityLevel } from '../../types/enums';
import { addDays, addWeeks, addMonths, addYears } from 'date-fns';
import { faker } from '@faker-js/faker';

/**
 * Mock Recurring Task Service
 */
export class MockRecurringTaskService {
  private tasks: Task[] = [];
  private instances: Task[] = [];
  private callHistory: Array<{ method: string; args: any[]; timestamp: Date }> = [];

  constructor(initialTasks: Task[] = []) {
    this.tasks = [...initialTasks];
  }

  /**
   * Create a new recurring task (mock)
   */
  async createRecurringTask(
    taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed'>,
    config: RecurringTaskConfig
  ): Promise<Task> {
    const newTask: Task = {
      ...taskData,
      id: `mock-task-${faker.string.uuid()}`,
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

    this.tasks.push(newTask);
    this.recordCall('createRecurringTask', [taskData, config]);

    // Generate initial instances
    await this.generateRecurringInstances(newTask, config);

    return newTask;
  }

  /**
   * Get recurring tasks (mock)
   */
  async getRecurringTasks(): Promise<Task[]> {
    this.recordCall('getRecurringTasks', []);
    return this.tasks.filter(task => task.recurringPattern);
  }

  /**
   * Get recurring task by ID (mock)
   */
  async getRecurringTask(taskId: string): Promise<Task> {
    this.recordCall('getRecurringTask', [taskId]);
    const task = this.tasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error('Task not found');
    }
    return task;
  }

  /**
   * Update a recurring task (mock)
   */
  async updateRecurringTask(
    taskId: string,
    updates: Partial<Task>,
    configUpdates?: Partial<RecurringTaskConfig>
  ): Promise<Task> {
    this.recordCall('updateRecurringTask', [taskId, updates, configUpdates]);

    const taskIndex = this.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    const updatedTask = {
      ...this.tasks[taskIndex],
      ...updates,
      updatedAt: new Date(),
      customFields: {
        ...this.tasks[taskIndex].customFields,
        ...(updates.customFields || {}),
        ...(configUpdates && {
          recurringConfig: {
            ...this.tasks[taskIndex].customFields?.recurringConfig,
            ...configUpdates
          }
        })
      }
    };

    this.tasks[taskIndex] = updatedTask;

    // Regenerate instances if config changed
    if (configUpdates) {
      await this.regenerateRecurringInstances(updatedTask, {
        ...this.tasks[taskIndex].customFields?.recurringConfig,
        ...configUpdates
      });
    }

    return updatedTask;
  }

  /**
   * Delete a recurring task (mock)
   */
  async deleteRecurringTask(taskId: string, confirm: boolean = true): Promise<void> {
    this.recordCall('deleteRecurringTask', [taskId, confirm]);

    const taskIndex = this.tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }

    // Remove all instances first
    this.instances = this.instances.filter(i =>
      i.customFields?.originalTaskId !== taskId
    );

    // Remove the task
    this.tasks.splice(taskIndex, 1);
  }

  /**
   * Generate recurring instances (mock)
   */
  async generateRecurringInstances(
    task: Task,
    config: RecurringTaskConfig
  ): Promise<Task[]> {
    this.recordCall('generateRecurringInstances', [task, config]);

    if (!task.recurringPattern || !task.dueDate) {
      return [];
    }

    const instances: Task[] = [];
    const startDate = new Date(task.dueDate);
    const endDate = config.endDate ? new Date(config.endDate) : null;
    const maxCount = config.maxOccurrences || 10;

    let currentDate = new Date(startDate);
    let count = 0;

    // Add the original task instance
    instances.push({
      ...task,
      customFields: {
        ...task.customFields,
        originalTaskId: task.id,
        isRecurringInstance: false
      }
    });

    // Generate future instances
    while (true) {
      if (endDate && currentDate > endDate) break;
      if (count >= maxCount) break;

      currentDate = this.getNextDate(currentDate, task.recurringPattern, config);
      if (currentDate < new Date()) continue; // Skip past dates

      const instanceId = `${task.id}-instance-${count + 1}`;

      const generatedTask: Task = {
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

      instances.push(generatedTask);
      this.instances.push(generatedTask);

      count++;
    }

    return instances;
  }

  /**
   * Regenerate all instances for a recurring task (mock)
   */
  async regenerateRecurringInstances(
    task: Task,
    config: RecurringTaskConfig
  ): Promise<void> {
    this.recordCall('regenerateRecurringInstances', [task, config]);

    // Remove existing instances
    this.instances = this.instances.filter(i =>
      i.customFields?.originalTaskId !== task.id
    );

    // Generate new instances
    await this.generateRecurringInstances(task, config);
  }

  /**
   * Complete a recurring instance (mock)
   */
  async completeRecurringInstance(instanceId: string): Promise<Task> {
    this.recordCall('completeRecurringInstance', [instanceId]);

    const instanceIndex = this.instances.findIndex(i => i.id === instanceId);
    if (instanceIndex === -1) {
      throw new Error('Instance not found');
    }

    const completedInstance = {
      ...this.instances[instanceIndex],
      completed: true,
      completedAt: new Date(),
      status: 'completed'
    };

    this.instances[instanceIndex] = completedInstance;

    // Check if we should generate next instance
    const originalTask = this.tasks.find(t =>
      t.id === completedInstance.customFields?.originalTaskId
    );

    if (originalTask && originalTask.recurringPattern) {
      const config = originalTask.customFields?.recurringConfig;
      if (config && (!config.endDate || !config.maxOccurrences)) {
        await this.generateNextRecurringInstance(originalTask);
      }
    }

    return completedInstance;
  }

  /**
   * Get recurring task statistics (mock)
   */
  getRecurringTaskStats(taskId: string): {
    totalInstances: number;
    completedInstances: number;
    pendingInstances: number;
    nextInstanceDate?: Date;
  } {
    this.recordCall('getRecurringTaskStats', [taskId]);

    const instances = this.getRecurringInstances(taskId);
    const completedInstances = instances.filter(i => i.completed);
    const pendingInstances = instances.filter(i => !i.completed && i.status !== 'archived');

    const futureInstances = instances
      .filter(i => !i.completed && i.dueDate && i.dueDate > new Date())
      .sort((a, b) => (a.dueDate?.getTime() || 0) - (b.dueDate?.getTime() || 0));

    return {
      totalInstances: instances.length,
      completedInstances: completedInstances.length,
      pendingInstances: pendingInstances.length,
      nextInstanceDate: futureInstances.length > 0 ? futureInstances[0].dueDate : undefined
    };
  }

  /**
   * Get all instances for a recurring task (mock)
   */
  getRecurringInstances(taskId: string): Task[] {
    this.recordCall('getRecurringInstances', [taskId]);
    return [
      ...this.tasks.filter(t => t.id === taskId),
      ...this.instances.filter(i => i.customFields?.originalTaskId === taskId)
    ].sort((a, b) => (a.dueDate?.getTime() || 0) - (b.dueDate?.getTime() || 0));
  }

  /**
   * Get upcoming recurring instances (mock)
   */
  async getUpcomingRecurringInstances(daysAhead: number = 30): Promise<Task[]> {
    this.recordCall('getUpcomingRecurringInstances', [daysAhead]);

    const today = new Date();
    const futureDate = addDays(today, daysAhead);

    return this.instances.filter(instance =>
      instance.customFields?.isRecurringInstance &&
      instance.dueDate &&
      instance.dueDate > today &&
      instance.dueDate < futureDate
    ).sort((a, b) => (a.dueDate?.getTime() || 0) - (b.dueDate?.getTime() || 0));
  }

  /**
   * Get overdue recurring instances (mock)
   */
  async getOverdueRecurringInstances(): Promise<Task[]> {
    this.recordCall('getOverdueRecurringInstances', []);

    const today = new Date();

    return this.instances.filter(instance =>
      instance.customFields?.isRecurringInstance &&
      instance.dueDate &&
      instance.dueDate < today &&
      !instance.completed
    ).sort((a, b) => (a.dueDate?.getTime() || 0) - (b.dueDate?.getTime() || 0));
  }

  /**
   * Get recurring task completion statistics (mock)
   */
  async getRecurringTaskCompletionStats(): Promise<{
    totalRecurringTasks: number;
    activeRecurringTasks: number;
    pausedRecurringTasks: number;
    completedInstances: number;
    pendingInstances: number;
  }> {
    this.recordCall('getRecurringTaskCompletionStats', []);

    const recurringTasks = this.tasks.filter(task => task.recurringPattern);
    const recurringInstances = this.instances.filter(instance =>
      instance.customFields?.isRecurringInstance
    );

    return {
      totalRecurringTasks: recurringTasks.length,
      activeRecurringTasks: recurringTasks.filter(t =>
        t.status === 'active' && !t.customFields?.isPaused
      ).length,
      pausedRecurringTasks: recurringTasks.filter(t =>
        t.customFields?.isPaused
      ).length,
      completedInstances: recurringInstances.filter(i => i.completed).length,
      pendingInstances: recurringInstances.filter(i => !i.completed).length
    };
  }

  /**
   * Get recurring task pattern distribution (mock)
   */
  async getRecurringTaskPatternDistribution(): Promise<Record<RecurringPattern, number>> {
    this.recordCall('getRecurringTaskPatternDistribution', []);

    const patternCounts: Record<RecurringPattern, number> = {
      daily: 0,
      weekly: 0,
      monthly: 0,
      yearly: 0,
      custom: 0
    };

    this.tasks.forEach(task => {
      if (task.recurringPattern) {
        patternCounts[task.recurringPattern]++;
      }
    });

    return patternCounts;
  }

  /**
   * Reset mock service state
   */
  reset(): void {
    this.tasks = [];
    this.instances = [];
    this.callHistory = [];
  }

  /**
   * Get call history for testing
   */
  getCallHistory(): Array<{ method: string; args: any[]; timestamp: Date }> {
    return this.callHistory;
  }

  /**
   * Clear call history
   */
  clearCallHistory(): void {
    this.callHistory = [];
  }

  // Private helper methods

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
        if (config?.customUnit === 'days') {
          return addDays(currentDate, config.customInterval || 1);
        } else if (config?.customUnit === 'weeks') {
          return addWeeks(currentDate, config.customInterval || 1);
        } else if (config?.customUnit === 'months') {
          return addMonths(currentDate, config.customInterval || 1);
        } else if (config?.customUnit === 'years') {
          return addYears(currentDate, config.customInterval || 1);
        }
        return addWeeks(currentDate, config?.customInterval || 1);
    }
  }

  private generateNextRecurringInstance(task: Task): Promise<Task | null> {
    this.recordCall('generateNextRecurringInstance', [task]);

    if (!task.recurringPattern || !task.dueDate) {
      return Promise.resolve(null);
    }

    const config = task.customFields?.recurringConfig;
    if (!config) {
      return Promise.resolve(null);
    }

    // Find the most recent instance
    const instances = this.getRecurringInstances(task.id);
    const latestInstance = instances.length > 0 ? instances[instances.length - 1] : task;
    const nextDate = this.getNextDate(
      new Date(latestInstance.dueDate || task.dueDate),
      task.recurringPattern,
      config
    );

    // Check if we should generate more instances
    if (config.endDate && nextDate > new Date(config.endDate)) {
      return Promise.resolve(null);
    }

    if (config.maxOccurrences) {
      const instanceCount = instances.length;
      if (instanceCount >= config.maxOccurrences) {
        return Promise.resolve(null);
      }
    }

    const instanceId = `${task.id}-instance-${instances.length + 1}`;

    const generatedTask: Task = {
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

    this.instances.push(generatedTask);
    return Promise.resolve(generatedTask);
  }

  private recordCall(method: string, args: any[]): void {
    this.callHistory.push({
      method,
      args,
      timestamp: new Date()
    });
  }
}

/**
 * Mock Recurring Pattern Service
 */
export class MockRecurringPatternService {
  private callHistory: Array<{ method: string; args: any[]; timestamp: Date }> = [];

  /**
   * Validate pattern configuration (mock)
   */
  validatePatternConfig(config: RecurringPatternConfig): { valid: boolean; errors: string[] } {
    this.recordCall('validatePatternConfig', [config]);

    const errors: string[] = [];

    if (!config.pattern) {
      errors.push('Pattern is required');
    }

    if (!config.startDate) {
      errors.push('Start date is required');
    }

    if (config.maxOccurrences && config.maxOccurrences < 1) {
      errors.push('Maximum occurrences must be at least 1');
    }

    if (config.interval && config.interval < 1) {
      errors.push('Interval must be at least 1');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Generate recurring dates (mock)
   */
  generateRecurringDates(
    startDate: Date,
    config: RecurringPatternConfig,
    count: number
  ): Date[] {
    this.recordCall('generateRecurringDates', [startDate, config, count]);

    const dates: Date[] = [];
    let currentDate = new Date(startDate);

    for (let i = 0; i < count; i++) {
      dates.push(new Date(currentDate));

      if (config.pattern === 'daily') {
        currentDate = addDays(currentDate, config.interval || 1);
      } else if (config.pattern === 'weekly') {
        currentDate = addWeeks(currentDate, config.interval || 1);
      } else if (config.pattern === 'monthly') {
        currentDate = addMonths(currentDate, config.interval || 1);
      } else if (config.pattern === 'yearly') {
        currentDate = addYears(currentDate, config.interval || 1);
      } else if (config.pattern === 'custom') {
        if (config.customUnit === 'days') {
          currentDate = addDays(currentDate, config.interval || 1);
        } else if (config.customUnit === 'weeks') {
          currentDate = addWeeks(currentDate, config.interval || 1);
        } else if (config.customUnit === 'months') {
          currentDate = addMonths(currentDate, config.interval || 1);
        } else if (config.customUnit === 'years') {
          currentDate = addYears(currentDate, config.interval || 1);
        }
      }
    }

    return dates;
  }

  /**
   * Get default pattern configuration (mock)
   */
  getDefaultPatternConfig(pattern: RecurringPattern): RecurringPatternConfig {
    this.recordCall('getDefaultPatternConfig', [pattern]);

    const baseConfig: RecurringPatternConfig = {
      pattern,
      frequency: pattern,
      endCondition: 'never',
      endDate: null,
      maxOccurrences: null,
      interval: 1,
      customDays: null,
      customMonthDays: null,
      customMonthPosition: null,
      customMonthDay: null
    };

    return baseConfig;
  }

  /**
   * Reset mock service state
   */
  reset(): void {
    this.callHistory = [];
  }

  /**
   * Get call history for testing
   */
  getCallHistory(): Array<{ method: string; args: any[]; timestamp: Date }> {
    return this.callHistory;
  }

  private recordCall(method: string, args: any[]): void {
    this.callHistory.push({
      method,
      args,
      timestamp: new Date()
    });
  }
}

/**
 * Mock Recurring Task Integration Service
 */
export class MockRecurringTaskIntegration {
  private mockTaskService: MockRecurringTaskService;
  private mockPatternService: MockRecurringPatternService;
  private callHistory: Array<{ method: string; args: any[]; timestamp: Date }> = [];

  constructor() {
    this.mockTaskService = new MockRecurringTaskService();
    this.mockPatternService = new MockRecurringPatternService();
  }

  /**
   * Initialize mock services
   */
  initialize(): void {
    this.recordCall('initialize', []);
  }

  /**
   * Create recurring task with full integration (mock)
   */
  async createRecurringTaskIntegrated(
    taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed'>,
    config: RecurringTaskConfig
  ): Promise<Task> {
    this.recordCall('createRecurringTaskIntegrated', [taskData, config]);

    // Validate configuration
    const validation = this.mockPatternService.validatePatternConfig({
      pattern: config.pattern,
      startDate: config.startDate,
      endDate: config.endDate,
      maxOccurrences: config.maxOccurrences,
      interval: config.customInterval || 1,
      customUnit: config.customUnit || null
    });

    if (!validation.valid) {
      throw new Error(`Invalid configuration: ${validation.errors.join(', ')}`);
    }

    // Create the task
    return this.mockTaskService.createRecurringTask(taskData, config);
  }

  /**
   * Get comprehensive recurring task data (mock)
   */
  async getComprehensiveRecurringTaskData(taskId: string): Promise<{
    task: Task;
    instances: Task[];
    stats: {
      totalInstances: number;
      completedInstances: number;
      pendingInstances: number;
      nextInstanceDate?: Date;
    };
  }> {
    this.recordCall('getComprehensiveRecurringTaskData', [taskId]);

    const task = await this.mockTaskService.getRecurringTask(taskId);
    const instances = this.mockTaskService.getRecurringInstances(taskId);
    const stats = this.mockTaskService.getRecurringTaskStats(taskId);

    return {
      task,
      instances,
      stats
    };
  }

  /**
   * Get system health report (mock)
   */
  async getSystemHealthReport(): Promise<{
    healthScore: number;
    issuesCount: number;
    recommendationsCount: number;
    performanceMetrics: {
      averageResponseTime: number;
      memoryUsage: number;
      errorRate: number;
    };
  }> {
    this.recordCall('getSystemHealthReport', []);

    return {
      healthScore: 95,
      issuesCount: 0,
      recommendationsCount: 0,
      performanceMetrics: {
        averageResponseTime: 150,
        memoryUsage: 1024,
        errorRate: 0.01
      }
    };
  }

  /**
   * Reset all mock services
   */
  reset(): void {
    this.recordCall('reset', []);
    this.mockTaskService.reset();
    this.mockPatternService.reset();
    this.callHistory = [];
  }

  /**
   * Get call history for testing
   */
  getCallHistory(): Array<{ method: string; args: any[]; timestamp: Date }> {
    return [
      ...this.callHistory,
      ...this.mockTaskService.getCallHistory().map(call => ({
        ...call,
        method: `taskService.${call.method}`
      })),
      ...this.mockPatternService.getCallHistory().map(call => ({
        ...call,
        method: `patternService.${call.method}`
      }))
    ];
  }

  private recordCall(method: string, args: any[]): void {
    this.callHistory.push({
      method,
      args,
      timestamp: new Date()
    });
  }
}

// Singleton instances
export const mockRecurringTaskService = new MockRecurringTaskService();
export const mockRecurringPatternService = new MockRecurringPatternService();
export const mockRecurringTaskIntegration = new MockRecurringTaskIntegration();