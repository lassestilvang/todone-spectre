// @ts-nocheck
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { devtools } from "zustand/middleware";
import { CalendarState } from "../types/store";
import { CalendarService } from "../services/calendarService";
import { CalendarSyncService } from "../services/calendarSyncService";
import {
  CalendarEventType,
  CalendarType,
  CalendarConfig,
  CalendarSyncState,
  CalendarIntegrationState,
} from "../types/calendarTypes";

// Helper function to create localStorage
const createJSONStorage = (getStorage: () => Storage) => ({
  getItem: (name: string) => {
    const storage = getStorage();
    const item = storage.getItem(name);
    return item ? JSON.parse(item) : null;
  },
  setItem: (name: string, value: any) => {
    const storage = getStorage();
    storage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name: string) => {
    const storage = getStorage();
    storage.removeItem(name);
  },
});

export const useCalendarStore = create<CalendarState>()(
  devtools(
    persist(
      (set, get) => ({
        events: [],
        calendars: [],
        calendarConfig: {
          defaultView: "week",
          workHours: {
            start: "09:00",
            end: "17:00",
          },
          showWeekends: true,
          timeZone: "UTC",
          firstDayOfWeek: 1, // Monday
        },
        calendarSyncState: {
          status: "idle",
          lastSynced: undefined,
          error: null,
          availableCalendars: [],
        },
        calendarIntegrationState: {
          linkedTasks: {},
          integrationEnabled: true,
          autoSync: false,
          syncFrequency: "manual",
        },
        loading: false,
        error: null,

        /**
         * Add new calendar event
         */
        addEvent: async (eventData) => {
          try {
            set({ loading: true, error: null });
            const newEvent = await CalendarService.createEvent(eventData);
            set((state) => ({
              events: [...state.events, newEvent],
              loading: false,
            }));
            return newEvent;
          } catch (err) {
            set({
              loading: false,
              error: err instanceof Error ? err.message : "Failed to add event",
            });
            throw err;
          }
        },

        /**
         * Update existing calendar event
         */
        updateEvent: async (eventId, updates) => {
          try {
            set({ loading: true, error: null });
            const updatedEvent = await CalendarService.updateEvent(
              eventId,
              updates
            );
            if (updatedEvent) {
              set((state) => ({
                events: state.events.map((event) =>
                  event.id === eventId ? updatedEvent : event
                ),
                loading: false,
              }));
            }
            return updatedEvent;
          } catch (err) {
            set({
              loading: false,
              error:
                err instanceof Error ? err.message : "Failed to update event",
            });
            throw err;
          }
        },

        /**
         * Delete calendar event
         */
        deleteEvent: async (eventId) => {
          try {
            set({ loading: true, error: null });
            const success = await CalendarService.deleteEvent(eventId);
            if (success) {
              set((state) => ({
                events: state.events.filter((event) => event.id !== eventId),
                loading: false,
              }));
            }
            return success;
          } catch (err) {
            set({
              loading: false,
              error:
                err instanceof Error ? err.message : "Failed to delete event",
            });
            throw err;
          }
        },

        /**
         * Fetch all calendar events
         */
        fetchEvents: async () => {
          try {
            set({ loading: true, error: null });
            const events = await CalendarService.getEvents();
            set({ events, loading: false });
            return events;
          } catch (err) {
            set({
              loading: false,
              error:
                err instanceof Error ? err.message : "Failed to fetch events",
            });
            throw err;
          }
        },

        /**
         * Add new calendar
         */
        addCalendar: async (calendarData) => {
          try {
            set({ loading: true, error: null });
            const newCalendar = await CalendarService.addCalendar(calendarData);
            set((state) => ({
              calendars: [...state.calendars, newCalendar],
              loading: false,
            }));
            return newCalendar;
          } catch (err) {
            set({
              loading: false,
              error:
                err instanceof Error ? err.message : "Failed to add calendar",
            });
            throw err;
          }
        },

        /**
         * Fetch all calendars
         */
        fetchCalendars: async () => {
          try {
            set({ loading: true, error: null });
            const calendars = await CalendarService.getCalendars();
            set({ calendars, loading: false });
            return calendars;
          } catch (err) {
            set({
              loading: false,
              error:
                err instanceof Error
                  ? err.message
                  : "Failed to fetch calendars",
            });
            throw err;
          }
        },

        /**
         * Update calendar configuration
         */
        updateCalendarConfig: (updates) => {
          set((state) => ({
            calendarConfig: { ...state.calendarConfig, ...updates },
          }));
        },

        /**
         * Sync calendars
         */
        syncCalendars: async (calendarIds) => {
          try {
            set({ loading: true, error: null });
            const result = await CalendarSyncService.syncCalendars(calendarIds);

            if (result.success) {
              set((state) => ({
                events: [...state.events, ...result.syncedEvents],
                calendarSyncState: {
                  ...state.calendarSyncState,
                  status: "completed",
                  lastSynced: new Date(),
                  error: null,
                },
                loading: false,
              }));
            } else {
              set((state) => ({
                calendarSyncState: {
                  ...state.calendarSyncState,
                  status: "error",
                  error: result.error || new Error("Sync failed"),
                },
                loading: false,
              }));
            }

            return {
              success: result.success,
              syncedEvents: result.syncedEvents,
            };
          } catch (err) {
            set((state) => ({
              calendarSyncState: {
                ...state.calendarSyncState,
                status: "error",
                error: err instanceof Error ? err : new Error("Sync failed"),
              },
              loading: false,
            }));
            throw err;
          }
        },

        /**
         * Get sync status
         */
        getSyncStatus: () => {
          return {
            status: get().calendarSyncState.status,
            lastSynced: get().calendarSyncState.lastSynced,
            error: get().calendarSyncState.error,
          };
        },

        /**
         * Link task to calendar event
         */
        linkTaskToEvent: async (taskId, eventId) => {
          try {
            set({ loading: true, error: null });
            const success = await CalendarService.linkTaskToEvent(
              taskId,
              eventId
            );

            if (success) {
              set((state) => ({
                calendarIntegrationState: {
                  ...state.calendarIntegrationState,
                  linkedTasks: {
                    ...state.calendarIntegrationState.linkedTasks,
                    [taskId]: eventId,
                  },
                },
                loading: false,
              }));
            }

            return success;
          } catch (err) {
            set({
              loading: false,
              error:
                err instanceof Error
                  ? err.message
                  : "Failed to link task to event",
            });
            throw err;
          }
        },

        /**
         * Initialize with sample data
         */
        initializeWithSampleData: () => {
          CalendarService.initializeWithSampleData();
          set((state) => ({
            events: CalendarService.getEvents()
              .then((events) => {
                set({ events });
                return events;
              })
              .catch(() => []),
            calendars: CalendarService.getCalendars()
              .then((calendars) => {
                set({ calendars });
                return calendars;
              })
              .catch(() => []),
          }));
        },
      }),
      {
        name: "todone-calendar-storage",
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
);
