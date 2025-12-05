/**
 * Comprehensive Offline Integration Tests
 * End-to-end tests covering all offline functionality
 */

import { renderHook, act } from "@testing-library/react";
import { useOfflineStore } from "../../../store/useOfflineStore";
import { useOffline } from "../../../hooks/useOffline";
import { useOfflineTasks } from "../../../hooks/useOfflineTasks";
import { useOfflineDataPersistence } from "../../../hooks/useOfflineDataPersistence";
import { useOfflineSync } from "../../../hooks/useOfflineSync";
import {
  MockOfflineTaskService,
  MockOfflineDataPersistence,
  MockOfflineSyncService,
  MockOfflineStore,
} from "./utils/offlineServiceMocks";
import {
  generateMockTask,
  generateOfflineQueueItem,
  generateOfflineState,
} from "./utils/offlineTestDataGenerators";

describe("Comprehensive Offline Integration Tests", () => {
  let mockTaskService: MockOfflineTaskService;
  let mockDataPersistence: MockOfflineDataPersistence;
  let mockSyncService: MockOfflineSyncService;
  let mockStore: MockOfflineStore;

  beforeEach(() => {
    // Initialize mock services
    mockTaskService = new MockOfflineTaskService(true); // Start offline
    mockDataPersistence = new MockOfflineDataPersistence();
    mockSyncService = new MockOfflineSyncService(true);
    mockStore = new MockOfflineStore(
      generateOfflineState({
        status: {
          isOffline: true,
          status: "offline",
        },
      }),
    );

    // Mock the store
    (useOfflineStore as jest.Mock).mockReturnValue(mockStore.getState());
  });

  describe("Complete Offline Workflow Integration", () => {
    it("should handle full offline workflow from creation to sync", async () => {
      // 1. Test offline task creation
      const mockTask = generateMockTask();
      const createdTask = await mockTaskService.createTaskOffline(mockTask);

      expect(createdTask.id).toContain("temp-");
      expect(mockTaskService.getQueueItems().length).toBe(1);

      // 2. Test offline task update
      const updatedTask = await mockTaskService.updateTaskOffline(
        createdTask.id,
        {
          title: "Updated Task Title",
        },
      );

      expect(updatedTask.title).toBe("Updated Task Title");
      expect(mockTaskService.getQueueItems().length).toBe(2);

      // 3. Test offline task deletion
      await mockTaskService.deleteTaskOffline(createdTask.id);
      expect(mockTaskService.getQueueItems().length).toBe(3);

      // 4. Test offline task completion toggle
      const toggledTask = await mockTaskService.toggleTaskCompletionOffline(
        createdTask.id,
      );
      expect(toggledTask.completed).toBe(true);
      expect(mockTaskService.getQueueItems().length).toBe(4);

      // 5. Verify queue status
      const queueStatus = mockTaskService.getOfflineTaskQueueStatus();
      expect(queueStatus.pendingTasks).toBe(4);
      expect(queueStatus.totalTasks).toBe(4);

      // 6. Switch to online and process queue
      mockTaskService.setOfflineStatus(false);
      mockStore.setState({
        status: {
          isOffline: false,
          status: "online",
        },
      });

      await mockTaskService.processOfflineTaskQueue();
      expect(mockTaskService.getQueueItems().length).toBe(0);
    });

    it("should handle data persistence workflow", async () => {
      // 1. Store tasks offline
      const tasks = [generateMockTask(), generateMockTask()];
      await mockDataPersistence.storeOfflineTasks(tasks);

      // 2. Verify tasks are stored
      const retrievedTasks = await mockDataPersistence.getOfflineTasks();
      expect(retrievedTasks.length).toBe(2);

      // 3. Store offline operations
      const operation = generateOfflineQueueItem("create", "high");
      await mockDataPersistence.storeOfflineOperation(operation);

      // 4. Verify operations are stored
      const operations = await mockDataPersistence.getOfflineOperations();
      expect(operations.length).toBe(1);

      // 5. Process operations
      await mockDataPersistence.processOfflineOperations();
      const processedOperations =
        await mockDataPersistence.getOfflineOperations();
      expect(processedOperations.length).toBe(0);

      // 6. Get storage stats
      const stats = await mockDataPersistence.getOfflineStorageStats();
      expect(stats.taskCount).toBe(2);
      expect(stats.queueSize).toBe(0);
    });

    it("should handle comprehensive sync workflow", async () => {
      // 1. Start offline
      expect(mockSyncService.needsSync()).toBe(false);

      // 2. Add some pending operations
      mockSyncService.getSyncStatus().pendingOperations = 5;
      expect(mockSyncService.needsSync()).toBe(false); // Still offline

      // 3. Switch to online
      mockSyncService.setOfflineStatus(false);
      mockStore.setState({
        status: {
          isOffline: false,
          status: "online",
        },
      });

      expect(mockSyncService.needsSync()).toBe(true);

      // 4. Auto-sync should trigger
      await mockSyncService.autoSync();
      const syncStatus = mockSyncService.getSyncStatus();
      expect(syncStatus.status).toBe("completed");
      expect(syncStatus.pendingOperations).toBe(0);

      // 5. Get sync statistics
      const stats = await mockSyncService.getSyncStatistics();
      expect(stats.totalOperations).toBeGreaterThan(0);
      expect(stats.completedOperations).toBeGreaterThan(0);
    });
  });

  describe("Hook Integration Tests", () => {
    it("should test useOffline hook integration", async () => {
      const { result } = renderHook(() => useOffline());

      // Initial state should be offline
      expect(result.current.isOffline).toBe(true);
      expect(result.current.status).toBe("offline");

      // Simulate network change to online
      act(() => {
        result.current.simulateNetworkChange(true);
      });

      expect(result.current.isOffline).toBe(false);
      expect(result.current.status).toBe("online");
    });

    it("should test useOfflineTasks hook integration", async () => {
      const mockTask = generateMockTask();
      const { result } = renderHook(() => useOfflineTasks());

      // Create task offline
      const createdTask = await result.current.createTaskOffline(mockTask);
      expect(createdTask.id).toContain("temp-");

      // Update task offline
      const updatedTask = await result.current.updateTaskOffline(
        createdTask.id,
        {
          title: "Updated Title",
        },
      );
      expect(updatedTask.title).toBe("Updated Title");

      // Check queue status
      const queueStatus = result.current.getOfflineQueueStatus();
      expect(queueStatus.pendingTasks).toBeGreaterThan(0);
    });

    it("should test useOfflineDataPersistence hook integration", async () => {
      const { result } = renderHook(() => useOfflineDataPersistence());

      // Initialize
      await result.current.initialize();
      expect(result.current.isInitialized).toBe(true);

      // Store tasks
      const tasks = [generateMockTask()];
      await result.current.storeTasksOffline(tasks);

      // Get tasks
      const retrievedTasks = await result.current.getTasksOffline();
      expect(retrievedTasks.length).toBe(1);

      // Check sync status
      const syncStatus = result.current.getSyncStatus();
      expect(syncStatus.pendingOperations).toBe(0);
    });

    it("should test useOfflineSync hook integration", async () => {
      const { result } = renderHook(() => useOfflineSync());

      // Check initial sync status
      const syncStatus = result.current.getSyncStatus();
      expect(syncStatus.isSyncing).toBe(false);

      // Check if sync is needed (should be false while offline)
      expect(result.current.needsSync()).toBe(false);

      // Switch to online
      mockSyncService.setOfflineStatus(false);
      mockStore.setState({
        status: {
          isOffline: false,
          status: "online",
        },
      });

      // Set pending operations
      mockSyncService.getSyncStatus().pendingOperations = 3;
      expect(result.current.needsSync()).toBe(true);
    });
  });

  describe("Error Handling and Recovery Tests", () => {
    it("should handle queue processing errors gracefully", async () => {
      // Set up a scenario where processing might fail
      mockTaskService.setOfflineStatus(true);

      // Try to process queue while offline
      await expect(mockTaskService.processOfflineTaskQueue()).rejects.toThrow(
        "Cannot process queue while offline",
      );

      // Queue should remain unchanged
      const queueItems = mockTaskService.getQueueItems();
      expect(queueItems.length).toBeGreaterThan(0);
    });

    it("should handle sync errors gracefully", async () => {
      mockSyncService.setOfflineStatus(true);

      // Try to sync while offline
      await expect(mockSyncService.syncAll()).rejects.toThrow(
        "Cannot sync while offline",
      );

      // Sync status should remain in error state
      const syncStatus = mockSyncService.getSyncStatus();
      expect(syncStatus.status).toBe("error");
    });

    it("should handle data persistence errors", async () => {
      // Force an error by trying to process before initialization
      mockDataPersistence = new MockOfflineDataPersistence();
      await expect(mockDataPersistence.syncOfflineData()).rejects.toThrow(
        "Not initialized",
      );
    });
  });

  describe("Performance and Stress Tests", () => {
    it("should handle large queue processing", async () => {
      // Add many items to queue
      for (let i = 0; i < 100; i++) {
        const task = generateMockTask({ title: `Bulk Task ${i + 1}` });
        await mockTaskService.createTaskOffline(task);
      }

      expect(mockTaskService.getQueueItems().length).toBe(100);

      // Switch to online and process
      mockTaskService.setOfflineStatus(false);
      await mockTaskService.processOfflineTaskQueue();

      expect(mockTaskService.getQueueItems().length).toBe(0);
    });

    it("should handle concurrent operations", async () => {
      // This test simulates multiple concurrent offline operations
      const operations = [
        mockTaskService.createTaskOffline(generateMockTask()),
        mockTaskService.updateTaskOffline("test-id", { title: "Updated" }),
        mockTaskService.deleteTaskOffline("delete-id"),
        mockTaskService.toggleTaskCompletionOffline("toggle-id"),
      ];

      const results = await Promise.all(operations);
      expect(results.length).toBe(4);
      expect(mockTaskService.getQueueItems().length).toBe(4);
    });
  });

  describe("State Management Integration Tests", () => {
    it("should test comprehensive state changes", async () => {
      const initialState = mockStore.getState();

      // Verify initial offline state
      expect(initialState.status.isOffline).toBe(true);
      expect(initialState.queue.items.length).toBe(0);

      // Add items to queue
      mockStore.setState({
        queue: {
          items: [
            generateOfflineQueueItem("create", "high"),
            generateOfflineQueueItem("update", "medium"),
          ],
          totalCount: 2,
          pendingCount: 2,
        },
        pendingChanges: 2,
      });

      const updatedState = mockStore.getState();
      expect(updatedState.queue.items.length).toBe(2);
      expect(updatedState.pendingChanges).toBe(2);

      // Switch to online
      mockStore.setState({
        status: {
          isOffline: false,
          status: "online",
        },
      });

      const onlineState = mockStore.getState();
      expect(onlineState.status.isOffline).toBe(false);
    });

    it("should test settings management", () => {
      const newSettings = {
        autoSyncEnabled: false,
        syncInterval: 60000,
        maxQueueSize: 200,
      };

      mockStore.setState({
        settings: {
          ...mockStore.getState().settings,
          ...newSettings,
        },
      });

      const state = mockStore.getState();
      expect(state.settings.autoSyncEnabled).toBe(false);
      expect(state.settings.syncInterval).toBe(60000);
      expect(state.settings.maxQueueSize).toBe(200);
    });
  });

  describe("Cross-Service Integration Tests", () => {
    it("should test integration between all offline services", async () => {
      // 1. Create task with task service (offline)
      const task = generateMockTask();
      const createdTask = await mockTaskService.createTaskOffline(task);
      expect(createdTask.id).toContain("temp-");

      // 2. Store task with data persistence
      await mockDataPersistence.storeOfflineTasks([createdTask]);
      const storedTasks = await mockDataPersistence.getOfflineTasks();
      expect(storedTasks.length).toBe(1);

      // 3. Add operation to data persistence
      const operation = generateOfflineQueueItem("create", "high", {
        data: task,
        operation: `Create task: ${task.title}`,
      });
      await mockDataPersistence.storeOfflineOperation(operation);

      // 4. Check sync service status
      mockSyncService.getSyncStatus().pendingOperations = 1;
      expect(mockSyncService.needsSync()).toBe(false); // Still offline

      // 5. Switch to online
      mockTaskService.setOfflineStatus(false);
      mockSyncService.setOfflineStatus(false);
      mockStore.setState({
        status: {
          isOffline: false,
          status: "online",
        },
      });

      // 6. Now sync should be needed
      expect(mockSyncService.needsSync()).toBe(true);

      // 7. Process queue with task service
      await mockTaskService.processOfflineTaskQueue();
      expect(mockTaskService.getQueueItems().length).toBe(0);

      // 8. Sync with sync service
      await mockSyncService.syncAll();
      const finalSyncStatus = mockSyncService.getSyncStatus();
      expect(finalSyncStatus.status).toBe("completed");
    });
  });
});
