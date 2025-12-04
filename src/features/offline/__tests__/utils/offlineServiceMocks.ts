/**
 * Offline Service Mocks
 * Comprehensive mock implementations for offline services
 */

import { Task } from '../../../../types/task';
import { OfflineQueueItem, OfflineQueuePriority } from '../../../../types/offlineTypes';
import { generateMockTask, generateOfflineQueueItem, generateStorageStats } from './offlineTestDataGenerators';

/**
 * Mock Offline Task Service
 */
export class MockOfflineTaskService {
  private queueItems: OfflineQueueItem[] = [];
  private isOffline: boolean = false;

  constructor(isOffline: boolean = false) {
    this.isOffline = isOffline;
  }

  async createTaskOffline(taskData: Omit<Task, 'id'>): Promise<Task> {
    if (this.isOffline) {
      const queueItem = generateOfflineQueueItem('create', 'high', {
        data: taskData,
        operation: `Create task: ${taskData.title}`
      });
      this.queueItems.push(queueItem);

      return {
        ...taskData,
        id: `temp-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        completed: false,
        status: 'todo',
        priority: taskData.priority || 'medium'
      };
    } else {
      return {
        ...taskData,
        id: `online-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    }
  }

  async updateTaskOffline(taskId: string, taskData: Partial<Task>): Promise<Task> {
    if (this.isOffline) {
      const queueItem = generateOfflineQueueItem('update', 'high', {
        data: {
          taskId,
          updates: taskData
        },
        operation: `Update task: ${taskId}`
      });
      this.queueItems.push(queueItem);

      return {
        ...taskData,
        id: taskId,
        updatedAt: new Date()
      } as Task;
    } else {
      return {
        ...taskData,
        id: taskId,
        updatedAt: new Date()
      } as Task;
    }
  }

  async deleteTaskOffline(taskId: string): Promise<void> {
    if (this.isOffline) {
      const queueItem = generateOfflineQueueItem('delete', 'medium', {
        data: { taskId },
        operation: `Delete task: ${taskId}`
      });
      this.queueItems.push(queueItem);
    }
  }

  async toggleTaskCompletionOffline(taskId: string): Promise<Task> {
    if (this.isOffline) {
      const queueItem = generateOfflineQueueItem('update', 'high', {
        data: {
          taskId,
          operation: 'toggleCompletion'
        },
        operation: `Toggle completion: ${taskId}`
      });
      this.queueItems.push(queueItem);

      return {
        id: taskId,
        completed: true,
        completedAt: new Date(),
        updatedAt: new Date()
      } as Task;
    } else {
      return {
        id: taskId,
        completed: true,
        completedAt: new Date(),
        updatedAt: new Date()
      } as Task;
    }
  }

  async processOfflineTaskQueue(): Promise<void> {
    if (this.isOffline) {
      throw new Error('Cannot process queue while offline');
    }

    // Process all items in queue
    this.queueItems = this.queueItems.map(item => ({
      ...item,
      status: 'completed',
      attempts: item.attempts + 1,
      lastAttempt: new Date()
    }));

    // Clear completed items
    this.queueItems = this.queueItems.filter(item => item.status !== 'completed');
  }

  getOfflineTaskQueueStatus(): {
    pendingTasks: number;
    failedTasks: number;
    totalTasks: number;
  } {
    return {
      pendingTasks: this.queueItems.filter(item => item.status === 'pending').length,
      failedTasks: this.queueItems.filter(item => item.status === 'failed').length,
      totalTasks: this.queueItems.length
    };
  }

  hasPendingOfflineTaskOperations(): boolean {
    return this.queueItems.some(item => item.status === 'pending');
  }

  getQueueItems(): OfflineQueueItem[] {
    return this.queueItems;
  }

  clearQueue(): void {
    this.queueItems = [];
  }

  setOfflineStatus(isOffline: boolean): void {
    this.isOffline = isOffline;
  }
}

/**
 * Mock Offline Data Persistence Service
 */
export class MockOfflineDataPersistence {
  private tasks: Task[] = [];
  private operations: OfflineQueueItem[] = [];
  private isInitialized: boolean = false;

  async initialize(): Promise<void> {
    this.isInitialized = true;
  }

  async storeOfflineTasks(tasks: Task[]): Promise<void> {
    this.tasks = [...this.tasks, ...tasks];
  }

  async getOfflineTasks(): Promise<Task[]> {
    return this.tasks;
  }

  async storeOfflineOperation(operation: OfflineQueueItem): Promise<void> {
    this.operations.push(operation);
  }

  async getOfflineOperations(): Promise<OfflineQueueItem[]> {
    return this.operations;
  }

  async processOfflineOperations(): Promise<void> {
    // Mark all operations as completed
    this.operations = this.operations.map(op => ({
      ...op,
      status: 'completed',
      attempts: op.attempts + 1,
      lastAttempt: new Date()
    }));

    // Clear completed operations
    this.operations = this.operations.filter(op => op.status !== 'completed');
  }

  async syncOfflineData(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Not initialized');
    }

    // Simulate sync process
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  getSyncStatus(): {
    isSyncing: boolean;
    lastSynced: Date | null;
    pendingOperations: number;
  } {
    return {
      isSyncing: false,
      lastSynced: new Date(),
      pendingOperations: this.operations.length
    };
  }

  async getOfflineStorageStats(): Promise<{
    taskCount: number;
    queueSize: number;
    storageUsage: number;
  }> {
    return generateStorageStats({
      taskCount: this.tasks.length,
      queueSize: this.operations.length,
      storageUsage: JSON.stringify(this.tasks).length + JSON.stringify(this.operations).length
    });
  }

