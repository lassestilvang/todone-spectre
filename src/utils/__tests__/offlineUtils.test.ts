/**
 * Offline Utilities Tests
 *
 * Comprehensive tests for offline utilities integration
 */

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
  decompressDataFromStorage,
} from "../offlineUtils";
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
  getSettingsValidationWarnings,
} from "../offlineSyncUtils";
import { offlineUtilsService } from "../../services/offlineUtilsService";
import { OfflineSettings } from "../../types/offlineTypes";

describe("Offline Utilities Integration Tests", () => {
  // Mock data
  const testData = {
    id: "test-123",
    name: "Test Task",
    description: "This is a test task",
    createdAt: new Date("2023-01-01T00:00:00.000Z"),
    updatedAt: new Date("2023-01-02T00:00:00.000Z"),
    priority: "high",
    status: "pending",
    metadata: {
      author: "test-user",
      version: "1.0",
    },
  };

  const testSettings: OfflineSettings = {
    autoSyncEnabled: true,
    syncInterval: 30000,
    maxQueueSize: 100,
    conflictResolution: "timestamp",
    offlineDataRetention: 30,
    showOfflineIndicator: true,
    syncOnReconnect: true,
  };

  describe("Data Transformation Utilities", () => {
    test("transformDataForOfflineStorage should handle complex objects", () => {
      const result = transformDataForOfflineStorage(testData);
      expect(result).toBeDefined();
      expect(typeof result).toBe("object");

      // Dates should be converted to ISO strings
      expect(result.createdAt).toBe("2023-01-01T00:00:00.000Z");
      expect(result.updatedAt).toBe("2023-01-02T00:00:00.000Z");

      // Sensitive data should be removed
      const dataWithSensitive = { ...testData, password: "secret123" };
      const sanitized = transformDataForOfflineStorage(dataWithSensitive);
      expect(sanitized.password).toBeUndefined();
    });

    test("transformOfflineDataToApplication should restore dates", () => {
      const offlineData = transformDataForOfflineStorage(testData);
      const restored = transformOfflineDataToApplication(offlineData);

      expect(restored.createdAt).toBeInstanceOf(Date);
      expect(restored.updatedAt).toBeInstanceOf(Date);
    });

    test("prepareQueueItemData should create valid queue items", () => {
      const queueItem = prepareQueueItemData(
        "test-operation",
        "create",
        testData,
      );

      expect(queueItem).toEqual({
        operation: "test-operation",
        type: "create",
        data: transformDataForOfflineStorage(testData),
      });
    });

    test("batch operations should work correctly", () => {
      const items = [testData, { ...testData, id: "test-456" }];
      const batchTransformed = batchTransformForOfflineStorage(items);
      const batchRestored =
        batchTransformOfflineToApplication(batchTransformed);

      expect(batchTransformed.length).toBe(2);
      expect(batchRestored.length).toBe(2);
      expect(batchRestored[0].id).toBe("test-123");
    });
  });

  describe("Sync Utilities", () => {
    test("isSyncNeeded should return correct status", () => {
      // This would need mocking in a real test environment
      const result = isSyncNeeded();
      expect(typeof result).toBe("boolean");
    });

    test("getSyncPriority should calculate priority correctly", () => {
      const mockItem = {
        id: "test-1",
        operation: "critical-update",
        type: "update",
        data: {},
        timestamp: new Date(Date.now() - 10000), // 10 seconds ago
        status: "failed",
        attempts: 1,
      };

      const priority = getSyncPriority(mockItem);
      expect(priority).toBeGreaterThan(0);
    });

    test("validateQueueItem should validate correctly", () => {
      const validResult = validateQueueItem(
        "test-op",
        "create",
        testData,
        testSettings,
      );
      expect(validResult.isValid).toBe(true);

      const invalidResult = validateQueueItem(
        "",
        "invalid" as any,
        null,
        testSettings,
      );
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.error).toBeDefined();
    });

    test("validateOfflineSettings should validate settings", () => {
      const validResult = validateOfflineSettings(testSettings);
      expect(validResult.isValid).toBe(true);

      const invalidResult = validateOfflineSettings({
        ...testSettings,
        syncInterval: 500, // Too low
      });
      expect(invalidResult.isValid).toBe(false);
      expect(invalidResult.errors.length).toBeGreaterThan(0);
    });
  });

  describe("Service Integration", () => {
    test("offlineUtilsService should be accessible", () => {
      expect(offlineUtilsService).toBeDefined();
      expect(typeof offlineUtilsService.transformDataForOfflineStorage).toBe(
        "function",
      );
      expect(typeof offlineUtilsService.processQueueEnhanced).toBe("function");
    });

    test("service methods should integrate utilities correctly", () => {
      // Test data transformation through service
      const transformed =
        offlineUtilsService.transformDataForOfflineStorage(testData);
      expect(transformed).toBeDefined();

      // Test settings validation through service
      const validation =
        offlineUtilsService.validateOfflineSettings(testSettings);
      expect(validation.isValid).toBe(true);
    });
  });

  describe("Comprehensive Workflow", () => {
    test("complete offline workflow should work", () => {
      // 1. Transform data for offline storage
      const offlineData =
        offlineUtilsService.transformDataForOfflineStorage(testData);

      // 2. Prepare queue item
      const queueItemData = offlineUtilsService.prepareQueueItemData(
        "test-workflow",
        "create",
        testData,
      );

      // 3. Validate queue item
      const validation = offlineUtilsService.validateQueueItem(
        "test-workflow",
        "create",
        testData,
        testSettings,
      );
      expect(validation.isValid).toBe(true);

      // 4. Check queue capacity
      const hasCapacity = offlineUtilsService.hasQueueCapacity(testSettings);
      expect(typeof hasCapacity).toBe("boolean");

      // 5. Validate settings
      const settingsValidation =
        offlineUtilsService.validateOfflineSettings(testSettings);
      expect(settingsValidation.isValid).toBe(true);

      // 6. Get comprehensive status
      const status = offlineUtilsService.getComprehensiveOfflineStatus();
      expect(status).toBeDefined();
      expect(status.isOffline).toBeDefined();
      expect(status.queueStats).toBeDefined();
    });
  });

  describe("Error Handling", () => {
    test("utilities should handle edge cases gracefully", () => {
      // Test with null/undefined data
      expect(() => transformDataForOfflineStorage(null)).not.toThrow();
      expect(() => transformDataForOfflineStorage(undefined)).not.toThrow();

      // Test with circular references
      const circularData: any = { name: "test" };
      circularData.self = circularData;
      expect(() => transformDataForOfflineStorage(circularData)).not.toThrow();

      // Test invalid settings
      const invalidSettings = {
        syncInterval: -1,
        maxQueueSize: 0,
      };
      const validation = validateOfflineSettings(invalidSettings);
      expect(validation.isValid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });
});

// Additional integration tests would go here to test:
// - Real sync scenarios with mocked network conditions
// - Queue processing with various item types
// - Conflict resolution scenarios
// - Performance testing with large datasets
// - Memory usage testing
// - Error recovery scenarios
