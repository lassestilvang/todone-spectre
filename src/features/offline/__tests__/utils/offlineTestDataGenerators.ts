/**
 * Offline Test Data Generators
 * Comprehensive utilities for generating test data for offline functionality
 */

import { Task } from "../../../../types/task";
import {
  OfflineQueueItem,
  OfflineQueuePriority,
} from "../../../../types/offlineTypes";

/**
 * Generate mock task data for testing
 */
export const generateMockTask = (overrides: Partial<Task> = {}): Task => {
  return {
    id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    title: `Test Task ${Date.now()}`,
    description: "This is a test task description",
    status: "todo",
    priority: "medium",
    projectId: "test-project",
    createdAt: new Date(),
    updatedAt: new Date(),
    completed: false,
    ...overrides,
  };
};

/**
 * Generate multiple mock tasks
 */
export const generateMockTasks = (
  count: number = 5,
  overrides: Partial<Task> = {},
): Task[] => {
  return Array.from({ length: count }, (_, i) =>
    generateMockTask({
      title: `Test Task ${i + 1}`,
      ...overrides,
    }),
  );
};

/**
 * Generate offline queue items for testing
 */
export const generateOfflineQueueItem = (
  type: "create" | "update" | "delete" | "sync" = "create",
  priority: OfflineQueuePriority = "medium",
  overrides: Partial<OfflineQueueItem> = {},
): OfflineQueueItem => {
  const baseData = {
    create: { title: "Test Task", description: "Test Description" },
    update: { taskId: "test-task-id", updates: { title: "Updated Title" } },
    delete: { taskId: "test-task-id" },
    sync: { operation: "sync_operation" },
  };

  return {
    id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    operation: `${type} operation for test`,
    type,
    data: baseData[type] || {},
    timestamp: new Date(),
    status: "pending",
    attempts: 0,
    priority,
    retryCount: 0,
    lastAttempt: null,
    ...overrides,
  };
};

/**
 * Generate multiple offline queue items
 */
export const generateOfflineQueueItems = (
  count: number = 3,
  types: ("create" | "update" | "delete" | "sync")[] = [
    "create",
    "update",
    "delete",
  ],
  priorities: OfflineQueuePriority[] = ["high", "medium", "low"],
): OfflineQueueItem[] => {
  return Array.from({ length: count }, (_, i) => {
    const type = types[i % types.length];
    const priority = priorities[i % priorities.length];
    return generateOfflineQueueItem(type, priority, {
      operation: `${type} operation ${i + 1}`,
    });
  });
};

/**
 * Generate comprehensive offline state for testing
 */
export const generateOfflineState = (overrides: Partial<any> = {}) => {
  return {
    status: {
      isOffline: false,
      status: "online",
      lastStatusChange: new Date(),
      connectionQuality: "good",
      networkType: "wifi",
      isFirstConnection: true,
      offlineSince: null,
      onlineSince: new Date(),
      connectionHistory: [],
    },
    queue: {
      items: [],
      totalCount: 0,
      pendingCount: 0,
      processingCount: 0,
      completedCount: 0,
      failedCount: 0,
      retryingCount: 0,
      queueSize: 0,
      maxQueueSize: 100,
      isQueueFull: false,
      lastUpdated: new Date(),
    },
    sync: {
      status: "idle",
      lastSynced: null,
      error: null,
      progress: 0,
      totalItems: 0,
      processedItems: 0,
      failedItems: 0,
      syncDuration: null,
      isSyncing: false,
      isPaused: false,
      syncStartTime: null,
      syncEndTime: null,
      currentBatch: 0,
      totalBatches: 0,
      syncStatistics: {
        successRate: 0,
        averageDuration: 0,
        lastSyncSize: 0,
      },
    },
    settings: {
      autoSyncEnabled: true,
      syncInterval: 30000,
      maxQueueSize: 100,
      conflictResolution: "timestamp",
      offlineDataRetention: 30,
      showOfflineIndicator: true,
      syncOnReconnect: true,
      maxRetryAttempts: 3,
      retryDelay: 5000,
      batchSize: 10,
      enableCompression: false,
      enableEncryption: false,
      syncPriority: "medium",
      autoRetryFailedItems: true,
      retryStrategy: "exponential",
    },
    error: null,
    isProcessing: false,
    pendingChanges: 0,
    lastSync: null,
    storageUsage: {
      used: 0,
      available: 0,
      percentage: 0,
    },
    performanceMetrics: {
      queueProcessingTime: 0,
      syncProcessingTime: 0,
      memoryUsage: 0,
    },
    ...overrides,
  };
};

/**
 * Generate offline storage statistics
 */
export const generateStorageStats = (overrides: Partial<any> = {}) => {
  return {
    taskCount: 10,
    queueSize: 5,
    storageUsage: 1024,
    ...overrides,
  };
};

/**
 * Generate comprehensive offline status
 */
export const generateComprehensiveOfflineStatus = (
  overrides: Partial<any> = {},
) => {
  return {
    isOffline: false,
    networkStatus: "online",
    pendingChanges: 0,
    queueStatus: {
      total: 0,
      pending: 0,
      failed: 0,
    },
    syncStatus: "idle",
    lastSync: null,
    ...overrides,
  };
};

/**
 * Generate mock API responses for offline testing
 */
export const generateMockApiResponse = (
  success: boolean = true,
  data: any = {},
  overrides: Partial<any> = {},
) => {
  return {
    success,
    data: success ? data : null,
    message: success ? "Operation successful" : "Operation failed",
    timestamp: new Date(),
    ...overrides,
  };
};
