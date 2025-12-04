/**
 * Offline Testing Integration
 * Final integration test that verifies all testing utilities work together
 */

import { render, screen } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { OfflineIntegration } from '../OfflineIntegration';
import { useOffline, useOfflineTasks, useOfflineDataPersistence, useOfflineSync } from '../../../hooks';
import { useOfflineStore } from '../../../store/useOfflineStore';
import {
  MockOfflineTaskService,
  MockOfflineDataPersistence,
  MockOfflineSyncService,
  MockOfflineStore
} from './utils/offlineServiceMocks';
import {
  generateMockTask,
  generateOfflineQueueItem,
  generateOfflineState,
  generateStorageStats
} from './utils/offlineTestDataGenerators';

// Mock all the hooks and store
jest.mock('../../../hooks/useOffline');
jest.mock('../../../hooks/useOfflineTasks');
jest.mock('../../../hooks/useOfflineDataPersistence');
jest.mock('../../../hooks/useOfflineSync');
jest.mock('../../../store/useOfflineStore');

describe('Offline Testing Utilities Integration', () => {
  let mockTaskService: MockOfflineTaskService;
  let mockDataPersistence: MockOfflineDataPersistence;
  let mockSyncService: MockOfflineSyncService;
  let mockStore: MockOfflineStore;

  beforeEach(() => {
    // Initialize all mock services
    mockTaskService = new MockOfflineTaskService(true);
    mockDataPersistence = new MockOfflineDataPersistence();
    mockSyncService = new MockOfflineSyncService(true);
    mockStore = new MockOfflineStore(generateOfflineState({
      status: { isOffline: true }
    }));

    // Set up mock implementations
    (useOfflineStore as jest.Mock).mockReturnValue(mockStore.getState());
    (useOffline as jest.Mock).mockReturnValue({
      ...mockStore.getState(),
      enqueueOperation: jest.fn(),
      processOfflineQueue: jest.fn(),
      simulateNetworkChange: jest.fn()
    });
    (useOfflineTasks as jest.Mock).mockReturnValue({
      isOffline: true,
      pendingOfflineOperations: 0,
      createTaskOffline: mockTaskService.createTaskOffline.bind(mockTaskService),
      updateTaskOffline: mockTaskService.updateTaskOffline.bind(mockTaskService),
      deleteTaskOffline: mockTaskService.deleteTaskOffline.bind(mockTaskService),
      toggleCompletionOffline: mockTaskService.toggleTaskCompletionOffline.bind(mockTaskService),
      processOfflineQueue: mockTaskService.processOfflineTaskQueue.bind(mockTaskService),
      getOfflineQueueStatus: jest.fn().mockReturnValue({
        pendingTasks: 0,
        failedTasks: 0,
        totalTasks: 0
      }),
      hasPendingOperations: jest.fn().mockReturnValue(false)
    });
    (useOfflineDataPersistence as jest.Mock).mockReturnValue({
      isInitialized: true,
      isSyncing: false,
      storeTasksOffline: mockDataPersistence.storeOfflineTasks.bind(mockDataPersistence),
      getTasksOffline: mockDataPersistence.getOfflineTasks.bind(mockDataPersistence),
      storeOfflineOperation: mockDataPersistence.storeOfflineOperation.bind(mockDataPersistence),
      processOfflineOperations: mockDataPersistence.processOfflineOperations.bind(mockDataPersistence),
      syncOfflineData: mockDataPersistence.syncOfflineData.bind(mockDataPersistence),
      needsSync: mockDataPersistence.needsSync.bind(mockDataPersistence),
      getSyncStatus: jest.fn().mockReturnValue({
        isSyncing: false,
        lastSynced: null,
        pendingOperations: 0
      }),
      loadStorageStats: jest.fn(),
      storageStats: generateStorageStats()
    });
    (useOfflineSync as jest.Mock).mockReturnValue({
      isSyncing: false,
      needsSync: mockSyncService.needsSync.bind(mockSyncService),
      syncAll: mockSyncService.syncAll.bind(mockSyncService),
      getSyncStatus: mockSyncService.getSyncStatus.bind(mockSyncService),
      getSyncStatistics: jest.fn().mockResolvedValue({
        totalOperations: 0,
        completedOperations: 0,
        failedOperations: 0,
        syncDuration: null,
        lastSyncSize: 0
      }),
      getQueueStatistics: jest.fn().mockReturnValue({
        totalItems: 0,
        pendingItems: 0,
        completedItems: 0,
        failedItems: 0
      }),
      getComprehensiveOfflineStatus: mockSyncService.getComprehensiveOfflineStatus.bind(mockSyncService)
    });
  });

  describe('Complete Testing Utilities Integration', () => {
    it('should verify all testing utilities work together', async () => {
      // 1. Test data generation
      const mockTask = generateMockTask({ title: 'Integration Test Task' });
      const queueItem = generateOfflineQueueItem('create', 'high');
      const offlineState = generateOfflineState({ status: { isOffline: true } });
      const storageStats = generateStorageStats({ taskCount: 5 });

      expect(mockTask.title).toBe('Integration Test Task');
      expect(queueItem.type).toBe('create');
      expect(offlineState.status.isOffline).toBe(true);
      expect(storageStats.taskCount).toBe(5);

      // 2. Test service mocks
      const createdTask = await mockTaskService.createTaskOffline(mockTask);
      expect(createdTask.id).toContain('temp-');
      expect(mockTaskService.getQueueItems().length).toBe(1);

      await mockDataPersistence.storeOfflineTasks([mockTask]);
      const storedTasks = await mockDataPersistence.getOfflineTasks();
      expect(storedTasks.length).toBe(1);

      const syncStatus = mockSyncService.getSyncStatus();
      expect(syncStatus.isSyncing).toBe(false);

      // 3. Test component rendering with mock store
      render(<OfflineIntegration />);
      expect(screen.getByText('Offline Integration Dashboard')).toBeInTheDocument();

      // 4. Test hook integration
      const offlineHook = renderHook(() => useOffline());
      const tasksHook = renderHook(() => useOfflineTasks());
      const persistenceHook = renderHook(() => useOfflineDataPersistence());
      const syncHook = renderHook(() => useOfflineSync());

      // Verify hooks return expected values
      expect(offlineHook.result.current.isOffline).toBe(true);
      expect(tasksHook.result.current.isOffline).toBe(true);
      expect(persistenceHook.result.current.isInitialized).toBe(true);
      expect(syncHook.result.current.isSyncing).toBe(false);

      // 5. Test complete workflow
      // Create task through hook
      const taskThroughHook = await tasksHook.result.current.createTaskOffline(
        generateMockTask({ title: 'Hook Test Task' })
      );
      expect(taskThroughHook.id).toContain('temp-');

      // Store through persistence hook
      await persistenceHook.result.current.storeTasksOffline([taskThroughHook]);
      const retrievedTasks = await persistenceHook.result.current.getTasksOffline();
      expect(retrievedTasks.length).toBe(2); // 1 from direct call + 1 from hook

      // Check sync status
      expect(syncHook.result.current.needsSync()).toBe(false); // Still offline

      // 6. Test state transitions
      // Switch to online
      mockTaskService.setOfflineStatus(false);
      mockSyncService.setOfflineStatus(false);
      mockStore.setState({
        status: {
          isOffline: false,
          status: 'online'
        }
      });

      // Process queue
      await mockTaskService.processOfflineTaskQueue();
      expect(mockTaskService.getQueueItems().length).toBe(0);

      // Now sync should be possible
      expect(syncHook.result.current.needsSync()).toBe(true);
      await syncHook.result.current.syncAll();
      const finalSyncStatus = syncHook.result.current.getSyncStatus();
      expect(finalSyncStatus.status).toBe('completed');
    });

    it('should verify comprehensive test coverage scenarios', async () => {
      // Test all major scenarios that should be covered

      // 1. Offline task operations
      const task1 = generateMockTask({ title: 'Test Coverage Task 1' });
      const created = await mockTaskService.createTaskOffline(task1);
      const updated = await mockTaskService.updateTaskOffline(created.id, { title: 'Updated' });
      await mockTaskService.deleteTaskOffline(created.id);
      const toggled = await mockTaskService.toggleTaskCompletionOffline(created.id);

      expect(created.id).toBeDefined();
      expect(updated.title).toBe('Updated');
      expect(toggled.completed).toBe(true);

      // 2. Data persistence operations
      const tasks = [generateMockTask(), generateMockTask()];
      await mockDataPersistence.storeOfflineTasks(tasks);
      const retrieved = await mockDataPersistence.getOfflineTasks();
      expect(retrieved.length).toBe(2);

      const operation = generateOfflineQueueItem('sync', 'critical');
      await mockDataPersistence.storeOfflineOperation(operation);
      const operations = await mockDataPersistence.getOfflineOperations();
      expect(operations.length).toBe(1);

      // 3. Sync operations
      mockSyncService.getSyncStatus().pendingOperations = 3;
      expect(mockSyncService.needsSync()).toBe(false); // Still offline

      // 4. Component rendering with various states
      // Online state
      mockStore.setState(generateOfflineState({
        status: { isOffline: false }
      }));
      render(<OfflineIntegration />);
      expect(screen.getByText('ONLINE')).toBeInTheDocument();

      // Offline state with pending changes
      mockStore.setState(generateOfflineState({
        status: { isOffline: true },
        pendingChanges: 5,
        queue: {
          items: [
            generateOfflineQueueItem('create', 'high', { status: 'pending' }),
            generateOfflineQueueItem('update', 'medium', { status: 'pending' })
          ],
          totalCount: 2,
          pendingCount: 2
        }
      }));
      render(<OfflineIntegration />);
      expect(screen.getByText('OFFLINE')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument(); // pending changes

      // 5. Error handling scenarios
      mockTaskService.setOfflineStatus(true);
      await expect(mockTaskService.processOfflineTaskQueue())
        .rejects.toThrow('Cannot process queue while offline');

      mockSyncService.setOfflineStatus(true);
      await expect(mockSyncService.syncAll())
        .rejects.toThrow('Cannot sync while offline');

      // 6. Performance scenarios
      // Bulk operations
      for (let i = 0; i < 50; i++) {
        await mockTaskService.createTaskOffline(
          generateMockTask({ title: `Bulk Task ${i}` })
        );
      }
      expect(mockTaskService.getQueueItems().length).toBe(50);

      // 7. State management
      const initialState = mockStore.getState();
      expect(initialState.status.isOffline).toBe(true);

      mockStore.setState({
        status: {
          isOffline: false,
          status: 'online'
        }
      });
      const onlineState = mockStore.getState();
      expect(onlineState.status.isOffline).toBe(false);
    });

    it('should verify all utilities provide comprehensive coverage', () => {
      // Verify that all the testing utilities cover the major aspects

      // 1. Data Generation Coverage
      const testDataCoverage = [
        generateMockTask(), // Task generation
        generateMockTasks(3), // Multiple tasks
        generateOfflineQueueItem('create'), // Queue items
        generateOfflineQueueItems(5), // Multiple queue items
        generateOfflineState(), // Complete state
        generateStorageStats(), // Storage stats
        generateStorageStats({ taskCount: 100 }) // Custom stats
      ];

      expect(testDataCoverage.length).toBe(7);
      expect(testDataCoverage[0].id).toContain('task-');
      expect(testDataCoverage[1].length).toBe(3);
      expect(testDataCoverage[2].type).toBe('create');
      expect(testDataCoverage[3].length).toBe(5);
      expect(testDataCoverage[4].status.isOffline).toBe(false);
      expect(testDataCoverage[5].taskCount).toBe(10);
      expect(testDataCoverage[6].taskCount).toBe(100);

      // 2. Service Mock Coverage
      const serviceMocks = [
        new MockOfflineTaskService(true),
        new MockOfflineDataPersistence(),
        new MockOfflineSyncService(true),
        new MockOfflineStore()
      ];

      expect(serviceMocks[0].getQueueItems().length).toBe(0);
      expect(serviceMocks[1].getOfflineTasks()).resolves.toEqual([]);
      expect(serviceMocks[2].getSyncStatus().isSyncing).toBe(false);
      expect(serviceMocks[3].getState().status.isOffline).toBe(true);

      // 3. Utility Function Coverage
      const mockServices = createMockServices(true);
      expect(mockServices.offlineTaskService).toBeDefined();
      expect(mockServices.offlineDataPersistence).toBeDefined();
      expect(mockServices.offlineSyncService).toBeDefined();
      expect(mockServices.useOfflineStore).toBeDefined();

      // 4. Component Coverage Verification
      const components = [
        { name: 'OfflineIndicator', test: () => render(<OfflineIndicator />) },
        { name: 'OfflineQueue', test: () => render(<OfflineQueue />) },
        { name: 'OfflineSync', test: () => render(<OfflineSync />) },
        { name: 'OfflineSettings', test: () => render(<OfflineSettings />) },
        { name: 'OfflineIntegration', test: () => render(<OfflineIntegration />) }
      ];

      components.forEach(component => {
        expect(() => component.test()).not.toThrow();
      });

      // 5. Hook Coverage Verification
      const hooks = [
        { name: 'useOffline', hook: () => renderHook(() => useOffline()) },
        { name: 'useOfflineTasks', hook: () => renderHook(() => useOfflineTasks()) },
        { name: 'useOfflineDataPersistence', hook: () => renderHook(() => useOfflineDataPersistence()) },
        { name: 'useOfflineSync', hook: () => renderHook(() => useOfflineSync()) }
      ];

      hooks.forEach(hook => {
        expect(() => hook.hook()).not.toThrow();
      });
    });
  });

  describe('Testing Utilities Verification', () => {
    it('should verify test data generators produce valid data', () => {
      // Test task generation
      const task = generateMockTask();
      expect(task).toHaveProperty('id');
      expect(task).toHaveProperty('title');
      expect(task).toHaveProperty('status');
      expect(task).toHaveProperty('priority');
      expect(task).toHaveProperty('createdAt');
      expect(task).toHaveProperty('updatedAt');

      // Test multiple tasks
      const tasks = generateMockTasks(5);
      expect(tasks.length).toBe(5);
      tasks.forEach((t, i) => {
        expect(t.title).toContain(`Test Task ${i + 1}`);
      });

      // Test queue items
      const queueItem = generateOfflineQueueItem('update', 'critical');
      expect(queueItem).toHaveProperty('id');
      expect(queueItem).toHaveProperty('operation');
      expect(queueItem).toHaveProperty('type');
      expect(queueItem).toHaveProperty('data');
      expect(queueItem).toHaveProperty('timestamp');
      expect(queueItem).toHaveProperty('status');
      expect(queueItem).toHaveProperty('priority');

      // Test multiple queue items
      const queueItems = generateOfflineQueueItems(3, ['create', 'update', 'delete'], ['high', 'medium', 'low']);
      expect(queueItems.length).toBe(3);
      expect(queueItems[0].type).toBe('create');
      expect(queueItems[1].type).toBe('update');
      expect(queueItems[2].type).toBe('delete');

      // Test offline state
      const state = generateOfflineState({
        status: { isOffline: true },
        pendingChanges: 10
      });
      expect(state.status.isOffline).toBe(true);
      expect(state.pendingChanges).toBe(10);

      // Test storage stats
      const stats = generateStorageStats({
        taskCount: 25,
        queueSize: 8,
        storageUsage: 2048
      });
      expect(stats.taskCount).toBe(25);
      expect(stats.queueSize).toBe(8);
      expect(stats.storageUsage).toBe(2048);
    });

    it('should verify service mocks implement all required methods', () => {
      // Task service methods
      const taskService = new MockOfflineTaskService(true);
      expect(typeof taskService.createTaskOffline).toBe('function');
      expect(typeof taskService.updateTaskOffline).toBe('function');
      expect(typeof taskService.deleteTaskOffline).toBe('function');
      expect(typeof taskService.toggleTaskCompletionOffline).toBe('function');
      expect(typeof taskService.processOfflineTaskQueue).toBe('function');
      expect(typeof taskService.getOfflineTaskQueueStatus).toBe('function');
      expect(typeof taskService.hasPendingOfflineTaskOperations).toBe('function');

      // Data persistence methods
      const dataPersistence = new MockOfflineDataPersistence();
      expect(typeof dataPersistence.initialize).toBe('function');
      expect(typeof dataPersistence.storeOfflineTasks).toBe('function');
      expect(typeof dataPersistence.getOfflineTasks).toBe('function');
      expect(typeof dataPersistence.storeOfflineOperation).toBe('function');
      expect(typeof dataPersistence.getOfflineOperations).toBe('function');
      expect(typeof dataPersistence.processOfflineOperations).toBe('function');
      expect(typeof dataPersistence.syncOfflineData).toBe('function');
      expect(typeof dataPersistence.getSyncStatus).toBe('function');
      expect(typeof dataPersistence.getOfflineStorageStats).toBe('function');

      // Sync service methods
      const syncService = new MockOfflineSyncService(true);
      expect(typeof syncService.needsSync).toBe('function');
      expect(typeof syncService.autoSync).toBe('function');
      expect(typeof syncService.syncAll).toBe('function');
      expect(typeof syncService.getSyncStatus).toBe('function');
      expect(typeof syncService.getSyncStatistics).toBe('function');
      expect(typeof syncService.processSyncQueue).toBe('function');
      expect(typeof syncService.retryFailedOperations).toBe('function');
      expect(typeof syncService.getQueueStatistics).toBe('function');

      // Store methods
      const store = new MockOfflineStore();
      expect(typeof store.getState).toBe('function');
      expect(typeof store.setState).toBe('function');
      expect(typeof store.subscribe).toBe('function');
    });

    it('should verify all utilities can be imported and used together', () => {
      // Import all utilities
      const {
        generateMockTask,
        generateMockTasks,
        generateOfflineQueueItem,
        generateOfflineQueueItems,
        generateOfflineState,
        generateStorageStats,
        generateComprehensiveOfflineStatus,
        generateMockApiResponse
      } = require('./utils/offlineTestDataGenerators');

      const {
        MockOfflineTaskService,
        MockOfflineDataPersistence,
        MockOfflineSyncService,
        MockOfflineStore,
        createMockServices
      } = require('./utils/offlineServiceMocks');

      // Verify all are defined
      expect(generateMockTask).toBeDefined();
      expect(generateMockTasks).toBeDefined();
      expect(generateOfflineQueueItem).toBeDefined();
      expect(generateOfflineQueueItems).toBeDefined();
      expect(generateOfflineState).toBeDefined();
      expect(generateStorageStats).toBeDefined();
      expect(generateComprehensiveOfflineStatus).toBeDefined();
      expect(generateMockApiResponse).toBeDefined();

      expect(MockOfflineTaskService).toBeDefined();
      expect(MockOfflineDataPersistence).toBeDefined();
      expect(MockOfflineSyncService).toBeDefined();
      expect(MockOfflineStore).toBeDefined();
      expect(createMockServices).toBeDefined();

      // Verify they can be used together
      const task = generateMockTask();
      const service = new MockOfflineTaskService(true);
      const createdTask = service.createTaskOffline(task);

      expect(createdTask).resolves.toBeDefined();
    });
  });
});