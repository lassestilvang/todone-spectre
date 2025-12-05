import React, { useState, useEffect } from "react";
import { useCalendar } from "../../../hooks/useCalendar";
import { CalendarEvent } from "./CalendarEvent";
import {
  format,
  startOfWeek,
  endOfWeek,
  addDays,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from "date-fns";

interface CalendarViewProps {
  onEventClick?: (eventId: string) => void;
  onDateSelect?: (date: Date) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  onEventClick,
  onDateSelect,
}) => {
  const { events, loading, error, fetchEvents } = useCalendar();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handlePrevWeek = () => {
    setCurrentDate((prev) => addDays(prev, -7));
  };

  const handleNextWeek = () => {
    setCurrentDate((prev) => addDays(prev, 7));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  const renderWeekDays = () => {
    const weekStart = startOfWeek(currentDate);
    const weekEnd = endOfWeek(currentDate);
    const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

    return days.map((day, index) => (
      <div key={index} className="calendar-day">
        <div className="calendar-day-header">
          {format(day, "EEE")}
          <div className="calendar-day-number">{format(day, "d")}</div>
        </div>
        <div className="calendar-day-events">
          {events
            .filter((event) => isSameDay(new Date(event.startDate), day))
            .map((event) => (
              <CalendarEvent
                key={event.id}
                event={event}
                onClick={() => onEventClick && onEventClick(event.id)}
              />
            ))}
        </div>
      </div>
    ));
  };

  if (loading) return <div>Loading calendar...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <button onClick={handlePrevWeek}>Previous</button>
        <h2>{format(currentDate, "MMMM yyyy")}</h2>
        <button onClick={handleNextWeek}>Next</button>
        <button onClick={handleToday}>Today</button>
      </div>
      <div className="calendar-week">{renderWeekDays()}</div>
    </div>
  );
};
