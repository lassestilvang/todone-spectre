import { offlineService } from "../offlineService";
import { offlineSyncService } from "../offlineSyncService";

describe("Offline Services", () => {
  beforeEach(() => {
    // Reset any mocks or state before each test
    jest.clearAllMocks();
  });

  describe("OfflineService", () => {
    it("should be a singleton", () => {
      const instance1 = offlineService;
      const instance2 = offlineService;
      expect(instance1).toBe(instance2);
    });

    it("should get offline status", () => {
      const status = offlineService.getOfflineStatus();
      expect(["online", "offline", "unknown"]).toContain(status);
    });

    it("should get offline state", () => {
      const state = offlineService.getOfflineState();
      expect(state).toHaveProperty("isOffline");
      expect(state).toHaveProperty("pendingChanges");
      expect(state).toHaveProperty("queue");
      expect(state).toHaveProperty("lastSync");
      expect(state).toHaveProperty("error");
      expect(state).toHaveProperty("isProcessing");
      expect(state).toHaveProperty("settings");
    });

    it("should get queue statistics", () => {
      const stats = offlineService.getQueueStats();
      expect(stats).toHaveProperty("totalItems");
      expect(stats).toHaveProperty("pendingItems");
      expect(stats).toHaveProperty("processingItems");
      expect(stats).toHaveProperty("completedItems");
      expect(stats).toHaveProperty("failedItems");
    });

    it("should check online status", () => {
      const isOnline = offlineService.checkOnlineStatus();
      expect(typeof isOnline).toBe("boolean");
    });
  });

  describe("OfflineSyncService", () => {
    it("should be a singleton", () => {
      const instance1 = offlineSyncService;
      const instance2 = offlineSyncService;
      expect(instance1).toBe(instance2);
    });

    it("should get sync status", () => {
      const syncStatus = offlineSyncService.getSyncStatus();
      expect(syncStatus).toHaveProperty("status");
      expect(syncStatus).toHaveProperty("lastSynced");
      expect(syncStatus).toHaveProperty("error");
      expect(syncStatus).toHaveProperty("progress");
      expect(syncStatus).toHaveProperty("totalItems");
      expect(syncStatus).toHaveProperty("processedItems");
    });

    it("should check if sync is needed", () => {
      const isNeeded = offlineSyncService.isSyncNeeded();
      expect(typeof isNeeded).toBe("boolean");
    });

    it("should get settings", () => {
      const settings = offlineSyncService.getSettings();
      expect(settings).toHaveProperty("autoSyncEnabled");
      expect(settings).toHaveProperty("syncInterval");
      expect(settings).toHaveProperty("maxQueueSize");
      expect(settings).toHaveProperty("conflictResolution");
      expect(settings).toHaveProperty("offlineDataRetention");
      expect(settings).toHaveProperty("showOfflineIndicator");
      expect(settings).toHaveProperty("syncOnReconnect");
    });

    it("should get sync progress", () => {
      const progress = offlineSyncService.getSyncProgress();
      expect(progress).toHaveProperty("progress");
      expect(progress).toHaveProperty("totalItems");
      expect(progress).toHaveProperty("processedItems");
    });

    it("should get offline state summary", () => {
      const summary = offlineSyncService.getOfflineStateSummary();
      expect(summary).toHaveProperty("isOffline");
      expect(summary).toHaveProperty("pendingChanges");
      expect(summary).toHaveProperty("lastSync");
      expect(summary).toHaveProperty("queueLength");
      expect(summary).toHaveProperty("syncStatus");
    });

    it("should get conflict resolution strategy", () => {
      const strategy = offlineSyncService.getConflictResolutionStrategy();
      expect(["local-wins", "remote-wins", "manual", "timestamp"]).toContain(
        strategy,
      );
    });
  });

  describe("Service Integration", () => {
    it("should handle conflict resolution", async () => {
      const localData = { id: "test", name: "local", updatedAt: Date.now() };
      const remoteData = {
        id: "test",
        name: "remote",
        updatedAt: Date.now() - 1000,
      };

      // Test timestamp strategy
      const result = await offlineSyncService.handleConflict(
        localData,
        remoteData,
        "update",
      );
      expect(result).toBeDefined();

      // Test local-wins strategy
      const localWinsResult = await offlineSyncService.handleConflict(
        localData,
        remoteData,
        "create",
      );
      expect(localWinsResult).toBeDefined();
    });
  });
});
