/**
 * Comprehensive Offline Component Tests
 * Tests for all offline components with various scenarios
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OfflineIndicator, OfflineQueue, OfflineSync, OfflineSettings } from '../index';
import { useOfflineStore } from '../../../store/useOfflineStore';
import { MockOfflineStore } from './utils/offlineServiceMocks';
import { generateOfflineQueueItem, generateStorageStats } from './utils/offlineTestDataGenerators';

// Mock the offline store
jest.mock('../../../store/useOfflineStore');

describe('Comprehensive Offline Component Tests', () => {
  const mockStore = new MockOfflineStore();

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();

    // Mock default store values
    (useOfflineStore as jest.Mock).mockReturnValue(mockStore.getState());
  });

  describe('OfflineIndicator Component Tests', () => {
    it('should render online status by default', () => {
      render(<OfflineIndicator />);
      expect(screen.getByText(/You are online/i)).toBeInTheDocument();
      expect(screen.queryByText(/pending changes/i)).not.toBeInTheDocument();
    });

    it('should show offline status when offline', () => {
      mockStore.setState({
        status: {
          isOffline: true,
          status: 'offline'
        },
        pendingChanges: 3
      });

      render(<OfflineIndicator showDetails={true} />);
      expect(screen.getByText(/You are offline/i)).toBeInTheDocument();
      expect(screen.getByText(/3 pending changes/i)).toBeInTheDocument();
    });

    it('should show different status messages based on network quality', () => {
      mockStore.setState({
        status: {
          isOffline: false,
          status: 'online',
          connectionQuality: 'poor'
        }
      });

      render(<OfflineIndicator showDetails={true} />);
      expect(screen.getByText(/Connection quality: poor/i)).toBeInTheDocument();
    });

    it('should handle error state gracefully', () => {
      mockStore.setState({
        error: new Error('Network error occurred')
      });

      render(<OfflineIndicator showDetails={true} />);
      expect(screen.getByText(/Network error occurred/i)).toBeInTheDocument();
    });
  });

  describe('OfflineQueue Component Tests', () => {
    it('should render empty queue state', () => {
      render(<OfflineQueue />);
      expect(screen.getByText(/No offline operations in queue/i)).toBeInTheDocument();
    });

    it('should display queue items with different statuses', () => {
      const queueItems = [
        generateOfflineQueueItem('create', 'high', { status: 'pending' }),
        generateOfflineQueueItem('update', 'medium', { status: 'processing' }),
        generateOfflineQueueItem('delete', 'low', { status: 'completed' }),
        generateOfflineQueueItem('sync', 'critical', { status: 'failed' })
      ];

      mockStore.setState({
        queue: {
          items: queueItems
        }
      });

      render(<OfflineQueue />);

      // Check that all items are rendered
      expect(screen.getByText(/create operation for test/i)).toBeInTheDocument();
      expect(screen.getByText(/update operation for test/i)).toBeInTheDocument();
      expect(screen.getByText(/delete operation for test/i)).toBeInTheDocument();
      expect(screen.getByText(/sync operation for test/i)).toBeInTheDocument();

      // Check status indicators
      expect(screen.getByText(/Pending/i)).toBeInTheDocument();
      expect(screen.getByText(/Processing/i)).toBeInTheDocument();
      expect(screen.getByText(/Completed/i)).toBeInTheDocument();
      expect(screen.getByText(/Failed/i)).toBeInTheDocument();
    });

    it('should show queue statistics', () => {
      const queueItems = [
        generateOfflineQueueItem('create', 'high', { status: 'pending' }),
        generateOfflineQueueItem('update', 'medium', { status: 'pending' }),
        generateOfflineQueueItem('delete', 'low', { status: 'completed' })
      ];

      mockStore.setState({
        queue: {
          items: queueItems,
          totalCount: 3,
          pendingCount: 2,
          completedCount: 1
        }
      });

      render(<OfflineQueue />);

      expect(screen.getByText(/Total: 3/i)).toBeInTheDocument();
      expect(screen.getByText(/Pending: 2/i)).toBeInTheDocument();
      expect(screen.getByText(/Completed: 1/i)).toBeInTheDocument();
    });

    it('should handle queue full state', () => {
      mockStore.setState({
        queue: {
          items: Array(100).fill(0).map((_, i) =>
            generateOfflineQueueItem('create', 'medium', {
              operation: `Operation ${i + 1}`,
              status: 'pending'
            })
          ),
          isQueueFull: true,
          maxQueueSize: 100
        }
      });

      render(<OfflineQueue />);
      expect(screen.getByText(/Queue is full/i)).toBeInTheDocument();
    });
  });

  describe('OfflineSync Component Tests', () => {
    it('should render default sync status', () => {
      render(<OfflineSync />);
      expect(screen.getByText(/Offline Sync/i)).toBeInTheDocument();
      expect(screen.getByText(/Ready to sync/i)).toBeInTheDocument();
    });

    it('should show syncing status when syncing', () => {
      mockStore.setState({
        sync: {
          status: 'syncing',
          isSyncing: true,
          progress: 50
        }
      });

      render(<OfflineSync />);
      expect(screen.getByText(/Syncing... 50%/i)).toBeInTheDocument();
    });

    it('should show completed sync status', () => {
      mockStore.setState({
        sync: {
          status: 'completed',
          isSyncing: false,
          progress: 100,
          lastSynced: new Date()
        }
      });

      render(<OfflineSync />);
      expect(screen.getByText(/Sync completed/i)).toBeInTheDocument();
    });

    it('should show error status when sync fails', () => {
      mockStore.setState({
        sync: {
          status: 'error',
          isSyncing: false,
          error: new Error('Sync failed due to network error')
        }
      });

      render(<OfflineSync />);
      expect(screen.getByText(/Sync failed/i)).toBeInTheDocument();
      expect(screen.getByText(/network error/i)).toBeInTheDocument();
    });

    it('should show paused sync status', () => {
      mockStore.setState({
        sync: {
          status: 'paused',
          isPaused: true
        }
      });

      render(<OfflineSync />);
      expect(screen.getByText(/Sync paused/i)).toBeInTheDocument();
    });
  });

  describe('OfflineSettings Component Tests', () => {
    it('should render all setting fields', () => {
      render(<OfflineSettings />);

      expect(screen.getByLabelText(/Enable Auto-Sync/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Sync Interval/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Max Queue Size/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Conflict Resolution/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Offline Data Retention/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Show Offline Indicator/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Sync on Reconnect/i)).toBeInTheDocument();
    });

    it('should display current network status', () => {
      mockStore.setState({
        status: {
          isOffline: true,
          status: 'offline',
          connectionQuality: 'good',
          networkType: 'wifi'
        },
        pendingChanges: 5
      });

      render(<OfflineSettings />);

      expect(screen.getByText(/Network Status:/i)).toBeInTheDocument();
      expect(screen.getByText(/Offline/i)).toBeInTheDocument();
      expect(screen.getByText(/5/i)).toBeInTheDocument(); // pending changes
    });

    it('should show storage statistics', () => {
      const stats = generateStorageStats({
        taskCount: 15,
        queueSize: 8,
        storageUsage: 2048
      });

      mockStore.setState({
        storageUsage: {
          used: 2048,
          available: 10240,
          percentage: 20
        }
      });

      render(<OfflineSettings />);

      expect(screen.getByText(/Storage Usage:/i)).toBeInTheDocument();
      expect(screen.getByText(/20%/i)).toBeInTheDocument();
    });

    it('should handle settings update', async () => {
      const mockUpdateSettings = jest.fn();
      (useOfflineStore as jest.Mock).mockReturnValue({
        ...mockStore.getState(),
        updateSettings: mockUpdateSettings
      });

      render(<OfflineSettings />);

      const autoSyncCheckbox = screen.getByLabelText(/Enable Auto-Sync/i);
      fireEvent.click(autoSyncCheckbox);

      await waitFor(() => {
        expect(mockUpdateSettings).toHaveBeenCalledWith(
          expect.objectContaining({
            autoSyncEnabled: expect.any(Boolean)
          })
        );
      });
    });
  });

  describe('Integration Tests Between Components', () => {
    it('should demonstrate component interaction in offline scenario', () => {
      // Set up offline state
      mockStore.setState({
        status: {
          isOffline: true,
          status: 'offline'
        },
        pendingChanges: 3,
        queue: {
          items: [
            generateOfflineQueueItem('create', 'high', { status: 'pending' }),
            generateOfflineQueueItem('update', 'medium', { status: 'pending' }),
            generateOfflineQueueItem('delete', 'low', { status: 'pending' })
          ],
          totalCount: 3,
          pendingCount: 3
        }
      });

      // Render all components
      render(
        <>
          <OfflineIndicator showDetails={true} />
          <OfflineQueue />
          <OfflineSync />
          <OfflineSettings />
        </>
      );

      // Verify OfflineIndicator shows offline status
      expect(screen.getByText(/You are offline/i)).toBeInTheDocument();
      expect(screen.getByText(/3 pending changes/i)).toBeInTheDocument();

      // Verify OfflineQueue shows items
      expect(screen.getByText(/Total: 3/i)).toBeInTheDocument();
      expect(screen.getByText(/Pending: 3/i)).toBeInTheDocument();

      // Verify OfflineSync shows ready state
      expect(screen.getByText(/Ready to sync/i)).toBeInTheDocument();

      // Verify OfflineSettings shows offline status
      expect(screen.getByText(/Network Status:/i)).toBeInTheDocument();
      expect(screen.getByText(/Offline/i)).toBeInTheDocument();
    });

    it('should show consistent state across components when online', () => {
      mockStore.setState({
        status: {
          isOffline: false,
          status: 'online'
        },
        pendingChanges: 0,
        queue: {
          items: [],
          totalCount: 0,
          pendingCount: 0
        },
        sync: {
          status: 'idle',
          isSyncing: false
        }
      });

      render(
        <>
          <OfflineIndicator />
          <OfflineQueue />
          <OfflineSync />
        </>
      );

      expect(screen.getByText(/You are online/i)).toBeInTheDocument();
      expect(screen.getByText(/No offline operations in queue/i)).toBeInTheDocument();
      expect(screen.getByText(/Ready to sync/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle empty or null data gracefully', () => {
      mockStore.setState({
        queue: {
          items: null,
          totalCount: 0
        }
      });

      // Should not crash
      expect(() => render(<OfflineQueue />)).not.toThrow();
    });

    it('should handle invalid status values', () => {
      mockStore.setState({
        status: {
          status: 'unknown' as const
        }
      });

      expect(() => render(<OfflineIndicator />)).not.toThrow();
    });

    it('should handle large queue sizes', () => {
      const largeQueue = Array(500).fill(0).map((_, i) =>
        generateOfflineQueueItem('create', 'medium', {
          operation: `Large operation ${i + 1}`,
          status: i % 3 === 0 ? 'pending' : i % 3 === 1 ? 'completed' : 'failed'
        })
      );

      mockStore.setState({
        queue: {
          items: largeQueue,
          totalCount: 500,
          pendingCount: 167,
          completedCount: 167,
          failedCount: 166
        }
      });

      expect(() => render(<OfflineQueue />)).not.toThrow();
      expect(screen.getByText(/Total: 500/i)).toBeInTheDocument();
    });
  });
});