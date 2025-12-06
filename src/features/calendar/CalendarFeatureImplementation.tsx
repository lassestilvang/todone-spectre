// @ts-nocheck
import React, { useState, useEffect } from "react";
import { CalendarView } from "./CalendarView";
import { CalendarSync } from "./CalendarSync";
import { CalendarIntegration } from "./CalendarIntegration";
import { CalendarTaskIntegration } from "./CalendarTaskIntegration";
import { CalendarViewControls } from "./CalendarViewControls";
import { CalendarEventDisplay } from "./CalendarEventDisplay";
import { CalendarSyncControls } from "./CalendarSyncControls";
import { CalendarIntegrationSettings } from "./CalendarIntegrationSettings";
import { useCalendar } from "../../../hooks/useCalendar";
import { useCalendarSync } from "../../../hooks/useCalendarSync";
import { useTasks } from "../../../hooks/useTasks";
import {
  CalendarEventType,
  CalendarViewState,
} from "../../../types/calendarTypes";

interface CalendarFeatureImplementationProps {
  initialView?: "day" | "week" | "month" | "agenda";
  showSyncControls?: boolean;
  showIntegrationSettings?: boolean;
  taskId?: string;
}

export const CalendarFeatureImplementation: React.FC<
  CalendarFeatureImplementationProps
> = ({
  initialView = "week",
  showSyncControls = true,
  showIntegrationSettings = true,
  taskId,
}) => {
  const {
    events,
    loading: eventsLoading,
    error: eventsError,
    fetchEvents,
  } = useCalendar();
  const { syncStatus, availableCalendars, syncCalendars, refreshCalendars } =
    useCalendarSync();
  const { tasks } = useTasks();

  const [viewState, setViewState] = useState<CalendarViewState>({
    currentView: initialView,
    currentDate: new Date(),
    selectedDate: undefined,
    selectedEventId: undefined,
  });

  const [selectedCalendars, setSelectedCalendars] = useState<string[]>([]);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showTaskIntegration, setShowTaskIntegration] = useState(false);

  // Initialize data
  useEffect(() => {
    fetchEvents();
    refreshCalendars();
  }, [fetchEvents, refreshCalendars]);

  const handleViewChange = (view: CalendarViewState["currentView"]) => {
    setViewState((prev) => ({ ...prev, currentView: view }));
  };

  const handleNavigate = (direction: "prev" | "next" | "today") => {
    setViewState((prev) => {
      const currentDate = new Date(prev.currentDate);

      if (direction === "today") {
        return { ...prev, currentDate: new Date() };
      }

      if (direction === "prev") {
        if (prev.currentView === "day") {
          currentDate.setDate(currentDate.getDate() - 1);
        } else if (prev.currentView === "week") {
          currentDate.setDate(currentDate.getDate() - 7);
        } else if (prev.currentView === "month") {
          currentDate.setMonth(currentDate.getMonth() - 1);
        }
      } else if (direction === "next") {
        if (prev.currentView === "day") {
          currentDate.setDate(currentDate.getDate() + 1);
        } else if (prev.currentView === "week") {
          currentDate.setDate(currentDate.getDate() + 7);
        } else if (prev.currentView === "month") {
          currentDate.setMonth(currentDate.getMonth() + 1);
        }
      }

      return { ...prev, currentDate };
    });
  };

  const handleDateChange = (date: Date) => {
    setViewState((prev) => ({ ...prev, currentDate: date }));
  };

  const handleEventClick = (eventId: string) => {
    setViewState((prev) => ({ ...prev, selectedEventId: eventId }));
    setShowEventDetails(true);
  };

  const handleCalendarToggle = (calendarId: string) => {
    setSelectedCalendars((prev) =>
      prev.includes(calendarId)
        ? prev.filter((id) => id !== calendarId)
        : [...prev, calendarId],
    );
  };

  const handleSync = async () => {
    await syncCalendars(selectedCalendars);
    await fetchEvents(); // Refresh events after sync
  };

  const getSelectedEvent = () => {
    return events.find((event) => event.id === viewState.selectedEventId);
  };

  const selectedEvent = getSelectedEvent();

  if (eventsLoading) {
    return <div className="calendar-loading">Loading calendar...</div>;
  }

  if (eventsError) {
    return <div className="calendar-error">Error: {eventsError.message}</div>;
  }

  return (
    <div className="calendar-feature-implementation">
      <div className="calendar-header">
        <h2>Calendar Integration</h2>
        <CalendarViewControls
          viewState={viewState}
          onViewChange={handleViewChange}
          onNavigate={handleNavigate}
          onDateChange={handleDateChange}
        />
      </div>

      <div className="calendar-main-content">
        <div className="calendar-view-container">
          <CalendarView
            onEventClick={handleEventClick}
            onDateSelect={handleDateChange}
          />
        </div>

        {showSyncControls && (
          <div className="calendar-sync-container">
            <CalendarSyncControls
              syncStatus={syncStatus}
              availableCalendars={availableCalendars}
              selectedCalendars={selectedCalendars}
              onSync={handleSync}
              onCalendarToggle={handleCalendarToggle}
              lastSynced={syncStatus === "completed" ? new Date() : undefined}
            />
          </div>
        )}
      </div>

      {showEventDetails && selectedEvent && (
        <div className="calendar-event-details-modal">
          <div className="modal-content">
            <button
              className="close-modal"
              onClick={() => setShowEventDetails(false)}
            >
              ×
            </button>
            <CalendarEventDisplay
              event={selectedEvent}
              onEdit={() => console.log("Edit event:", selectedEvent.id)}
              onDelete={() => console.log("Delete event:", selectedEvent.id)}
              onLinkTask={() => {
                setShowEventDetails(false);
                setShowTaskIntegration(true);
              }}
            />
          </div>
        </div>
      )}

      {showTaskIntegration && taskId && (
        <div className="calendar-task-integration-modal">
          <div className="modal-content">
            <button
              className="close-modal"
              onClick={() => setShowTaskIntegration(false)}
            >
              ×
            </button>
            <CalendarTaskIntegration
              taskId={taskId}
              onEventCreated={() => {
                setShowTaskIntegration(false);
                fetchEvents();
              }}
            />
          </div>
        </div>
      )}

      {showIntegrationSettings && (
        <div className="calendar-integration-settings-container">
          <CalendarIntegrationSettings
            config={useCalendar().config}
            onConfigChange={useCalendar().updateConfig}
            onSave={() => console.log("Settings saved")}
          />
        </div>
      )}
    </div>
  );
};
