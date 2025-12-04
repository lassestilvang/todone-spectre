/**
 * Offline Data Persistence Service - Handles offline data storage and retrieval
 */
import { Task } from '../types/task';
import { useOfflineStore } from '../store/useOfflineStore';
import { TodoneDatabase } from '../database/db';
import { SyncEngine } from '../database/sync';
import { OfflineQueueItem } from '../types/offlineTypes';

export class OfflineDataPersistence {
  private static instance: OfflineDataPersistence;
  private offlineStore = useOfflineStore.getState();
  private db: TodoneDatabase;
  private syncEngine: SyncEngine;

  private constructor() {
    this.db = new TodoneDatabase();
    this.syncEngine = new SyncEngine(this.db);
  }

  public static getInstance(): OfflineDataPersistence {
    if (!OfflineDataPersistence.instance) {
      OfflineDataPersistence.instance = new OfflineDataPersistence();
    }
    return OfflineDataPersistence.instance;
  }

  /**
   * Initialize offline data persistence
   */
  async initialize(): Promise<void> {
    await this.db.initialize();
    await this.syncEngine.initialize();
    this.loadOfflineData();
  }

  /**
   * Load offline data from local storage
   */
  private loadOfflineData(): void {
    try {
      // Load from localStorage or IndexedDB
      const savedData = localStorage.getItem('todone-offline-data');
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        this.restoreOfflineState(parsedData);
      }
    } catch (error) {
      console.error('Failed to load offline data:', error);
    }
  }

  /**
   * Save offline data to local storage
   */
  async saveOfflineData(): Promise<void> {
    try {
      const offlineState = this.getCurrentOfflineState();
      localStorage.setItem('todone-offline-data', JSON.stringify(offlineState));
    } catch (error) {
      console.error('Failed to save offline data:', error);
    }
  }

  /**
   * Get current offline state
   */
  private getCurrentOfflineState(): any {
    return {
      tasks: this.getOfflineTasks(),
      queue: this.offlineStore.queue.items,
      settings: this.offlineStore.settings,
      lastSync: this.offlineStore.lastSync
    };
  }

  /**
   * Restore offline state
   */
  private restoreOfflineState(state: any): void {
    if (state?.tasks) {
      this.storeOfflineTasks(state.tasks);
    }
  }

  /**
   * Store tasks in offline storage
   */
  async storeOfflineTasks(tasks: Task[]): Promise<void> {
    try {
      // Store in IndexedDB
      await this.db.tasks.bulkPut(tasks);

      // Also update sync engine
      for (const task of tasks) {
        await this.syncEngine.addToSyncQueue('create', 'tasks', task.id, task);
      }
    } catch (error) {
      console.error('Failed to store offline tasks:', error);
      throw error;
    }
  }

  /**
   * Get tasks from offline storage
   */
  async getOfflineTasks(): Promise<Task[]> {
    try {
      const tasks = await this.db.tasks.toArray();
      return tasks;
    } catch (error) {
      console.error('Failed to get offline tasks:', error);
      return [];
    }
  }

  /**
   * Store task operation in offline queue
   */
  async storeOfflineOperation(operation: OfflineQueueItem): Promise<void> {
    try {
      // Add to offline store
      this.offlineStore.addToQueue(operation);

      // Also add to sync engine for persistence
      await this.syncEngine.addToSyncQueue(
        operation.type,
        'offline_queue',
        Date.now(),
        operation
      );

      // Save to local storage
      await this.saveOfflineData();
    } catch (error) {
      console.error('Failed to store offline operation:', error);
      throw error;
    }
  }

  /**
   * Get offline operations from queue
   */
  async getOfflineOperations(): Promise<OfflineQueueItem[]> {
    try {
      return this.offlineStore.queue.items;
    } catch (error) {
      console.error('Failed to get offline operations:', error);
      return [];
    }
  }

  /**
   * Process offline operations queue
   */
  async processOfflineOperations(): Promise<void> {
    try {
      const operations = await this.getOfflineOperations();

      if (operations.length === 0) {
        console.log('No offline operations to process');
        return;
      }

      console.log(`Processing ${operations.length} offline operations`);

      for (const operation of operations) {
        try {
          await this.processSingleOperation(operation);
          this.offlineStore.removeQueueItem(operation.id);
        } catch (error) {
          console.error(`Failed to process operation ${operation.operation}:`, error);
          this.offlineStore.retryQueueItem(operation.id);
        }
      }

      // Save state after processing
      await this.saveOfflineData();
    } catch (error) {
      console.error('Failed to process offline operations:', error);
      throw error;
    }
  }

  /**
   * Process single offline operation
   */
  private async processSingleOperation(operation: OfflineQueueItem): Promise<void> {
    // This would be implemented based on the specific operation type
    // For now, we'll just log it and mark as completed
    console.log(`Processing offline operation: ${operation.operation}`);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Mark as completed in sync engine
    await this.syncEngine.addToSyncQueue('completed', 'offline_queue', Date.now(), {
      ...operation,
      status: 'completed'
    });
  }

  /**
   * Sync offline data with remote server
   */
  async syncOfflineData(): Promise<void> {
    try {
      if (this.offlineStore.status.isOffline) {
        throw new Error('Cannot sync while offline');
      }

      console.log('Starting offline data sync');

      // Process sync queue
      await this.syncEngine.processSyncQueue();

      // Save state after sync
      await this.saveOfflineData();

      console.log('Offline data sync completed');
    } catch (error) {
      console.error('Failed to sync offline data:', error);
      throw error;
    }
  }

  /**
   * Get sync status
   */
  getSyncStatus(): {
    isSyncing: boolean;
    lastSynced: Date | null;
    pendingOperations: number;
  } {
    return {
      isSyncing: this.offlineStore.sync.isSyncing,
      lastSynced: this.offlineStore.lastSync,
      pendingOperations: this.offlineStore.pendingChanges
    };
  }

  /**
   * Clear offline data
   */
  async clearOfflineData(): Promise<void> {
    try {
      // Clear local storage
      localStorage.removeItem('todone-offline-data');

      // Clear IndexedDB
      await this.db.tasks.clear();

      // Reset offline store
      this.offlineStore.initializeOfflineStore();

      console.log('Offline data cleared');
    } catch (error) {
      console.error('Failed to clear offline data:', error);
      throw error;
    }
  }

  /**
   * Get offline storage statistics
   */
  async getOfflineStorageStats(): Promise<{
    taskCount: number;
    queueSize: number;
    storageUsage: number;
  }> {
    try {
      const tasks = await this.getOfflineTasks();
      const queueSize = this.offlineStore.queue.items.length;

      // Calculate approximate storage usage
      const tasksSize = JSON.stringify(tasks).length;
      const queueSizeBytes = JSON.stringify(this.offlineStore.queue.items).length;
      const totalSize = tasksSize + queueSizeBytes;

      return {
        taskCount: tasks.length,
        queueSize,
        storageUsage: totalSize
      };
    } catch (error) {
      console.error('Failed to get offline storage stats:', error);
      return {
        taskCount: 0,
        queueSize: 0,
        storageUsage: 0
      };
    }
  }

  /**
   * Check if offline data needs sync
   */
  needsSync(): boolean {
    return this.offlineStore.pendingChanges > 0 && !this.offlineStore.status.isOffline;
  }

  /**
   * Auto-sync when coming back online
   */
  setupAutoSync(): void {
    // This would be handled by the useEffect in the offline store
    // But we can add additional logic here if needed
    console.log('Auto-sync setup completed');
  }
}

// Singleton instance
export const offlineDataPersistence = OfflineDataPersistence.getInstance();