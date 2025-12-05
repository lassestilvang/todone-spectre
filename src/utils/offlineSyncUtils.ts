/**
 * Offline Sync Utilities
 *
 * This module provides utilities for handling offline synchronization,
 * including conflict resolution, sync state management, and data reconciliation.
 */

import { OfflineQueueItem, OfflineSettings } from "../types/offlineTypes";
import { offlineService } from "../services/offlineService";
import { offlineSyncService } from "../services/offlineSyncService";

/**
 * Check if sync is needed based on current state
 */
export function isSyncNeeded(): boolean {
  const state = offlineService.getOfflineState();
  return state.pendingChanges > 0 || state.queue.length > 0;
}

/**
 * Get sync priority for queue items
 * Determines which items should be synced first
 */
export function getSyncPriority(item: OfflineQueueItem): number {
  // Higher priority for older items (FIFO)
  const agePriority = Date.now() - new Date(item.timestamp).getTime();

  // Higher priority for failed items
  const statusPriority =
    item.status === "failed" ? 1000 : item.status === "pending" ? 500 : 0;

  // Higher priority for certain operation types
  const operationPriority = item.operation.toLowerCase().includes("critical")
    ? 1000
    : item.operation.toLowerCase().includes("important")
      ? 500
      : 0;

  return agePriority + statusPriority + operationPriority;
}

/**
 * Sort queue items by sync priority
 */
export function sortQueueByPriority(
  queue: OfflineQueueItem[],
): OfflineQueueItem[] {
  return [...queue].sort((a, b) => getSyncPriority(b) - getSyncPriority(a));
}

/**
 * Process sync in batches
 * Handles large sync operations in manageable chunks
 */
export async function processSyncInBatches(
  queue: OfflineQueueItem[],
  batchSize: number = 10,
  onProgress?: (processed: number, total: number) => void,
): Promise<{
  success: boolean;
  processedItems: OfflineQueueItem[];
  failedItems: OfflineQueueItem[];
  error?: Error | null;
}> {
  const processedItems: OfflineQueueItem[] = [];
  const failedItems: OfflineQueueItem[] = [];

  const sortedQueue = sortQueueByPriority(queue);
  const totalItems = sortedQueue.length;

  for (let i = 0; i < sortedQueue.length; i += batchSize) {
    const batch = sortedQueue.slice(i, i + batchSize);

    try {
      // Process each item in the batch
      for (const item of batch) {
        try {
          // Simulate processing (in real implementation, this would call actual sync logic)
          await new Promise((resolve) => setTimeout(resolve, 100));

          const updatedItem: OfflineQueueItem = {
            ...item,
            status: "completed",
            attempts: item.attempts + 1,
          };

          processedItems.push(updatedItem);

          if (onProgress) {
            onProgress(processedItems.length, totalItems);
          }
        } catch (batchError) {
          const failedItem: OfflineQueueItem = {
            ...item,
            status: "failed",
            attempts: item.attempts + 1,
            error:
              batchError instanceof Error
                ? batchError
                : new Error("Batch processing failed"),
          };

          failedItems.push(failedItem);
        }
      }
    } catch (error) {
      return {
        success: false,
        processedItems,
        failedItems: [
          ...failedItems,
          ...batch.map((item) => ({
            ...item,
            status: "failed",
            attempts: item.attempts + 1,
            error:
              error instanceof Error
                ? error
                : new Error("Batch processing failed"),
          })),
        ],
        error:
          error instanceof Error
            ? error
            : new Error("Sync batch processing failed"),
      };
    }
  }

  return {
    success: true,
    processedItems,
    failedItems,
  };
}

/**
 * Handle sync conflicts with advanced resolution strategies
 */
