/**
 * Offline Utilities Service
 *
 * This service integrates the offline utilities with the existing
 * offline services and components, providing a comprehensive
 * interface for offline functionality.
 */

import { OfflineQueueItem, OfflineSettings } from '../types/offlineTypes';
import { offlineService } from './offlineService';
import { offlineSyncService } from './offlineSyncService';
import {
  transformDataForOfflineStorage,
  transformOfflineDataToApplication,
  prepareQueueItemData,
  batchTransformForOfflineStorage,
  batchTransformOfflineToApplication,
  createDataSnapshot,
  compareDataSnapshots,
  mergeOfflineChanges,
  validateDataForOfflineStorage,
  compressDataForStorage,
  decompressDataFromStorage
} from '../utils/offlineUtils';
import {
  isSyncNeeded,
  getSyncPriority,
  sortQueueByPriority,
  processSyncInBatches,
  handleSyncConflict,
  getSyncHealthMetrics,
  isNetworkStable,
  getOptimalSyncInterval,
  createSyncReport,
  validateSyncReadiness,
  estimateSyncProgress,
  validateQueueItem,
  hasQueueCapacity,
  getQueueStatistics,
  filterQueueByStatus,
  findQueueItemsByOperation,
  getItemsNeedingRetry,
  cleanupCompletedItems,
  archiveCompletedItems,
  hasCriticalOperations,
  estimateQueueProcessingTime,
  validateOfflineSettings,
  getRecommendedSettings,
  compareSettingsWithDefaults,
  createSettingsProfile,
  getSettingsImpactAnalysis,
  exportSettingsToPortable,
  importSettingsFromPortable,
  getSettingsValidationWarnings
} from '../utils/offlineSyncUtils';

/**
 * Offline Utilities Service
 * Provides comprehensive offline functionality integration
 */
