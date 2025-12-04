import React from 'react';
import { CalendarEventType } from '../../../types/calendarTypes';

interface CalendarEventProps {
  event: CalendarEventType;
  onClick?: () => void;
}

export const CalendarEvent: React.FC<CalendarEventProps> = ({ event, onClick }) => {
  const getEventColor = () => {
    switch (event.priority) {
      case 'high': return '#ff6b6b';
      case 'medium': return '#ffd93d';
      case 'low': return '#6bcf7f';
      default: return '#4dabf7';
    }
  };

  return (
    <div
      className="calendar-event"
      style={{
        backgroundColor: getEventColor(),
        borderLeft: `4px solid ${getEventColor()}`,
        cursor: 'pointer'
      }}
      onClick={onClick}
    >
      <div className="calendar-event-time">
        {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div className="calendar-event-title">
        {event.title}
      </div>
      {event.description && (
        <div className="calendar-event-description">
          {event.description}
        </div>
      )}
    </div>
  );
};