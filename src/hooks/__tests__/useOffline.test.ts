import { renderHook, act } from "@testing-library/react";
import { useOffline } from "../useOffline";
import { useOfflineStore } from "../../store/useOfflineStore";
import { OfflineQueueItem } from "../../types/offlineTypes";

// Mock the offline store
jest.mock("../../store/useOfflineStore", () => ({
  useOfflineStore: jest.fn(),
}));

describe("useOffline Hook", () => {
  const mockStore = {
    isOffline: false,
    pendingChanges: 0,
    queue: [],
    lastSync: null,
    error: null,
    isProcessing: false,
    settings: {
      autoSyncEnabled: true,
      syncInterval: 30000,
      maxQueueSize: 100,
      conflictResolution: "timestamp",
      offlineDataRetention: 30,
      showOfflineIndicator: true,
      syncOnReconnect: true,
    },
    checkOnlineStatus: jest.fn().mockReturnValue(false),
    addToQueue: jest.fn().mockImplementation((item) => {
      mockStore.queue.push({
        ...item,
        id: `queue-${Date.now()}`,
        timestamp: new Date(),
        status: "pending",
        attempts: 0,
      });
      mockStore.pendingChanges++;
      return true;
    }),
    retryQueueItem: jest.fn().mockResolvedValue(true),
    clearQueue: jest.fn().mockImplementation(() => {
      mockStore.queue = [];
      mockStore.pendingChanges = 0;
    }),
    processQueue: jest.fn().mockResolvedValue(true),
    simulateNetworkChange: jest.fn().mockImplementation((isOnline) => {
      mockStore.isOffline = !isOnline;
    }),
  };

  beforeEach(() => {
    (useOfflineStore as jest.Mock).mockReturnValue(mockStore);
  });

  afterEach(() => {
    jest.clearAllMocks();
    mockStore.queue = [];
    mockStore.pendingChanges = 0;
    mockStore.isOffline = false;
  });

  it("should initialize with correct status", () => {
    const { result } = renderHook(() => useOffline());
    expect(result.current.status).toBe("online");
    expect(result.current.isOffline).toBe(false);
  });

  it("should return offline status when offline", () => {
    mockStore.isOffline = true;
    const { result } = renderHook(() => useOffline());
    expect(result.current.status).toBe("offline");
    expect(result.current.isOffline).toBe(true);
  });

  it("should get offline state correctly", () => {
    mockStore.pendingChanges = 3;
    mockStore.queue = [
      {
        id: "1",
        operation: "test",
        type: "create",
        data: {},
        timestamp: new Date(),
        status: "pending",
        attempts: 0,
      },
      {
        id: "2",
        operation: "test2",
        type: "update",
        data: {},
        timestamp: new Date(),
        status: "completed",
        attempts: 1,
      },
    ];

    const { result } = renderHook(() => useOffline());
    const state = result.current.getOfflineState();

    expect(state.isOffline).toBe(false);
    expect(state.pendingChanges).toBe(3);
    expect(state.queueLength).toBe(2);
  });

  it("should enqueue operations when offline", async () => {
    mockStore.isOffline = true;
    const { result } = renderHook(() => useOffline());

    const enqueueResult = await result.current.enqueueOperation(
      "test-operation",
      "create",
      { test: "data" },
    );

    expect(enqueueResult.success).toBe(true);
    expect(mockStore.addToQueue).toHaveBeenCalled();
    expect(mockStore.queue.length).toBe(1);
  });

  it("should not enqueue operations when online (except sync)", async () => {
    mockStore.isOffline = false;
    const { result } = renderHook(() => useOffline());

    const enqueueResult = await result.current.enqueueOperation(
      "test-operation",
      "create",
      { test: "data" },
    );

    expect(enqueueResult.success).toBe(false);
    expect(enqueueResult.error?.message).toContain(
      "Cannot enqueue operation when online",
    );
  });

  it("should allow sync operations when online", async () => {
    mockStore.isOffline = false;
    const { result } = renderHook(() => useOffline());

    const enqueueResult = await result.current.enqueueOperation(
      "sync-operation",
      "sync",
      { test: "data" },
    );

    expect(enqueueResult.success).toBe(true);
    expect(mockStore.addToQueue).toHaveBeenCalled();
  });

  it("should handle queue full scenario", async () => {
    mockStore.isOffline = true;
    mockStore.settings.maxQueueSize = 1;
    mockStore.queue = [
      {
        id: "1",
        operation: "test",
        type: "create",
        data: {},
        timestamp: new Date(),
        status: "pending",
        attempts: 0,
      },
    ];

    const { result } = renderHook(() => useOffline());

    const enqueueResult = await result.current.enqueueOperation(
      "test-operation",
      "create",
      { test: "data" },
    );

    expect(enqueueResult.success).toBe(false);
    expect(enqueueResult.error?.message).toContain("Queue full");
  });

  it("should process queue when online", async () => {
    mockStore.isOffline = false;
    mockStore.queue = [
      {
        id: "1",
        operation: "test",
        type: "create",
        data: {},
        timestamp: new Date(),
        status: "pending",
        attempts: 0,
      },
    ];

    const { result } = renderHook(() => useOffline());

    const processResult = await result.current.processOfflineQueue();

    expect(processResult.success).toBe(true);
    expect(mockStore.processQueue).toHaveBeenCalled();
  });

  it("should not process queue when offline", async () => {
    mockStore.isOffline = true;
    mockStore.queue = [
      {
        id: "1",
        operation: "test",
        type: "create",
        data: {},
        timestamp: new Date(),
        status: "pending",
        attempts: 0,
      },
    ];

    const { result } = renderHook(() => useOffline());

    const processResult = await result.current.processOfflineQueue();

    expect(processResult.success).toBe(false);
    expect(processResult.error?.message).toContain(
      "Cannot process queue while offline",
    );
  });

  it("should get queue statistics correctly", () => {
    mockStore.queue = [
      {
        id: "1",
        operation: "test1",
        type: "create",
        data: {},
        timestamp: new Date(),
        status: "pending",
        attempts: 0,
      },
      {
        id: "2",
        operation: "test2",
        type: "update",
        data: {},
        timestamp: new Date(),
        status: "processing",
        attempts: 1,
      },
      {
        id: "3",
        operation: "test3",
        type: "delete",
        data: {},
        timestamp: new Date(),
        status: "completed",
        attempts: 2,
      },
      {
        id: "4",
        operation: "test4",
        type: "create",
        data: {},
        timestamp: new Date(),
        status: "failed",
        attempts: 3,
      },
    ];

    const { result } = renderHook(() => useOffline());
    const stats = result.current.getQueueStats();

    expect(stats.totalItems).toBe(4);
    expect(stats.pendingItems).toBe(1);
    expect(stats.processingItems).toBe(1);
    expect(stats.completedItems).toBe(1);
    expect(stats.failedItems).toBe(1);
  });

  it("should get queue items by status", () => {
    mockStore.queue = [
      {
        id: "1",
        operation: "test1",
        type: "create",
        data: {},
        timestamp: new Date(),
        status: "pending",
        attempts: 0,
      },
      {
        id: "2",
        operation: "test2",
        type: "update",
        data: {},
        timestamp: new Date(),
        status: "completed",
        attempts: 1,
      },
      {
        id: "3",
        operation: "test3",
        type: "delete",
        data: {},
        timestamp: new Date(),
        status: "pending",
        attempts: 0,
      },
    ];

    const { result } = renderHook(() => useOffline());
    const pendingItems = result.current.getQueueItemsByStatus("pending");

    expect(pendingItems.length).toBe(2);
    expect(pendingItems[0].operation).toBe("test1");
  });

  it("should retry failed items", async () => {
    mockStore.queue = [
      {
        id: "1",
        operation: "test1",
        type: "create",
        data: {},
        timestamp: new Date(),
        status: "failed",
        attempts: 0,
      },
      {
        id: "2",
        operation: "test2",
        type: "update",
        data: {},
        timestamp: new Date(),
        status: "failed",
        attempts: 1,
      },
    ];

    const { result } = renderHook(() => useOffline());

    const retryResult = await result.current.retryFailedItems();

    expect(retryResult.success).toBe(true);
    expect(retryResult.retriedCount).toBe(2);
    expect(mockStore.retryQueueItem).toHaveBeenCalledTimes(2);
  });

  it("should clear queue", () => {
    mockStore.queue = [
      {
        id: "1",
        operation: "test1",
        type: "create",
        data: {},
        timestamp: new Date(),
        status: "pending",
        attempts: 0,
      },
    ];
    mockStore.pendingChanges = 1;

    const { result } = renderHook(() => useOffline());

    result.current.clearAllQueueItems();

    expect(mockStore.clearQueue).toHaveBeenCalled();
    expect(mockStore.queue.length).toBe(0);
    expect(mockStore.pendingChanges).toBe(0);
  });

  it("should simulate network change", () => {
    const { result } = renderHook(() => useOffline());

    act(() => {
      result.current.simulateNetworkChange(true);
    });

    expect(result.current.status).toBe("online");

    act(() => {
      result.current.simulateNetworkChange(false);
    });

    expect(result.current.status).toBe("offline");
  });
});
