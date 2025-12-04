/**
 * Comprehensive Offline Integration Tests
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { OfflineIntegration } from '../OfflineIntegration';
import { useOfflineTasks } from '../../../hooks/useOfflineTasks';
import { useOfflineDataPersistence } from '../../../hooks/useOfflineDataPersistence';
import { useOfflineSync } from '../../../hooks/useOfflineSync';
import { useOfflineStore } from '../../../store/useOfflineStore';

// Mock the hooks
jest.mock('../../../hooks/useOfflineTasks');
jest.mock('../../../hooks/useOfflineDataPersistence');
jest.mock('../../../hooks/useOfflineSync');
jest.mock('../../../store/useOfflineStore');

describe('OfflineIntegration Component', () => {
  const mockUseOfflineTasks = useOfflineTasks as jest.Mock;
  const mockUseOfflineDataPersistence = useOfflineDataPersistence as jest.Mock;
  const mockUseOfflineSync = useOfflineSync as jest.Mock;
  const mockUseOfflineStore = useOfflineStore as jest.Mock;

  const mockTask = {
    title: 'Test Task',
    description: 'Test Description',
    status: 'todo',
    priority: 'medium',
    projectId: 'test-project',
    createdAt: new Date(),
    updatedAt: new Date(),
    completed: false
  };

  beforeEach(() => {
    // Mock hook implementations
    mockUseOfflineTasks.mockReturnValue({
      isOffline: false,
      pendingOfflineOperations: 0,
      createTaskOffline: jest.fn().mockResolvedValue({ ...mockTask, id: 'test-id' }),
      updateTaskOffline: jest.fn(),
      deleteTaskOffline: jest.fn(),
      toggleCompletionOffline: jest.fn(),
      processOfflineQueue: jest.fn(),
      hasPendingOperations: jest.fn().mockReturnValue(false)
    });

    mockUseOfflineDataPersistence.mockReturnValue({
      isSyncing: false,
      pendingOperations: 0,
      syncOfflineData: jest.fn(),
      needsSync: jest.fn().mockReturnValue(false),
      storageStats: {
        taskCount: 0,
        queueSize: 0,
        storageUsage: 0
      }
    });

    mockUseOfflineSync.mockReturnValue({
      isSyncing: false,
      lastSynced: null,
      pendingOperations: 0,
      syncAll: jest.fn(),
      needsSync: jest.fn().mockReturnValue(false),
      getComprehensiveOfflineStatus: jest.fn().mockReturnValue({
        isOffline: false,
        networkStatus: 'online',
        pendingChanges: 0,
        queueStatus: {
          total: 0,
          pending: 0,
          failed: 0
        },
        syncStatus: 'idle',
        lastSync: null
      })
    });

    mockUseOfflineStore.mockReturnValue({
      status: {
        isOffline: false,
        status: 'online'
      },
      simulateNetworkChange: jest.fn()
    });
  });

  it('should render offline integration dashboard', () => {
    render(<OfflineIntegration />);

    expect(screen.getByText('Offline Integration Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Offline Status')).toBeInTheDocument();
    expect(screen.getByText('Offline Integration Demo')).toBeInTheDocument();
    expect(screen.getByText('Offline Storage Statistics')).toBeInTheDocument();
    expect(screen.getByText('Comprehensive Offline Status')).toBeInTheDocument();
  });

  it('should show network status correctly', () => {
    render(<OfflineIntegration />);

    expect(screen.getByText('ONLINE')).toBeInTheDocument();
    expect(screen.getByText('Pending Operations')).toBeInTheDocument();
    expect(screen.getByText('Last Synced')).toBeInTheDocument();
  });

  it('should handle offline task creation', async () => {
    const createTaskMock = jest.fn().mockResolvedValue({ ...mockTask, id: 'offline-id' });
    mockUseOfflineTasks.mockReturnValue({
      ...mockUseOfflineTasks(),
      isOffline: true,
      createTaskOffline: createTaskMock
    });

    render(<OfflineIntegration />);

    const createButton = screen.getByText('Create Demo Task Offline');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(createTaskMock).toHaveBeenCalledWith(mockTask);
    });
  });

  it('should handle queue processing', async () => {
    const processQueueMock = jest.fn().mockResolvedValue(undefined);
    mockUseOfflineTasks.mockReturnValue({
      ...mockUseOfflineTasks(),
      isOffline: false,
      hasPendingOperations: jest.fn().mockReturnValue(true),
      processOfflineQueue: processQueueMock
    });

    render(<OfflineIntegration />);

    const processButton = screen.getByText('Process Offline Queue');
    fireEvent.click(processButton);

    await waitFor(() => {
      expect(processQueueMock).toHaveBeenCalled();
    });
  });

  it('should handle sync all operations', async () => {
    const syncAllMock = jest.fn().mockResolvedValue(undefined);
    mockUseOfflineSync.mockReturnValue({
      ...mockUseOfflineSync(),
      isSyncing: false,
      needsSync: jest.fn().mockReturnValue(true),
      syncAll: syncAllMock
    });

    render(<OfflineIntegration />);

    const syncButton = screen.getByText('Sync All Offline Data');
    fireEvent.click(syncButton);

    await waitFor(() => {
      expect(syncAllMock).toHaveBeenCalled();
    });
  });

  it('should handle network toggle', async () => {
    const toggleNetworkMock = jest.fn();
    mockUseOfflineStore.mockReturnValue({
      ...mockUseOfflineStore(),
      simulateNetworkChange: toggleNetworkMock
    });

    render(<OfflineIntegration />);

    const toggleButton = screen.getByText('Toggle Network (Test)');
    fireEvent.click(toggleButton);

    await waitFor(() => {
      expect(toggleNetworkMock).toHaveBeenCalledWith(true);
    });
  });

  it('should show offline status when offline', () => {
    mockUseOfflineTasks.mockReturnValue({
      ...mockUseOfflineTasks(),
      isOffline: true
    });

    render(<OfflineIntegration />);

    expect(screen.getByText('OFFLINE')).toBeInTheDocument();
  });

  it('should disable offline buttons when online', () => {
    render(<OfflineIntegration />);

    const createButton = screen.getByText('Create Demo Task Offline');
    expect(createButton).toBeDisabled();
  });

  it('should disable sync buttons when offline', () => {
    mockUseOfflineTasks.mockReturnValue({
      ...mockUseOfflineTasks(),
      isOffline: true
    });

    render(<OfflineIntegration />);

    const processButton = screen.getByText('Process Offline Queue');
    const syncButton = screen.getByText('Sync All Offline Data');
    expect(processButton).toBeDisabled();
    expect(syncButton).toBeDisabled();
  });

  it('should display storage statistics', () => {
    const mockStats = {
      taskCount: 10,
      queueSize: 5,
      storageUsage: 1024
    };

    mockUseOfflineDataPersistence.mockReturnValue({
      ...mockUseOfflineDataPersistence(),
      storageStats: mockStats
    });

    render(<OfflineIntegration />);

    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('1 KB')).toBeInTheDocument();
  });

  it('should display comprehensive offline status', () => {
    const mockStatus = {
      isOffline: false,
      networkStatus: 'online',
      pendingChanges: 3,
      queueStatus: {
        total: 5,
        pending: 3,
        failed: 1
      },
      syncStatus: 'idle',
      lastSync: new Date('2023-01-01')
    };

    mockUseOfflineSync.mockReturnValue({
      ...mockUseOfflineSync(),
      getComprehensiveOfflineStatus: jest.fn().mockReturnValue(mockStatus)
    });

    render(<OfflineIntegration />);

    expect(screen.getByText(JSON.stringify(mockStatus, null, 2))).toBeInTheDocument();
  });
});