export async function handleSyncConflict(
  localItem: OfflineQueueItem,
  remoteData: any,
  settings: OfflineSettings,
): Promise<{
  resolvedData: any;
  resolutionStrategy: string;
}> {
  const strategy = settings.conflictResolution;

  switch (strategy) {
    case "local-wins":
      return {
        resolvedData: localItem.data,
        resolutionStrategy: "local-wins",
      };

    case "remote-wins":
      return {
        resolvedData: remoteData,
        resolutionStrategy: "remote-wins",
      };

    case "timestamp":
      // Compare timestamps
      const localTimestamp =
        localItem.data.updatedAt ||
        localItem.data.timestamp ||
        localItem.timestamp;
      const remoteTimestamp =
        remoteData.updatedAt || remoteData.timestamp || new Date();

      if (new Date(localTimestamp) >= new Date(remoteTimestamp)) {
        return {
          resolvedData: localItem.data,
          resolutionStrategy: "timestamp-local-newer",
        };
      } else {
        return {
          resolvedData: remoteData,
          resolutionStrategy: "timestamp-remote-newer",
        };
      }

    case "manual":
      // In a real implementation, this would trigger UI for manual resolution
      console.warn(
        "Manual conflict resolution required for:",
        localItem.operation,
      );
      return {
        resolvedData: null,
        resolutionStrategy: "manual-required",
      };

    default:
      return {
        resolvedData: localItem.data,
        resolutionStrategy: "default-local-wins",
      };
  }
}

/**
 * Get sync health metrics
 * Provides insights into sync performance and reliability
 */
export function getSyncHealthMetrics(): {
  successRate: number;
  averageAttempts: number;
  failureRate: number;
  pendingRatio: number;
} {
  const state = offlineService.getOfflineState();
  const queue = state.queue;

  if (queue.length === 0) {
    return {
      successRate: 100,
      averageAttempts: 0,
      failureRate: 0,
      pendingRatio: 0,
    };
  }

  const completedItems = queue.filter((item) => item.status === "completed");
  const failedItems = queue.filter((item) => item.status === "failed");
  const pendingItems = queue.filter((item) => item.status === "pending");

  const totalAttempts = queue.reduce((sum, item) => sum + item.attempts, 0);
  const successRate = (completedItems.length / queue.length) * 100;
  const failureRate = (failedItems.length / queue.length) * 100;
  const pendingRatio = (pendingItems.length / queue.length) * 100;
  const averageAttempts = totalAttempts / queue.length;

  return {
    successRate,
    averageAttempts,
    failureRate,
    pendingRatio,
  };
}

/**
 * Check if network is available and stable
 */
export function isNetworkStable(): boolean {
  // In a real implementation, this would check network stability
  // For now, we'll just check if we're online
  return navigator.onLine;
}

/**
 * Get optimal sync interval based on network conditions
 */
export function getOptimalSyncInterval(settings: OfflineSettings): number {
  // Base interval from settings
  let interval = settings.syncInterval;

  // Adjust based on queue size
  const state = offlineService.getOfflineState();
  if (state.queue.length > 50) {
    interval = Math.max(5000, interval / 2); // More frequent sync for large queues
  } else if (state.queue.length < 10) {
    interval = Math.min(60000, interval * 2); // Less frequent sync for small queues
  }

  return interval;
}

/**
 * Create sync report
 * Generates a summary report of sync operations
 */
export function createSyncReport(
  startTime: Date,
  endTime: Date,
  processedItems: number,
  failedItems: number,
): any {
  const duration = endTime.getTime() - startTime.getTime();

  return {
    syncReport: {
      timestamp: new Date().toISOString(),
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      durationMs: duration,
      processedItems,
      failedItems,
      successRate:
        processedItems > 0
          ? ((processedItems - failedItems) / processedItems) * 100
          : 0,
      status: failedItems === 0 ? "success" : "partial-success",
    },
  };
}

/**
 * Validate sync readiness
 * Checks if the system is ready for sync operations
 */
export function validateSyncReadiness(): {
  isReady: boolean;
  reasons?: string[];
} {
  const reasons: string[] = [];
  const state = offlineService.getOfflineState();

  if (state.isOffline) {
    reasons.push("Network is offline");
  }

  if (state.queue.length === 0) {
    reasons.push("No items in queue");
  }

  if (state.isProcessing) {
    reasons.push("Sync already in progress");
  }

  return {
    isReady: reasons.length === 0,
    reasons: reasons.length > 0 ? reasons : undefined,
  };
}

/**
 * Get sync progress estimation
 * Estimates time remaining for sync operations
 */
