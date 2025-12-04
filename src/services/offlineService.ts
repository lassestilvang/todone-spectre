import {
  OfflineStatus,
  OfflineQueueItem,
  OfflineState,
  OfflineQueuePriority,
  OfflineOperationResult,
  OfflineBatchResult
} from '../types/offlineTypes';
import { useOfflineStore } from '../store/useOfflineStore';

/**
 * Offline Service - Handles offline status and queue management
 */
export class OfflineService {
  private static instance: OfflineService;
  private offlineStore = useOfflineStore.getState();

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance of OfflineService
   */
  public static getInstance(): OfflineService {
    if (!OfflineService.instance) {
      OfflineService.instance = new OfflineService();
    }
    return OfflineService.instance;
  }

  /**
   * Check current online status
   */
  checkOnlineStatus(): boolean {
    return this.offlineStore.checkOnlineStatus();
  }

  /**
   * Get current offline status
   */
  getOfflineStatus(): OfflineStatus {
    return this.offlineStore.isOffline ? 'offline' : 'online';
  }

  /**
   * Get current offline state
   */
  getOfflineState(): OfflineState {
    return {
      isOffline: this.offlineStore.isOffline,
      pendingChanges: this.offlineStore.pendingChanges,
      queue: this.offlineStore.queue,
      lastSync: this.offlineStore.lastSync,
      error: this.offlineStore.error,
      isProcessing: this.offlineStore.isProcessing,
      settings: this.offlineStore.settings
    };
  }

  /**
   * Add item to offline queue
   */
  addToQueue(item: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'status' | 'attempts'>): {
    success: boolean;
    error?: Error | null;
    queueItem?: OfflineQueueItem;
  } {
    try {
      // Check if queue is full
      if (this.offlineStore.queue.length >= this.offlineStore.settings.maxQueueSize) {
        throw new Error(`Queue full. Maximum size: ${this.offlineStore.settings.maxQueueSize}`);
      }

      // Create new queue item
      const newItem: OfflineQueueItem = {
        id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        operation: item.operation,
        type: item.type,
        data: item.data,
        timestamp: new Date(),
        status: 'pending',
        attempts: 0
      };

      // Add to queue
      this.offlineStore.addToQueue(newItem);

      return {
        success: true,
        queueItem: newItem
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Failed to add to queue')
      };
    }
  }

  /**
   * Process the offline queue
   */
  async processQueue(): Promise<{
    success: boolean;
    processedItems?: OfflineQueueItem[];
    error?: Error | null;
  }> {
    try {
      if (this.offlineStore.isOffline) {
        throw new Error('Cannot process queue while offline');
      }

      if (this.offlineStore.queue.length === 0) {
        throw new Error('No items to process');
      }

      await this.offlineStore.processQueue();

      return {
        success: true,
        processedItems: this.offlineStore.queue.filter(item => item.status === 'completed')
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Queue processing failed')
      };
    }
  }

  /**
   * Retry a specific queue item
   */
  async retryQueueItem(itemId: string): Promise<{
    success: boolean;
    error?: Error | null;
  }> {
    try {
      await this.offlineStore.retryQueueItem(itemId);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Failed to retry queue item')
      };
    }
  }

  /**
   * Clear the offline queue
   */
  clearQueue(): void {
    this.offlineStore.clearQueue();
  }

  /**
   * Get queue statistics
   */
  getQueueStats(): {
    totalItems: number;
    pendingItems: number;
    processingItems: number;
    completedItems: number;
    failedItems: number;
  } {
    const totalItems = this.offlineStore.queue.length;
    const pendingItems = this.offlineStore.queue.filter(item => item.status === 'pending').length;
    const processingItems = this.offlineStore.queue.filter(item => item.status === 'processing').length;
    const completedItems = this.offlineStore.queue.filter(item => item.status === 'completed').length;
    const failedItems = this.offlineStore.queue.filter(item => item.status === 'failed').length;

    return {
      totalItems,
      pendingItems,
      processingItems,
      completedItems,
      failedItems
    };
  }

  /**
   * Simulate network change (for testing)
   */
  simulateNetworkChange(isOnline: boolean): void {
    this.offlineStore.simulateNetworkChange(isOnline);
  }

  /**
   * Clear any errors
   */
  clearError(): void {
    this.offlineStore.clearError();
  }
}

// Singleton instance
export const offlineService = OfflineService.getInstance();