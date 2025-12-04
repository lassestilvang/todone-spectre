import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OfflineIntegration } from '../OfflineIntegration';
import { OfflineEnhancedDemo } from '../OfflineEnhancedDemo';
import { OfflineIndicatorEnhanced } from '../OfflineIndicatorEnhanced';
import { OfflineQueueEnhanced } from '../OfflineQueueEnhanced';
import { OfflineSyncEnhanced } from '../OfflineSyncEnhanced';
import { OfflineSettingsEnhanced } from '../OfflineSettingsEnhanced';
import { useOfflineStore } from '../../../store/useOfflineStore';
import { OfflineSyncService } from '../../../services/offlineSyncService';

// Mock the offline store and services
jest.mock('../../../store/useOfflineStore');
jest.mock('../../../services/offlineSyncService');

describe('Offline Features Integration Tests', () => {
  const mockOfflineStore = {
    status: {
      isOffline: false,
      status: 'online',
      connectionQuality: 'good',
      networkType: 'wifi'
    },
    queue: {
      items: [],
      totalCount: 0,
      pendingCount: 0,
      failedCount: 0
    },
    sync: {
      status: 'idle',
      isSyncing: false,
      progress: 0
    },
    settings: {
      autoSyncEnabled: true,
      syncInterval: 30000,
      conflictResolution: 'timestamp'
    },
    pendingChanges: 0,
    lastSync: null,
    addToQueue: jest.fn(),
    processQueue: jest.fn(),
    clearQueue: jest.fn(),
    simulateNetworkChange: jest.fn()
  };

  const mockSyncService = {
    syncAll: jest.fn(),
    retryFailedOperations: jest.fn(),
    getSyncStatus: jest.fn().mockReturnValue({
      isSyncing: false,
      lastSynced: null,
      pendingOperations: 0,
      status: 'idle',
      error: null
    })
  };

  beforeEach(() => {
    // Mock the store
    (useOfflineStore as jest.Mock).mockReturnValue(mockOfflineStore);

    // Mock the sync service
    (OfflineSyncService.getInstance as jest.Mock).mockReturnValue(mockSyncService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Offline Integration Component', () => {
    it('should render all offline components', () => {
      render(<OfflineIntegration />);

      // Check that all main components are rendered
      expect(screen.getByText('Offline Integration Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Offline Status')).toBeInTheDocument();
      expect(screen.getByText('Offline Queue')).toBeInTheDocument();
      expect(screen.getByText('Offline Sync')).toBeInTheDocument();
      expect(screen.getByText('Offline Settings')).toBeInTheDocument();
    });

    it('should display network status correctly', () => {
      render(<OfflineIntegration />);

      // Should show online status by default
      expect(screen.getByText('ONLINE')).toBeInTheDocument();
      expect(screen.getByText('Pending Operations')).toBeInTheDocument();
      expect(screen.getByText('Last Synced')).toBeInTheDocument();
    });

    it('should handle demo operations', async () => {
      render(<OfflineIntegration />);

      // Click the demo task creation button
      const createButton = screen.getByText('Create Demo Task Offline');
      fireEvent.click(createButton);

      // Should call the addToQueue method
      await waitFor(() => {
        expect(mockOfflineStore.addToQueue).toHaveBeenCalled();
      });
    });
  });

  describe('Enhanced Offline Demo', () => {
    it('should render both basic and advanced modes', () => {
      render(<OfflineEnhancedDemo />);

      // Should start in basic mode
      expect(screen.getByText('Basic Offline Features')).toBeInTheDocument();

      // Switch to advanced mode
      const modeSelect = screen.getByLabelText('Demo Mode:');
      fireEvent.change(modeSelect, { target: { value: 'advanced' } });

      expect(screen.getByText('Advanced Offline Features')).toBeInTheDocument();
    });

    it('should handle demo controls', () => {
      render(<OfflineEnhancedDemo />);

      // Test demo controls
      const addOpsButton = screen.getByText('Add Demo Operations');
      const toggleNetworkButton = screen.getByText(/Toggle Network/);
      const processQueueButton = screen.getByText('Process Queue');
      const clearQueueButton = screen.getByText('Clear Queue');

      expect(addOpsButton).toBeInTheDocument();
      expect(toggleNetworkButton).toBeInTheDocument();
      expect(processQueueButton).toBeInTheDocument();
      expect(clearQueueButton).toBeInTheDocument();
    });
  });

  describe('Enhanced Offline Indicator', () => {
    it('should display status and advanced stats when enabled', () => {
      render(
        <OfflineIndicatorEnhanced
          showDetails={true}
          showAdvancedStats={true}
          showConnectionHistory={true}
        />
      );

      expect(screen.getByText('You are online. All changes are syncing automatically.')).toBeInTheDocument();
      expect(screen.getByText('Excellent connection')).toBeInTheDocument();
    });

    it('should handle status changes', () => {
      // Mock offline status
      const offlineMockStore = {
        ...mockOfflineStore,
        status: {
          ...mockOfflineStore.status,
          isOffline: true,
          status: 'offline'
        }
      };

      (useOfflineStore as jest.Mock).mockReturnValue(offlineMockStore);

      render(<OfflineIndicatorEnhanced showDetails={true} />);

      expect(screen.getByText('You are offline. Changes will sync when you reconnect.')).toBeInTheDocument();
    });
  });

  describe('Enhanced Offline Queue', () => {
    it('should display queue items and handle filters', () => {
      // Mock queue with items
      const queueMockStore = {
        ...mockOfflineStore,
        queue: {
          ...mockOfflineStore.queue,
          items: [
            {
              id: '1',
              operation: 'Create Task',
              type: 'create',
              data: {},
              timestamp: new Date(),
              status: 'pending',
              attempts: 0,
              priority: 'high'
            }
          ],
          totalCount: 1,
          pendingCount: 1
        }
      };

      (useOfflineStore as jest.Mock).mockReturnValue(queueMockStore);

      render(<OfflineQueueEnhanced showAdvancedFilters={true} />);

      expect(screen.getByText('Create Task')).toBeInTheDocument();
      expect(screen.getByText('pending')).toBeInTheDocument();
    });

    it('should handle queue operations', () => {
      render(<OfflineQueueEnhanced showControls={true} />);

      const retryButton = screen.getByText('Retry All');
      const clearButton = screen.getByText('Clear All');

      expect(retryButton).toBeInTheDocument();
      expect(clearButton).toBeInTheDocument();
    });
  });

  describe('Enhanced Offline Sync', () => {
    it('should display sync status and handle operations', () => {
      render(<OfflineSyncEnhanced showAdvancedStats={true} />);

      expect(screen.getByText('Ready to sync')).toBeInTheDocument();
      expect(screen.getByText('Sync Now')).toBeInTheDocument();
    });

    it('should handle sync operations', async () => {
      render(<OfflineSyncEnhanced />);

      const syncButton = screen.getByText('Sync Now');
      fireEvent.click(syncButton);

      await waitFor(() => {
        expect(mockSyncService.syncAll).toHaveBeenCalled();
      });
    });
  });

  describe('Enhanced Offline Settings', () => {
    it('should display all setting tabs', () => {
      render(<OfflineSettingsEnhanced showAdvancedOptions={true} />);

      expect(screen.getByText('General')).toBeInTheDocument();
      expect(screen.getByText('Advanced')).toBeInTheDocument();
      expect(screen.getByText('Storage')).toBeInTheDocument();
      expect(screen.getByText('Performance')).toBeInTheDocument();
    });

    it('should handle settings changes', () => {
      render(<OfflineSettingsEnhanced />);

      // Should start in view mode
      expect(screen.getByText('Edit Settings')).toBeInTheDocument();

      // Click edit button
      const editButton = screen.getByText('Edit Settings');
      fireEvent.click(editButton);

      // Should now show save/cancel buttons
      expect(screen.getByText('Save Settings')).toBeInTheDocument();
      expect(screen.getByText('Cancel')).toBeInTheDocument();
    });
  });

  describe('Offline Conflict Resolution', () => {
    it('should handle conflict detection and resolution', () => {
      render(<OfflineSyncEnhanced showConflictResolution={true} />);

      // Simulate conflict detection
      const detectButton = screen.getByText('Detect Conflicts');
      fireEvent.click(detectButton);

      // Should show conflict details
      expect(screen.getByText('Conflict Details')).toBeInTheDocument();
    });
  });

  describe('Offline Performance Monitoring', () => {
    it('should display performance metrics', () => {
      const performanceMockStore = {
        ...mockOfflineStore,
        performanceMetrics: {
          queueProcessingTime: 100,
          syncProcessingTime: 200,
          memoryUsage: 50
        }
      };

      (useOfflineStore as jest.Mock).mockReturnValue(performanceMockStore);

      render(<OfflineSettingsEnhanced showPerformanceTuning={true} />);

      // Switch to performance tab
      const perfTab = screen.getByText('Performance');
      fireEvent.click(perfTab);

      expect(screen.getByText('Queue Processing Time:')).toBeInTheDocument();
      expect(screen.getByText('Sync Processing Time:')).toBeInTheDocument();
    });
  });
});