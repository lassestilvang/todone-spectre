import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import TaskCreatePage from '../../pages/tasks/TaskCreatePage';
import TaskDetailPage from '../../pages/tasks/TaskDetailPage';
import TasksPage from '../../pages/tasks/TasksPage';
import RecurringTasksPage from '../../pages/tasks/RecurringTasksPage';
import { useTasks } from '../../../hooks/useTasks';
import { useRecurringTaskIntegration } from '../../../hooks/useRecurringTaskIntegration';

// Mock the hooks
jest.mock('../../../hooks/useTasks');
jest.mock('../../../hooks/useRecurringTaskIntegration');

describe('Recurring Task Integration Test', () => {
  const mockTasks = [
    {
      id: 'task-1',
      title: 'Regular Task',
      description: 'This is a regular task',
      status: 'active',
      priority: 'P2',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'task-2',
      title: 'Recurring Task',
      description: 'This is a recurring task',
      status: 'active',
      priority: 'P1',
      recurringPattern: 'weekly',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customFields: {
        recurringConfig: {
          pattern: 'weekly',
          startDate: new Date(),
          maxOccurrences: 10
        }
      }
    }
  ];

  const mockRecurringTasks = [
    {
      id: 'recurring-1',
      title: 'Weekly Meeting',
      description: 'Team sync meeting',
      status: 'active',
      priority: 'P1',
      recurringPattern: 'weekly',
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customFields: {
        recurringConfig: {
          pattern: 'weekly',
          startDate: new Date(),
          maxOccurrences: 52
        }
      }
    }
  ];

  beforeEach(() => {
    // Mock useTasks hook
    (useTasks as jest.Mock).mockReturnValue({
      createTask: jest.fn().mockResolvedValue({ id: 'new-task' }),
      updateTask: jest.fn().mockResolvedValue({}),
      deleteTask: jest.fn().mockResolvedValue({}),
      getProcessedTasks: () => mockTasks,
      isLoading: false,
      error: null,
      toggleCompletion: jest.fn(),
      searchTasks: jest.fn(),
      filterByStatus: jest.fn(),
      filterByPriority: jest.fn(),
      resetFilters: jest.fn(),
      sortTasks: jest.fn(),
      searchQuery: '',
      statusFilter: 'all',
      priorityFilter: 'all',
      sortBy: 'priority',
      sortDirection: 'asc'
    });

    // Mock useRecurringTaskIntegration hook
    (useRecurringTaskIntegration as jest.Mock).mockReturnValue({
      createRecurringTaskIntegrated: jest.fn().mockResolvedValue({ id: 'new-recurring-task' }),
      updateRecurringTaskIntegrated: jest.fn().mockResolvedValue({}),
      deleteRecurringTaskIntegrated: jest.fn().mockResolvedValue({}),
      getRecurringTasks: () => mockRecurringTasks,
      getRecurringTaskStats: jest.fn().mockReturnValue({
        totalInstances: 5,
        completedInstances: 2,
        pendingInstances: 3
      }),
      recurringTasks: mockRecurringTasks,
      recurringTaskInstances: [],
      isLoading: false,
      error: null,
      systemStatus: {
        healthScore: 100,
        issuesCount: 0,
        recommendationsCount: 0
      }
    });
  });

  test('TaskCreatePage should allow creating both regular and recurring tasks', async () => {
    render(
      <MemoryRouter>
        <TaskCreatePage />
      </MemoryRouter>
    );

    // Should show regular task form by default
    expect(screen.getByText('Create New Task')).toBeInTheDocument();
    expect(screen.queryByText('Create New Recurring Task')).not.toBeInTheDocument();

    // Toggle to recurring task
    const recurringCheckbox = screen.getByLabelText('Make this a recurring task');
    fireEvent.click(recurringCheckbox);

    // Should now show recurring task form
    expect(screen.getByText('Create New Recurring Task')).toBeInTheDocument();
    expect(screen.getByText('Recurring Task Settings')).toBeInTheDocument();
  });

  test('TaskDetailPage should show appropriate detail view based on task type', async () => {
    // Mock task detail for regular task
    (useTasks as jest.Mock).mockReturnValueOnce({
      ...useTasks(),
      task: mockTasks[0],
      refetch: jest.fn()
    });

    render(
      <MemoryRouter initialEntries={['/tasks/task-1']}>
        <Routes>
          <Route path="/tasks/:taskId" element={<TaskDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Should show regular task detail
    expect(screen.getByText('Regular Task')).toBeInTheDocument();
    expect(screen.queryByText('Recurring Task Statistics')).not.toBeInTheDocument();

    // Mock task detail for recurring task
    (useTasks as jest.Mock).mockReturnValueOnce({
      ...useTasks(),
      task: mockTasks[1],
      refetch: jest.fn()
    });

    render(
      <MemoryRouter initialEntries={['/tasks/task-2']}>
        <Routes>
          <Route path="/tasks/:taskId" element={<TaskDetailPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Should show recurring task preview
    expect(screen.getByText('Weekly Task')).toBeInTheDocument();
    expect(screen.getByText('Recurring Task Statistics')).toBeInTheDocument();
  });

  test('TasksPage should display both regular and recurring tasks', async () => {
    render(
      <MemoryRouter>
        <TasksPage />
      </MemoryRouter>
    );

    // Should show task statistics
    expect(screen.getByText('Regular Tasks')).toBeInTheDocument();
    expect(screen.getByText('Recurring Tasks')).toBeInTheDocument();

    // Should show task counts
    expect(screen.getByText('2')).toBeInTheDocument(); // Regular tasks
    expect(screen.getByText('1')).toBeInTheDocument(); // Recurring tasks
    expect(screen.getByText('3')).toBeInTheDocument(); // Total tasks
  });

  test('RecurringTasksPage should display only recurring tasks', async () => {
    render(
      <MemoryRouter>
        <RecurringTasksPage />
      </MemoryRouter>
    );

    // Should show recurring tasks header
    expect(screen.getByText('Recurring Tasks')).toBeInTheDocument();

    // Should show recurring task
    expect(screen.getByText('Weekly Meeting')).toBeInTheDocument();
  });

  test('Navigation between task types should work correctly', async () => {
    render(
      <MemoryRouter initialEntries={['/tasks']}>
        <Routes>
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/tasks/recurring" element={<RecurringTasksPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Start on main tasks page
    expect(screen.getByText('Tasks')).toBeInTheDocument();

    // Click on recurring tasks button
    const recurringButton = screen.getByText('Recurring Tasks');
    fireEvent.click(recurringButton);

    // Should navigate to recurring tasks page
    await waitFor(() => {
      expect(screen.getByText('Recurring Tasks')).toBeInTheDocument();
    });
  });
});