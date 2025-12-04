import { TaskApi } from '../../api/taskApi';
import { Task } from '../../types/task';
import { ApiResponse } from '../../types/api';

// Mock global fetch
global.fetch = jest.fn();

describe('TaskApi', () => {
  let taskApi: TaskApi;
  const mockTask: Task = {
    id: 'test-task-1',
    title: 'Test Task',
    description: 'Test Description',
    status: 'todo',
    priority: 'medium',
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    order: 0
  };

  beforeEach(() => {
    taskApi = new TaskApi();
    jest.clearAllMocks();
  });

  describe('transformRequest', () => {
    it('should transform task data for API requests', () => {
      // @ts-ignore - testing private method
      const result = taskApi.transformRequest(mockTask);
      expect(result).toBeDefined();
      expect(result.dueDate).toBeUndefined(); // No dueDate in mock
      expect(result.createdAt).toBeDefined();
    });

    it('should handle date transformation', () => {
      const taskWithDates = {
        ...mockTask,
        dueDate: new Date('2023-01-01'),
        completedAt: new Date('2023-01-02')
      };
      // @ts-ignore - testing private method
      const result = taskApi.transformRequest(taskWithDates);
      expect(result.dueDate).toBe('2023-01-01T00:00:00.000Z');
      expect(result.completedAt).toBe('2023-01-02T00:00:00.000Z');
    });
  });

  describe('transformResponse', () => {
    it('should transform API response to Task object', () => {
      const apiResponse = {
        id: 'test-1',
        title: 'Test Task',
        status: 'todo',
        priority: 'high',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z'
      };
      // @ts-ignore - testing private method
      const result = taskApi.transformResponse(apiResponse);
      expect(result).toBeDefined();
      expect(result.id).toBe('test-1');
      expect(result.title).toBe('Test Task');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle null dates in response', () => {
      const apiResponse = {
        id: 'test-1',
        title: 'Test Task',
        status: 'todo',
        priority: 'medium',
        createdAt: '2023-01-01T00:00:00.000Z',
        updatedAt: '2023-01-02T00:00:00.000Z',
        dueDate: null,
        completedAt: null
      };
      // @ts-ignore - testing private method
      const result = taskApi.transformResponse(apiResponse);
      expect(result.dueDate).toBeNull();
      expect(result.completedAt).toBeNull();
    });
  });

  describe('handleApiRequest', () => {
    it('should handle successful API requests', async () => {
      const mockResponse = { success: true, data: { test: 'data' } };
      // @ts-ignore - testing private method
      const result = await taskApi.handleApiRequest(async () => {
        return {
          ok: true,
          json: async () => mockResponse
        } as Response;
      });

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockResponse);
    });

    it('should handle failed API requests', async () => {
      // @ts-ignore - testing private method
      const result = await taskApi.handleApiRequest(async () => {
        return {
          ok: false,
          status: 404,
          json: async () => ({ message: 'Not found' })
        } as Response;
      });

      expect(result.success).toBe(false);
      expect(result.message).toContain('HTTP error! status: 404');
    });

    it('should retry failed requests up to MAX_RETRIES', async () => {
      let callCount = 0;
      // @ts-ignore - testing private method
      const result = await taskApi.handleApiRequest(async () => {
        callCount++;
        if (callCount < 3) {
          throw new Error('Network error');
        }
        return {
          ok: true,
          json: async () => ({ success: true })
        } as Response;
      });

      expect(callCount).toBe(3);
      expect(result.success).toBe(true);
    });
  });

  describe('createTask', () => {
    it('should create a task successfully', async () => {
      const mockTaskData = {
        title: 'New Task',
        description: 'New Description',
        status: 'todo',
        priority: 'high'
      };

      // Mock fetch to return successful response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'new-task-1',
          ...mockTaskData,
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-01T00:00:00.000Z'
        })
      });

      const result = await taskApi.createTask(mockTaskData as any);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe('new-task-1');
    });

    it('should handle task creation failure', async () => {
      // Mock fetch to return failed response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Server error' })
      });

      const result = await taskApi.createTask({ title: 'Test' } as any);
      expect(result.success).toBe(false);
      expect(result.message).toContain('Server error');
    });
  });

  describe('getTask', () => {
    it('should get a task by ID successfully', async () => {
      // Mock fetch to return successful response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'test-task-1',
          title: 'Test Task',
          status: 'todo',
          priority: 'medium',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-02T00:00:00.000Z'
        })
      });

      const result = await taskApi.getTask('test-task-1');
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe('test-task-1');
    });

    it('should handle task fetch failure', async () => {
      // Mock fetch to return failed response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ message: 'Task not found' })
      });

      const result = await taskApi.getTask('non-existent-task');
      expect(result.success).toBe(false);
      expect(result.message).toContain('Task not found');
    });
  });

  describe('getTasks', () => {
    it('should get all tasks successfully', async () => {
      // Mock fetch to return successful response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ([
          {
            id: 'task-1',
            title: 'Task 1',
            status: 'todo',
            priority: 'high',
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-02T00:00:00.000Z'
          },
          {
            id: 'task-2',
            title: 'Task 2',
            status: 'in-progress',
            priority: 'medium',
            createdAt: '2023-01-01T00:00:00.000Z',
            updatedAt: '2023-01-02T00:00:00.000Z'
          }
        ])
      });

      const result = await taskApi.getTasks();
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.length).toBe(2);
    });

    it('should handle tasks fetch failure', async () => {
      // Mock fetch to return failed response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Server error' })
      });

      const result = await taskApi.getTasks();
      expect(result.success).toBe(false);
      expect(result.message).toContain('Server error');
    });
  });

  describe('updateTask', () => {
    it('should update a task successfully', async () => {
      const updateData = {
        title: 'Updated Task',
        status: 'in-progress'
      };

      // Mock fetch to return successful response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'test-task-1',
          title: 'Updated Task',
          status: 'in-progress',
          priority: 'medium',
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-03T00:00:00.000Z'
        })
      });

      const result = await taskApi.updateTask('test-task-1', updateData as any);
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.title).toBe('Updated Task');
    });
  });

  describe('deleteTask', () => {
    it('should delete a task successfully', async () => {
      // Mock fetch to return successful response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      const result = await taskApi.deleteTask('test-task-1');
      expect(result.success).toBe(true);
    });
  });

  describe('completeTask', () => {
    it('should complete a task successfully', async () => {
      // Mock fetch to return successful response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'test-task-1',
          title: 'Test Task',
          status: 'completed',
          priority: 'medium',
          completed: true,
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-03T00:00:00.000Z',
          completedAt: '2023-01-03T00:00:00.000Z'
        })
      });

      const result = await taskApi.completeTask('test-task-1');
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.status).toBe('completed');
      expect(result.data?.completed).toBe(true);
    });
  });

  describe('reopenTask', () => {
    it('should reopen a task successfully', async () => {
      // Mock fetch to return successful response
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: 'test-task-1',
          title: 'Test Task',
          status: 'in-progress',
          priority: 'medium',
          completed: false,
          createdAt: '2023-01-01T00:00:00.000Z',
          updatedAt: '2023-01-03T00:00:00.000Z',
          completedAt: null
        })
      });

      const result = await taskApi.reopenTask('test-task-1');
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.completed).toBe(false);
    });
  });
});