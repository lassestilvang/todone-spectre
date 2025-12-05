import React, { useState, useEffect } from "react";
import { useCalendar } from "../../../hooks/useCalendar";
import { useTasks } from "../../../hooks/useTasks";
import { CalendarEventType } from "../../../types/calendarTypes";
import { Task } from "../../../types/taskTypes";

interface CalendarTaskIntegrationProps {
  taskId: string;
  onEventCreated?: (event: CalendarEventType) => void;
}

export const CalendarTaskIntegration: React.FC<
  CalendarTaskIntegrationProps
> = ({ taskId, onEventCreated }) => {
  const { events, createEvent, linkTaskToEvent } = useCalendar();
  const { tasks } = useTasks();
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [newEventData, setNewEventData] = useState<Partial<CalendarEventType>>({
    title: "",
    description: "",
    startDate: new Date().toISOString(),
    endDate: new Date().toISOString(),
    priority: "normal",
  });

  const task = tasks.find((t) => t.id === taskId);

  useEffect(() => {
    if (task) {
      setNewEventData((prev) => ({
        ...prev,
        title: task.title || "",
        description: task.description || "",
        startDate: task.dueDate || new Date().toISOString(),
        endDate: task.dueDate || new Date().toISOString(),
        priority: task.priority || "normal",
      }));
    }
  }, [task]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setNewEventData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (field: "startDate" | "endDate", value: string) => {
    setNewEventData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleCreateEvent = async () => {
    if (!task) return;

    try {
      setIsCreatingEvent(true);
      const eventData: Omit<CalendarEventType, "id"> = {
        title: newEventData.title || task.title || "Untitled Event",
        description: newEventData.description || task.description || "",
        startDate: newEventData.startDate || new Date().toISOString(),
        endDate: newEventData.endDate || new Date().toISOString(),
        priority: newEventData.priority || "normal",
        taskId: task.id,
      };

      const createdEvent = await createEvent(eventData);
      await linkTaskToEvent(task.id, createdEvent.id);

      if (onEventCreated) {
        onEventCreated(createdEvent);
      }

      setIsCreatingEvent(false);
    } catch (error) {
      console.error("Failed to create event:", error);
      setIsCreatingEvent(false);
    }
  };

  const getLinkedEvent = () => {
    return events.find((event) => event.taskId === taskId);
  };

  const linkedEvent = getLinkedEvent();

  return (
    <div className="calendar-task-integration">
      <h3>Calendar Integration</h3>

      {linkedEvent ? (
        <div className="linked-event-info">
          <h4>Linked Calendar Event</h4>
          <p>
            <strong>Title:</strong> {linkedEvent.title}
          </p>
          <p>
            <strong>Date:</strong>{" "}
            {new Date(linkedEvent.startDate).toLocaleString()}
          </p>
          <p>
            <strong>Priority:</strong> {linkedEvent.priority}
          </p>
          <p>This task is linked to a calendar event.</p>
        </div>
      ) : (
        <div className="create-event-form">
          {isCreatingEvent ? (
            <div className="creating-event">
              <p>Creating calendar event...</p>
            </div>
          ) : (
            <>
              <div className="form-group">
                <label htmlFor="eventTitle">Event Title</label>
                <input
                  type="text"
                  id="eventTitle"
                  name="title"
                  value={newEventData.title}
                  onChange={handleInputChange}
                  placeholder="Event title"
                />
              </div>

              <div className="form-group">
                <label htmlFor="eventDescription">Description</label>
                <textarea
                  id="eventDescription"
                  name="description"
                  value={newEventData.description}
                  onChange={handleInputChange}
                  placeholder="Event description"
                />
              </div>

              <div className="form-group">
                <label htmlFor="eventStartDate">Start Date</label>
                <input
                  type="datetime-local"
                  id="eventStartDate"
                  value={new Date(newEventData.startDate || "")
                    .toISOString()
                    .slice(0, 16)}
                  onChange={(e) =>
                    handleDateChange("startDate", e.target.value)
                  }
                />
              </div>

              <div className="form-group">
                <label htmlFor="eventEndDate">End Date</label>
                <input
                  type="datetime-local"
                  id="eventEndDate"
                  value={new Date(newEventData.endDate || "")
                    .toISOString()
                    .slice(0, 16)}
                  onChange={(e) => handleDateChange("endDate", e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="eventPriority">Priority</label>
                <select
                  id="eventPriority"
                  name="priority"
                  value={newEventData.priority}
                  onChange={handleInputChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <button
                onClick={handleCreateEvent}
                disabled={!newEventData.title || !newEventData.startDate}
                className="create-event-button"
              >
                Create Calendar Event
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
