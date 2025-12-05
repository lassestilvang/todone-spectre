import {
  CalendarEventType,
  CalendarType,
  CalendarSyncStatus,
} from "../types/calendarTypes";
import { Task } from "../types/taskTypes";

/**
 * Calendar Sync Service
 * Handles synchronization between calendar events and tasks
 */
export class CalendarSyncService {
  private static syncState: {
    status: CalendarSyncStatus;
    lastSynced?: Date;
    error?: Error | null;
  } = {
    status: "idle",
    lastSynced: undefined,
    error: null,
  };

  /**
   * Sync calendars with external providers
   */
  static async syncCalendars(calendarIds: string[]): Promise<{
    success: boolean;
    syncedEvents: CalendarEventType[];
    error?: Error | null;
  }> {
    this.syncState.status = "syncing";
    this.syncState.error = null;

    try {
      // Simulate API calls to external calendar providers
      const syncedEvents: CalendarEventType[] = [];

      for (const calendarId of calendarIds) {
        // Simulate sync process for each calendar
        const events = await this.fetchEventsFromProvider(calendarId);
        syncedEvents.push(...events);
      }

      this.syncState.status = "completed";
      this.syncState.lastSynced = new Date();
      this.syncState.error = null;

      return {
        success: true,
        syncedEvents,
        error: null,
      };
    } catch (error) {
      this.syncState.status = "error";
      this.syncState.error =
        error instanceof Error ? error : new Error("Sync failed");
      return {
        success: false,
        syncedEvents: [],
        error: this.syncState.error,
      };
    }
  }

  /**
   * Get current sync status
   */
  static getSyncStatus(): {
    status: CalendarSyncStatus;
    lastSynced?: Date;
    error?: Error | null;
  } {
    return { ...this.syncState };
  }

  /**
   * Get available calendars for sync
   */
  static async getAvailableCalendars(): Promise<CalendarType[]> {
    // Simulate fetching available calendars from different providers
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: "google-primary",
            name: "Google Primary",
            type: "google",
            isPrimary: true,
            isSynced: true,
          },
          {
            id: "google-work",
            name: "Google Work",
            type: "google",
            isSynced: false,
          },
          {
            id: "outlook-personal",
            name: "Outlook Personal",
            type: "outlook",
            isSynced: false,
          },
          {
            id: "apple-calendar",
            name: "Apple Calendar",
            type: "apple",
            isSynced: true,
          },
        ]);
      }, 500);
    });
  }

  /**
   * Sync tasks with calendar events
   */
  static async syncTasksWithCalendarEvents(tasks: Task[]): Promise<{
    createdEvents: CalendarEventType[];
    updatedEvents: CalendarEventType[];
    errors: Error[];
  }> {
    const createdEvents: CalendarEventType[] = [];
    const updatedEvents: CalendarEventType[] = [];
    const errors: Error[] = [];

    for (const task of tasks) {
      try {
        if (task.dueDate) {
          const eventData: Omit<CalendarEventType, "id"> = {
            title: task.title || "Untitled Task",
            description: task.description || "",
            startDate: task.dueDate,
            endDate: task.dueDate,
            priority: task.priority || "normal",
            taskId: task.id,
          };

          // Check if task already has a linked event
          const existingEvent = await this.findEventByTaskId(task.id);

          if (existingEvent) {
            // Update existing event
            const updatedEvent = await this.updateCalendarEvent(
              existingEvent.id,
              eventData,
            );
            if (updatedEvent) {
              updatedEvents.push(updatedEvent);
            }
          } else {
            // Create new event
            const newEvent = await this.createCalendarEvent(eventData);
            createdEvents.push(newEvent);
          }
        }
      } catch (error) {
        errors.push(
          error instanceof Error
            ? error
            : new Error(`Failed to sync task ${task.id}`),
        );
      }
    }

    return { createdEvents, updatedEvents, errors };
  }

  /**
   * Find calendar event by task ID
   */
  private static async findEventByTaskId(
    taskId: string,
  ): Promise<CalendarEventType | null> {
    // This would typically query a database or API
    // For simulation, we'll return null (no existing event)
    return new Promise((resolve) => {
      setTimeout(() => resolve(null), 200);
    });
  }

  /**
   * Create calendar event (simulated)
   */
  private static async createCalendarEvent(
    eventData: Omit<CalendarEventType, "id">,
  ): Promise<CalendarEventType> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: `synced-event-${Date.now()}`,
          ...eventData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }, 300);
    });
  }

  /**
   * Update calendar event (simulated)
   */
  private static async updateCalendarEvent(
    eventId: string,
    updates: Partial<CalendarEventType>,
  ): Promise<CalendarEventType | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: eventId,
          title: "Updated Event",
          description: "Updated description",
          startDate: new Date().toISOString(),
          priority: "normal",
          ...updates,
          updatedAt: new Date().toISOString(),
        });
      }, 300);
    });
  }

  /**
   * Simulate fetching events from external provider
   */
  private static async fetchEventsFromProvider(
    calendarId: string,
  ): Promise<CalendarEventType[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate different events from different providers
        const baseEvents: CalendarEventType[] = [
          {
            id: `${calendarId}-event-1`,
            title: `Event from ${calendarId}`,
            description: "Synced event",
            startDate: new Date(Date.now() + 86400000).toISOString(),
            endDate: new Date(Date.now() + 86400000 + 3600000).toISOString(),
            priority: "medium",
            calendarId: calendarId,
          },
        ];

        // Add more events for primary calendars
        if (calendarId.includes("primary")) {
          baseEvents.push({
            id: `${calendarId}-event-2`,
            title: `Important Meeting`,
            description: "Team sync",
            startDate: new Date(Date.now() + 172800000).toISOString(),
            priority: "high",
            calendarId: calendarId,
          });
        }

        resolve(baseEvents);
      }, 500);
    });
  }
}
