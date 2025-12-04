/**
 * Offline feature types
 */

export type OfflineStatus = 'online' | 'offline' | 'unknown';

export type OfflineSyncStatus = 'idle' | 'syncing' | 'completed' | 'error' | 'paused' | 'queued';

export type OfflineQueuePriority = 'high' | 'medium' | 'low' | 'critical';

export interface OfflineQueueItem {
  id: string;
  operation: string;
  type: 'create' | 'update' | 'delete' | 'sync';
  data: any;
  timestamp: Date;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'retrying';
  attempts: number;
  error?: Error | null;
  priority?: OfflineQueuePriority;
  retryCount?: number;
  lastAttempt?: Date | null;
  metadata?: Record<string, any>;
}

export interface OfflineQueueState {
  items: OfflineQueueItem[];
  totalCount: number;
  pendingCount: number;
  processingCount: number;
  completedCount: number;
  failedCount: number;
  retryingCount: number;
  queueSize: number;
  maxQueueSize: number;
  isQueueFull: boolean;
  lastUpdated: Date | null;
}

export interface OfflineSyncState {
  status: OfflineSyncStatus;
  lastSynced: Date | null;
  error: Error | null;
  progress: number;
  totalItems: number;
  processedItems: number;
  failedItems: number;
  syncDuration: number | null;
  isSyncing: boolean;
  isPaused: boolean;
  syncStartTime: Date | null;
  syncEndTime: Date | null;
  currentBatch: number;
  totalBatches: number;
  syncStatistics: {
    successRate: number;
    averageDuration: number;
    lastSyncSize: number;
  };
}

export interface OfflineSettings {
  autoSyncEnabled: boolean;
  syncInterval: number;
  maxQueueSize: number;
  conflictResolution: 'local-wins' | 'remote-wins' | 'manual' | 'timestamp';
  offlineDataRetention: number;
  showOfflineIndicator: boolean;
  syncOnReconnect: boolean;
  maxRetryAttempts: number;
  retryDelay: number;
  batchSize: number;
  enableCompression: boolean;
  enableEncryption: boolean;
  syncPriority: OfflineQueuePriority;
  autoRetryFailedItems: boolean;
  retryStrategy: 'linear' | 'exponential' | 'immediate';
}

export interface OfflineStatusState {
  isOffline: boolean;
  status: OfflineStatus;
  lastStatusChange: Date | null;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor' | 'unknown';
  networkType: 'wifi' | 'cellular' | 'ethernet' | 'unknown' | 'none';
  isFirstConnection: boolean;
  offlineSince: Date | null;
  onlineSince: Date | null;
  connectionHistory: {
    timestamp: Date;
    status: OfflineStatus;
    duration: number;
  }[];
}

export interface OfflineState {
  status: OfflineStatusState;
  queue: OfflineQueueState;
  sync: OfflineSyncState;
  settings: OfflineSettings;
  error: Error | null;
  isProcessing: boolean;
  pendingChanges: number;
  lastSync: Date | null;
  storageUsage: {
    used: number;
    available: number;
    percentage: number;
  };
  performanceMetrics: {
    queueProcessingTime: number;
    syncProcessingTime: number;
    memoryUsage: number;
  };
}

// Helper types for offline operations
export interface OfflineOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: Error | null;
  timestamp: Date;
  operationId?: string;
}

export interface OfflineBatchResult {
  success: boolean;
  processedCount: number;
  failedCount: number;
  errors: Error[];
  batchId: string;
  timestamp: Date;
}