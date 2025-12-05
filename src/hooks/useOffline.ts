import { useState, useEffect, useCallback } from "react";
import { useOfflineStore } from "../store/useOfflineStore";
import {
  OfflineStatus,
  OfflineQueueItem,
  OfflineQueuePriority,
  OfflineOperationResult,
  OfflineBatchResult,
} from "../types/offlineTypes";

/**
 * Custom hook for offline status monitoring and queue management
 */
export const useOffline = () => {
  const {
    status,
    queue,
    sync,
    settings,
    error,
    isProcessing,
    pendingChanges,
    lastSync,
    checkOnlineStatus,
    addToQueue,
    retryQueueItem,
    clearQueue,
    processQueue,
    updateSettings,
    getQueueStats,
    getQueueItemsByStatus,
    getQueueItemsByPriority,
    updateQueueItemPriority,
    removeQueueItem,
    pauseSync,
    resumeSync,
    getOfflineState,
    getSyncStatus,
    isSyncNeeded,
    updateStorageUsage,
    updatePerformanceMetrics,
    initializeOfflineStore,
    simulateNetworkChange,
    clearError,
  } = useOfflineStore();

  const [status, setStatus] = useState<OfflineStatus>(
    isOffline ? "offline" : "online",
  );
  const [networkStatus, setNetworkStatus] = useState<{
    isOnline: boolean;
    since: Date | null;
  }>({
    isOnline: !isOffline,
    since: null,
  });

  /**
   * Initialize offline monitoring
   */
  const initialize = useCallback(() => {
    // Set initial status
    setStatus(isOffline ? "offline" : "online");
    setNetworkStatus({
      isOnline: !isOffline,
      since: new Date(),
    });
  }, [isOffline]);

  /**
   * Monitor network status changes
   */
  useEffect(() => {
    const newStatus: OfflineStatus = isOffline ? "offline" : "online";
    setStatus(newStatus);

    setNetworkStatus((prev) => ({
      isOnline: !isOffline,
      since: prev.isOnline === !isOffline ? prev.since : new Date(),
    }));

    // Handle reconnection logic
    if (!isOffline && settings.syncOnReconnect && pendingChanges > 0) {
      processQueue();
    }
  }, [isOffline, pendingChanges, processQueue, settings.syncOnReconnect]);

  /**
   * Check current network status
   */
  const checkNetworkStatus = useCallback((): boolean => {
    return checkOnlineStatus();
  }, [checkOnlineStatus]);

  /**
   * Get current offline status
   */
  const getOfflineStatus = useCallback((): OfflineStatus => {
    return status;
  }, [status]);

  /**
   * Get offline state summary
   */
  const getOfflineState = useCallback((): {
    isOffline: boolean;
    status: OfflineStatus;
    pendingChanges: number;
    queueLength: number;
    lastSync: Date | null;
    error: Error | null;
    isProcessing: boolean;
  } => {
    return {
      isOffline,
      status,
      pendingChanges,
      queueLength: queue.length,
      lastSync,
      error,
      isProcessing,
    };
  }, [
    isOffline,
    status,
    pendingChanges,
    queue.length,
    lastSync,
    error,
    isProcessing,
  ]);

  /**
   * Add operation to offline queue
   */
  const enqueueOperation = useCallback(
    async (
      operation: string,
      type: "create" | "update" | "delete" | "sync",
      data: any,
    ): Promise<{
      success: boolean;
      queueItem?: OfflineQueueItem;
      error?: Error | null;
    }> => {
      try {
        // Check if we're offline or if we should queue even when online
        const shouldQueue = isOffline || type === "sync";

        if (!shouldQueue) {
          return {
            success: false,
            error: new Error(
              "Cannot enqueue operation when online (except for sync operations)",
            ),
          };
        }

        const result = addToQueue({
          operation,
          type,
          data,
        });

        // Check if queue is full
        if (queue.length >= settings.maxQueueSize) {
          return {
            success: false,
            error: new Error(
              `Queue full. Maximum size: ${settings.maxQueueSize}`,
            ),
          };
        }

        return {
          success: true,
        };
      } catch (err) {
        return {
          success: false,
          error:
            err instanceof Error
              ? err
              : new Error("Failed to enqueue operation"),
        };
      }
    },
    [isOffline, addToQueue, queue.length, settings.maxQueueSize],
  );

  /**
   * Process the entire queue
   */
  const processOfflineQueue = useCallback(async (): Promise<{
    success: boolean;
    processedItems?: OfflineQueueItem[];
    error?: Error | null;
  }> => {
    try {
      if (isOffline) {
        throw new Error("Cannot process queue while offline");
      }

      if (queue.length === 0) {
        throw new Error("No items to process");
      }

      await processQueue();

      const processedItems = queue.filter(
        (item) => item.status === "completed",
      );

      return {
        success: true,
        processedItems,
      };
    } catch (err) {
      return {
        success: false,
        error:
          err instanceof Error ? err : new Error("Queue processing failed"),
      };
    }
  }, [isOffline, queue, processQueue]);

  /**
   * Retry failed queue items
   */
  const retryFailedItems = useCallback(async (): Promise<{
    success: boolean;
    retriedCount: number;
    error?: Error | null;
  }> => {
    try {
      const failedItems = queue.filter((item) => item.status === "failed");
      let retriedCount = 0;

      for (const item of failedItems) {
        await retryQueueItem(item.id);
        retriedCount++;
      }

      return {
        success: true,
        retriedCount,
      };
    } catch (err) {
      return {
        success: false,
        retriedCount: 0,
        error: err instanceof Error ? err : new Error("Failed to retry items"),
      };
    }
  }, [queue, retryQueueItem]);

  /**
   * Get queue statistics
   */
  const getQueueStats = useCallback((): {
    totalItems: number;
    pendingItems: number;
    processingItems: number;
    completedItems: number;
    failedItems: number;
  } => {
    const totalItems = queue.length;
    const pendingItems = queue.filter(
      (item) => item.status === "pending",
    ).length;
    const processingItems = queue.filter(
      (item) => item.status === "processing",
    ).length;
    const completedItems = queue.filter(
      (item) => item.status === "completed",
    ).length;
    const failedItems = queue.filter((item) => item.status === "failed").length;

    return {
      totalItems,
      pendingItems,
      processingItems,
      completedItems,
      failedItems,
    };
  }, [queue]);

  /**
   * Get queue items by status
   */
  const getQueueItemsByStatus = useCallback(
    (statusFilter: OfflineQueueItem["status"]): OfflineQueueItem[] => {
      return queue.filter((item) => item.status === statusFilter);
    },
    [queue],
  );

  /**
   * Clear all queue items
   */
  const clearAllQueueItems = useCallback((): void => {
    clearQueue();
  }, [clearQueue]);

  /**
   * Simulate network change (for testing)
   */
  const simulateNetworkChange = useCallback((isOnline: boolean): void => {
    // This would typically be handled by the store's simulateNetworkChange method
    // For now, we'll just update our local state to reflect the change
    const newStatus: OfflineStatus = isOnline ? "online" : "offline";
    setStatus(newStatus);
    setNetworkStatus({
      isOnline,
      since: new Date(),
    });
  }, []);

  return {
    // Status and state
    status,
    isOffline,
    networkStatus,
    pendingChanges,
    queue,
    lastSync,
    error,
    isProcessing,
    settings,

    // Status monitoring
    getOfflineStatus,
    getOfflineState,
    checkNetworkStatus,

    // Queue management
    enqueueOperation,
    processOfflineQueue,
    retryFailedItems,
    getQueueStats,
    getQueueItemsByStatus,
    clearAllQueueItems,

    // Initialization
    initialize,

    // Testing utilities
    simulateNetworkChange,
  };
};