export class OfflineUtilsService {
  private static instance: OfflineUtilsService;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): OfflineUtilsService {
    if (!OfflineUtilsService.instance) {
      OfflineUtilsService.instance = new OfflineUtilsService();
    }
    return OfflineUtilsService.instance;
  }

  /**
   * Data Transformation Utilities
   */

  /**
   * Transform data for offline storage
   */
  transformDataForOfflineStorage(data: any): any {
    return transformDataForOfflineStorage(data);
  }

  /**
   * Transform offline data back to application format
   */
  transformOfflineDataToApplication(data: any): any {
    return transformOfflineDataToApplication(data);
  }

  /**
   * Prepare data for queue item
   */
  prepareQueueItemData(
    operation: string,
    type: 'create' | 'update' | 'delete' | 'sync',
    data: any
  ): Omit<OfflineQueueItem, 'id' | 'timestamp' | 'status' | 'attempts'> {
    return prepareQueueItemData(operation, type, data);
  }

  /**
   * Batch transform for offline storage
   */
  batchTransformForOfflineStorage(items: any[]): any[] {
    return batchTransformForOfflineStorage(items);
  }

  /**
   * Batch transform offline to application
   */
  batchTransformOfflineToApplication(items: any[]): any[] {
    return batchTransformOfflineToApplication(items);
  }

  /**
   * Create data snapshot
   */
  createDataSnapshot(data: any, snapshotName: string): any {
    return createDataSnapshot(data, snapshotName);
  }

  /**
   * Compare data snapshots
   */
  compareDataSnapshots(oldSnapshot: any, newSnapshot: any): boolean {
    return compareDataSnapshots(oldSnapshot, newSnapshot);
  }

  /**
   * Merge offline changes
   */
  mergeOfflineChanges(offlineData: any, onlineData: any): any {
    return mergeOfflineChanges(offlineData, onlineData);
  }

  /**
   * Validate data for offline storage
   */
  validateDataForOfflineStorage(data: any): boolean {
    return validateDataForOfflineStorage(data);
  }

  /**
   * Compress data for storage
   */
  compressDataForStorage(data: any): string {
    return compressDataForStorage(data);
  }

  /**
   * Decompress data from storage
   */
  decompressDataFromStorage(compressedData: string): any {
    return decompressDataFromStorage(compressedData);
  }

  /**
   * Sync Utilities
   */

  /**
   * Check if sync is needed
   */
  isSyncNeeded(): boolean {
    return isSyncNeeded();
  }

  /**
   * Get sync priority for item
   */
  getSyncPriority(item: OfflineQueueItem): number {
    return getSyncPriority(item);
  }

  /**
   * Sort queue by priority
   */
  sortQueueByPriority(queue: OfflineQueueItem[]): OfflineQueueItem[] {
    return sortQueueByPriority(queue);
  }

  /**
   * Process sync in batches
   */
  async processSyncInBatches(
    queue: OfflineQueueItem[],
    batchSize?: number,
    onProgress?: (processed: number, total: number) => void
  ): Promise<{
    success: boolean;
    processedItems: OfflineQueueItem[];
    failedItems: OfflineQueueItem[];
    error?: Error | null;
  }> {
    return processSyncInBatches(queue, batchSize, onProgress);
  }

  /**
   * Handle sync conflict
   */
  async handleSyncConflict(
    localItem: OfflineQueueItem,
    remoteData: any,
    settings: OfflineSettings
  ): Promise<{
    resolvedData: any;
    resolutionStrategy: string;
  }> {
    return handleSyncConflict(localItem, remoteData, settings);
  }

  /**
   * Get sync health metrics
   */
  getSyncHealthMetrics(): {
    successRate: number;
    averageAttempts: number;
    failureRate: number;
    pendingRatio: number;
  } {
    return getSyncHealthMetrics();
  }

  /**
   * Check if network is stable
   */
  isNetworkStable(): boolean {
    return isNetworkStable();
  }

  /**
   * Get optimal sync interval
   */
  getOptimalSyncInterval(settings: OfflineSettings): number {
    return getOptimalSyncInterval(settings);
  }

  /**
   * Create sync report
   */
  createSyncReport(
    startTime: Date,
    endTime: Date,
    processedItems: number,
    failedItems: number
  ): any {
    return createSyncReport(startTime, endTime, processedItems, failedItems);
  }

  /**
   * Validate sync readiness
   */
  validateSyncReadiness(): {
    isReady: boolean;
    reasons?: string[];
  } {
    return validateSyncReadiness();
  }

  /**
   * Estimate sync progress
   */
  estimateSyncProgress(
    processedItems: number,
    totalItems: number,
    startTime: Date
  ): {
    percentage: number;
    estimatedTimeRemainingMs: number;
    itemsPerSecond: number;
  } {
    return estimateSyncProgress(processedItems, totalItems, startTime);
  }

  /**
   * Queue Utilities
   */

  /**
   * Validate queue item
   */
  validateQueueItem(
    operation: string,
    type: 'create' | 'update' | 'delete' | 'sync',
    data: any,
    settings: OfflineSettings
  ): {
    isValid: boolean;
    error?: string;
  } {
    return validateQueueItem(operation, type, data, settings);
  }

  /**
   * Check queue capacity
   */
  hasQueueCapacity(settings: OfflineSettings): boolean {
    return hasQueueCapacity(settings);
  }

  /**
   * Get queue statistics
   */
  getQueueStatistics(): {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
    averageAttempts: number;
    oldestItemAgeMs: number;
    queueUtilization: number;
  } {
    return getQueueStatistics();
  }

  /**
   * Filter queue by status
   */
  filterQueueByStatus(
    queue: OfflineQueueItem[],
    status: 'pending' | 'processing' | 'completed' | 'failed'
  ): OfflineQueueItem[] {
    return filterQueueByStatus(queue, status);
  }

  /**
   * Find queue items by operation
   */
  findQueueItemsByOperation(
    queue: OfflineQueueItem[],
    operationFilter: string
  ): OfflineQueueItem[] {
    return findQueueItemsByOperation(queue, operationFilter);
  }

  /**
   * Get items needing retry
   */
  getItemsNeedingRetry(queue: OfflineQueueItem[]): OfflineQueueItem[] {
    return getItemsNeedingRetry(queue);
  }

  /**
   * Cleanup completed items
   */
  cleanupCompletedItems(queue: OfflineQueueItem[]): OfflineQueueItem[] {
    return cleanupCompletedItems(queue);
  }

  /**
   * Archive completed items
   */
  archiveCompletedItems(queue: OfflineQueueItem[]): OfflineQueueItem[] {
    return archiveCompletedItems(queue);
  }

  /**
   * Check for critical operations
   */
  hasCriticalOperations(queue: OfflineQueueItem[]): boolean {
    return hasCriticalOperations(queue);
  }

  /**
   * Estimate queue processing time
   */
  estimateQueueProcessingTime(
    queue: OfflineQueueItem[],
    itemsPerSecond?: number
  ): number {
    return estimateQueueProcessingTime(queue, itemsPerSecond);
  }

  /**
   * Settings Utilities
   */

  /**
   * Validate offline settings
   */
  validateOfflineSettings(settings: Partial<OfflineSettings>): {
    isValid: boolean;
    errors: string[];
  } {
    return validateOfflineSettings(settings);
  }

  /**
   * Get recommended settings
   */
  getRecommendedSettings(): OfflineSettings {
    return getRecommendedSettings();
  }

  /**
   * Compare settings with defaults
   */
  compareSettingsWithDefaults(
    currentSettings: OfflineSettings,
    defaultSettings: OfflineSettings
  ): Partial<OfflineSettings> {
    return compareSettingsWithDefaults(currentSettings, defaultSettings);
  }

  /**
   * Create settings profile
   */
  createSettingsProfile(settings: OfflineSettings): string {
    return createSettingsProfile(settings);
  }

  /**
   * Get settings impact analysis
   */
  getSettingsImpactAnalysis(settings: OfflineSettings): {
    performanceImpact: 'low' | 'medium' | 'high';
    dataUsageImpact: 'low' | 'medium' | 'high';
    batteryImpact: 'low' | 'medium' | 'high';
    reliabilityImpact: 'low' | 'medium' | 'high';
  } {
    return getSettingsImpactAnalysis(settings);
  }

  /**
   * Export settings to portable format
   */
  exportSettingsToPortable(settings: OfflineSettings): string {
    return exportSettingsToPortable(settings);
  }

  /**
   * Import settings from portable format
   */
  importSettingsFromPortable(portableSettings: string): OfflineSettings | null {
    return importSettingsFromPortable(portableSettings);
  }

  /**
   * Get settings validation warnings
   */
  getSettingsValidationWarnings(settings: OfflineSettings): string[] {
    return getSettingsValidationWarnings(settings);
  }

  /**
   * Integrated Offline Operations
   */

  /**
   * Add item to queue with validation and transformation
   */
  async addToQueueWithValidation(
    operation: string,
    type: 'create' | 'update' | 'delete' | 'sync',
    data: any
  ): Promise<{
    success: boolean;
    queueItem?: OfflineQueueItem;
    error?: Error | null;
  }> {
    try {
      // Get current settings
      const settings = offlineService.getOfflineState().settings;

      // Validate the queue item
      const validation = this.validateQueueItem(operation, type, data, settings);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Queue item validation failed');
      }

      // Check queue capacity
      if (!this.hasQueueCapacity(settings)) {
        throw new Error('Queue is full');
      }

      // Transform data for offline storage
      const preparedData = this.prepareQueueItemData(operation, type, data);

      // Add to queue using existing service
      const result = offlineService.addToQueue(preparedData);

      if (!result.success) {
        throw result.error || new Error('Failed to add to queue');
      }

      return {
        success: true,
        queueItem: result.queueItem
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error : new Error('Failed to add item to queue')
      };
    }
  }

  /**
   * Process queue with enhanced functionality
   */
  async processQueueEnhanced(): Promise<{
    success: boolean;
    processedItems: OfflineQueueItem[];
    failedItems: OfflineQueueItem[];
    syncReport?: any;
    error?: Error | null;
  }> {
    try {
      const state = offlineService.getOfflineState();

      // Check sync readiness
      const readiness = this.validateSyncReadiness();
      if (!readiness.isReady) {
        throw new Error(`Sync not ready: ${readiness.reasons?.join(', ') || 'Unknown reason'}`);
      }

      // Get optimal batch size based on queue size
      const batchSize = Math.min(20, Math.max(5, Math.floor(state.queue.length / 2)));

      const startTime = new Date();
      let processedItems: OfflineQueueItem[] = [];
      let failedItems: OfflineQueueItem[] = [];

      // Process in batches
      const batchResult = await this.processSyncInBatches(state.queue, batchSize, (processed, total) => {
        console.log(`Processed ${processed} of ${total} items`);
      });

      if (!batchResult.success) {
        throw batchResult.error || new Error('Batch processing failed');
      }

      processedItems = batchResult.processedItems;
      failedItems = batchResult.failedItems;

      const endTime = new Date();

      // Create sync report
      const syncReport = this.createSyncReport(
        startTime,
        endTime,
        processedItems.length,
        failedItems.length
      );

      return {
        success: true,
        processedItems,
        failedItems,
        syncReport,
        error: null
      };
    } catch (error) {
      return {
        success: false,
        processedItems: [],
        failedItems: [],
        error: error instanceof Error ? error : new Error('Enhanced queue processing failed')
      };
    }
  }

  /**
   * Get comprehensive offline status
   */
  getComprehensiveOfflineStatus(): {
    isOffline: boolean;
    pendingChanges: number;
    queueStats: ReturnType<typeof this.getQueueStatistics>;
    syncHealth: ReturnType<typeof this.getSyncHealthMetrics>;
    syncReadiness: ReturnType<typeof this.validateSyncReadiness>;
    settingsProfile: string;
    settingsImpact: ReturnType<typeof this.getSettingsImpactAnalysis>;
  } {
    const state = offlineService.getOfflineState();

    return {
      isOffline: state.isOffline,
      pendingChanges: state.pendingChanges,
      queueStats: this.getQueueStatistics(),
      syncHealth: this.getSyncHealthMetrics(),
      syncReadiness: this.validateSyncReadiness(),
      settingsProfile: this.createSettingsProfile(state.settings),
      settingsImpact: this.getSettingsImpactAnalysis(state.settings)
    };
  }
}

// Singleton instance
export const offlineUtilsService = OfflineUtilsService.getInstance();