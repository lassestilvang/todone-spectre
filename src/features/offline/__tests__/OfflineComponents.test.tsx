import React from "react";
import { render, screen } from "@testing-library/react";
import {
  OfflineIndicator,
  OfflineQueue,
  OfflineSync,
  OfflineSettings,
} from "../index";
import { useOfflineStore } from "../../../store/useOfflineStore";

// Mock the offline store
jest.mock("../../../store/useOfflineStore");

describe("Offline Components", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Mock default store values
    (useOfflineStore as jest.Mock).mockReturnValue({
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
      checkOnlineStatus: jest.fn(),
      addToQueue: jest.fn(),
      processQueue: jest.fn(),
      retryQueueItem: jest.fn(),
      clearQueue: jest.fn(),
      updateSettings: jest.fn(),
      clearError: jest.fn(),
      simulateNetworkChange: jest.fn(),
    });
  });

  test("OfflineIndicator renders correctly", () => {
    render(<OfflineIndicator />);
    expect(screen.getByText(/You are online/i)).toBeInTheDocument();
  });

  test("OfflineIndicator shows offline status when offline", () => {
    (useOfflineStore as jest.Mock).mockReturnValue({
      ...useOfflineStore(),
      isOffline: true,
      pendingChanges: 2,
    });

    render(<OfflineIndicator showDetails={true} />);
    expect(screen.getByText(/You are offline/i)).toBeInTheDocument();
    expect(screen.getByText(/2 pending changes/i)).toBeInTheDocument();
  });

  test("OfflineQueue renders empty state", () => {
    render(<OfflineQueue />);
    expect(
      screen.getByText(/No offline operations in queue/i),
    ).toBeInTheDocument();
  });

  test("OfflineQueue shows items when queue has data", () => {
    const mockQueue = [
      {
        id: "1",
        operation: "create_task",
        type: "create",
        data: { title: "Test task" },
        timestamp: new Date(),
        status: "pending",
        attempts: 0,
      },
    ];

    (useOfflineStore as jest.Mock).mockReturnValue({
      ...useOfflineStore(),
      queue: mockQueue,
    });

    render(<OfflineQueue />);
    expect(screen.getByText(/create_task/i)).toBeInTheDocument();
    expect(screen.getByText(/Pending/i)).toBeInTheDocument();
  });

  test("OfflineSync renders with default props", () => {
    render(<OfflineSync />);
    expect(screen.getByText(/Offline Sync/i)).toBeInTheDocument();
    expect(screen.getByText(/Ready to sync/i)).toBeInTheDocument();
  });

  test("OfflineSettings renders form fields", () => {
    render(<OfflineSettings />);
    expect(screen.getByLabelText(/Enable Auto-Sync/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Sync Interval/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Max Queue Size/i)).toBeInTheDocument();
  });

  test("OfflineSettings shows current status", () => {
    (useOfflineStore as jest.Mock).mockReturnValue({
      ...useOfflineStore(),
      isOffline: true,
      pendingChanges: 3,
    });

    render(<OfflineSettings />);
    expect(screen.getByText(/Network Status:/i)).toBeInTheDocument();
    expect(screen.getByText(/Offline/i)).toBeInTheDocument();
    expect(screen.getByText(/3/i)).toBeInTheDocument(); // pending changes
  });
});
