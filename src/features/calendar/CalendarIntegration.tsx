import React, { useState } from "react";
import { useCalendar } from "../../../hooks/useCalendar";
import { useTasks } from "../../../hooks/useTasks";
import { CalendarEventType } from "../../../types/calendarTypes";
import { Task } from "../../../types/taskTypes";

interface CalendarIntegrationProps {
  taskId?: string;
  onTaskLinked?: (taskId: string, eventId: string) => void;
}

export const CalendarIntegration: React.FC<CalendarIntegrationProps> = ({
  taskId,
  onTaskLinked,
}) => {
  const { events, loading: eventsLoading, error: eventsError } = useCalendar();
  const { tasks, loading: tasksLoading, error: tasksError } = useTasks();
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isLinking, setIsLinking] = useState(false);

  const loading = eventsLoading || tasksLoading;
  const error = eventsError || tasksError;

  const handleLinkTaskToEvent = () => {
    if (!taskId || !selectedEventId) return;

    setIsLinking(true);
    // Simulate API call to link task to event
    setTimeout(() => {
      if (onTaskLinked) {
        onTaskLinked(taskId, selectedEventId);
      }
      setIsLinking(false);
    }, 1000);
  };

  const getTaskById = (id: string): Task | undefined => {
    return tasks.find((task) => task.id === id);
  };

  const getEventById = (id: string): CalendarEventType | undefined => {
    return events.find((event) => event.id === id);
  };

  if (loading) return <div>Loading integration...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="calendar-integration">
      <h3>Calendar Integration</h3>

      {taskId && (
        <div className="task-info">
          <h4>Current Task</h4>
          {getTaskById(taskId) ? (
            <div>
              <strong>{getTaskById(taskId)?.title}</strong>
              <p>{getTaskById(taskId)?.description}</p>
            </div>
          ) : (
            <p>Task not found</p>
          )}
        </div>
      )}

      <div className="event-selection">
        <h4>Select Event to Link</h4>
        <select
          value={selectedEventId || ""}
          onChange={(e) => setSelectedEventId(e.target.value)}
          disabled={isLinking}
        >
          <option value="">Select an event</option>
          {events.map((event) => (
            <option key={event.id} value={event.id}>
              {event.title} ({new Date(event.startDate).toLocaleDateString()})
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleLinkTaskToEvent}
        disabled={!selectedEventId || isLinking}
      >
        {isLinking ? "Linking..." : "Link Task to Event"}
      </button>
    </div>
  );
};
