import {
  CalendarEventType,
  CalendarType,
  CalendarConfig,
  CalendarSyncStatus,
} from "../types/calendarTypes";
import { Task } from "../types/taskTypes";

/**
 * Calendar Service Mocks
 * Mock implementations for calendar services for testing
 */
export class CalendarServiceMocks {
  /**
   * Mock calendar service
   */
  static createMockCalendarService() {
    const mockEvents: CalendarEventType[] = [
      {
        id: "mock-event-1",
        title: "Mock Team Meeting",
        description: "Weekly team sync meeting",
        startDate: new Date(Date.now() + 86400000).toISOString(),
        endDate: new Date(Date.now() + 86400000 + 3600000).toISOString(),
        priority: "medium",
        calendarId: "mock-calendar-1",
        location: "Conference Room A",
      },
      {
        id: "mock-event-2",
        title: "Mock Project Deadline",
        description: "Finalize project deliverables",
        startDate: new Date(Date.now() + 172800000).toISOString(),
        priority: "high",
        calendarId: "mock-calendar-1",
      },
    ];

    const mockCalendars: CalendarType[] = [
      {
        id: "mock-calendar-1",
        name: "Mock Work Calendar",
        type: "google",
        isPrimary: true,
      },
      {
        id: "mock-calendar-2",
        name: "Mock Personal Calendar",
        type: "local",
      },
    ];

    const mockConfig: CalendarConfig = {
      defaultView: "week",
      workHours: {
        start: "09:00",
        end: "17:00",
      },
      showWeekends: true,
      timeZone: "UTC",
      firstDayOfWeek: 1,
    };

    return {
      getEvents: async (): Promise<CalendarEventType[]> => {
        return new Promise((resolve) => {
          setTimeout(() => resolve([...mockEvents]), 100);
        });
      },

      getEventById: async (
        eventId: string,
      ): Promise<CalendarEventType | null> => {
        return new Promise((resolve) => {
          setTimeout(() => {
            const event = mockEvents.find((e) => e.id === eventId);
            resolve(event || null);
          }, 100);
        });
      },

      createEvent: async (
        eventData: Omit<CalendarEventType, "id">,
      ): Promise<CalendarEventType> => {
        return new Promise((resolve) => {
          setTimeout(() => {
            const newEvent: CalendarEventType = {
              id: `mock-event-${Date.now()}`,
              ...eventData,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            mockEvents.push(newEvent);
            resolve(newEvent);
          }, 100);
        });
      },

      updateEvent: async (
        eventId: string,
        updates: Partial<CalendarEventType>,
      ): Promise<CalendarEventType | null> => {
        return new Promise((resolve) => {
          setTimeout(() => {
            const eventIndex = mockEvents.findIndex((e) => e.id === eventId);
            if (eventIndex === -1) {
              resolve(null);
              return;
            }

            const updatedEvent = {
              ...mockEvents[eventIndex],
              ...updates,
              updatedAt: new Date().toISOString(),
            };

            mockEvents[eventIndex] = updatedEvent;
            resolve(updatedEvent);
          }, 100);
        });
      },

      deleteEvent: async (eventId: string): Promise<boolean> => {
        return new Promise((resolve) => {
          setTimeout(() => {
            const initialLength = mockEvents.length;
            mockEvents.splice(
              mockEvents.findIndex((e) => e.id === eventId),
              1,
            );
            resolve(mockEvents.length !== initialLength);
          }, 100);
        });
      },

      getCalendars: async (): Promise<CalendarType[]> => {
        return new Promise((resolve) => {
          setTimeout(() => resolve([...mockCalendars]), 100);
        });
      },

      addCalendar: async (
        calendarData: Omit<CalendarType, "id">,
      ): Promise<CalendarType> => {
        return new Promise((resolve) => {
          setTimeout(() => {
            const newCalendar: CalendarType = {
              id: `mock-calendar-${Date.now()}`,
              ...calendarData,
            };
            mockCalendars.push(newCalendar);
            resolve(newCalendar);
          }, 100);
        });
      },

      getConfig: (): CalendarConfig => {
        return { ...mockConfig };
      },

      updateConfig: (updates: Partial<CalendarConfig>): CalendarConfig => {
        Object.assign(mockConfig, updates);
        return this.getConfig();
      },

      linkTaskToEvent: async (
        taskId: string,
        eventId: string,
      ): Promise<boolean> => {
        return new Promise((resolve) => {
          setTimeout(() => {
            const event = mockEvents.find((e) => e.id === eventId);
            if (event) {
              event.taskId = taskId;
              resolve(true);
            } else {
              resolve(false);
            }
          }, 100);
        });
      },

      getEventsForDateRange: async (
        startDate: Date,
        endDate: Date,
      ): Promise<CalendarEventType[]> => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(
              mockEvents.filter((event) => {
                const eventStart = new Date(event.startDate);
                const eventEnd = new Date(event.endDate || event.startDate);
                return eventStart <= endDate && eventEnd >= startDate;
              }),
            );
          }, 100);
        });
      },

      initializeWithSampleData: () => {
        // Already initialized with mock data
      },
    };
  }

  /**
   * Mock calendar sync service
   */
  static createMockCalendarSyncService() {
    let syncStatus: CalendarSyncStatus = "idle";
    let lastSynced: Date | undefined = undefined;
    let syncError: Error | null = null;

    return {
      syncCalendars: async (
        calendarIds: string[],
      ): Promise<{
        success: boolean;
        syncedEvents: CalendarEventType[];
        error?: Error | null;
      }> => {
        return new Promise((resolve) => {
          setTimeout(() => {
            syncStatus = "syncing";

            // Simulate sync process
            setTimeout(() => {
              if (Math.random() > 0.8) {
                // 20% chance of failure for testing
                syncStatus = "error";
                syncError = new Error("Mock sync failed");
                resolve({
                  success: false,
                  syncedEvents: [],
                  error: syncError,
                });
              } else {
                syncStatus = "completed";
                lastSynced = new Date();
                syncError = null;

                // Generate some mock synced events
                const syncedEvents: CalendarEventType[] = calendarIds.map(
                  (calendarId, index) => ({
                    id: `synced-${calendarId}-${Date.now()}-${index}`,
                    title: `Synced Event from ${calendarId}`,
                    description: "Event synced from external calendar",
                    startDate: new Date(
                      Date.now() + index * 86400000,
                    ).toISOString(),
                    endDate: new Date(
                      Date.now() + index * 86400000 + 3600000,
                    ).toISOString(),
                    priority: ["high", "medium", "low"][index % 3] as
                      | "high"
                      | "medium"
                      | "low",
                    calendarId: calendarId,
                  }),
                );

                resolve({
                  success: true,
                  syncedEvents,
                  error: null,
                });
              }
            }, 200);
          }, 100);
        });
      },

      getSyncStatus: (): {
        status: CalendarSyncStatus;
        lastSynced?: Date;
        error?: Error | null;
      } => {
        return {
          status: syncStatus,
          lastSynced: lastSynced,
          error: syncError,
        };
      },

      getAvailableCalendars: async (): Promise<CalendarType[]> => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve([
              {
                id: "mock-google-primary",
                name: "Mock Google Primary",
                type: "google",
                isPrimary: true,
                isSynced: true,
              },
              {
                id: "mock-google-work",
                name: "Mock Google Work",
                type: "google",
                isSynced: false,
              },
              {
                id: "mock-outlook-personal",
                name: "Mock Outlook Personal",
                type: "outlook",
                isSynced: false,
              },
            ]);
          }, 100);
        });
      },

      syncTasksWithCalendarEvents: async (
        tasks: Task[],
      ): Promise<{
        createdEvents: CalendarEventType[];
        updatedEvents: CalendarEventType[];
        errors: Error[];
      }> => {
        return new Promise((resolve) => {
          setTimeout(() => {
            const createdEvents: CalendarEventType[] = [];
            const updatedEvents: CalendarEventType[] = [];
            const errors: Error[] = [];

            tasks.forEach((task, index) => {
              if (Math.random() > 0.7) {
                // 30% chance of error for testing
                errors.push(new Error(`Failed to sync task ${task.id}`));
              } else {
                const event: CalendarEventType = {
                  id: `task-event-${task.id}`,
                  title: task.title || "Untitled Task",
                  description: task.description || "",
                  startDate: task.dueDate || new Date().toISOString(),
                  endDate: task.dueDate || new Date().toISOString(),
                  priority: task.priority || "normal",
                  taskId: task.id,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };

                if (index % 2 === 0) {
                  createdEvents.push(event);
                } else {
                  updatedEvents.push(event);
                }
              }
            });

            resolve({ createdEvents, updatedEvents, errors });
          }, 100);
        });
      },
    };
  }
}
