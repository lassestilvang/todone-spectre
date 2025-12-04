import { useState, useEffect, useCallback } from 'react';
import { CalendarSyncService } from '../services/calendarSyncService';
import { CalendarType, CalendarSyncStatus } from '../types/calendarTypes';

export const useCalendarSync = () => {
  const [syncStatus, setSyncStatus] = useState<CalendarSyncStatus>('idle');
  const [lastSynced, setLastSynced] = useState<Date | undefined>(undefined);
  const [availableCalendars, setAvailableCalendars] = useState<CalendarType[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * Initialize available calendars
   */
  const initialize = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const calendars = await CalendarSyncService.getAvailableCalendars();
      setAvailableCalendars(calendars);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to initialize calendars'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Sync selected calendars
   */
  const syncCalendars = useCallback(async (calendarIds: string[]) => {
    try {
      setIsLoading(true);
      setError(null);
      setSyncStatus('syncing');

      const result = await CalendarSyncService.syncCalendars(calendarIds);

      if (result.success) {
        setSyncStatus('completed');
        setLastSynced(new Date());
        setError(null);
        return {
          success: true,
          syncedEvents: result.syncedEvents
        };
      } else {
        setSyncStatus('error');
        if (result.error) {
          setError(result.error);
        }
        return {
          success: false,
          syncedEvents: []
        };
      }
    } catch (err) {
      setSyncStatus('error');
      setError(err instanceof Error ? err : new Error('Sync failed'));
      return {
        success: false,
        syncedEvents: []
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Get current sync status
   */
  const getSyncStatus = useCallback(() => {
    return CalendarSyncService.getSyncStatus();
  }, []);

  /**
   * Refresh available calendars
   */
  const refreshCalendars = useCallback(async () => {
    await initialize();
  }, [initialize]);

  // Initialize on mount
  useEffect(() => {
    initialize();
  }, [initialize]);

  // Update status from service
  useEffect(() => {
    const status = CalendarSyncService.getSyncStatus();
    setSyncStatus(status.status);
    setLastSynced(status.lastSynced);
    setError(status.error || null);
  }, []);

  return {
    syncStatus,
    lastSynced,
    availableCalendars,
    error,
    isLoading,
    syncCalendars,
    getSyncStatus,
    refreshCalendars
  };
};