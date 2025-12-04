import React from 'react';
import { CalendarSyncStatus } from '../../../types/calendarTypes';

interface CalendarSyncControlsProps {
  syncStatus: CalendarSyncStatus;
  availableCalendars: { id: string; name: string; type: string }[];
  selectedCalendars: string[];
  onSync: () => void;
  onCalendarToggle: (calendarId: string) => void;
  lastSynced?: Date;
}

export const CalendarSyncControls: React.FC<CalendarSyncControlsProps> = ({
  syncStatus,
  availableCalendars,
  selectedCalendars,
  onSync,
  onCalendarToggle,
  lastSynced
}) => {
  const getStatusText = () => {
    switch (syncStatus) {
      case 'idle': return 'Ready to sync';
      case 'syncing': return 'Syncing...';
      case 'completed': return 'Sync completed';
      case 'error': return 'Sync failed';
      default: return 'Unknown status';
    }
  };

  const getStatusColor = () => {
    switch (syncStatus) {
      case 'idle': return '#6c757d';
      case 'syncing': return '#007bff';
      case 'completed': return '#28a745';
      case 'error': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <div className="calendar-sync-controls">
      <div className="sync-status" style={{ color: getStatusColor() }}>
        <strong>Status:</strong> {getStatusText()}
        {lastSynced && (
          <span className="last-synced">
            | Last synced: {lastSynced.toLocaleString()}
          </span>
        )}
      </div>

      <div className="calendar-selection">
        <h4>Select Calendars to Sync</h4>
        <div className="calendar-options">
          {availableCalendars.map(calendar => (
            <div key={calendar.id} className="calendar-option">
              <input
                type="checkbox"
                id={`sync-calendar-${calendar.id}`}
                checked={selectedCalendars.includes(calendar.id)}
                onChange={() => onCalendarToggle(calendar.id)}
                disabled={syncStatus === 'syncing'}
              />
              <label htmlFor={`sync-calendar-${calendar.id}`}>
                {calendar.name} ({calendar.type})
              </label>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onSync}
        disabled={syncStatus === 'syncing' || selectedCalendars.length === 0}
        className="sync-button"
      >
        {syncStatus === 'syncing' ? (
          <>
            <span className="spinner"></span> Syncing...
          </>
        ) : (
          'Sync Calendars'
        )}
      </button>
    </div>
  );
};