export function estimateSyncProgress(
  processedItems: number,
  totalItems: number,
  startTime: Date,
): {
  percentage: number;
  estimatedTimeRemainingMs: number;
  itemsPerSecond: number;
} {
  const now = new Date();
  const elapsedTimeMs = now.getTime() - startTime.getTime();
  const elapsedSeconds = elapsedTimeMs / 1000;

  const itemsPerSecond =
    elapsedSeconds > 0 ? processedItems / elapsedSeconds : 0;
  const remainingItems = totalItems - processedItems;
  const estimatedTimeRemainingMs =
    itemsPerSecond > 0 ? (remainingItems / itemsPerSecond) * 1000 : 0;

  const percentage = totalItems > 0 ? (processedItems / totalItems) * 100 : 0;

  return {
    percentage,
    estimatedTimeRemainingMs,
    itemsPerSecond,
  };
}

/**
 * Offline Queue Utilities
 */

/**
 * Validate queue item before adding
 */
export function validateQueueItem(
  operation: string,
  type: "create" | "update" | "delete" | "sync",
  data: any,
  settings: OfflineSettings,
): {
  isValid: boolean;
  error?: string;
} {
  if (!operation || typeof operation !== "string") {
    return {
      isValid: false,
      error: "Operation must be a non-empty string",
    };
  }

  if (!["create", "update", "delete", "sync"].includes(type)) {
    return {
      isValid: false,
      error: "Type must be one of: create, update, delete, sync",
    };
  }

  if (data === undefined || data === null) {
    return {
      isValid: false,
      error: "Data cannot be null or undefined",
    };
  }

  // Check if data can be serialized
  try {
    JSON.stringify(data);
  } catch (error) {
    return {
      isValid: false,
      error: "Data must be JSON serializable",
    };
  }

  return { isValid: true };
}

/**
 * Check if queue has capacity for more items
 */
export function hasQueueCapacity(settings: OfflineSettings): boolean {
  const state = offlineService.getOfflineState();
  return state.queue.length < settings.maxQueueSize;
}

/**
 * Get queue statistics with detailed analysis
 */
export function getQueueStatistics(): {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  averageAttempts: number;
  oldestItemAgeMs: number;
  queueUtilization: number;
} {
  const state = offlineService.getOfflineState();
  const queue = state.queue;

  if (queue.length === 0) {
    return {
      total: 0,
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
      averageAttempts: 0,
      oldestItemAgeMs: 0,
      queueUtilization: 0,
    };
  }

  const pending = queue.filter((item) => item.status === "pending").length;
  const processing = queue.filter(
    (item) => item.status === "processing",
  ).length;
  const completed = queue.filter((item) => item.status === "completed").length;
  const failed = queue.filter((item) => item.status === "failed").length;

  const totalAttempts = queue.reduce((sum, item) => sum + item.attempts, 0);
  const averageAttempts = totalAttempts / queue.length;

  const oldestItem = queue.reduce(
    (oldest, item) =>
      new Date(item.timestamp) < new Date(oldest.timestamp) ? item : oldest,
    queue[0],
  );
  const oldestItemAgeMs = Date.now() - new Date(oldestItem.timestamp).getTime();

  const queueUtilization = (queue.length / state.settings.maxQueueSize) * 100;

  return {
    total: queue.length,
    pending,
    processing,
    completed,
    failed,
    averageAttempts,
    oldestItemAgeMs,
    queueUtilization,
  };
}

/**
 * Filter queue by status
 */
export function filterQueueByStatus(
  queue: OfflineQueueItem[],
  status: "pending" | "processing" | "completed" | "failed",
): OfflineQueueItem[] {
  return queue.filter((item) => item.status === status);
}

/**
 * Find queue items by operation type
 */
export function findQueueItemsByOperation(
  queue: OfflineQueueItem[],
  operationFilter: string,
): OfflineQueueItem[] {
  return queue.filter((item) =>
    item.operation.toLowerCase().includes(operationFilter.toLowerCase()),
  );
}

/**
 * Get queue items that need retry
 * Returns items that have failed and could be retried
 */
export function getItemsNeedingRetry(
  queue: OfflineQueueItem[],
): OfflineQueueItem[] {
  return queue.filter(
    (item) => item.status === "failed" && item.attempts < 3, // Limit retry attempts
  );
}