  needsSync(): boolean {
    return this.operations.length > 0;
  }

  async clearOfflineData(): Promise<void> {
    this.tasks = [];
    this.operations = [];
    this.isInitialized = false;
  }

  setupAutoSync(): void {
    // Mock auto-sync setup
  }
}

/**
 * Mock Offline Sync Service
 */
export class MockOfflineSyncService {
  private isOffline: boolean = false;
  private syncStatus: any = {
    isSyncing: false,
    lastSynced: null,
    pendingOperations: 0,
    status: 'idle',
    error: null
  };

  constructor(isOffline: boolean = false) {
    this.isOffline = isOffline;
  }

  needsSync(): boolean {
    return !this.isOffline && this.syncStatus.pendingOperations > 0;
  }

  async autoSync(): Promise<void> {
    if (this.isOffline) {
      throw new Error('Cannot auto-sync while offline');
    }

    if (!this.needsSync()) {
      return;
    }

    await this.syncAll();
  }

  async syncAll(): Promise<void> {
    if (this.isOffline) {
      throw new Error('Cannot sync while offline');
    }

    this.syncStatus = {
      ...this.syncStatus,
      isSyncing: true,
      status: 'syncing',
      syncStartTime: new Date()
    };

    // Simulate sync process
    await new Promise(resolve => setTimeout(resolve, 200));

    this.syncStatus = {
      ...this.syncStatus,
      isSyncing: false,
      status: 'completed',
      lastSynced: new Date(),
      syncEndTime: new Date(),
      syncDuration: 200,
      pendingOperations: 0
    };
  }

  getSyncStatus(): {
    isSyncing: boolean;
    lastSynced: Date | null;
    pendingOperations: number;
    status: any;
    error: Error | null;
  } {
    return this.syncStatus;
  }

  async getSyncStatistics(): Promise<{
    totalOperations: number;
    completedOperations: number;
    failedOperations: number;
    syncDuration: number | null;
    lastSyncSize: number;
  }> {
    return {
      totalOperations: 10,
      completedOperations: 8,
      failedOperations: 2,
      syncDuration: 200,
      lastSyncSize: 5
    };
  }

  async processSyncQueue(): Promise<void> {
    if (this.isOffline) {
      throw new Error('Cannot process sync queue while offline');
    }

    // Simulate queue processing
    await new Promise(resolve => setTimeout(resolve, 150));
  }

  async retryFailedOperations(): Promise<void> {
    // Simulate retry process
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  async clearSyncQueue(): Promise<void> {
    this.syncStatus.pendingOperations = 0;
  }

  getQueueStatistics(): {
    totalItems: number;
    pendingItems: number;
    completedItems: number;
    failedItems: number;
  } {
    return {
      totalItems: 10,
      pendingItems: 2,
      completedItems: 7,
      failedItems: 1
    };
  }

  setupPeriodicSync(interval: number = 30000): () => void {
    return () => {}; // Mock cleanup function
  }

  pauseSync(): void {
    this.syncStatus = {
      ...this.syncStatus,
      isPaused: true,
      status: this.syncStatus.status === 'syncing' ? 'paused' : this.syncStatus.status
    };
  }

  resumeSync(): void {
    this.syncStatus = {
      ...this.syncStatus,
      isPaused: false,
      status: this.syncStatus.status === 'paused' ? 'syncing' : this.syncStatus.status
    };
  }

  getComprehensiveOfflineStatus(): {
    isOffline: boolean;
    networkStatus: string;
    pendingChanges: number;
    queueStatus: {
      total: number;
      pending: number;
      failed: number;
    };
    syncStatus: any;
    lastSync: Date | null;
  } {
    return {
      isOffline: this.isOffline,
      networkStatus: this.isOffline ? 'offline' : 'online',
      pendingChanges: this.syncStatus.pendingOperations,
      queueStatus: {
        total: 10,
        pending: 2,
        failed: 1
      },
      syncStatus: this.syncStatus.status,
      lastSync: this.syncStatus.lastSynced
    };
  }

  setOfflineStatus(isOffline: boolean): void {
    this.isOffline = isOffline;
  }
}

/**
 * Mock Offline Store
 */
export class MockOfflineStore {
  private state: any;

  constructor(initialState: any = {}) {
    this.state = {
      status: {
        isOffline: false,
        status: 'online',
        ...initialState.status
      },
      queue: {
        items: [],
        ...initialState.queue
      },
      sync: {
        status: 'idle',
        ...initialState.sync
      },
      settings: {
        autoSyncEnabled: true,
        syncInterval: 30000,
        maxQueueSize: 100,
        ...initialState.settings
      },
      ...initialState
    };
  }

  getState() {
    return this.state;
  }

  setState(newState: Partial<any>) {
    this.state = {
      ...this.state,
      ...newState
    };
  }

  subscribe(callback: (state: any) => void) {
    return () => {}; // Mock unsubscribe
  }
}

/**
 * Create mock instances for testing
 */
export const createMockServices = (isOffline: boolean = false) => {
  const mockTaskService = new MockOfflineTaskService(isOffline);
  const mockDataPersistence = new MockOfflineDataPersistence();
  const mockSyncService = new MockOfflineSyncService(isOffline);
  const mockStore = new MockOfflineStore();

  return {
    offlineTaskService: mockTaskService,
    offlineDataPersistence: mockDataPersistence,
    offlineSyncService: mockSyncService,
    useOfflineStore: mockStore
  };
};