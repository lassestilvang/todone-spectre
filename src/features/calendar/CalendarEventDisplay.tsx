import React from "react";
import { CalendarEventType } from "../../../types/calendarTypes";

interface CalendarEventDisplayProps {
  event: CalendarEventType;
  onEdit?: () => void;
  onDelete?: () => void;
  onLinkTask?: () => void;
  showActions?: boolean;
}

export const CalendarEventDisplay: React.FC<CalendarEventDisplayProps> = ({
  event,
  onEdit,
  onDelete,
  onLinkTask,
  showActions = true,
}) => {
  const getPriorityColor = () => {
    switch (event.priority) {
      case "high":
        return "#ff6b6b";
      case "medium":
        return "#ffd93d";
      case "low":
        return "#6bcf7f";
      default:
        return "#4dabf7";
    }
  };

  const formatDateTime = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleString([], {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className="calendar-event-display"
      style={{ borderLeft: `4px solid ${getPriorityColor()}` }}
    >
      <div className="event-header">
        <h4 className="event-title">{event.title}</h4>
        <span
          className="event-priority"
          style={{ backgroundColor: getPriorityColor() }}
        >
          {event.priority}
        </span>
      </div>

      <div className="event-details">
        <div className="event-time">
          {formatDateTime(event.startDate)} -{" "}
          {event.endDate ? formatDateTime(event.endDate) : "No end time"}
        </div>

        {event.location && (
          <div className="event-location">
            <span>📍 {event.location}</span>
          </div>
        )}

        {event.description && (
          <div className="event-description">
            <p>{event.description}</p>
          </div>
        )}

        {event.taskId && (
          <div className="event-task-link">
            <span>🔗 Linked to task: {event.taskId}</span>
          </div>
        )}
      </div>

      {showActions && (
        <div className="event-actions">
          {onEdit && <button onClick={onEdit}>Edit</button>}
          {onDelete && <button onClick={onDelete}>Delete</button>}
          {onLinkTask && <button onClick={onLinkTask}>Link Task</button>}
        </div>
      )}
    </div>
  );
};
