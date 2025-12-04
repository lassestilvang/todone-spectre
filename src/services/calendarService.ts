import { CalendarEventType, CalendarType, CalendarConfig } from '../types/calendarTypes';
import { Task } from '../types/taskTypes';

/**
 * Calendar Service
 * Handles calendar event management and integration
 */
export class CalendarService {
  private static events: CalendarEventType[] = [];
  private static calendars: CalendarType[] = [];
  private static config: CalendarConfig = {
    defaultView: 'week',
    workHours: {
      start: '09:00',
      end: '17:00'
    },
    showWeekends: true,
    timeZone: 'UTC',
    firstDayOfWeek: 1 // Monday
  };

  /**
   * Get all calendar events
   */
  static async getEvents(): Promise<CalendarEventType[]> {
    // Simulate API call
    return new Promise(resolve => {
      setTimeout(() => resolve([...this.events]), 500);
    });
  }

  /**
   * Get calendar event by ID
   */
  static async getEventById(eventId: string): Promise<CalendarEventType | null> {
    const event = this.events.find(e => e.id === eventId);
    return new Promise(resolve => {
      setTimeout(() => resolve(event || null), 300);
    });
  }

  /**
   * Create new calendar event
   */
  static async createEvent(eventData: Omit<CalendarEventType, 'id'>): Promise<CalendarEventType> {
    const newEvent: CalendarEventType = {
      id: `event-${Date.now()}`,
      ...eventData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.events.push(newEvent);
    return new Promise(resolve => {
      setTimeout(() => resolve(newEvent), 500);
    });
  }

  /**
   * Update existing calendar event
   */
  static async updateEvent(eventId: string, updates: Partial<CalendarEventType>): Promise<CalendarEventType | null> {
    const eventIndex = this.events.findIndex(e => e.id === eventId);
    if (eventIndex === -1) return null;

    const updatedEvent = {
      ...this.events[eventIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    this.events[eventIndex] = updatedEvent;
    return new Promise(resolve => {
      setTimeout(() => resolve(updatedEvent), 500);
    });
  }

  /**
   * Delete calendar event
   */
  static async deleteEvent(eventId: string): Promise<boolean> {
    const initialLength = this.events.length;
    this.events = this.events.filter(e => e.id !== eventId);
    return new Promise(resolve => {
      setTimeout(() => resolve(this.events.length !== initialLength), 500);
    });
  }

  /**
   * Get all available calendars
   */
  static async getCalendars(): Promise<CalendarType[]> {
    return new Promise(resolve => {
      setTimeout(() => resolve([...this.calendars]), 300);
    });
  }

  /**
   * Add new calendar
   */
  static async addCalendar(calendarData: Omit<CalendarType, 'id'>): Promise<CalendarType> {
    const newCalendar: CalendarType = {
      id: `calendar-${Date.now()}`,
      ...calendarData
    };

    this.calendars.push(newCalendar);
    return new Promise(resolve => {
      setTimeout(() => resolve(newCalendar), 500);
    });
  }

  /**
   * Get calendar configuration
   */
  static getConfig(): CalendarConfig {
    return { ...this.config };
  }

  /**
   * Update calendar configuration
   */
  static updateConfig(updates: Partial<CalendarConfig>): CalendarConfig {
    this.config = { ...this.config, ...updates };
    return this.getConfig();
  }

  /**
   * Link task to calendar event
   */
  static async linkTaskToEvent(taskId: string, eventId: string): Promise<boolean> {
    const event = await this.getEventById(eventId);
    if (!event) return false;

    const updatedEvent = await this.updateEvent(eventId, { taskId });
    return !!updatedEvent;
  }

  /**
   * Get events for specific date range
   */
  static async getEventsForDateRange(startDate: Date, endDate: Date): Promise<CalendarEventType[]> {
    const allEvents = await this.getEvents();
    return allEvents.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = event.endDate ? new Date(event.endDate) : eventStart;
      return eventStart <= endDate && eventEnd >= startDate;
    });
  }

  /**
   * Initialize with sample data for development
   */
  static initializeWithSampleData() {
    this.events = [
      {
        id: 'event-1',
        title: 'Team Meeting',
        description: 'Weekly team sync',
        startDate: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
        endDate: new Date(Date.now() + 86400000 + 3600000).toISOString(), // 1 hour later
        priority: 'medium',
        calendarId: 'work-calendar',
        location: 'Conference Room A'
      },
      {
        id: 'event-2',
        title: 'Project Deadline',
        description: 'Finalize project deliverables',
        startDate: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
        priority: 'high',
        calendarId: 'work-calendar'
      }
    ];

    this.calendars = [
      {
        id: 'work-calendar',
        name: 'Work Calendar',
        type: 'google',
        isPrimary: true
      },
      {
        id: 'personal-calendar',
        name: 'Personal Calendar',
        type: 'local'
      }
    ];
  }
}