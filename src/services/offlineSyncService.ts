/**
 * Offline Sync Service - Handles comprehensive offline synchronization
 */
import { useOfflineStore } from "../store/useOfflineStore";
import { offlineTaskService } from "./offlineTaskService";
import { offlineDataPersistence } from "./offlineDataPersistence";
import { SyncEngine } from "../database/sync";
import { TodoneDatabase } from "../database/db";
import { OfflineQueueItem, OfflineSyncStatus } from "../types/offlineTypes";

export class OfflineSyncService {
  private static instance: OfflineSyncService;
  private offlineStore = useOfflineStore.getState();
  private syncEngine: SyncEngine;
  private db: TodoneDatabase;

  private constructor() {
    this.db = new TodoneDatabase();
    this.syncEngine = new SyncEngine(this.db);
  }

  public static getInstance(): OfflineSyncService {
    if (!OfflineSyncService.instance) {
      OfflineSyncService.instance = new OfflineSyncService();
    }
    return OfflineSyncService.instance;
  }

  /**
   * Initialize offline sync service
   */
  async initialize(): Promise<void> {
    await this.db.initialize();
    await this.syncEngine.initialize();
    this.setupEventListeners();
  }

  /**
   * Setup event listeners for sync operations
   */
  private setupEventListeners(): void {
    // Listen for network status changes
    useOfflineStore.subscribe(
      (state) => state.status.isOffline,
      (isOffline) => {
        if (!isOffline && this.needsSync()) {
          this.autoSync();
        }
      },
    );
  }

  /**
   * Check if sync is needed
   */
  needsSync(): boolean {
    return (
      this.offlineStore.pendingChanges > 0 &&
      !this.offlineStore.status.isOffline
    );
  }

  /**
   * Auto-sync when coming back online
   */
  async autoSync(): Promise<void> {
    try {
      if (this.offlineStore.status.isOffline) {
        console.log("Cannot auto-sync while offline");
        return;
      }

      if (!this.needsSync()) {
        console.log("No sync needed");
        return;
      }

      console.log("Starting auto-sync");
      await this.syncAll();
    } catch (error) {
      console.error("Auto-sync failed:", error);
    }
  }

  /**
   * Sync all offline data
   */
  async syncAll(): Promise<void> {
    try {
      if (this.offlineStore.status.isOffline) {
        throw new Error("Cannot sync while offline");
      }

      // Update sync status
      this.offlineStore.sync = {
        ...this.offlineStore.sync,
        status: "syncing",
        isSyncing: true,
        syncStartTime: new Date(),
      };

      console.log("Starting comprehensive sync");

      // 1. Sync task operations
      await offlineTaskService.processOfflineTaskQueue();

      // 2. Sync data persistence
      await offlineDataPersistence.syncOfflineData();

      // 3. Sync database operations
      await this.syncEngine.processSyncQueue();

      // Update sync status
      this.offlineStore.sync = {
        ...this.offlineStore.sync,
        status: "completed",
        isSyncing: false,
        lastSynced: new Date(),
        syncEndTime: new Date(),
        syncDuration:
          Date.now() - (this.offlineStore.sync.syncStartTime?.getTime() || 0),
      };

      // Update last sync in offline store
      this.offlineStore.lastSync = new Date();
      this.offlineStore.pendingChanges = 0;

      console.log("Comprehensive sync completed");
    } catch (error) {
      console.error("Sync failed:", error);

      // Update sync status with error
      this.offlineStore.sync = {
        ...this.offlineStore.sync,
        status: "error",
        isSyncing: false,
        error: error instanceof Error ? error : new Error("Sync failed"),
      };

      throw error;
    }
  }

  /**
   * Get comprehensive sync status
   */
  getSyncStatus(): {
    isSyncing: boolean;
    lastSynced: Date | null;
    pendingOperations: number;
    status: OfflineSyncStatus;
    error: Error | null;
  } {
    return {
      isSyncing: this.offlineStore.sync.isSyncing,
      lastSynced: this.offlineStore.lastSync,
      pendingOperations: this.offlineStore.pendingChanges,
      status: this.offlineStore.sync.status,
      error: this.offlineStore.sync.error,
    };
  }

  /**
   * Get detailed sync statistics
   */
  async getSyncStatistics(): Promise<{
    totalOperations: number;
    completedOperations: number;
    failedOperations: number;
    syncDuration: number | null;
    lastSyncSize: number;
  }> {
    return {
      totalOperations: this.offlineStore.sync.totalItems,
      completedOperations: this.offlineStore.sync.processedItems,
      failedOperations: this.offlineStore.sync.failedItems,
      syncDuration: this.offlineStore.sync.syncDuration,
      lastSyncSize: this.offlineStore.sync.syncStatistics.lastSyncSize,
    };
  }

