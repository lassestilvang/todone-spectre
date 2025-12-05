/**
 * Recurring Task Component Tests
 * Comprehensive component tests for recurring task UI components
 * Tests user interactions, rendering, and integration with services
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { RecurringTaskForm } from "../RecurringTaskForm";
import { RecurringTaskList } from "../RecurringTaskList";
import { RecurringTaskPreview } from "../RecurringTaskPreview";
import { RecurringTaskScheduler } from "../RecurringTaskScheduler";
import { useRecurringTasks } from "../../../hooks/useRecurringTasks";
import { useRecurringTaskIntegration } from "../../../hooks/useRecurringTaskIntegration";
import {
  mockRecurringTaskService,
  mockRecurringTaskIntegration,
} from "../../../utils/__tests__/recurringTaskServiceMocks";
import { recurringTaskTestDataGenerator } from "../../../utils/__tests__/recurringTaskTestDataGenerators";

// Mock the hooks
jest.mock("../../../hooks/useRecurringTasks");
jest.mock("../../../hooks/useRecurringTaskIntegration");

describe("Recurring Task Component Tests", () => {
  const testData =
    recurringTaskTestDataGenerator.generateRecurringTaskScenarios();
  const mockTasks = Object.values(testData);

  beforeEach(() => {
    // Reset mock services before each test
    mockRecurringTaskService.reset();
    mockRecurringTaskIntegration.reset();

    // Mock useRecurringTasks hook
    (useRecurringTasks as jest.Mock).mockReturnValue({
      createRecurringTask: jest
        .fn()
        .mockImplementation((task, config) =>
          mockRecurringTaskService.createRecurringTask(task, config),
        ),
      fetchRecurringTasks: jest.fn().mockResolvedValue(mockTasks),
      completeRecurringInstance: jest
        .fn()
        .mockImplementation((instanceId) =>
          mockRecurringTaskService.completeRecurringInstance(instanceId),
        ),
      getRecurringTaskStats: jest
        .fn()
        .mockImplementation((taskId) =>
          mockRecurringTaskService.getRecurringTaskStats(taskId),
        ),
      recurringTasks: mockTasks,
      recurringTaskInstances: [],
      isLoading: false,
      error: null,
    });

    // Mock useRecurringTaskIntegration hook
    (useRecurringTaskIntegration as jest.Mock).mockReturnValue({
      createRecurringTaskIntegrated: jest
        .fn()
        .mockImplementation((task, config) =>
          mockRecurringTaskIntegration.createRecurringTaskIntegrated(
            task,
            config,
          ),
        ),
      getRecurringTasks: jest.fn().mockResolvedValue(mockTasks),
      getRecurringTaskStats: jest
        .fn()
        .mockImplementation((taskId) =>
          mockRecurringTaskService.getRecurringTaskStats(taskId),
        ),
      recurringTasks: mockTasks,
      recurringTaskInstances: [],
      isLoading: false,
      error: null,
      systemStatus: {
        healthScore: 100,
        issuesCount: 0,
        recommendationsCount: 0,
      },
    });
  });

  describe("RecurringTaskForm Component", () => {
    test("should render recurring task form with all required fields", () => {
      render(
        <MemoryRouter>
          <RecurringTaskForm />
        </MemoryRouter>,
      );

      // Check that all form fields are present
      expect(screen.getByLabelText("Task Title")).toBeInTheDocument();
      expect(screen.getByLabelText("Description")).toBeInTheDocument();
      expect(screen.getByLabelText("Priority")).toBeInTheDocument();
      expect(screen.getByLabelText("Due Date")).toBeInTheDocument();
      expect(screen.getByLabelText("Due Time")).toBeInTheDocument();

      // Check that recurring pattern fields are present
      expect(screen.getByLabelText("Recurring Pattern")).toBeInTheDocument();
      expect(screen.getByLabelText("Start Date")).toBeInTheDocument();
      expect(screen.getByLabelText("End Condition")).toBeInTheDocument();
    });

    test("should allow selecting different recurring patterns", () => {
      render(
        <MemoryRouter>
          <RecurringTaskForm />
        </MemoryRouter>,
      );

      const patternSelect = screen.getByLabelText("Recurring Pattern");
      fireEvent.change(patternSelect, { target: { value: "weekly" } });

      expect((patternSelect as HTMLSelectElement).value).toBe("weekly");
    });

    test("should show validation errors for invalid form submission", async () => {
      render(
        <MemoryRouter>
          <RecurringTaskForm />
        </MemoryRouter>,
      );

      const submitButton = screen.getByText("Create Recurring Task");
      fireEvent.click(submitButton);

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText("Task title is required")).toBeInTheDocument();
        expect(screen.getByText("Description is required")).toBeInTheDocument();
      });
    });

    test("should successfully create a recurring task with valid data", async () => {
      const mockTask = testData.weeklyTeamMeeting;

      render(
        <MemoryRouter>
          <RecurringTaskForm />
        </MemoryRouter>,
      );

      // Fill out the form
      fireEvent.change(screen.getByLabelText("Task Title"), {
        target: { value: mockTask.title },
      });
      fireEvent.change(screen.getByLabelText("Description"), {
        target: { value: mockTask.description },
      });
      fireEvent.change(screen.getByLabelText("Priority"), {
        target: { value: mockTask.priority },
      });
      fireEvent.change(screen.getByLabelText("Recurring Pattern"), {
        target: { value: mockTask.recurringPattern },
      });

      // Submit the form
      const submitButton = screen.getByText("Create Recurring Task");
      fireEvent.click(submitButton);

      // Should show success message
      await waitFor(() => {
        expect(
          screen.getByText("Recurring task created successfully"),
        ).toBeInTheDocument();
      });
    });
  });

  describe("RecurringTaskList Component", () => {
    test("should render list of recurring tasks", async () => {
      render(
        <MemoryRouter>
          <RecurringTaskList />
        </MemoryRouter>,
      );

      // Should show loading state initially
      expect(
        screen.getByText("Loading recurring tasks..."),
      ).toBeInTheDocument();

      // Wait for tasks to load
      await waitFor(() => {
        expect(screen.getByText("Weekly Team Meeting")).toBeInTheDocument();
        expect(screen.getByText("Daily Standup Meeting")).toBeInTheDocument();
        expect(screen.getByText("Monthly Progress Report")).toBeInTheDocument();
      });
    });

    test("should show empty state when no recurring tasks exist", async () => {
      // Mock empty task list
      (useRecurringTasks as jest.Mock).mockReturnValueOnce({
        ...useRecurringTasks(),
        recurringTasks: [],
        fetchRecurringTasks: jest.fn().mockResolvedValue([]),
      });

      render(
        <MemoryRouter>
          <RecurringTaskList />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("No recurring tasks found"),
        ).toBeInTheDocument();
        expect(
          screen.getByText("Create your first recurring task"),
        ).toBeInTheDocument();
      });
    });

    test("should allow filtering recurring tasks by pattern", async () => {
      render(
        <MemoryRouter>
          <RecurringTaskList />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("Weekly Team Meeting")).toBeInTheDocument();
      });

      // Filter by weekly pattern
      const filterSelect = screen.getByLabelText("Filter by Pattern");
      fireEvent.change(filterSelect, { target: { value: "weekly" } });

      // Should only show weekly tasks
      expect(screen.getByText("Weekly Team Meeting")).toBeInTheDocument();
      expect(
        screen.queryByText("Daily Standup Meeting"),
      ).not.toBeInTheDocument();
    });

    test("should allow sorting recurring tasks", async () => {
      render(
        <MemoryRouter>
          <RecurringTaskList />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText("Weekly Team Meeting")).toBeInTheDocument();
      });

      // Sort by priority
      const sortSelect = screen.getByLabelText("Sort by");
      fireEvent.change(sortSelect, { target: { value: "priority" } });

      // Tasks should be sorted by priority
      const taskTitles = screen.getAllByTestId("task-title");
      expect(taskTitles[0].textContent).toContain("P1");
    });
  });

  describe("RecurringTaskPreview Component", () => {
    test("should render preview of recurring task with instances", async () => {
      const task = testData.weeklyTeamMeeting;
      const { instances } = mockRecurringTaskService.generateRecurringInstances(
        task,
        task.customFields?.recurringConfig || {
          pattern: "weekly",
          startDate: new Date(),
          maxOccurrences: 5,
        },
      );

      render(
        <MemoryRouter>
          <RecurringTaskPreview task={task} instances={instances} />
        </MemoryRouter>,
      );

      // Should show task details
      expect(screen.getByText(task.title)).toBeInTheDocument();
      expect(screen.getByText(task.description || "")).toBeInTheDocument();

      // Should show pattern information
      expect(screen.getByText("Pattern: weekly")).toBeInTheDocument();
      expect(screen.getByText("Frequency: Every 1 week")).toBeInTheDocument();

      // Should show instance count
      expect(
        screen.getByText(`Instances: ${instances.length}`),
      ).toBeInTheDocument();
    });

    test("should show statistics for recurring task", async () => {
      const task = testData.weeklyTeamMeeting;
      const { instances } = mockRecurringTaskService.generateRecurringInstances(
        task,
        task.customFields?.recurringConfig || {
          pattern: "weekly",
          startDate: new Date(),
          maxOccurrences: 5,
        },
      );

      // Mark some instances as completed
      for (let i = 0; i < 2; i++) {
        await mockRecurringTaskService.completeRecurringInstance(
          instances[i].id,
        );
      }

      render(
        <MemoryRouter>
          <RecurringTaskPreview task={task} instances={instances} />
        </MemoryRouter>,
      );

      // Should show statistics
      expect(screen.getByText("Total Instances: 5")).toBeInTheDocument();
      expect(screen.getByText("Completed: 2")).toBeInTheDocument();
      expect(screen.getByText("Pending: 3")).toBeInTheDocument();
    });

    test("should show timeline view for recurring task", async () => {
      const task = testData.weeklyTeamMeeting;
      const { instances } = mockRecurringTaskService.generateRecurringInstances(
        task,
        task.customFields?.recurringConfig || {
          pattern: "weekly",
          startDate: new Date(),
          maxOccurrences: 3,
        },
      );

      render(
        <MemoryRouter>
          <RecurringTaskPreview task={task} instances={instances} />
        </MemoryRouter>,
      );

      // Switch to timeline view
      const timelineTab = screen.getByText("Timeline");
      fireEvent.click(timelineTab);

      // Should show timeline items
      expect(screen.getByText("Task Created")).toBeInTheDocument();
      expect(screen.getAllByText("Instance Generated").length).toBeGreaterThan(
        0,
      );
    });
  });

  describe("RecurringTaskScheduler Component", () => {
    test("should render scheduler with upcoming instances", async () => {
      // Create some upcoming instances
      const task = testData.dailyStandup;
      const { instances } = mockRecurringTaskService.generateRecurringInstances(
        task,
        task.customFields?.recurringConfig || {
          pattern: "daily",
          startDate: new Date(),
          maxOccurrences: 7,
        },
      );

      render(
        <MemoryRouter>
          <RecurringTaskScheduler
            tasks={[task]}
            instances={instances}
            onCompleteInstance={jest.fn()}
          />
        </MemoryRouter>,
      );

      // Should show scheduler header
      expect(screen.getByText("Recurring Task Scheduler")).toBeInTheDocument();

      // Should show upcoming instances
      expect(
        screen.getAllByTestId("scheduler-instance").length,
      ).toBeGreaterThan(0);
    });

    test("should allow completing instances from scheduler", async () => {
      const task = testData.dailyStandup;
      const { instances } = mockRecurringTaskService.generateRecurringInstances(
        task,
        task.customFields?.recurringConfig || {
          pattern: "daily",
          startDate: new Date(),
          maxOccurrences: 3,
        },
      );

      const mockComplete = jest.fn();

      render(
        <MemoryRouter>
          <RecurringTaskScheduler
            tasks={[task]}
            instances={instances}
            onCompleteInstance={mockComplete}
          />
        </MemoryRouter>,
      );

      // Find complete buttons
      const completeButtons = screen.getAllByText("Complete");
      expect(completeButtons.length).toBeGreaterThan(0);

      // Complete the first instance
      fireEvent.click(completeButtons[0]);

      // Should call the complete handler
      await waitFor(() => {
        expect(mockComplete).toHaveBeenCalledWith(instances[0].id);
      });
    });

    test("should show calendar view for scheduling", async () => {
      const task = testData.weeklyTeamMeeting;
      const { instances } = mockRecurringTaskService.generateRecurringInstances(
        task,
        task.customFields?.recurringConfig || {
          pattern: "weekly",
          startDate: new Date(),
          maxOccurrences: 4,
        },
      );

      render(
        <MemoryRouter>
          <RecurringTaskScheduler
            tasks={[task]}
            instances={instances}
            onCompleteInstance={jest.fn()}
          />
        </MemoryRouter>,
      );

      // Switch to calendar view
      const calendarTab = screen.getByText("Calendar View");
      fireEvent.click(calendarTab);

      // Should show calendar view
      expect(screen.getByText("Calendar View")).toBeInTheDocument();
      expect(screen.getAllByTestId("calendar-day").length).toBeGreaterThan(0);
    });

    test("should show statistics dashboard", async () => {
      const task = testData.weeklyTeamMeeting;
      const { instances } = mockRecurringTaskService.generateRecurringInstances(
        task,
        task.customFields?.recurringConfig || {
          pattern: "weekly",
          startDate: new Date(),
          maxOccurrences: 5,
        },
      );

      // Complete some instances
      for (let i = 0; i < 2; i++) {
        await mockRecurringTaskService.completeRecurringInstance(
          instances[i].id,
        );
      }

      render(
        <MemoryRouter>
          <RecurringTaskScheduler
            tasks={[task]}
            instances={instances}
            onCompleteInstance={jest.fn()}
          />
        </MemoryRouter>,
      );

      // Should show statistics
      expect(screen.getByText("Completion Rate")).toBeInTheDocument();
      expect(screen.getByText("Pending Instances")).toBeInTheDocument();
      expect(screen.getByText("Overdue Instances")).toBeInTheDocument();
    });
  });

  describe("Integration Tests", () => {
    test("should integrate form, list, and preview components", async () => {
      // Test the full workflow from creation to viewing

      // 1. Create a task using the form
      render(
        <MemoryRouter>
          <RecurringTaskForm />
        </MemoryRouter>,
      );

      const mockTask = testData.monthlyReport;

      fireEvent.change(screen.getByLabelText("Task Title"), {
        target: { value: mockTask.title },
      });
      fireEvent.change(screen.getByLabelText("Description"), {
        target: { value: mockTask.description },
      });
      fireEvent.change(screen.getByLabelText("Recurring Pattern"), {
        target: { value: mockTask.recurringPattern },
      });

      const submitButton = screen.getByText("Create Recurring Task");
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText("Recurring task created successfully"),
        ).toBeInTheDocument();
      });

      // 2. View the task in the list
      render(
        <MemoryRouter>
          <RecurringTaskList />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(screen.getByText(mockTask.title)).toBeInTheDocument();
      });

      // 3. View the task preview
      const task = await mockRecurringTaskService.getRecurringTask(
        mockRecurringTaskService
          .getCallHistory()
          .find((call) => call.method === "createRecurringTask")?.args[0].id ||
          "",
      );

      const { instances } = mockRecurringTaskService.generateRecurringInstances(
        task,
        task.customFields?.recurringConfig || {
          pattern: "monthly",
          startDate: new Date(),
          maxOccurrences: 3,
        },
      );

      render(
        <MemoryRouter>
          <RecurringTaskPreview task={task} instances={instances} />
        </MemoryRouter>,
      );

      expect(screen.getByText(task.title)).toBeInTheDocument();
      expect(screen.getByText("Pattern: monthly")).toBeInTheDocument();
    });

    test("should handle error states gracefully", async () => {
      // Mock error state
      (useRecurringTasks as jest.Mock).mockReturnValueOnce({
        ...useRecurringTasks(),
        isLoading: false,
        error: "Failed to load recurring tasks",
        recurringTasks: [],
      });

      render(
        <MemoryRouter>
          <RecurringTaskList />
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(
          screen.getByText("Error loading recurring tasks"),
        ).toBeInTheDocument();
        expect(
          screen.getByText("Failed to load recurring tasks"),
        ).toBeInTheDocument();
      });
    });

    test("should show loading states appropriately", async () => {
      // Mock loading state
      (useRecurringTasks as jest.Mock).mockReturnValueOnce({
        ...useRecurringTasks(),
        isLoading: true,
        error: null,
        recurringTasks: [],
      });

      render(
        <MemoryRouter>
          <RecurringTaskList />
        </MemoryRouter>,
      );

      expect(
        screen.getByText("Loading recurring tasks..."),
      ).toBeInTheDocument();
      expect(
        screen.queryByText("Error loading recurring tasks"),
      ).not.toBeInTheDocument();
    });
  });
});
