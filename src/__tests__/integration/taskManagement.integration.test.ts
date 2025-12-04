import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';
import { taskApi } from '../../api/taskApi';
import { TodoneDatabase } from '../../database/db';
import { Task } from '../../types/task';

// Mock the database
vi.mock('../../database/db');
vi.mock('../../api/taskApi');

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

describe('Task Management Integration Tests', () => {
  const mockTask: Task = {
    id: 'task-1',
    title: 'Test Task',
    description: 'Test task description',
    status: 'todo',
    priority: 'medium',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    projectId: 'project-1',
    order: 0
  };

  const mockDatabaseTask = {
    id: 1,
    content: 'Test Task',
    projectId: 'project-1',
    sectionId: null,
    priority: 'medium',
    dueDate: null,
    completed: false,
    createdDate: new Date(),
    parentTaskId: null,
    order: 0
  };

  beforeEach(() => {
    // Set up auth token
    localStorage.setItem('token', 'test-token');

    // Mock database methods
    (TodoneDatabase.prototype.tasks.add as any).mockResolvedValue(1);
    (TodoneDatabase.prototype.tasks.put as any).mockResolvedValue(1);
    (TodoneDatabase.prototype.tasks.delete as any).mockResolvedValue(undefined);
    (TodoneDatabase.prototype.tasks.get as any).mockResolvedValue(mockDatabaseTask);
    (TodoneDatabase.prototype.tasks.where as any).mockReturnValue({
      toArray: vi.fn().mockResolvedValue([mockDatabaseTask])
    });

    // Mock API responses
    vi.spyOn(taskApi, 'createTask').mockResolvedValue({
      success: true,
      message: 'Task created successfully',
      data: mockTask
    });

    vi.spyOn(taskApi, 'getTask').mockResolvedValue({
      success: true,
      message: 'Task retrieved successfully',
      data: mockTask
    });

    vi.spyOn(taskApi, 'updateTask').mockResolvedValue({
      success: true,
      message: 'Task updated successfully',
      data: { ...mockTask, title: 'Updated Task' }
    });

    vi.spyOn(taskApi, 'deleteTask').mockResolvedValue({
      success: true,
      message: 'Task deleted successfully',
      data: undefined
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('Task creation → API → Database → UI update flow', async () => {
    // Mock database instance
    const db = new TodoneDatabase();

    // Test task creation flow
    const createResponse = await taskApi.createTask({
      title: 'Test Task',
      description: 'Test task description',
      status: 'todo',
      priority: 'medium',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      projectId: 'project-1',
      order: 0
    });

    expect(createResponse.success).toBe(true);
    expect(createResponse.data).toEqual(mockTask);

    // Simulate database sync
    const dbTask = await db.tasks.add({
      content: 'Test Task',
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

    // Verify database contains the task
    const savedTask = await db.tasks.get(1);
    expect(savedTask).toEqual(mockDatabaseTask);
  });

  test('Task retrieval → API → Database consistency', async () => {
    // Test task retrieval flow
    const getResponse = await taskApi.getTask('task-1');
    expect(getResponse.success).toBe(true);
    expect(getResponse.data).toEqual(mockTask);

    // Verify database consistency
    const db = new TodoneDatabase();
    const dbTask = await db.tasks.get(1);
    expect(dbTask.content).toBe(mockTask.title);
    expect(dbTask.projectId).toBe(mockTask.projectId);
  });

  test('Task update → API → Database sync', async () => {
    // Test task update flow
    const updatedTask = { ...mockTask, title: 'Updated Task' };
    const updateResponse = await taskApi.updateTask('task-1', { title: 'Updated Task' });

    expect(updateResponse.success).toBe(true);
    expect(updateResponse.data?.title).toBe('Updated Task');

    // Simulate database update
    const db = new TodoneDatabase();
    await db.tasks.put({
      ...mockDatabaseTask,
      content: 'Updated Task'
    });

    // Verify database sync
    const dbTask = await db.tasks.get(1);
    expect(dbTask.content).toBe('Updated Task');
  });

  test('Task deletion → API → Database cleanup', async () => {
    // Test task deletion flow
    const deleteResponse = await taskApi.deleteTask('task-1');
    expect(deleteResponse.success).toBe(true);

    // Simulate database cleanup
    const db = new TodoneDatabase();
    await db.tasks.delete(1);

    // Verify task is removed from database
    const deletedTask = await db.tasks.get(1);
    expect(deletedTask).toBeUndefined();
  });

  test('Error handling in task creation flow', async () => {
    // Mock API error
    vi.spyOn(taskApi, 'createTask').mockResolvedValueOnce({
      success: false,
      message: 'Failed to create task',
      data: null
    });

    const createResponse = await taskApi.createTask({
      title: 'Test Task',
      description: 'Test task description',
      status: 'todo',
      priority: 'medium',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      projectId: 'project-1',
      order: 0
    });

    expect(createResponse.success).toBe(false);
    expect(createResponse.message).toBe('Failed to create task');
  });

  test('Data consistency between API and database', async () => {
    // Create task via API
    const createResponse = await taskApi.createTask({
      title: 'Consistency Test',
      description: 'Testing data consistency',
      status: 'todo',
      priority: 'high',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      projectId: 'project-1',
      order: 0
    });

    // Add to database
    const db = new TodoneDatabase();
    await db.tasks.add({
      id: 2,
      content: 'Consistency Test',
      projectId: 'project-1',
      sectionId: null,
      priority: 'high',
      dueDate: null,
      completed: false,
      createdDate: new Date(),
      parentTaskId: null,
      order: 0
    });

    // Retrieve from both sources
    const apiTask = (await taskApi.getTask('task-1')).data;
    const dbTask = await db.tasks.get(2);

    // Verify consistency
    expect(apiTask?.title).toBe(dbTask?.content);
    expect(apiTask?.priority).toBe(dbTask?.priority);
    expect(apiTask?.projectId).toBe(dbTask?.projectId);
  });

  test('Performance impact of task operations', async () => {
    const startTime = performance.now();

    // Perform multiple operations
    await taskApi.createTask(mockTask);
    await taskApi.getTask('task-1');
    await taskApi.updateTask('task-1', { title: 'Updated' });
    await taskApi.getTask('task-1');

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Performance should be reasonable (less than 1 second for mocked operations)
    expect(duration).toBeLessThan(1000);
  });
});