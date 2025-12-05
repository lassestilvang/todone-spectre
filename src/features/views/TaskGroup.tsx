import React from "react";
import { Task } from "../../types/task";
import { TaskList } from "../tasks/TaskList";

interface TaskGroupProps {
  title: string;
  tasks: Task[];
  onTaskClick?: (taskId: string) => void;
  showProject?: boolean;
  showDueDate?: boolean;
  showOverdueIndicator?: boolean;
  icon?: React.ReactNode;
  color?: string;
}

export const TaskGroup: React.FC<TaskGroupProps> = ({
  title,
  tasks,
  onTaskClick,
  showProject = false,
  showDueDate = false,
  showOverdueIndicator = false,
  icon,
  color = "gray",
}) => {
  // Color mapping for different group types
  const colorClasses: Record<
    string,
    { bg: string; text: string; border: string }
  > = {
    gray: {
      bg: "bg-gray-50 dark:bg-gray-800",
      text: "text-gray-900 dark:text-white",
      border: "border-gray-200 dark:border-gray-700",
    },
    red: {
      bg: "bg-red-50 dark:bg-red-900/20",
      text: "text-red-800 dark:text-red-300",
      border: "border-red-200 dark:border-red-800",
    },
    blue: {
      bg: "bg-blue-50 dark:bg-blue-900/20",
      text: "text-blue-800 dark:text-blue-300",
      border: "border-blue-200 dark:border-blue-800",
    },
    green: {
      bg: "bg-green-50 dark:bg-green-900/20",
      text: "text-green-800 dark:text-green-300",
      border: "border-green-200 dark:border-green-800",
    },
    yellow: {
      bg: "bg-yellow-50 dark:bg-yellow-900/20",
      text: "text-yellow-800 dark:text-yellow-300",
      border: "border-yellow-200 dark:border-yellow-800",
    },
  };

  const currentColor = colorClasses[color] || colorClasses.gray;

  return (
    <div
      className={`${currentColor.bg} rounded-lg shadow-sm p-4 border-l-4 ${currentColor.border}`}
    >
      <h3
        className={`${currentColor.text} text-lg font-semibold mb-3 flex items-center`}
      >
        {icon && <span className="mr-2">{icon}</span>}
        {title} ({tasks.length})
      </h3>
      {tasks.length > 0 ? (
        <TaskList
          tasks={tasks}
          onTaskClick={onTaskClick}
          showProject={showProject}
          showDueDate={showDueDate}
          showOverdueIndicator={showOverdueIndicator}
        />
      ) : (
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No tasks in this group
        </p>
      )}
    </div>
  );
};
