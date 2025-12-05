import { describe, test, expect, vi, beforeEach, afterEach } from "vitest";
import { CalendarService } from "../../services/calendarService";
import { Task } from "../../types/taskTypes";
import { CalendarEventType } from "../../types/calendarTypes";

// Mock the calendar service
vi.mock("../../services/calendarService");

describe("Calendar Integration Tests", () => {
  const mockTask: Task = {
    id: "task-1",
    title: "Implement Calendar Sync",
    description: "Integrate calendar events with task management",
    status: "todo",
    priority: "high",
    completed: false,
    createdAt: new Date(),
    updatedAt: new Date(),
    projectId: "project-1",
    order: 0,
  };

  const mockCalendarEvent: CalendarEventType = {
    id: "event-1",
    title: "Task Implementation Meeting",
    description: "Discuss calendar integration implementation",
    startDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    endDate: new Date(Date.now() + 86400000 + 3600000).toISOString(), // 1 hour later
    priority: "high",
    calendarId: "work-calendar",
    location: "Conference Room B",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    // Initialize calendar service with sample data
    CalendarService.initializeWithSampleData();

    // Mock calendar service methods
    vi.spyOn(CalendarService, "createEvent").mockImplementation(
      async (eventData) => {
        const newEvent = {
          ...eventData,
          id: `event-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return newEvent;
      },
    );

    vi.spyOn(CalendarService, "getEvents").mockResolvedValue([
      mockCalendarEvent,
    ]);
    vi.spyOn(CalendarService, "getEventById").mockResolvedValue(
      mockCalendarEvent,
    );
    vi.spyOn(CalendarService, "updateEvent").mockResolvedValue({
      ...mockCalendarEvent,
      title: "Updated Event",
    });
    vi.spyOn(CalendarService, "deleteEvent").mockResolvedValue(true);
    vi.spyOn(CalendarService, "linkTaskToEvent").mockResolvedValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("Task creation → Calendar sync → UI reflection flow", async () => {
    // Test task to calendar event creation
    const calendarEvent = await CalendarService.createEvent({
      title: mockTask.title,
      description: mockTask.description || "",
      startDate: new Date(Date.now() + 3600000).toISOString(), // 1 hour from now
      endDate: new Date(Date.now() + 7200000).toISOString(), // 2 hours from now
      priority: mockTask.priority,
      calendarId: "work-calendar",
      taskId: mockTask.id,
    });

    expect(calendarEvent).toBeTruthy();
    expect(calendarEvent.title).toBe(mockTask.title);
    expect(calendarEvent.taskId).toBe(mockTask.id);

    // Test linking task to calendar event
    const linkResult = await CalendarService.linkTaskToEvent(
      mockTask.id,
      calendarEvent.id,
    );
    expect(linkResult).toBe(true);

    // Test retrieving the linked event
    const retrievedEvent = await CalendarService.getEventById(calendarEvent.id);
    expect(retrievedEvent).toBeTruthy();
    expect(retrievedEvent?.taskId).toBe(mockTask.id);
  });

  test("Calendar event management and task synchronization", async () => {
    // Test creating multiple calendar events from tasks
    const tasks = [
      mockTask,
      {
        ...mockTask,
        id: "task-2",
        title: "Calendar Integration Testing",
        description: "Test calendar sync functionality",
      },
    ];

    const createdEvents = [];
    for (const task of tasks) {
      const event = await CalendarService.createEvent({
        title: task.title,
        description: task.description || "",
        startDate: new Date(Date.now() + 3600000).toISOString(),
        endDate: new Date(Date.now() + 7200000).toISOString(),
        priority: task.priority,
        calendarId: "work-calendar",
        taskId: task.id,
      });

      createdEvents.push(event);
    }

    expect(createdEvents).toHaveLength(2);

    // Test retrieving all events
    const allEvents = await CalendarService.getEvents();
    expect(allEvents).toHaveLength(3); // 2 created + 1 sample event

    // Test updating an event
    const updatedEvent = await CalendarService.updateEvent(
      createdEvents[0].id,
      {
        title: "Updated Task Event",
      },
    );

    expect(updatedEvent).toBeTruthy();
    expect(updatedEvent?.title).toBe("Updated Task Event");
  });

  test("Calendar date range queries and task filtering", async () => {
    // Test getting events for specific date range
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const events = await CalendarService.getEventsForDateRange(today, tomorrow);
    expect(events).toHaveLength(1); // Should include the sample event from tomorrow

    // Test with future date range
    const futureStart = new Date();
    futureStart.setDate(futureStart.getDate() + 2);
    const futureEnd = new Date(futureStart);
    futureEnd.setDate(futureEnd.getDate() + 7);

    const futureEvents = await CalendarService.getEventsForDateRange(
      futureStart,
      futureEnd,
    );
    expect(futureEvents).toHaveLength(1); // Should include the second sample event
  });

  test("Calendar and task data consistency", async () => {
    // Create calendar event from task
    const createdEvent = await CalendarService.createEvent({
      title: mockTask.title,
      description: mockTask.description || "",
      startDate: new Date(mockTask.createdAt).toISOString(),
      endDate: new Date(mockTask.createdAt.getTime() + 3600000).toISOString(),
      priority: mockTask.priority,
      calendarId: "work-calendar",
      taskId: mockTask.id,
    });

    // Verify data consistency
    expect(createdEvent.title).toBe(mockTask.title);
    expect(createdEvent.priority).toBe(mockTask.priority);
    expect(createdEvent.taskId).toBe(mockTask.id);

    // Test retrieving and verifying consistency
    const retrievedEvent = await CalendarService.getEventById(createdEvent.id);
    expect(retrievedEvent?.title).toBe(createdEvent.title);
    expect(retrievedEvent?.priority).toBe(createdEvent.priority);
    expect(retrievedEvent?.taskId).toBe(createdEvent.taskId);
  });

  test("Calendar event lifecycle management", async () => {
    // Test complete event lifecycle: create → update → delete

    // 1. Create event
    const createdEvent = await CalendarService.createEvent({
      title: "Lifecycle Test Event",
      description: "Testing complete event lifecycle",
      startDate: new Date(Date.now() + 3600000).toISOString(),
      endDate: new Date(Date.now() + 7200000).toISOString(),
      priority: "medium",
      calendarId: "work-calendar",
      taskId: mockTask.id,
    });

    expect(createdEvent).toBeTruthy();
    expect(createdEvent.title).toBe("Lifecycle Test Event");

    // 2. Update event
    const updatedEvent = await CalendarService.updateEvent(createdEvent.id, {
      title: "Updated Lifecycle Event",
      priority: "high",
    });

    expect(updatedEvent).toBeTruthy();
    expect(updatedEvent?.title).toBe("Updated Lifecycle Event");
    expect(updatedEvent?.priority).toBe("high");

    // 3. Delete event
    const deleteResult = await CalendarService.deleteEvent(createdEvent.id);
    expect(deleteResult).toBe(true);

    // 4. Verify deletion
    const deletedEvent = await CalendarService.getEventById(createdEvent.id);
    expect(deletedEvent).toBeNull();
  });

  test("Calendar configuration and settings management", async () => {
    // Test calendar configuration
    const initialConfig = CalendarService.getConfig();
    expect(initialConfig.defaultView).toBe("week");
    expect(initialConfig.workHours.start).toBe("09:00");

    // Test updating configuration
    const updatedConfig = CalendarService.updateConfig({
      defaultView: "month",
      workHours: {
        start: "08:00",
        end: "18:00",
      },
    });

    expect(updatedConfig.defaultView).toBe("month");
    expect(updatedConfig.workHours.start).toBe("08:00");
  });

  test("Calendar performance with multiple operations", async () => {
    const startTime = performance.now();

    // Perform multiple calendar operations
    const operations = [];
    for (let i = 0; i < 5; i++) {
      const event = await CalendarService.createEvent({
        title: `Performance Test Event ${i}`,
        description: `Testing calendar performance ${i}`,
        startDate: new Date(Date.now() + (i + 1) * 3600000).toISOString(),
        endDate: new Date(Date.now() + (i + 2) * 3600000).toISOString(),
        priority: "medium",
        calendarId: "work-calendar",
      });

      operations.push(event);
    }

    // Test bulk retrieval
    const allEvents = await CalendarService.getEvents();

    // Test date range queries
    const rangeEvents = await CalendarService.getEventsForDateRange(
      new Date(),
      new Date(Date.now() + 86400000 * 2), // 2 days from now
    );

    const endTime = performance.now();
    const duration = endTime - startTime;

    // Performance should be reasonable
    expect(duration).toBeLessThan(3000); // Should complete in under 3 seconds
    expect(operations).toHaveLength(5);
    expect(allEvents).toHaveLength(6); // 5 created + 1 sample
  });

  test("Calendar and task integration scenarios", async () => {
    // Test comprehensive calendar-task integration scenario

    // 1. Create task-related calendar events
    const taskEvents = await Promise.all([
      CalendarService.createEvent({
        title: `${mockTask.title} - Planning`,
        description: "Plan the implementation approach",
        startDate: new Date(Date.now() + 3600000).toISOString(),
        endDate: new Date(Date.now() + 5400000).toISOString(),
        priority: mockTask.priority,
        calendarId: "work-calendar",
        taskId: mockTask.id,
      }),
      CalendarService.createEvent({
        title: `${mockTask.title} - Implementation`,
        description: "Implement the calendar sync feature",
        startDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        endDate: new Date(Date.now() + 86400000 + 10800000).toISOString(), // 3 hours later
        priority: mockTask.priority,
        calendarId: "work-calendar",
        taskId: mockTask.id,
      }),
    ]);

    expect(taskEvents).toHaveLength(2);

    // 2. Link all events to the task
    const linkResults = await Promise.all(
      taskEvents.map((event) =>
        CalendarService.linkTaskToEvent(mockTask.id, event.id),
      ),
    );

    expect(linkResults.every((result) => result === true)).toBe(true);

    // 3. Retrieve task-related events
    const allEvents = await CalendarService.getEvents();
    const taskRelatedEvents = allEvents.filter(
      (event) => event.taskId === mockTask.id,
    );

    expect(taskRelatedEvents).toHaveLength(2);

    // 4. Verify data consistency across all events
    taskRelatedEvents.forEach((event) => {
      expect(event.taskId).toBe(mockTask.id);
      expect(event.priority).toBe(mockTask.priority);
    });
  });
});
