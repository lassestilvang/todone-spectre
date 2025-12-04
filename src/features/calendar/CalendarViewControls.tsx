import React from 'react';
import { CalendarViewState } from '../../../types/calendarTypes';

interface CalendarViewControlsProps {
  viewState: CalendarViewState;
  onViewChange: (view: 'day' | 'week' | 'month' | 'agenda') => void;
  onNavigate: (direction: 'prev' | 'next' | 'today') => void;
  onDateChange: (date: Date) => void;
}

export const CalendarViewControls: React.FC<CalendarViewControlsProps> = ({
  viewState,
  onViewChange,
  onNavigate,
  onDateChange
}) => {
  const handleDateInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      onDateChange(newDate);
    }
  };

  return (
    <div className="calendar-view-controls">
      <div className="calendar-navigation">
        <button onClick={() => onNavigate('today')}>Today</button>
        <button onClick={() => onNavigate('prev')}>Previous</button>
        <button onClick={() => onNavigate('next')}>Next</button>
      </div>

      <div className="calendar-date-picker">
        <input
          type="date"
          value={viewState.currentDate.toISOString().split('T')[0]}
          onChange={handleDateInputChange}
          className="date-input"
        />
      </div>

      <div className="calendar-view-selector">
        <select
          value={viewState.currentView}
          onChange={(e) => onViewChange(e.target.value as 'day' | 'week' | 'month' | 'agenda')}
        >
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
          <option value="agenda">Agenda</option>
        </select>
      </div>
    </div>
  );
};