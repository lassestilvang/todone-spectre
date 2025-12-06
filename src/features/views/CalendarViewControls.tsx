// @ts-nocheck
import React from "react";

interface CalendarViewControlsProps {
  viewMode: string;
  showWeekends: boolean;
  currentDate: Date;
  onViewModeChange: (viewMode: string) => void;
  onShowWeekendsChange: (show: boolean) => void;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}

export const CalendarViewControls: React.FC<CalendarViewControlsProps> = ({
  viewMode,
  showWeekends,
  currentDate,
  onViewModeChange,
  onShowWeekendsChange,
  onPrevious,
  onNext,
  onToday,
}) => {
  const viewModeOptions = [
    { value: "day", label: "Day" },
    { value: "week", label: "Week" },
    { value: "month", label: "Month" },
  ];

  const formatDateRange = () => {
    const options: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };

    if (viewMode === "day") {
      return currentDate.toLocaleDateString(undefined, options);
    } else if (viewMode === "week") {
      const startOfWeek = new Date(currentDate);
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Monday
      const endOfWeek = new Date(currentDate);
      endOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + 7); // Sunday

      const startFormatted = startOfWeek.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
      const endFormatted = endOfWeek.toLocaleDateString(undefined, options);

      return `${startFormatted} - ${endFormatted}`;
    } else {
      // month
      return currentDate.toLocaleDateString(undefined, {
        month: "long",
        year: "numeric",
      });
    }
  };

  return (
    <div className="calendar-view-controls flex flex-wrap items-center gap-3 mb-4">
      <div className="flex items-center space-x-2">
        <button
          onClick={onPrevious}
          className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          &lt;
        </button>

        <button
          onClick={onToday}
          className="px-3 py-1 text-sm bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800"
        >
          Today
        </button>

        <button
          onClick={onNext}
          className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          &gt;
        </button>
      </div>

      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {formatDateRange()}
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <select
          value={viewMode}
          onChange={(e) => onViewModeChange(e.target.value)}
          className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          {viewModeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <label className="flex items-center space-x-1">
          <input
            type="checkbox"
            checked={showWeekends}
            onChange={(e) => onShowWeekendsChange(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Weekends
          </span>
        </label>
      </div>
    </div>
  );
};
