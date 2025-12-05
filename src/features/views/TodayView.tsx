import React from "react";
import { ViewLayout } from "./ViewLayout";
import { Task } from "../../types/task";
import { TaskList } from "../tasks/TaskList";
import { useTasks } from "../../hooks/useTasks";
import { isToday } from "../../utils/dateUtils";

interface TodayViewProps {
  projectId?: string;
  onTaskClick?: (taskId: string) => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  projectId,
  onTaskClick,
}) => {
  const { tasks, isLoading, error, getProcessedTasks } = useTasks(projectId);

  // Get today's date for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter tasks for today view (due today or overdue)
  const todayTasks = getProcessedTasks().filter((task) => {
    if (!task.dueDate) return false;

    const taskDueDate = new Date(task.dueDate);
    taskDueDate.setHours(0, 0, 0, 0);

    return taskDueDate <= today;
  });

  // Sort by priority and then by due date
  const sortedTasks = [...todayTasks].sort((a, b) => {
    // First by priority (critical, high, medium, low)
    const priorityOrder: Record<string, number> = {
      critical: 1,
      high: 2,
      medium: 3,
      low: 4,
    };

    const priorityCompare =
      (priorityOrder[a.priority] || 5) - (priorityOrder[b.priority] || 5);
    if (priorityCompare !== 0) return priorityCompare;

    // Then by due date (earlier dates first)
    const aDueDate = a.dueDate?.getTime() || Number.MAX_SAFE_INTEGER;
    const bDueDate = b.dueDate?.getTime() || Number.MAX_SAFE_INTEGER;
    return aDueDate - bDueDate;
  });

  // Separate overdue and today tasks
  const overdueTasks: Task[] = [];
  const dueTodayTasks: Task[] = [];

  const now = new Date();

  sortedTasks.forEach((task) => {
    if (task.dueDate) {
      const taskDueDate = new Date(task.dueDate);
      taskDueDate.setHours(0, 0, 0, 0);

      if (taskDueDate < today) {
        overdueTasks.push(task);
      } else {
        dueTodayTasks.push(task);
      }
    }
  });

  return (
    <ViewLayout
      title="Today"
      description="Tasks due today and overdue tasks"
      isLoading={isLoading}
      error={error}
      headerActions={
        <>
          <button className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
            Filter
          </button>
        </>
      }
      toolbarActions={
        <>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {sortedTasks.length} tasks due
            </span>
          </div>
        </>
      }
    >
      <div className="space-y-6">
        {/* Overdue Section */}
        {overdueTasks.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-lg shadow-sm p-4 border-l-4 border-red-400">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-3 flex items-center">
              <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
              Overdue ({overdueTasks.length})
            </h3>
            <TaskList
              tasks={overdueTasks}
              onTaskClick={onTaskClick}
              showProject={true}
              showDueDate={true}
              showOverdueIndicator={true}
            />
          </div>
        )}

        {/* Due Today Section */}
        {dueTodayTasks.length > 0 && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg shadow-sm p-4 border-l-4 border-blue-400">
            <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-3 flex items-center">
              <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
              Due Today ({dueTodayTasks.length})
            </h3>
            <TaskList
              tasks={dueTodayTasks}
              onTaskClick={onTaskClick}
              showProject={true}
              showDueDate={true}
            />
          </div>
        )}

        {/* Empty State */}
        {sortedTasks.length === 0 && !isLoading && !error && (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-gray-400 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No tasks due today
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Great job! You're all caught up.
            </p>
            <button className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600">
              View Upcoming Tasks
            </button>
          </div>
        )}
      </div>
    </ViewLayout>
  );
};
