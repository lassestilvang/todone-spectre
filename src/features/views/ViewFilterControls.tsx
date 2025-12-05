import React from "react";

interface ViewFilterControlsProps {
  filters: {
    status?: string;
    priority?: string;
    timeRange?: string;
    searchQuery?: string;
  };
  onStatusChange?: (status: string) => void;
  onPriorityChange?: (priority: string) => void;
  onTimeRangeChange?: (timeRange: string) => void;
  onSearchChange?: (query: string) => void;
  onReset?: () => void;
  viewType: "inbox" | "today" | "upcoming";
}

export const ViewFilterControls: React.FC<ViewFilterControlsProps> = ({
  filters,
  onStatusChange,
  onPriorityChange,
  onTimeRangeChange,
  onSearchChange,
  onReset,
  viewType,
}) => {
  const priorityOptions = [
    { value: "all", label: "All Priorities" },
    { value: "critical", label: "Critical" },
    { value: "high", label: "High" },
    { value: "medium", label: "Medium" },
    { value: "low", label: "Low" },
  ];

  const statusOptions = [
    { value: "all", label: "All Statuses" },
    { value: "todo", label: "To Do" },
    { value: "in-progress", label: "In Progress" },
    { value: "completed", label: "Completed" },
  ];

  const timeRangeOptions = [
    { value: "all", label: "All Time" },
    { value: "next-week", label: "Next Week" },
    { value: "next-month", label: "Next Month" },
    { value: "next-3-months", label: "Next 3 Months" },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Status Filter (Inbox only) */}
      {viewType === "inbox" && onStatusChange && (
        <select
          value={filters.status || "all"}
          onChange={(e) => onStatusChange(e.target.value)}
          className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}

      {/* Priority Filter */}
      {onPriorityChange && (
        <select
          value={filters.priority || "all"}
          onChange={(e) => onPriorityChange(e.target.value)}
          className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          {priorityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}

      {/* Time Range Filter (Upcoming only) */}
      {viewType === "upcoming" && onTimeRangeChange && (
        <select
          value={filters.timeRange || "all"}
          onChange={(e) => onTimeRangeChange(e.target.value)}
          className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        >
          {timeRangeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}

      {/* Search Input */}
      {onSearchChange && (
        <input
          type="text"
          placeholder="Search tasks..."
          value={filters.searchQuery || ""}
          onChange={(e) => onSearchChange(e.target.value)}
          className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white flex-1 min-w-[200px]"
        />
      )}

      {/* Reset Button */}
      {onReset && (
        <button
          onClick={onReset}
          className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          Reset
        </button>
      )}
    </div>
  );
};
