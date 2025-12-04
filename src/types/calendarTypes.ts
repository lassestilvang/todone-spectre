export interface CalendarEventType {
  id: string;
  title: string;
  description?: string;
  startDate: string | Date;
  endDate?: string | Date;
  priority: 'high' | 'medium' | 'low' | 'normal';
  calendarId?: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
  location?: string;
  attendees?: string[];
  status?: 'confirmed' | 'tentative' | 'cancelled';
  createdAt?: string | Date;
  updatedAt?: string | Date;
  taskId?: string;
}

export interface CalendarType {
  id: string;
  name: string;
  type: 'google' | 'outlook' | 'apple' | 'local';
  color?: string;
  isPrimary?: boolean;
  isSynced?: boolean;
  lastSynced?: string | Date;
}

export type CalendarSyncStatus = 'idle' | 'syncing' | 'completed' | 'error';

export interface CalendarSyncState {
  status: CalendarSyncStatus;
  lastSynced?: Date;
  error?: Error | null;
  availableCalendars: CalendarType[];
}

export interface CalendarViewState {
  currentView: 'day' | 'week' | 'month' | 'agenda';
  currentDate: Date;
  selectedDate?: Date;
  selectedEventId?: string;
}

export interface CalendarIntegrationState {
  linkedTasks: Record<string, string>; // taskId -> eventId mapping
  integrationEnabled: boolean;
  autoSync: boolean;
  syncFrequency: 'manual' | 'daily' | 'weekly';
}

export interface CalendarConfig {
  defaultView: 'day' | 'week' | 'month' | 'agenda';
  workHours: {
    start: string;
    end: string;
  };
  showWeekends: boolean;
  timeZone: string;
  firstDayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
}