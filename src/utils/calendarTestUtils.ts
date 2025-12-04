import { CalendarEventType, CalendarType, CalendarConfig } from '../types/calendarTypes';
import { Task } from '../types/taskTypes';

/**
 * Calendar Test Utilities
 * Utility functions for testing calendar functionality
 */
export class CalendarTestUtils {
  /**
   * Generate mock calendar events for testing
   */
  static generateMockEvents(count: number = 5): CalendarEventType[] {
    return Array.from({ length: count }, (_, i) => ({
      id: `test-event-${i + 1}`,
      title: `Test Event ${i + 1}`,
      description: `Description for test event ${i + 1}`,
      startDate: new Date(Date.now() + (i * 86400000)).toISOString(), // Each event i days from now
      endDate: new Date(Date.now() + (i * 86400000) + 3600000).toISOString(), // 1 hour later
      priority: i % 3 === 0 ? 'high' : i % 3 === 1 ? 'medium' : 'low',
      calendarId: `test-calendar-${Math.floor(i / 2) + 1}`,
      taskId: i % 2 === 0 ? `test-task-${i + 1}` : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
  }

  /**
   * Generate mock calendars for testing
   */
  static generateMockCalendars(count: number = 3): CalendarType[] {
    const types: CalendarType['type'][] = ['google', 'outlook', 'apple', 'local'];
    return Array.from({ length: count }, (_, i) => ({
      id: `test-calendar-${i + 1}`,
      name: `Test Calendar ${i + 1}`,
      type: types[i % types.length],
      color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
      isPrimary: i === 0,
      isSynced: i < 2 // First two are synced
    }));
  }

  /**
   * Generate mock calendar configuration
   */
  static generateMockConfig(): CalendarConfig {
    return {
      defaultView: 'week',
      workHours: {
        start: '09:00',
        end: '17:00'
      },
      showWeekends: true,
      timeZone: 'UTC',
      firstDayOfWeek: 1 // Monday
    };
  }

  /**
   * Generate mock tasks with calendar integration
   */
  static generateMockTasksWithCalendar(count: number = 5): Task[] {
    return Array.from({ length: count }, (_, i) => ({
      id: `test-task-${i + 1}`,
      title: `Task with Calendar ${i + 1}`,
      description: `Description for task ${i + 1}`,
      status: i % 3 === 0 ? 'completed' : i % 3 === 1 ? 'in-progress' : 'todo',
      priority: i % 4 === 0 ? 'critical' : i % 4 === 1 ? 'high' : i % 4 === 2 ? 'medium' : 'low',
      dueDate: new Date(Date.now() + (i * 86400000)),
      createdAt: new Date(),
      updatedAt: new Date(),
      completed: i % 3 === 0,
      projectId: `test-project-${Math.floor(i / 2) + 1}`
    }));
  }

  /**
   * Create test scenario with events and tasks
   */
  static createTestScenario(): {
    events: CalendarEventType[];
    calendars: CalendarType[];
    tasks: Task[];
    config: CalendarConfig;
  } {
    const events = this.generateMockEvents(10);
    const calendars = this.generateMockCalendars(4);
    const tasks = this.generateMockTasksWithCalendar(8);
    const config = this.generateMockConfig();

    return { events, calendars, tasks, config };
  }

  /**
   * Generate recurring events for testing
   */
  static generateRecurringEvents(baseEvent: Partial<CalendarEventType>, count: number = 5): CalendarEventType[] {
    return Array.from({ length: count }, (_, i) => ({
      id: `${baseEvent.id || 'recurring'}-${i + 1}`,
      title: baseEvent.title || 'Recurring Event',
      description: baseEvent.description || 'Recurring event description',
      startDate: new Date(Date.now() + (i * 7 * 86400000)).toISOString(), // Weekly recurrence
      endDate: new Date(Date.now() + (i * 7 * 86400000) + 3600000).toISOString(),
      priority: baseEvent.priority || 'normal',
      calendarId: baseEvent.calendarId || 'test-calendar-1',
      isRecurring: true,
      recurrencePattern: 'weekly',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));
  }

  /**
   * Generate events with conflicts for testing
   */
  static generateConflictingEvents(): CalendarEventType[] {
    const baseTime = new Date();
    baseTime.setHours(10, 0, 0, 0);

    return [
      {
        id: 'conflict-event-1',
        title: 'Conflicting Event 1',
        description: 'First conflicting event',
        startDate: baseTime.toISOString(),
        endDate: new Date(baseTime.getTime() + 3600000).toISOString(), // 1 hour
        priority: 'high',
        calendarId: 'test-calendar-1'
      },
      {
        id: 'conflict-event-2',
        title: 'Conflicting Event 2',
        description: 'Second conflicting event',
        startDate: new Date(baseTime.getTime() + 1800000).toISOString(), // 30 minutes later
        endDate: new Date(baseTime.getTime() + 5400000).toISOString(), // 1.5 hours total
        priority: 'medium',
        calendarId: 'test-calendar-2'
      },
      {
        id: 'conflict-event-3',
        title: 'Non-conflicting Event',
        description: 'Event that doesn\'t conflict',
        startDate: new Date(baseTime.getTime() + 7200000).toISOString(), // 2 hours later
        endDate: new Date(baseTime.getTime() + 10800000).toISOString(), // 3 hours total
        priority: 'low',
        calendarId: 'test-calendar-1'
      }
    ];
  }

  /**
   * Generate calendar events for specific date range
   */
  static generateEventsForDateRange(startDate: Date, endDate: Date, count: number = 5): CalendarEventType[] {
    const timeDiff = endDate.getTime() - startDate.getTime();
    const dayDiff = timeDiff / (1000 * 3600 * 24);

    return Array.from({ length: count }, (_, i) => {
      const randomDayOffset = Math.floor(Math.random() * dayDiff);
      const eventStart = new Date(startDate.getTime() + (randomDayOffset * 86400000));
      const eventEnd = new Date(eventStart.getTime() + 3600000); // 1 hour duration

      return {
        id: `date-range-event-${i + 1}`,
        title: `Date Range Event ${i + 1}`,
        description: `Event within date range`,
        startDate: eventStart.toISOString(),
        endDate: eventEnd.toISOString(),
        priority: ['high', 'medium', 'low'][i % 3] as 'high' | 'medium' | 'low',
        calendarId: `test-calendar-${i % 2 + 1}`
      };
    });
  }
}