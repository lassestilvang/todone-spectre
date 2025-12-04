/**
 * Custom hook for comprehensive offline sync integration
 */
import { useState, useEffect, useCallback } from 'react';
import { offlineSyncService } from '../services/offlineSyncService';
import { useOfflineStore } from '../store/useOfflineStore';
import { OfflineSyncStatus } from '../types/offlineTypes';

export const useOfflineSync = () => {
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [pendingOperations, setPendingOperations] = useState<number>(0);
  const [syncStatus, setSyncStatus] = useState<OfflineSyncStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [syncStatistics, setSyncStatistics] = useState<{
    totalOperations: number;
    completedOperations: number;
    failedOperations: number;
    syncDuration: number | null;
    lastSyncSize: number;
  }>({
    totalOperations: 0,
    completedOperations: 0,
    failedOperations: 0,
    syncDuration: null,
    lastSyncSize: 0
  });

  const offlineStore = useOfflineStore.getState();

  /**
   * Initialize offline sync service
   */
  const initialize = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      await offlineSyncService.initialize();
      await loadSyncStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize offline sync service');
      throw err;
    }
  }, []);

  /**
   * Load sync status
   */
  const loadSyncStatus = useCallback(async (): Promise<void> => {
    try {
      const status = offlineSyncService.getSyncStatus();
      setIsSyncing(status.isSyncing);
      setLastSynced(status.lastSynced);
      setPendingOperations(status.pendingOperations);
      setSyncStatus(status.status);

      const stats = await offlineSyncService.getSyncStatistics();
      setSyncStatistics(stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sync status');
    }
  }, []);

  /**
   * Sync all offline data
   */
  const syncAll = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      setIsSyncing(true);
      setSyncStatus('syncing');

      await offlineSyncService.syncAll();

      // Update status after sync
      await loadSyncStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sync all offline data');
      setSyncStatus('error');
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, [loadSyncStatus]);

  /**
   * Process sync queue
   */
  const processSyncQueue = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      setIsSyncing(true);
      setSyncStatus('syncing');

      await offlineSyncService.processSyncQueue();

      // Update status after processing
      await loadSyncStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process sync queue');
      setSyncStatus('error');
      throw err;
    } finally {
      setIsSyncing(false);
    }
  }, [loadSyncStatus]);

  /**
   * Retry failed operations
   */
  const retryFailedOperations = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      await offlineSyncService.retryFailedOperations();
      await loadSyncStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retry failed operations');
      throw err;
    }
  }, [loadSyncStatus]);

  /**
   * Check if sync is needed
   */
  const needsSync = useCallback((): boolean => {
    return offlineSyncService.needsSync();
  }, []);

  /**
   * Get sync status
   */
  const getSyncStatus = useCallback((): {
    isSyncing: boolean;
    lastSynced: Date | null;
    pendingOperations: number;
    status: OfflineSyncStatus;
    error: Error | null;
  } => {
    return offlineSyncService.getSyncStatus();
  }, []);

  /**
   * Get queue statistics
   */
  const getQueueStatistics = useCallback((): {
    totalItems: number;
    pendingItems: number;
    completedItems: number;
    failedItems: number;
  } => {
    return offlineSyncService.getQueueStatistics();
  }, []);

  /**
   * Setup periodic sync
   */
  const setupPeriodicSync = useCallback((interval: number = 30000): (() => void) => {
    return offlineSyncService.setupPeriodicSync(interval);
  }, []);

  /**
   * Pause sync operations
   */
  const pauseSync = useCallback((): void => {
    offlineSyncService.pauseSync();
    setSyncStatus('paused');
  }, []);

  /**
   * Resume sync operations
   */
  const resumeSync = useCallback((): void => {
    offlineSyncService.resumeSync();
    setSyncStatus('syncing');
  }, []);

  /**
   * Clear sync queue
   */
  const clearSyncQueue = useCallback(async (): Promise<void> => {
    try {
      setError(null);
      await offlineSyncService.clearSyncQueue();
      await loadSyncStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear sync queue');
      throw err;
    }
  }, [loadSyncStatus]);

  /**
   * Get comprehensive offline status
   */
  const getComprehensiveOfflineStatus = useCallback((): {
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
  } => {
    return offlineSyncService.getComprehensiveOfflineStatus();
  }, []);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Set up auto-sync when coming back online
  useEffect(() => {
    if (!offlineStore.status.isOffline && needsSync()) {
      syncAll();
    }
  }, [offlineStore.status.isOffline, needsSync, syncAll]);

  // Update status when offline store changes
  useEffect(() => {
    loadSyncStatus();
  }, [offlineStore.sync, offlineStore.pendingChanges, loadSyncStatus]);

  return {
    // State
    isSyncing,
    lastSynced,
    pendingOperations,
    syncStatus,
    error,
    syncStatistics,

    // Initialization
    initialize,

    // Sync operations
    syncAll,
    processSyncQueue,
    retryFailedOperations,
    needsSync,

    // Status methods
    getSyncStatus,
    getQueueStatistics,

    // Control methods
    setupPeriodicSync,
    pauseSync,
    resumeSync,
    clearSyncQueue,

    // Utility methods
    getComprehensiveOfflineStatus,
    loadSyncStatus
  };
};