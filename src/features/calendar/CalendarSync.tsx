import React, { useState, useEffect } from 'react';
import { useCalendarSync } from '../../../hooks/useCalendarSync';
import { CalendarSyncStatus } from '../../../types/calendarTypes';

interface CalendarSyncProps {
  onSyncComplete?: () => void;
}

export const CalendarSync: React.FC<CalendarSyncProps> = ({ onSyncComplete }) => {
  const { syncStatus, lastSynced, syncCalendars, availableCalendars, error } = useCalendarSync();
  const [selectedCalendars, setSelectedCalendars] = useState<string[]>([]);

  useEffect(() => {
    if (syncStatus === 'completed' && onSyncComplete) {
      onSyncComplete();
    }
  }, [syncStatus, onSyncComplete]);

  const handleSync = () => {
    syncCalendars(selectedCalendars);
  };

  const handleCalendarToggle = (calendarId: string) => {
    setSelectedCalendars(prev =>
      prev.includes(calendarId)
        ? prev.filter(id => id !== calendarId)
        : [...prev, calendarId]
    );
  };

  const getStatusText = () => {
    switch (syncStatus) {
      case 'idle': return 'Ready to sync';
      case 'syncing': return 'Syncing...';
      case 'completed': return 'Sync completed';
      case 'error': return 'Sync failed';
      default: return 'Unknown status';
    }
  };

  return (
    <div className="calendar-sync">
      <h3>Calendar Sync</h3>
      <div className="sync-status">
        <span>Status: {getStatusText()}</span>
        {lastSynced && (
          <span>Last synced: {new Date(lastSynced).toLocaleString()}</span>
        )}
      </div>

      {error && (
        <div className="sync-error">
          Error: {error.message}
        </div>
      )}

      <div className="calendar-selection">
        <h4>Available Calendars</h4>
        {availableCalendars.map(calendar => (
          <div key={calendar.id} className="calendar-option">
            <input
              type="checkbox"
              id={`calendar-${calendar.id}`}
              checked={selectedCalendars.includes(calendar.id)}
              onChange={() => handleCalendarToggle(calendar.id)}
            />
            <label htmlFor={`calendar-${calendar.id}`}>
              {calendar.name} ({calendar.type})
            </label>
          </div>
        ))}
      </div>

      <button
        onClick={handleSync}
        disabled={syncStatus === 'syncing' || selectedCalendars.length === 0}
      >
        {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Calendars'}
      </button>
    </div>
  );
};