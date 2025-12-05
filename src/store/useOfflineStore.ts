import { create } from "zustand";
import { persist } from "zustand/middleware";
import { devtools } from "zustand/middleware";
import {
  OfflineState,
  OfflineQueueItem,
  OfflineSettings,
  OfflineStatus,
  OfflineQueuePriority,
  OfflineOperationResult,
  OfflineBatchResult,
} from "../types/offlineTypes";

// Default settings with enhanced configuration
const DEFAULT_SETTINGS: OfflineSettings = {
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
};

// Enhanced offline store with comprehensive state management
export const useOfflineStore = create<OfflineState>()(
  devtools(
    persist(
      (set, get) => ({
        // Status state
        status: {
          isOffline: false,
          status: "online",
          lastStatusChange: null,
          connectionQuality: "unknown",
          networkType: "unknown",
          isFirstConnection: true,
          offlineSince: null,
          onlineSince: null,
          connectionHistory: [],
        },

        // Queue state
        queue: {
          items: [],
          totalCount: 0,
          pendingCount: 0,
          processingCount: 0,
          completedCount: 0,
          failedCount: 0,
          retryingCount: 0,
          queueSize: 0,
          maxQueueSize: DEFAULT_SETTINGS.maxQueueSize,
          isQueueFull: false,
          lastUpdated: null,
        },

        // Sync state
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

        // Settings state
        settings: DEFAULT_SETTINGS,

        // Error state
        error: null,

        // Processing state
        isProcessing: false,

        // Pending changes
        pendingChanges: 0,

        // Last sync timestamp
        lastSync: null,

        // Storage usage
        storageUsage: {
          used: 0,
          available: 0,
          percentage: 0,
        },

        // Performance metrics
        performanceMetrics: {
          queueProcessingTime: 0,
          syncProcessingTime: 0,
          memoryUsage: 0,
        },

        // Status management methods
        checkOnlineStatus: () => {
          const isOnline = navigator.onLine;
          const newStatus: OfflineStatus = isOnline ? "online" : "offline";
          const now = new Date();

          set((state) => {
            const connectionHistory = [...state.status.connectionHistory];
            if (connectionHistory.length >= 10) {
              connectionHistory.shift();
            }

            connectionHistory.push({
              timestamp: now,
              status: newStatus,
              duration: 0,
            });

            return {
              status: {
                ...state.status,
                isOffline: !isOnline,
                status: newStatus,
                lastStatusChange: now,
                connectionQuality: isOnline ? "good" : "unknown",
                networkType: isOnline ? "wifi" : "none",
                isFirstConnection: state.status.isFirstConnection && isOnline,
                offlineSince: !isOnline ? now : null,
                onlineSince: isOnline ? now : null,
                connectionHistory,
              },
            };
          });

          return !isOnline;
        },

        // Queue management methods
        addToQueue: (
          item: Omit<
            OfflineQueueItem,
            | "id"
            | "timestamp"
            | "status"
            | "attempts"
            | "priority"
            | "retryCount"
            | "lastAttempt"
          >,
        ) => {
          set((state) => {
            const priority = item.priority || state.settings.syncPriority;
            const newItem: OfflineQueueItem = {
              id: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              operation: item.operation,
              type: item.type,
              data: item.data,
              timestamp: new Date(),
              status: "pending",
              attempts: 0,
              priority,
              retryCount: 0,
              lastAttempt: null,
              metadata: item.metadata || {},
            };

            // Check if queue is full
            if (state.queue.items.length >= state.settings.maxQueueSize) {
              return {
                error: new Error(
                  `Queue full. Maximum size: ${state.settings.maxQueueSize}`,
                ),
                queue: {
                  ...state.queue,
                  isQueueFull: true,
                },
              };
            }

            // Update queue statistics
            const updatedItems = [...state.queue.items, newItem];
            const pendingCount = updatedItems.filter(
              (i) => i.status === "pending",
            ).length;
            const processingCount = updatedItems.filter(
              (i) => i.status === "processing",
            ).length;
            const completedCount = updatedItems.filter(
              (i) => i.status === "completed",
            ).length;
            const failedCount = updatedItems.filter(
              (i) => i.status === "failed",
            ).length;
            const retryingCount = updatedItems.filter(
              (i) => i.status === "retrying",
            ).length;

            return {
              queue: {
                items: updatedItems,
                totalCount: updatedItems.length,
                pendingCount,
                processingCount,
                completedCount,
                failedCount,
                retryingCount,
                queueSize: updatedItems.length,
                maxQueueSize: state.settings.maxQueueSize,
                isQueueFull: updatedItems.length >= state.settings.maxQueueSize,
                lastUpdated: new Date(),
              },
              pendingChanges: state.pendingChanges + 1,
              error: null,
            };
          });
        },

        // Process queue with batching support
        processQueue: async (batchSize?: number) => {
          const { queue, settings, sync } = get();
          const effectiveBatchSize = batchSize || settings.batchSize;

          if (get().status.isOffline || queue.items.length === 0) {
            return;
          }

          set({
            isProcessing: true,
            sync: {
              ...sync,
              isSyncing: true,
              status: "syncing",
              syncStartTime: new Date(),
              currentBatch: 0,
              totalBatches: Math.ceil(queue.items.length / effectiveBatchSize),
            },
          });

          try {
            const startTime = Date.now();
            const itemsToProcess = [...queue.items].filter(
              (item) => item.status === "pending",
            );
            const totalItems = itemsToProcess.length;
            let processedItems = 0;
            let failedItems = 0;
            const errors: Error[] = [];

            // Process in batches
            for (
              let batchIndex = 0;
              batchIndex < itemsToProcess.length;
              batchIndex += effectiveBatchSize
            ) {
              const batch = itemsToProcess.slice(
                batchIndex,
                batchIndex + effectiveBatchSize,
              );
              const batchId = `batch-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

              // Simulate batch processing
              const batchResults = await Promise.all(
                batch.map(async (item) => {
                  try {
                    // Simulate API call with delay based on priority
                    const delay =
                      item.priority === "critical"
                        ? 500
                        : item.priority === "high"
                          ? 1000
                          : item.priority === "medium"
                            ? 1500
                            : 2000;

                    await new Promise((resolve) => setTimeout(resolve, delay));

                    return {
                      ...item,
                      status: "completed",
                      attempts: item.attempts + 1,
                      lastAttempt: new Date(),
                    };
                  } catch (error) {
                    failedItems++;
                    errors.push(
                      error instanceof Error
                        ? error
                        : new Error("Batch processing failed"),
                    );

                    return {
                      ...item,
                      status: "failed",
                      attempts: item.attempts + 1,
                      error:
                        error instanceof Error
                          ? error
                          : new Error("Batch processing failed"),
                      lastAttempt: new Date(),
                    };
                  }
                }),
              );

              processedItems += batch.length - failedItems;
              set({
                pendingChanges: Math.max(
                  0,
                  get().pendingChanges - (batch.length - failedItems),
                ),
              });

              // Update sync progress
              set((state) => ({
                sync: {
                  ...state.sync,
                  progress: Math.min(
                    100,
                    Math.round(
                      ((batchIndex + batch.length) / totalItems) * 100,
                    ),
                  ),
                  processedItems:
                    state.sync.processedItems + (batch.length - failedItems),
                  failedItems: state.sync.failedItems + failedItems,
                  currentBatch: Math.floor(
                    (batchIndex + batch.length) / effectiveBatchSize,
                  ),
                  syncStatistics: {
                    ...state.sync.syncStatistics,
                    successRate:
                      processedItems / (processedItems + failedItems),
                    lastSyncSize: batch.length,
                  },
                },
              }));

              // Update queue items
              set((state) => {
                const updatedItems = state.queue.items.map((existingItem) => {
                  const updatedItem = batchResults.find(
                    (item) => item.id === existingItem.id,
                  );
                  return updatedItem || existingItem;
                });

                return {
                  queue: {
                    ...state.queue,
                    items: updatedItems,
                    completedCount: updatedItems.filter(
                      (i) => i.status === "completed",
                    ).length,
                    failedCount: updatedItems.filter(
                      (i) => i.status === "failed",
                    ).length,
                    lastUpdated: new Date(),
                  },
                };
              });
            }

            const syncDuration = Date.now() - startTime;

            set({
              isProcessing: false,
              sync: {
                ...sync,
                status: "completed",
                isSyncing: false,
                syncEndTime: new Date(),
                syncDuration,
                lastSynced: new Date(),
                progress: 100,
                syncStatistics: {
                  ...sync.syncStatistics,
                  averageDuration: syncDuration / totalItems,
                  successRate: processedItems / totalItems,
                },
              },
              lastSync: new Date(),
              performanceMetrics: {
                ...get().performanceMetrics,
                syncProcessingTime: syncDuration,
              },
            });

            return {
              success: true,
              processedCount: processedItems,
              failedCount: failedItems,
              errors,
              batchId: `sync-${Date.now()}`,
              timestamp: new Date(),
            } as OfflineBatchResult;
          } catch (error) {
            set({
              error:
                error instanceof Error
                  ? error
                  : new Error("Queue processing failed"),
              isProcessing: false,
              sync: {
                ...sync,
                status: "error",
                isSyncing: false,
                error:
                  error instanceof Error
                    ? error
                    : new Error("Queue processing failed"),
              },
            });
            return {
              success: false,
              error:
                error instanceof Error
                  ? error
                  : new Error("Queue processing failed"),
              processedCount: 0,
              failedCount: 0,
              errors: [
                error instanceof Error
                  ? error
                  : new Error("Queue processing failed"),
              ],
              batchId: `error-${Date.now()}`,
              timestamp: new Date(),
            } as OfflineBatchResult;
          }
        },

        // Retry queue items with enhanced retry logic
        retryQueueItem: async (itemId: string) => {
          set((state) => ({
            queue: {
              ...state.queue,
              items: state.queue.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      status: "retrying",
                      attempts: item.attempts + 1,
                      retryCount: (item.retryCount || 0) + 1,
                      lastAttempt: new Date(),
                    }
                  : item,
              ),
              retryingCount:
                state.queue.items.filter((item) => item.id === itemId).length >
                0
                  ? state.queue.retryingCount + 1
                  : state.queue.retryingCount,
            },
          }));

          // Simulate retry with exponential backoff based on settings
          const { settings } = get();
          const retryDelay =
            settings.retryStrategy === "exponential"
              ? Math.min(
                  30000,
                  settings.retryDelay *
                    Math.pow(
                      2,
                      get().queue.items.find((item) => item.id === itemId)
                        ?.retryCount || 0,
                    ),
                )
              : settings.retryDelay;

          await new Promise((resolve) => setTimeout(resolve, retryDelay));

          set((state) => {
            const updatedItems = state.queue.items.map((item) => {
              if (item.id === itemId) {
                // Simulate successful retry
                const success = Math.random() > 0.2; // 80% success rate for simulation
                return {
                  ...item,
                  status: success ? "completed" : "failed",
                  lastAttempt: new Date(),
                };
              }
              return item;
            });

            const completedCount = updatedItems.filter(
              (i) => i.status === "completed",
            ).length;
            const failedCount = updatedItems.filter(
              (i) => i.status === "failed",
            ).length;
            const retryingCount = updatedItems.filter(
              (i) => i.status === "retrying",
            ).length;

            return {
              queue: {
                ...state.queue,
                items: updatedItems,
                completedCount,
                failedCount,
                retryingCount,
                lastUpdated: new Date(),
              },
              pendingChanges: Math.max(
                0,
                state.pendingChanges - (success ? 1 : 0),
              ),
            };
          });
        },

        // Clear queue with enhanced functionality
        clearQueue: () => {
          set({
            queue: {
              items: [],
              totalCount: 0,
              pendingCount: 0,
              processingCount: 0,
              completedCount: 0,
              failedCount: 0,
              retryingCount: 0,
              queueSize: 0,
              maxQueueSize: get().settings.maxQueueSize,
              isQueueFull: false,
              lastUpdated: new Date(),
            },
            pendingChanges: 0,
            error: null,
          });
        },

        // Settings management with validation
        updateSettings: (newSettings: Partial<OfflineSettings>) => {
          set((state) => {
            // Validate settings
            const validatedSettings = {
              ...state.settings,
              ...newSettings,
              // Ensure values are within reasonable bounds
              syncInterval: Math.max(
                5000,
                Math.min(
                  3600000,
                  newSettings.syncInterval || state.settings.syncInterval,
                ),
              ),
              maxQueueSize: Math.max(
                10,
                Math.min(
                  1000,
                  newSettings.maxQueueSize || state.settings.maxQueueSize,
                ),
              ),
              maxRetryAttempts: Math.max(
                1,
                Math.min(
                  10,
                  newSettings.maxRetryAttempts ||
                    state.settings.maxRetryAttempts,
                ),
              ),
              retryDelay: Math.max(
                1000,
                Math.min(
                  60000,
                  newSettings.retryDelay || state.settings.retryDelay,
                ),
              ),
              batchSize: Math.max(
                1,
                Math.min(50, newSettings.batchSize || state.settings.batchSize),
              ),
              offlineDataRetention: Math.max(
                1,
                Math.min(
                  365,
                  newSettings.offlineDataRetention ||
                    state.settings.offlineDataRetention,
                ),
              ),
            };

            return {
              settings: validatedSettings,
              queue: {
                ...state.queue,
                maxQueueSize: validatedSettings.maxQueueSize,
              },
            };
          });
        },

        // Clear error
        clearError: () => {
          set({
            error: null,
            sync: {
              ...get().sync,
              error: null,
            },
          });
        },

        // Simulate network change with enhanced functionality
        simulateNetworkChange: (isOnline: boolean) => {
          set((state) => {
            const newStatus: OfflineStatus = isOnline ? "online" : "offline";
            const now = new Date();

            // Update connection history
            const connectionHistory = [...state.status.connectionHistory];
            if (connectionHistory.length >= 10) {
              connectionHistory.shift();
            }

            connectionHistory.push({
              timestamp: now,
              status: newStatus,
              duration: 0,
            });

            return {
              status: {
                ...state.status,
                isOffline: !isOnline,
                status: newStatus,
                lastStatusChange: now,
                connectionQuality: isOnline ? "good" : "unknown",
                networkType: isOnline ? "wifi" : "none",
                offlineSince: !isOnline ? now : null,
                onlineSince: isOnline ? now : null,
                connectionHistory,
              },
            };
          });
        },

        // Enhanced queue management methods
        getQueueStats: () => {
          const state = get();
          return {
            totalItems: state.queue.totalCount,
            pendingItems: state.queue.pendingCount,
            processingItems: state.queue.processingCount,
            completedItems: state.queue.completedCount,
            failedItems: state.queue.failedCount,
            retryingItems: state.queue.retryingCount,
            queueSize: state.queue.queueSize,
            maxQueueSize: state.queue.maxQueueSize,
            isQueueFull: state.queue.isQueueFull,
          };
        },

        // Get queue items by status
        getQueueItemsByStatus: (status: OfflineQueueItem["status"]) => {
          return get().queue.items.filter((item) => item.status === status);
        },

        // Get queue items by priority
        getQueueItemsByPriority: (priority: OfflineQueuePriority) => {
          return get().queue.items.filter((item) => item.priority === priority);
        },

        // Update queue item priority
        updateQueueItemPriority: (
          itemId: string,
          newPriority: OfflineQueuePriority,
        ) => {
          set((state) => ({
            queue: {
              ...state.queue,
              items: state.queue.items.map((item) =>
                item.id === itemId ? { ...item, priority: newPriority } : item,
              ),
            },
          }));
        },

        // Remove specific queue item
        removeQueueItem: (itemId: string) => {
          set((state) => {
            const updatedItems = state.queue.items.filter(
              (item) => item.id !== itemId,
            );
            return {
              queue: {
                ...state.queue,
                items: updatedItems,
                totalCount: updatedItems.length,
                pendingCount: updatedItems.filter((i) => i.status === "pending")
                  .length,
                processingCount: updatedItems.filter(
                  (i) => i.status === "processing",
                ).length,
                completedCount: updatedItems.filter(
                  (i) => i.status === "completed",
                ).length,
                failedCount: updatedItems.filter((i) => i.status === "failed")
                  .length,
                retryingCount: updatedItems.filter(
                  (i) => i.status === "retrying",
                ).length,
                queueSize: updatedItems.length,
                lastUpdated: new Date(),
              },
              pendingChanges: Math.max(0, state.pendingChanges - 1),
            };
          });
        },

        // Pause sync process
        pauseSync: () => {
          set((state) => ({
            sync: {
              ...state.sync,
              isPaused: true,
              status:
                state.sync.status === "syncing" ? "paused" : state.sync.status,
            },
          }));
        },

        // Resume sync process
        resumeSync: () => {
          set((state) => ({
            sync: {
              ...state.sync,
              isPaused: false,
              status:
                state.sync.status === "paused" ? "syncing" : state.sync.status,
            },
          }));
        },

        // Get current offline state summary
        getOfflineState: () => {
          const state = get();
          return {
            isOffline: state.status.isOffline,
            status: state.status.status,
            pendingChanges: state.pendingChanges,
            queueLength: state.queue.totalCount,
            lastSync: state.lastSync,
            error: state.error,
            isProcessing: state.isProcessing,
            connectionQuality: state.status.connectionQuality,
            networkType: state.status.networkType,
          };
        },

        // Get sync status
        getSyncStatus: () => {
          return get().sync;
        },

        // Check if sync is needed
        isSyncNeeded: () => {
          const state = get();
          return (
            state.queue.pendingCount > 0 &&
            !state.status.isOffline &&
            !state.sync.isSyncing
          );
        },

        // Update storage usage metrics
        updateStorageUsage: (used: number, available: number) => {
          set({
            storageUsage: {
              used,
              available,
              percentage:
                available > 0 ? Math.round((used / available) * 100) : 0,
            },
          });
        },

        // Update performance metrics
        updatePerformanceMetrics: (
          metrics: Partial<{
            queueProcessingTime: number;
            syncProcessingTime: number;
            memoryUsage: number;
          }>,
        ) => {
          set((state) => ({
            performanceMetrics: {
              ...state.performanceMetrics,
              ...metrics,
            },
          }));
        },

        // Initialize offline store with default values
        initializeOfflineStore: () => {
          set({
            status: {
              isOffline: false,
              status: "online",
              lastStatusChange: new Date(),
              connectionQuality: "good",
              networkType: "wifi",
              isFirstConnection: true,
              offlineSince: null,
              onlineSince: new Date(),
              connectionHistory: [
                {
                  timestamp: new Date(),
                  status: "online",
                  duration: 0,
                },
              ],
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
              maxQueueSize: DEFAULT_SETTINGS.maxQueueSize,
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
            settings: DEFAULT_SETTINGS,
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
          });
        },
      }),
      {
        name: "todone-offline-storage",
        storage: createJSONStorage(() => localStorage),
      },
    ),
  ),
);

// Helper function to create localStorage
const createJSONStorage = (getStorage: () => Storage) => ({
  getItem: (name: string) => {
    const storage = getStorage();
    const item = storage.getItem(name);
    return item ? JSON.parse(item) : null;
  },
  setItem: (name: string, value: any) => {
    const storage = getStorage();
    storage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name: string) => {
    const storage = getStorage();
    storage.removeItem(name);
  },
});