/**
 * Clean up completed items from queue
 */
export function cleanupCompletedItems(
  queue: OfflineQueueItem[],
): OfflineQueueItem[] {
  return queue.filter((item) => item.status !== "completed");
}

/**
 * Archive completed items for audit purposes
 */
export function archiveCompletedItems(
  queue: OfflineQueueItem[],
): OfflineQueueItem[] {
  return queue.filter((item) => item.status === "completed");
}

/**
 * Check if queue contains critical operations
 * Identifies operations that should be prioritized
 */
export function hasCriticalOperations(queue: OfflineQueueItem[]): boolean {
  return queue.some(
    (item) =>
      item.operation.toLowerCase().includes("critical") ||
      item.operation.toLowerCase().includes("urgent") ||
      item.operation.toLowerCase().includes("priority"),
  );
}

/**
 * Get queue processing time estimates
 */
export function estimateQueueProcessingTime(
  queue: OfflineQueueItem[],
  itemsPerSecond: number = 5,
): number {
  // Estimate based on queue size and processing rate
  return Math.ceil(queue.length / itemsPerSecond) * 1000; // in milliseconds
}

/**
 * Offline Settings Utilities
 */

/**
 * Validate offline settings
 */
export function validateOfflineSettings(settings: Partial<OfflineSettings>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (
    settings.autoSyncEnabled !== undefined &&
    typeof settings.autoSyncEnabled !== "boolean"
  ) {
    errors.push("autoSyncEnabled must be a boolean");
  }

  if (settings.syncInterval !== undefined) {
    if (typeof settings.syncInterval !== "number") {
      errors.push("syncInterval must be a number");
    } else if (settings.syncInterval < 1000 || settings.syncInterval > 300000) {
      errors.push("syncInterval must be between 1000 and 300000 milliseconds");
    }
  }

  if (settings.maxQueueSize !== undefined) {
    if (typeof settings.maxQueueSize !== "number") {
      errors.push("maxQueueSize must be a number");
    } else if (settings.maxQueueSize < 10 || settings.maxQueueSize > 1000) {
      errors.push("maxQueueSize must be between 10 and 1000");
    }
  }

  if (
    settings.conflictResolution !== undefined &&
    !["local-wins", "remote-wins", "manual", "timestamp"].includes(
      settings.conflictResolution,
    )
  ) {
    errors.push(
      "conflictResolution must be one of: local-wins, remote-wins, manual, timestamp",
    );
  }

  if (settings.offlineDataRetention !== undefined) {
    if (typeof settings.offlineDataRetention !== "number") {
      errors.push("offlineDataRetention must be a number");
    } else if (
      settings.offlineDataRetention < 1 ||
      settings.offlineDataRetention > 365
    ) {
      errors.push("offlineDataRetention must be between 1 and 365 days");
    }
  }

  if (
    settings.showOfflineIndicator !== undefined &&
    typeof settings.showOfflineIndicator !== "boolean"
  ) {
    errors.push("showOfflineIndicator must be a boolean");
  }

  if (
    settings.syncOnReconnect !== undefined &&
    typeof settings.syncOnReconnect !== "boolean"
  ) {
    errors.push("syncOnReconnect must be a boolean");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Get recommended settings based on usage patterns
 */
export function getRecommendedSettings(): OfflineSettings {
  const state = offlineService.getOfflineState();

  // Base settings
  const recommended: OfflineSettings = {
    autoSyncEnabled: true,
    syncInterval: 30000,
    maxQueueSize: 100,
    conflictResolution: "timestamp",
    offlineDataRetention: 30,
    showOfflineIndicator: true,
    syncOnReconnect: true,
  };

  // Adjust based on usage patterns
  if (state.queue.length > 50) {
    recommended.maxQueueSize = 200; // Larger queue for heavy usage
    recommended.syncInterval = 15000; // More frequent sync
  }

  if (state.pendingChanges > 20) {
    recommended.autoSyncEnabled = true;
    recommended.syncOnReconnect = true;
  }

  return recommended;
}

/**
 * Compare settings with defaults
 * Identifies which settings have been customized
 */
export function compareSettingsWithDefaults(
  currentSettings: OfflineSettings,
  defaultSettings: OfflineSettings,
): Partial<OfflineSettings> {
  const customizedSettings: Partial<OfflineSettings> = {};

  for (const key in currentSettings) {
    if (
      currentSettings[key as keyof OfflineSettings] !==
      defaultSettings[key as keyof OfflineSettings]
    ) {
      customizedSettings[key as keyof OfflineSettings] =
        currentSettings[key as keyof OfflineSettings];
    }
  }

  return customizedSettings;
}

/**
 * Create settings profile based on user behavior
 */
export function createSettingsProfile(settings: OfflineSettings): string {
  // Analyze settings to determine user profile
  if (
    settings.autoSyncEnabled &&
    settings.syncOnReconnect &&
    settings.syncInterval < 20000
  ) {
    return "aggressive-sync";
  }

  if (!settings.autoSyncEnabled && settings.syncInterval > 60000) {
    return "conservative-sync";
  }

  if (settings.maxQueueSize > 150) {
    return "high-volume";
  }

  if (settings.conflictResolution === "manual") {
    return "cautious";
  }

  return "balanced";
}

/**
 * Get settings impact analysis
 * Analyzes how settings affect performance and behavior
 */
export function getSettingsImpactAnalysis(settings: OfflineSettings): {
  performanceImpact: "low" | "medium" | "high";
  dataUsageImpact: "low" | "medium" | "high";
  batteryImpact: "low" | "medium" | "high";
  reliabilityImpact: "low" | "medium" | "high";
} {
  let performanceImpact: "low" | "medium" | "high" = "medium";
  let dataUsageImpact: "low" | "medium" | "high" = "medium";
  let batteryImpact: "low" | "medium" | "high" = "medium";
  let reliabilityImpact: "low" | "medium" | "high" = "medium";

  // Performance impact
  if (settings.syncInterval < 15000) {
    performanceImpact = "high";
  } else if (settings.syncInterval > 45000) {
    performanceImpact = "low";
  }

  // Data usage impact
  if (settings.autoSyncEnabled && settings.syncInterval < 20000) {
    dataUsageImpact = "high";
  } else if (!settings.autoSyncEnabled) {
    dataUsageImpact = "low";
  }

  // Battery impact
  if (settings.autoSyncEnabled && settings.syncInterval < 30000) {
    batteryImpact = "high";
  } else if (!settings.autoSyncEnabled) {
    batteryImpact = "low";
  }

  // Reliability impact
  if (settings.conflictResolution === "manual") {
    reliabilityImpact = "high"; // More reliable but requires user intervention
  } else if (settings.conflictResolution === "timestamp") {
    reliabilityImpact = "medium";
  }

  return {
    performanceImpact,
    dataUsageImpact,
    batteryImpact,
    reliabilityImpact,
  };
}

/**
 * Export settings to portable format
 */
export function exportSettingsToPortable(settings: OfflineSettings): string {
  return JSON.stringify(
    {
      offlineSettings: settings,
      version: "1.0",
      exportedAt: new Date().toISOString(),
    },
    null,
    2,
  );
}

/**
 * Import settings from portable format
 */
export function importSettingsFromPortable(
  portableSettings: string,
): OfflineSettings | null {
  try {
    const parsed = JSON.parse(portableSettings);
    if (parsed.offlineSettings) {
      return parsed.offlineSettings;
    }
    return null;
  } catch (error) {
    console.error("Failed to import settings:", error);
    return null;
  }
}

/**
 * Get settings validation warnings
 * Provides warnings for potentially problematic settings
 */
export function getSettingsValidationWarnings(
  settings: OfflineSettings,
): string[] {
  const warnings: string[] = [];

  if (settings.syncInterval < 10000 && settings.autoSyncEnabled) {
    warnings.push(
      "Very frequent sync intervals may impact battery life and performance",
    );
  }

  if (settings.maxQueueSize > 500) {
    warnings.push("Large queue sizes may impact memory usage");
  }

  if (settings.offlineDataRetention > 180) {
    warnings.push("Long data retention periods may use significant storage");
  }

  if (settings.conflictResolution === "manual") {
    warnings.push("Manual conflict resolution requires user intervention");
  }

  return warnings;
}
