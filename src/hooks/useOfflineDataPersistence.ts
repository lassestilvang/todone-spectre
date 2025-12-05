/**
 * Custom hook for offline data persistence integration
 */
import { useState, useEffect, useCallback } from "react";
import { offlineDataPersistence } from "../services/offlineDataPersistence";
import { useOfflineStore } from "../store/useOfflineStore";
import { Task } from "../types/task";
import { OfflineQueueItem } from "../types/offlineTypes";

export const useOfflineDataPersistence = () => {
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [pendingOperations, setPendingOperations] = useState<number>(0);
  const [storageStats, setStorageStats] = useState<{
    taskCount: number;
    queueSize: number;
    storageUsage: number;
  }>({
    taskCount: 0,
    queueSize: 0,
    storageUsage: 0,
  });

  const [error, setError] = useState<string | null>(null);
  const offlineStore = useOfflineStore.getState();

  /**
   * Initialize offline data persistence
   */
  const initialize = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      await offlineDataPersistence.initialize();
      setIsInitialized(true);

      // Load initial stats
      await loadStorageStats();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to initialize offline data persistence",
      );
      throw err;
    }
  }, []);

  /**
   * Load storage statistics
   */
  const loadStorageStats = useCallback(async (): Promise<void> => {
    try {
      const stats = await offlineDataPersistence.getOfflineStorageStats();
      setStorageStats(stats);

      // Update pending operations
      const syncStatus = offlineDataPersistence.getSyncStatus();
      setPendingOperations(syncStatus.pendingOperations);
      setLastSynced(syncStatus.lastSynced);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load storage stats",
      );
    }
  }, []);

  /**
   * Store tasks in offline storage
   */
  const storeTasksOffline = useCallback(
    async (tasks: Task[]): Promise<void> => {
      try {
        setError(null);
        await offlineDataPersistence.storeOfflineTasks(tasks);
        await loadStorageStats();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to store tasks offline",
        );
        throw err;
      }
    },
    [loadStorageStats],
  );

  /**
   * Get tasks from offline storage
   */
  const getTasksOffline = useCallback(async (): Promise<Task[]> => {
    try {
      setError(null);
      return await offlineDataPersistence.getOfflineTasks();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to get tasks from offline storage",
      );
      throw err;
    }
  }, []);

  /**
   * Store offline operation
   */
  const storeOfflineOperation = useCallback(
    async (
      operation: Omit<
        OfflineQueueItem,
        "id" | "timestamp" | "status" | "attempts"
      >,
    ): Promise<void> => {
      try {
        setError(null);
        await offlineDataPersistence.storeOfflineOperation(
          operation as OfflineQueueItem,
        );
        await loadStorageStats();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to store offline operation",
        );
        throw err;
      }
    },
    [loadStorageStats],
  );

  /**
   * Process offline operations
   */
  const processOfflineOperations = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      setIsSyncing(true);
      await offlineDataPersistence.processOfflineOperations();
      await loadStorageStats();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to process offline operations",
      );
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, [loadStorageStats]);

  /**
   * Sync offline data with remote server
   */
  const syncOfflineData = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      setIsSyncing(true);
      await offlineDataPersistence.syncOfflineData();

      // Update sync status
      const syncStatus = offlineDataPersistence.getSyncStatus();
      setLastSynced(syncStatus.lastSynced);
      setPendingOperations(syncStatus.pendingOperations);

      await loadStorageStats();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to sync offline data",
      );
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, [loadStorageStats]);

  /**
   * Check if sync is needed
   */
  const needsSync = useCallback((): boolean => {
    return offlineDataPersistence.needsSync();
  }, []);

  /**
   * Clear offline data
   */
  const clearOfflineData = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      await offlineDataPersistence.clearOfflineData();
      await loadStorageStats();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to clear offline data",
      );
      throw err;
    }
  }, [loadStorageStats]);

  /**
   * Setup auto-sync
   */
  const setupAutoSync = useCallback((): void => {
    try {
      offlineDataPersistence.setupAutoSync();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to setup auto-sync",
      );
    }
  }, []);

  /**
   * Get sync status
   */
  const getSyncStatus = useCallback((): {
    isSyncing: boolean;
    lastSynced: Date | null;
    pendingOperations: number;
  } => {
    return offlineDataPersistence.getSyncStatus();
  }, []);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Set up auto-sync when coming back online
  useEffect(() => {
    if (!offlineStore.status.isOffline && needsSync()) {
      syncOfflineData();
    }
  }, [offlineStore.status.isOffline, needsSync, syncOfflineData]);

  // Update stats when offline store changes
  useEffect(() => {
    loadStorageStats();
  }, [offlineStore.queue.items, offlineStore.pendingChanges, loadStorageStats]);

  return {
    // State
    isInitialized,
    isSyncing,
    lastSynced,
    pendingOperations,
    storageStats,
    error,

    // Initialization
    initialize,

    // Task storage
    storeTasksOffline,
    getTasksOffline,

    // Operation management
    storeOfflineOperation,
    processOfflineOperations,

    // Sync operations
    syncOfflineData,
    needsSync,
    getSyncStatus,

    // Data management
    clearOfflineData,
    setupAutoSync,

    // Utility
    loadStorageStats,
  };
};
