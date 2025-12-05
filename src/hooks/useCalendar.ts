import { useState, useEffect, useCallback } from "react";
import { CalendarService } from "../services/calendarService";
import {
  CalendarEventType,
  CalendarType,
  CalendarConfig,
} from "../types/calendarTypes";

export const useCalendar = () => {
  const [events, setEvents] = useState<CalendarEventType[]>([]);
  const [calendars, setCalendars] = useState<CalendarType[]>([]);
  const [config, setConfig] = useState<CalendarConfig>(
    CalendarService.getConfig(),
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Initialize calendar service with sample data
  useEffect(() => {
    CalendarService.initializeWithSampleData();
  }, []);

  /**
   * Fetch all calendar events
   */
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedEvents = await CalendarService.getEvents();
      setEvents(fetchedEvents);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch events"),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch all calendars
   */
  const fetchCalendars = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedCalendars = await CalendarService.getCalendars();
      setCalendars(fetchedCalendars);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to fetch calendars"),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Get calendar configuration
   */
  const getConfig = useCallback(() => {
    return CalendarService.getConfig();
  }, []);

  /**
   * Update calendar configuration
   */
  const updateConfig = useCallback((updates: Partial<CalendarConfig>) => {
    const updatedConfig = CalendarService.updateConfig(updates);
    setConfig(updatedConfig);
    return updatedConfig;
  }, []);

  /**
   * Create new calendar event
   */
  const createEvent = useCallback(
    async (eventData: Omit<CalendarEventType, "id">) => {
      try {
        setLoading(true);
        setError(null);
        const newEvent = await CalendarService.createEvent(eventData);
        setEvents((prev) => [...prev, newEvent]);
        return newEvent;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to create event"),
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Update existing calendar event
   */
  const updateEvent = useCallback(
    async (eventId: string, updates: Partial<CalendarEventType>) => {
      try {
        setLoading(true);
        setError(null);
        const updatedEvent = await CalendarService.updateEvent(
          eventId,
          updates,
        );
        if (updatedEvent) {
          setEvents((prev) =>
            prev.map((event) => (event.id === eventId ? updatedEvent : event)),
          );
        }
        return updatedEvent;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to update event"),
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Delete calendar event
   */
  const deleteEvent = useCallback(async (eventId: string) => {
    try {
      setLoading(true);
      setError(null);
      const success = await CalendarService.deleteEvent(eventId);
      if (success) {
        setEvents((prev) => prev.filter((event) => event.id !== eventId));
      }
      return success;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to delete event"),
      );
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Link task to calendar event
   */
  const linkTaskToEvent = useCallback(
    async (taskId: string, eventId: string) => {
      try {
        setLoading(true);
        setError(null);
        const success = await CalendarService.linkTaskToEvent(taskId, eventId);
        return success;
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to link task to event"),
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Get events for specific date range
   */
  const getEventsForDateRange = useCallback(
    async (startDate: Date, endDate: Date) => {
      try {
        setLoading(true);
        setError(null);
        return await CalendarService.getEventsForDateRange(startDate, endDate);
      } catch (err) {
        setError(
          err instanceof Error
            ? err
            : new Error("Failed to get events for date range"),
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    events,
    calendars,
    config,
    loading,
    error,
    fetchEvents,
    fetchCalendars,
    getConfig,
    updateConfig,
    createEvent,
    updateEvent,
    deleteEvent,
    linkTaskToEvent,
    getEventsForDateRange,
  };
};
