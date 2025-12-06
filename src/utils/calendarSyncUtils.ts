import { CalendarEventType, CalendarType } from "../types/calendarTypes";
import { Task } from "../types/taskTypes";

/**
 * Calendar Sync Utilities
 * Utility functions for calendar synchronization
 */
export class CalendarSyncUtils {
  /**
   * Convert tasks to calendar events
   */
  static convertTasksToCalendarEvents(tasks: Task[]): CalendarEventType[] {
    return tasks.map((task) => ({
      id: `task-event-${task.id}`,
      title: task.title || "Untitled Task",
      description: task.description || "",
      startDate: task.dueDate || new Date().toISOString(),
      endDate: task.dueDate || new Date().toISOString(),
      priority: task.priority || "normal",
      taskId: task.id,
      status: task.completed ? "completed" : "confirmed",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  }

  /**
   * Convert calendar events to tasks
   */
  static convertCalendarEventsToTasks(events: CalendarEventType[]): Task[] {
    return events.map((event) => ({
      id: event.taskId || `event-task-${event.id}`,
      title: event.title,
      description: event.description || "",
      dueDate: event.startDate.toString(),
      priority: event.priority || "normal",
      completed: event.status === "completed",
      createdAt: event.createdAt?.toString() || new Date().toISOString(),
      updatedAt: event.updatedAt?.toString() || new Date().toISOString(),
    }));
  }

  /**
   * Filter events by calendar type
   */
  static filterEventsByCalendarType(
    events: CalendarEventType[],
    // calendarType: string,
  ): CalendarEventType[] {
    return events.filter(() => {
      // This would typically check against calendar metadata
      // For now, we'll implement a simple filter
      return true;
    });
  }

  /**
   * Filter calendars by type
   */
  static filterCalendarsByType(
    calendars: CalendarType[],
    types: string[],
  ): CalendarType[] {
    return calendars.filter((calendar) => types.includes(calendar.type));
  }

  /**
   * Find conflicts between events
   */
  static findEventConflicts(events: CalendarEventType[]): CalendarEventType[] {
    const conflictingEvents: CalendarEventType[] = [];

    for (let i = 0; i < events.length; i++) {
      for (let j = i + 1; j < events.length; j++) {
        const event1 = events[i];
        const event2 = events[j];

        const start1 = new Date(event1.startDate);
        const end1 = new Date(event1.endDate || event1.startDate);
        const start2 = new Date(event2.startDate);
        const end2 = new Date(event2.endDate || event2.startDate);

        // Check for overlap
        if (start1 < end2 && end1 > start2) {
          if (!conflictingEvents.includes(event1)) {
            conflictingEvents.push(event1);
          }
          if (!conflictingEvents.includes(event2)) {
            conflictingEvents.push(event2);
          }
        }
      }
    }

    return conflictingEvents;
  }

  /**
   * Merge events from multiple calendars
   */
  static mergeEventsFromMultipleCalendars(
    eventGroups: CalendarEventType[][],
  ): CalendarEventType[] {
    const mergedEvents: CalendarEventType[] = [];

    // Simple merge - just combine all events
    // In a real implementation, this would handle conflicts, deduplication, etc.
    for (const eventGroup of eventGroups) {
      mergedEvents.push(...eventGroup);
    }

    return mergedEvents;
  }

  /**
   * Create sync summary
   */
  static createSyncSummary(
    syncedEvents: CalendarEventType[],
    createdEvents: CalendarEventType[],
    updatedEvents: CalendarEventType[],
    errors: Error[],
  ): {
    totalEvents: number;
    createdEvents: number;
    updatedEvents: number;
    errorCount: number;
    successRate: number;
  } {
    return {
      totalEvents: syncedEvents.length,
      createdEvents: createdEvents.length,
      updatedEvents: updatedEvents.length,
      errorCount: errors.length,
      successRate:
        syncedEvents.length > 0
          ? ((syncedEvents.length - errors.length) / syncedEvents.length) * 100
          : 100,
    };
  }

  /**
   * Validate calendar event data
   */
  static validateCalendarEvent(event: Partial<CalendarEventType>): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!event.title || event.title.trim() === "") {
      errors.push("Title is required");
    }

    if (!event.startDate) {
      errors.push("Start date is required");
    } else {
      const startDate = new Date(event.startDate);
      if (isNaN(startDate.getTime())) {
        errors.push("Invalid start date");
      }
    }

    if (event.endDate) {
      const endDate = new Date(event.endDate);
      const startDate = new Date(event.startDate || "");
      if (
        !isNaN(endDate.getTime()) &&
        !isNaN(startDate.getTime()) &&
        endDate < startDate
      ) {
        errors.push("End date cannot be before start date");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate calendar event ID
   */
  static generateEventId(prefix: string = "event"): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  }

  /**
   * Check if event is within working hours
   */
  static isEventWithinWorkingHours(
    event: CalendarEventType,
    workHours: { start: string; end: string },
  ): boolean {
    const startTime = this.parseTimeString(workHours.start);
    const endTime = this.parseTimeString(workHours.end);
    const eventStart = new Date(event.startDate);

    // Check if event start time is within working hours
    const eventHours = eventStart.getHours();
    const eventMinutes = eventStart.getMinutes();
    const eventTimeInMinutes = eventHours * 60 + eventMinutes;

    return eventTimeInMinutes >= startTime && eventTimeInMinutes <= endTime;
  }

  /**
   * Parse time string (HH:mm) to minutes
   */
  private static parseTimeString(timeStr: string): number {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  }
}
