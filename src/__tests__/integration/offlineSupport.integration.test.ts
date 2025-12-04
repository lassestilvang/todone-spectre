import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { offlineService } from '../../services/offlineService';
import { offlineSyncService } from '../../services/offlineSyncService';
import { offlineDataPersistence } from '../../services/offlineDataPersistence';
import { TodoneDatabase } from '../../database/db';
import { Task } from '../../types/task';

// Mock the services and database
vi.mock('../../services/offlineService');
vi.mock('../../services/offlineSyncService');
vi.mock('../../services/offlineDataPersistence');
vi.mock('../../database/db');

describe('Offline Support Integration Tests', () => {
  const mockTask: Task = {
    id: 'task-1',
    title: 'Offline Test Task',
    description: 'Test task for offline functionality',
    status: 'todo',
    priority: 'medium',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    projectId: 'project-1',
    order: 0
  };

  const mockQueueItem = {
    id: 'queue-1',
    operation: 'create_task',
    type: 'create',
    data: mockTask,
    status: 'pending',
    createdAt: new Date(),
    attempts: 0,
    maxAttempts: 3
  };

  beforeEach(() => {
    // Mock offline service methods
    vi.spyOn(offlineService, 'getOfflineStatus').mockReturnValue('offline');
    vi.spyOn(offlineService, 'getOfflineState').mockReturnValue({
      isOffline: true,
      pendingChanges: 1,
      queue: [mockQueueItem],
      lastSync: null,
      error: null,
      isProcessing: false,
      settings: {
        maxQueueSize: 100,
        retryInterval: 5000,
        maxAttempts: 3,
        autoSyncOnReconnect: true
      }
    });

    vi.spyOn(offlineService, 'addToQueue').mockResolvedValue({
      success: true,
      queueItem: mockQueueItem
    });

    vi.spyOn(offlineService, 'processQueue').mockResolvedValue({
      success: true,
      processedItems: [mockQueueItem]
    });

    // Mock sync service methods
    vi.spyOn(offlineSyncService, 'getSyncStatus').mockReturnValue({
      status: 'idle',
      lastSynced: null,
      pendingOperations: 1,
      error: null
    });

    vi.spyOn(offlineSyncService, 'syncOfflineData').mockResolvedValue({
      success: true,
      syncedItems: 1,
      failedItems: 0
    });

    // Mock data persistence methods
    vi.spyOn(offlineDataPersistence, 'storeOfflineTasks').mockResolvedValue(undefined);
    vi.spyOn(offlineDataPersistence, 'getOfflineTasks').mockResolvedValue([mockTask]);
    vi.spyOn(offlineDataPersistence, 'syncOfflineData').mockResolvedValue(undefined);

    // Mock database methods
    (TodoneDatabase.prototype.tasks.add as any).mockResolvedValue(1);
    (TodoneDatabase.prototype.tasks.get as any).mockResolvedValue({
      id: 1,
      content: 'Offline Test Task',
      projectId: 'project-1',
      sectionId: null,
      priority: 'medium',
      dueDate: null,
      completed: false,
      createdDate: new Date(),
      parentTaskId: null,
      order: 0
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('Offline actions → Queue management → Sync on reconnect flow', async () => {
    // Test offline task creation
    const addToQueueResponse = await offlineService.addToQueue({
      operation: 'create_task',
      type: 'create',
      data: mockTask
    });

    expect(addToQueueResponse.success).toBe(true);
    expect(addToQueueResponse.queueItem).toEqual(mockQueueItem);

    // Verify queue state
    const offlineState = offlineService.getOfflineState();
    expect(offlineState.queue).toHaveLength(1);
    expect(offlineState.pendingChanges).toBe(1);

    // Test offline data persistence
    await offlineDataPersistence.storeOfflineTasks([mockTask]);
    const offlineTasks = await offlineDataPersistence.getOfflineTasks();
    expect(offlineTasks).toHaveLength(1);
    expect(offlineTasks[0]).toEqual(mockTask);

    // Simulate coming back online and syncing
    vi.spyOn(offlineService, 'getOfflineStatus').mockReturnValue('online');

    const syncResponse = await offlineSyncService.syncOfflineData();
    expect(syncResponse.success).toBe(true);
    expect(syncResponse.syncedItems).toBe(1);
    expect(syncResponse.failedItems).toBe(0);

    // Verify queue is processed
    const processResponse = await offlineService.processQueue();
    expect(processResponse.success).toBe(true);
    expect(processResponse.processedItems).toHaveLength(1);
  });

  test('Offline task creation and queue management', async () => {
    // Test adding multiple tasks to queue
    const tasksToAdd = [mockTask, {
      ...mockTask,
      id: 'task-2',
      title: 'Second Offline Task'
    }];

    for (const task of tasksToAdd) {
      const response = await offlineService.addToQueue({
        operation: 'create_task',
        type: 'create',
        data: task
      });

      expect(response.success).toBe(true);
    }

    // Verify queue contains both tasks
    const offlineState = offlineService.getOfflineState();
    expect(offlineState.queue).toHaveLength(2);
    expect(offlineState.pendingChanges).toBe(2);
  });

  test('Offline queue processing and error handling', async () => {
    // Mock a failed queue processing
    vi.spyOn(offlineService, 'processQueue').mockResolvedValueOnce({
      success: false,
      processedItems: [],
      error: new Error('Network error during sync')
    });

    const processResponse = await offlineService.processQueue();
    expect(processResponse.success).toBe(false);
    expect(processResponse.error).toBeInstanceOf(Error);
    expect(processResponse.error?.message).toContain('Network error');

    // Verify queue items remain for retry
    const offlineState = offlineService.getOfflineState();
    expect(offlineState.queue).toHaveLength(1); // Original queue item should still be there
  });

  test('Offline data persistence and recovery', async () => {
    // Test storing and retrieving offline tasks
    const tasks = [
      mockTask,
      {
        ...mockTask,
        id: 'task-2',
        title: 'Persistent Task'
      }
    ];

    await offlineDataPersistence.storeOfflineTasks(tasks);
    const retrievedTasks = await offlineDataPersistence.getOfflineTasks();

    expect(retrievedTasks).toHaveLength(2);
    expect(retrievedTasks[0].title).toBe('Offline Test Task');
    expect(retrievedTasks[1].title).toBe('Persistent Task');

    // Test database persistence
    const db = new TodoneDatabase();
    const dbTask = await db.tasks.add({
      content: 'Offline Test Task',
      projectId: 'project-1',
      sectionId: null,
      priority: 'medium',
      dueDate: null,
      completed: false,
      createdDate: new Date(),
      parentTaskId: null,
      order: 0
    });

    expect(dbTask).toBe(1);

    // Verify task can be retrieved from database
    const savedTask = await db.tasks.get(1);
    expect(savedTask.content).toBe('Offline Test Task');
  });

  test('Offline to online transition and sync', async () => {
    // Start offline
    let offlineStatus = offlineService.getOfflineStatus();
    expect(offlineStatus).toBe('offline');

    // Add task while offline
    const addResponse = await offlineService.addToQueue({
      operation: 'create_task',
      type: 'create',
      data: mockTask
    });

    expect(addResponse.success).toBe(true);

    // Transition to online
    vi.spyOn(offlineService, 'getOfflineStatus').mockReturnValue('online');

    // Check sync status before sync
    const syncStatusBefore = offlineSyncService.getSyncStatus();
    expect(syncStatusBefore.pendingOperations).toBe(1);

    // Perform sync
    const syncResponse = await offlineSyncService.syncOfflineData();
    expect(syncResponse.success).toBe(true);

    // Check sync status after sync
    const syncStatusAfter = offlineSyncService.getSyncStatus();
    expect(syncStatusAfter.pendingOperations).toBe(0);
  });

  test('Queue management with different operation types', async () => {
    // Test different types of operations
    const operations = [
      {
        operation: 'create_task',
        type: 'create',
        data: mockTask
      },
      {
        operation: 'update_task',
        type: 'update',
        data: { ...mockTask, title: 'Updated Task' }
      },
      {
        operation: 'delete_task',
        type: 'delete',
        data: { taskId: 'task-1' }
      }
    ];

    // Add all operations to queue
    for (const operation of operations) {
      const response = await offlineService.addToQueue(operation);
      expect(response.success).toBe(true);
    }

    // Verify all operations are in queue
    const offlineState = offlineService.getOfflineState();
    expect(offlineState.queue).toHaveLength(3);

    // Test queue statistics
    const queueStats = offlineService.getQueueStats();
    expect(queueStats.totalItems).toBe(3);
    expect(queueStats.pendingItems).toBe(3);
  });

  test('Performance impact of offline operations', async () => {
    const startTime = performance.now();

    // Perform multiple offline operations
    for (let i = 0; i < 10; i++) {
      await offlineService.addToQueue({
        operation: `create_task_${i}`,
        type: 'create',
        data: { ...mockTask, id: `task-${i}`, title: `Task ${i}` }
      });
    }

    // Test data persistence
    const tasks = Array(5).fill(0).map((_, i) => ({
      ...mockTask,
      id: `persist-${i}`,
      title: `Persistent Task ${i}`
    }));

    await offlineDataPersistence.storeOfflineTasks(tasks);

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Performance should be reasonable (less than 2 seconds for mocked operations)
    expect(duration).toBeLessThan(2000);
  });
});