  /**
   * Process sync queue with priority handling
   */
  async processSyncQueue(): Promise<void> {
    try {
      if (this.offlineStore.status.isOffline) {
        throw new Error("Cannot process sync queue while offline");
      }

      const queueItems = this.offlineStore.queue.items;

      if (queueItems.length === 0) {
        console.log("No items in sync queue");
        return;
      }

      console.log(`Processing ${queueItems.length} items in sync queue`);

      // Process items by priority
      const priorityOrder: Record<string, number> = {
        critical: 1,
        high: 2,
        medium: 3,
        low: 4,
      };

      // Sort by priority
      const sortedItems = [...queueItems].sort((a, b) => {
        const priorityA = priorityOrder[a.priority || "medium"] || 3;
        const priorityB = priorityOrder[b.priority || "medium"] || 3;
        return priorityA - priorityB;
      });

      for (const item of sortedItems) {
        try {
          await this.processQueueItem(item);
          this.offlineStore.removeQueueItem(item.id);
        } catch (error) {
          console.error(`Failed to process queue item ${item.id}:`, error);
          this.offlineStore.retryQueueItem(item.id);
        }
      }
    } catch (error) {
      console.error("Failed to process sync queue:", error);
      throw error;
    }
  }

  /**
   * Process individual queue item
   */
  private async processQueueItem(item: OfflineQueueItem): Promise<void> {
    try {
      console.log(`Processing queue item: ${item.operation}`);

      // Simulate processing based on operation type
      switch (item.type) {
        case "create":
        case "update":
        case "delete":
          // These are handled by the task service
          break;
        case "sync":
          // Handle sync operations
          await this.handleSyncOperation(item);
          break;
      }

      // Mark as completed in sync engine
      await this.syncEngine.addToSyncQueue(
        "completed",
        "sync_queue",
        Date.now(),
        {
          ...item,
          status: "completed",
        },
      );
    } catch (error) {
      console.error(`Failed to process queue item ${item.id}:`, error);
      throw error;
    }
  }

  /**
   * Handle sync operations
   */
  private async handleSyncOperation(item: OfflineQueueItem): Promise<void> {
    // This would handle specific sync operations
    console.log(`Handling sync operation: ${item.operation}`);

    // Simulate sync operation
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  /**
   * Retry failed sync operations
   */
  async retryFailedOperations(): Promise<void> {
    try {
      const failedItems = this.offlineStore.queue.items.filter(
        (item) => item.status === "failed",
      );

      if (failedItems.length === 0) {
        console.log("No failed operations to retry");
        return;
      }

      console.log(`Retrying ${failedItems.length} failed operations`);

      for (const item of failedItems) {
        try {
          await this.processQueueItem(item);
          this.offlineStore.removeQueueItem(item.id);
        } catch (error) {
          console.error(`Failed to retry operation ${item.id}:`, error);
          // If max attempts reached, remove from queue
          if (item.attempts >= this.offlineStore.settings.maxRetryAttempts) {
            this.offlineStore.removeQueueItem(item.id);
          }
        }
      }
    } catch (error) {
      console.error("Failed to retry failed operations:", error);
      throw error;
    }
  }

  /**
   * Clear sync queue
   */
  async clearSyncQueue(): Promise<void> {
    try {
      this.offlineStore.clearQueue();
      await this.syncEngine.clearSyncQueue();
      console.log("Sync queue cleared");
    } catch (error) {
      console.error("Failed to clear sync queue:", error);
      throw error;
    }
  }

  /**
   * Get queue statistics
   */
  getQueueStatistics(): {
    totalItems: number;
    pendingItems: number;
    completedItems: number;
    failedItems: number;
  } {
    return {
      totalItems: this.offlineStore.queue.totalCount,
      pendingItems: this.offlineStore.queue.pendingCount,
      completedItems: this.offlineStore.queue.completedCount,
      failedItems: this.offlineStore.queue.failedCount,
    };
  }

  /**
   * Setup periodic sync
   */
  setupPeriodicSync(interval: number = 30000): () => void {
    const syncInterval = setInterval(async () => {
      try {
        if (this.needsSync()) {
          await this.syncAll();
        }
      } catch (error) {
        console.error("Periodic sync failed:", error);
      }
    }, interval);

    return () => clearInterval(syncInterval);
  }

  /**
   * Pause sync operations
   */
  pauseSync(): void {
    this.offlineStore.pauseSync();
    console.log("Sync operations paused");
  }

  /**
   * Resume sync operations
   */
  resumeSync(): void {
    this.offlineStore.resumeSync();
    console.log("Sync operations resumed");
  }

  /**
   * Get comprehensive offline status
   */
  getComprehensiveOfflineStatus(): {
    isOffline: boolean;
    networkStatus: string;
    pendingChanges: number;
    queueStatus: {
      total: number;
      pending: number;
      failed: number;
    };
    syncStatus: OfflineSyncStatus;
    lastSync: Date | null;
  } {
    return {
      isOffline: this.offlineStore.status.isOffline,
      networkStatus: this.offlineStore.status.status,
      pendingChanges: this.offlineStore.pendingChanges,
      queueStatus: {
        total: this.offlineStore.queue.totalCount,
        pending: this.offlineStore.queue.pendingCount,
        failed: this.offlineStore.queue.failedCount,
      },
      syncStatus: this.offlineStore.sync.status,
      lastSync: this.offlineStore.lastSync,
    };
  }
}

// Singleton instance
export const offlineSyncService = OfflineSyncService.getInstance();
