import React, { useState } from "react";
import { CalendarConfig } from "../../../types/calendarTypes";

interface CalendarIntegrationSettingsProps {
  config: CalendarConfig;
  onConfigChange: (updates: Partial<CalendarConfig>) => void;
  onSave: () => void;
}

export const CalendarIntegrationSettings: React.FC<
  CalendarIntegrationSettingsProps
> = ({ config, onConfigChange, onSave }) => {
  const [localConfig, setLocalConfig] = useState<CalendarConfig>(config);
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setLocalConfig((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleWorkHoursChange = (field: "start" | "end", value: string) => {
    setLocalConfig((prev) => ({
      ...prev,
      workHours: {
        ...prev.workHours,
        [field]: value,
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfigChange(localConfig);
    setIsEditing(false);
    onSave();
  };

  return (
    <div className="calendar-integration-settings">
      <h3>Calendar Integration Settings</h3>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="settings-form">
          <div className="form-group">
            <label htmlFor="defaultView">Default View</label>
            <select
              id="defaultView"
              name="defaultView"
              value={localConfig.defaultView}
              onChange={handleInputChange}
            >
              <option value="day">Day</option>
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="agenda">Agenda</option>
            </select>
          </div>

          <div className="form-group">
            <label>Work Hours</label>
            <div className="work-hours-inputs">
              <input
                type="time"
                value={localConfig.workHours.start}
                onChange={(e) => handleWorkHoursChange("start", e.target.value)}
              />
              <span> to </span>
              <input
                type="time"
                value={localConfig.workHours.end}
                onChange={(e) => handleWorkHoursChange("end", e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                name="showWeekends"
                checked={localConfig.showWeekends}
                onChange={(e) =>
                  handleInputChange({
                    target: {
                      name: "showWeekends",
                      value: e.target.checked.toString(),
                    },
                  } as any)
                }
              />
              Show Weekends
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="timeZone">Time Zone</label>
            <input
              type="text"
              id="timeZone"
              name="timeZone"
              value={localConfig.timeZone}
              onChange={handleInputChange}
              placeholder="e.g., UTC, America/New_York"
            />
          </div>

          <div className="form-group">
            <label htmlFor="firstDayOfWeek">First Day of Week</label>
            <select
              id="firstDayOfWeek"
              name="firstDayOfWeek"
              value={localConfig.firstDayOfWeek}
              onChange={handleInputChange}
            >
              <option value="0">Sunday</option>
              <option value="1">Monday</option>
              <option value="2">Tuesday</option>
              <option value="3">Wednesday</option>
              <option value="4">Thursday</option>
              <option value="5">Friday</option>
              <option value="6">Saturday</option>
            </select>
          </div>

          <div className="form-actions">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="cancel-button"
            >
              Cancel
            </button>
            <button type="submit" className="save-button">
              Save Settings
            </button>
          </div>
        </form>
      ) : (
        <div className="settings-summary">
          <p>
            <strong>Default View:</strong> {config.defaultView}
          </p>
          <p>
            <strong>Work Hours:</strong> {config.workHours.start} -{" "}
            {config.workHours.end}
          </p>
          <p>
            <strong>Show Weekends:</strong> {config.showWeekends ? "Yes" : "No"}
          </p>
          <p>
            <strong>Time Zone:</strong> {config.timeZone}
          </p>
          <p>
            <strong>First Day of Week:</strong>{" "}
            {getDayName(config.firstDayOfWeek)}
          </p>

          <button onClick={() => setIsEditing(true)} className="edit-button">
            Edit Settings
          </button>
        </div>
      )}
    </div>
  );
};

// Helper function to get day name
const getDayName = (dayIndex: number): string => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[dayIndex] || "Unknown";
};
