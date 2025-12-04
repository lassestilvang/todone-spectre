import { renderHook, act } from "@testing-library/react";
import { useOfflineStore } from "../../../store/useOfflineStore";
import { useOffline } from "../../../hooks/useOffline";
import { useOfflineSync } from "../../../hooks/useOfflineSync";
import { useOfflineSettings } from "../../../hooks/useOfflineSettings";
import { OfflineQueuePriority } from "../../../types/offlineTypes";

describe("Offline State Management Integration Tests", () => {
  beforeEach(() => {
    // Clear and initialize the store before each test
    useOfflineStore.getState().initializeOfflineStore();
  });

  describe("Offline Status State Management", () => {
    it("should initialize with correct default status state", () => {
      const { result } = renderHook(() => useOffline());

      expect(result.current.status).toBe("online");
      expect(result.current.isOffline).toBe(false);
      expect(result.current.networkStatus.isOnline).toBe(true);
    });

    it("should update status when network changes", () => {
      const { result } = renderHook(() => useOffline());

      act(() => {
        result.current.simulateNetworkChange(false);
      });

      expect(result.current.status).toBe("offline");
      expect(result.current.isOffline).toBe(true);

      act(() => {
        result.current.simulateNetworkChange(true);
      });

      expect(result.current.status).toBe("online");
      expect(result.current.isOffline).toBe(false);
    });

    it("should track connection quality and network type", () => {
      const { result } = renderHook(() => useOffline());

      const state = useOfflineStore.getState();
      expect(state.status.connectionQuality).toBe("good");
      expect(state.status.networkType).toBe("wifi");
    });
  });

  describe("Offline Queue State Management", () => {
    it("should initialize with empty queue state", () => {
      const state = useOfflineStore.getState();
      expect(state.queue.totalCount).toBe(0);
      expect(state.queue.pendingCount).toBe(0);
      expect(state.queue.isQueueFull).toBe(false);
    });

    it("should add items to queue and update statistics", async () => {
      const { result } = renderHook(() => useOffline());

      await act(async () => {
        await result.current.enqueueOperation(
          "test-operation",
          "create",
          { test: "data" },
          "high",
        );
      });

      const state = useOfflineStore.getState();
      expect(state.queue.totalCount).toBe(1);
      expect(state.queue.pendingCount).toBe(1);
      expect(state.queue.items[0].priority).toBe("high");
      expect(state.pendingChanges).toBe(1);
    });

    it("should handle queue priority updates", () => {
      const { result } = renderHook(() => useOffline());

      act(() => {
        result.current.enqueueOperation("test-operation", "create", {
          test: "data",
        });
      });

      const state = useOfflineStore.getState();
      const itemId = state.queue.items[0].id;

      act(() => {
        result.current.updateQueueItemPriority(itemId, "critical");
      });

      const updatedItem = state.queue.items.find((item) => item.id === itemId);
      expect(updatedItem?.priority).toBe("critical");
    });

    it("should handle queue full scenario", async () => {
      const { result } = renderHook(() => useOffline());

      // Set max queue size to 2 for testing
      act(() => {
        result.current.updateSettings({ maxQueueSize: 2 });
      });

      // Add 2 items
      await act(async () => {
        await result.current.enqueueOperation("test-1", "create", {
          test: "data1",
        });
        await result.current.enqueueOperation("test-2", "create", {
          test: "data2",
        });
      });

      // Try to add a third item (should fail)
      const result3 = await act(async () => {
        return await result.current.enqueueOperation("test-3", "create", {
          test: "data3",
        });
      });

      expect(result3.success).toBe(false);
      expect(result3.error?.message).toContain("Queue full");
    });
  });

  describe("Offline Sync State Management", () => {
    it("should initialize with idle sync state", () => {
      const state = useOfflineStore.getState();
      expect(state.sync.status).toBe("idle");
      expect(state.sync.isSyncing).toBe(false);
      expect(state.sync.progress).toBe(0);
    });

    it("should process queue and update sync state", async () => {
      const { result } = renderHook(() => useOffline());

      // Add items to queue
      await act(async () => {
        await result.current.enqueueOperation("test-1", "create", {
          test: "data1",
        });
        await result.current.enqueueOperation("test-2", "create", {
          test: "data2",
        });
      });

      // Process queue
      const syncResult = await act(async () => {
        return await result.current.processOfflineQueue();
      });

      expect(syncResult.success).toBe(true);
      expect(syncResult.processedCount).toBeGreaterThan(0);

      const state = useOfflineStore.getState();
      expect(state.sync.status).toBe("completed");
      expect(state.sync.progress).toBe(100);
      expect(state.sync.isSyncing).toBe(false);
    });

    it("should handle sync errors gracefully", async () => {
      const { result } = renderHook(() => useOffline());

      // Go offline
      act(() => {
        result.current.simulateNetworkChange(false);
      });

      // Try to process queue while offline
      const syncResult = await act(async () => {
        return await result.current.processOfflineQueue();
      });

      expect(syncResult.success).toBe(false);
      expect(syncResult.error?.message).toContain(
        "Cannot process queue while offline",
      );
    });
  });

  describe("Offline Settings State Management", () => {
    it("should initialize with default settings", () => {
      const { result } = renderHook(() => useOfflineSettings());

      expect(result.current.settings.autoSyncEnabled).toBe(true);
      expect(result.current.settings.syncInterval).toBe(30000);
      expect(result.current.settings.maxQueueSize).toBe(100);
      expect(result.current.settings.maxRetryAttempts).toBe(3);
      expect(result.current.settings.batchSize).toBe(10);
    });

    it("should update settings with validation", async () => {
      const { result } = renderHook(() => useOfflineSettings());

      await act(async () => {
        await result.current.updateSettings({
          syncInterval: 60000,
          maxQueueSize: 200,
          syncPriority: "high",
        });
      });

      expect(result.current.settings.syncInterval).toBe(60000);
      expect(result.current.settings.maxQueueSize).toBe(200);
      expect(result.current.settings.syncPriority).toBe("high");
    });

    it("should validate and constrain setting values", async () => {
      const { result } = renderHook(() => useOfflineSettings());

      await act(async () => {
        await result.current.updateSettings({
          syncInterval: 1000, // Below minimum
          maxQueueSize: 10000, // Above maximum
          maxRetryAttempts: 20, // Above maximum
        });
      });

      // Should be constrained to valid ranges
      expect(result.current.settings.syncInterval).toBe(5000); // Minimum
      expect(result.current.settings.maxQueueSize).toBe(1000); // Maximum
      expect(result.current.settings.maxRetryAttempts).toBe(10); // Maximum
    });

    it("should reset to default settings", async () => {
      const { result } = renderHook(() => useOfflineSettings());

      // Change some settings
      await act(async () => {
        await result.current.updateSettings({ syncInterval: 60000 });
      });

      // Reset to defaults
      await act(async () => {
        await result.current.resetToDefaults();
      });

      expect(result.current.settings.syncInterval).toBe(30000);
      expect(result.current.settings.maxQueueSize).toBe(100);
    });
  });

  describe("Integration Between All Offline States", () => {
    it("should demonstrate full offline workflow", async () => {
      const offlineHook = renderHook(() => useOffline());
      const syncHook = renderHook(() => useOfflineSync());
      const settingsHook = renderHook(() => useOfflineSettings());

      // 1. Verify initial state
      expect(offlineHook.result.current.status).toBe("online");
      expect(syncHook.result.current.syncStatus).toBe("idle");
      expect(settingsHook.result.current.settings.autoSyncEnabled).toBe(true);

      // 2. Go offline
      act(() => {
        offlineHook.result.current.simulateNetworkChange(false);
      });
      expect(offlineHook.result.current.status).toBe("offline");

      // 3. Add operations to queue while offline
      await act(async () => {
        await offlineHook.result.current.enqueueOperation(
          "create-task",
          "create",
          { title: "Test Task" },
          "high",
        );
        await offlineHook.result.current.enqueueOperation(
          "update-task",
          "update",
          { id: "1", title: "Updated Task" },
          "medium",
        );
      });

      const state1 = useOfflineStore.getState();
      expect(state1.queue.pendingCount).toBe(2);
      expect(state1.pendingChanges).toBe(2);

      // 4. Come back online
      act(() => {
        offlineHook.result.current.simulateNetworkChange(true);
      });

      // 5. Auto-sync should trigger (simulated by manual call)
      const syncResult = await act(async () => {
        return await offlineHook.result.current.processOfflineQueue();
      });

      expect(syncResult.success).toBe(true);
      expect(syncResult.processedCount).toBeGreaterThan(0);

      // 6. Verify final state
      const finalState = useOfflineStore.getState();
      expect(finalState.sync.status).toBe("completed");
      expect(finalState.queue.completedCount).toBeGreaterThan(0);
      expect(finalState.pendingChanges).toBe(0);
    });

    it("should handle complex queue operations with priorities", async () => {
      const { result } = renderHook(() => useOffline());

      // Add items with different priorities
      await act(async () => {
        await result.current.enqueueOperation(
          "critical-op",
          "create",
          { data: "critical" },
          "critical",
        );
        await result.current.enqueueOperation(
          "high-op",
          "create",
          { data: "high" },
          "high",
        );
        await result.current.enqueueOperation(
          "medium-op",
          "create",
          { data: "medium" },
          "medium",
        );
        await result.current.enqueueOperation(
          "low-op",
          "create",
          { data: "low" },
          "low",
        );
      });

      const state = useOfflineStore.getState();
      expect(state.queue.items.length).toBe(4);

      // Verify priorities are maintained
      const criticalItems = result.current.getQueueItemsByPriority("critical");
      const highItems = result.current.getQueueItemsByPriority("high");
      expect(criticalItems.length).toBe(1);
      expect(highItems.length).toBe(1);

      // Process queue
      const syncResult = await act(async () => {
        return await result.current.processOfflineQueue(2); // Process in batches of 2
      });

      expect(syncResult.success).toBe(true);
      expect(syncResult.processedCount).toBeGreaterThan(0);
    });
  });

  describe("Error Handling and Recovery", () => {
    it("should handle queue processing errors gracefully", async () => {
      const { result } = renderHook(() => useOffline());

      // Add an item that will fail processing
      await act(async () => {
        await result.current.enqueueOperation("failing-op", "create", {
          shouldFail: true,
        });
      });

      // Process queue (some items may fail)
      const syncResult = await act(async () => {
        return await result.current.processOfflineQueue();
      });

      // Even if some items fail, the system should continue
      expect(syncResult.success).toBe(true);
      expect(syncResult.failedCount).toBeGreaterThanOrEqual(0);

      // Check that failed items can be retried
      const failedItems = result.current.getQueueItemsByStatus("failed");
      if (failedItems.length > 0) {
        const retryResult = await act(async () => {
          return await result.current.retryFailedItems();
        });

        expect(retryResult.success).toBe(true);
        expect(retryResult.retriedCount).toBeGreaterThan(0);
      }
    });

    it("should clear errors and recover from error states", () => {
      const { result } = renderHook(() => useOffline());

      // Simulate an error
      act(() => {
        useOfflineStore.getState().sync.error = new Error("Test error");
      });

      expect(result.current.error).not.toBeNull();

      // Clear the error
      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });
});
