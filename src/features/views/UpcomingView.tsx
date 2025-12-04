import React from 'react';
import { ViewLayout } from './ViewLayout';
import { Task } from '../../types/task';
import { TaskList } from '../tasks/TaskList';
import { useTasks } from '../../hooks/useTasks';
import { isFutureDate } from '../../utils/dateUtils';

interface UpcomingViewProps {
  projectId?: string;
  onTaskClick?: (taskId: string) => void;
}

export const UpcomingView: React.FC<UpcomingViewProps> = ({ projectId, onTaskClick }) => {
  const {
    tasks,
    isLoading,
    error,
    getProcessedTasks
  } = useTasks(projectId);

  // Get today's date for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter tasks for upcoming view (due in the future, not completed)
  const upcomingTasks = getProcessedTasks().filter(task => {
    if (!task.dueDate || task.completed) return false;

    const taskDueDate = new Date(task.dueDate);
    taskDueDate.setHours(0, 0, 0, 0);

    return taskDueDate > today;
  });

  // Sort by due date (earliest first) and then by priority
  const sortedTasks = [...upcomingTasks].sort((a, b) => {
    // First by due date (earlier dates first)
    const aDueDate = a.dueDate?.getTime() || Number.MAX_SAFE_INTEGER;
    const bDueDate = b.dueDate?.getTime() || Number.MAX_SAFE_INTEGER;
    const dateCompare = aDueDate - bDueDate;

    if (dateCompare !== 0) return dateCompare;

    // Then by priority (critical, high, medium, low)
    const priorityOrder: Record<string, number> = {
      'critical': 1,
      'high': 2,
      'medium': 3,
      'low': 4
    };

    return (priorityOrder[a.priority] || 5) - (priorityOrder[b.priority] || 5);
  });

  // Group tasks by time period
  const tasksByWeek: Record<string, Task[]> = {};
  const tasksByMonth: Record<string, Task[]> = {};

  sortedTasks.forEach(task => {
    if (task.dueDate) {
      const taskDueDate = new Date(task.dueDate);
      const todayCopy = new Date(today);
      const oneWeekLater = new Date(todayCopy);
      oneWeekLater.setDate(todayCopy.getDate() + 7);

      // Tasks due within the next week
      if (taskDueDate <= oneWeekLater) {
        const weekKey = `Week of ${taskDueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        if (!tasksByWeek[weekKey]) {
          tasksByWeek[weekKey] = [];
        }
        tasksByWeek[weekKey].push(task);
      } else {
        // Tasks due in the future (grouped by month)
        const monthKey = taskDueDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        if (!tasksByMonth[monthKey]) {
          tasksByMonth[monthKey] = [];
        }
        tasksByMonth[monthKey].push(task);
      }
    }
  });

  return (
    <ViewLayout
      title="Upcoming"
      description="Tasks scheduled for the future"
      isLoading={isLoading}
      error={error}
      headerActions={
        <>
          <button className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
            Filter
          </button>
          <button className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600">
            Sort
          </button>
        </>
      }
      toolbarActions={
        <>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
              {sortedTasks.length} upcoming tasks
            </span>
            <button className="px-3 py-1 text-sm bg-primary-500 text-white rounded-md hover:bg-primary-600">
              New Task
            </button>
          </div>
        </>
      }
    >
      <div className="space-y-6">
        {/* Next Week Section */}
        {Object.entries(tasksByWeek).length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Next Week</h3>
            {Object.entries(tasksByWeek).map(([weekKey, weekTasks]) => (
              <div key={weekKey} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                <h4 className="text-md font-medium text-gray-700 dark:text-gray-200 mb-2">{weekKey}</h4>
                <TaskList
                  tasks={weekTasks}
                  onTaskClick={onTaskClick}
                  showProject={true}
                  showDueDate={true}
                />
              </div>
            ))}
          </div>
        )}

        {/* Future Months Section */}
        {Object.entries(tasksByMonth).length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Future</h3>
            {Object.entries(tasksByMonth).map(([monthKey, monthTasks]) => (
              <div key={monthKey} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
                <h4 className="text-md font-medium text-gray-700 dark:text-gray-200 mb-2">{monthKey}</h4>
                <TaskList
                  tasks={monthTasks}
                  onTaskClick={onTaskClick}
                  showProject={true}
                  showDueDate={true}
                />
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {sortedTasks.length === 0 && !isLoading && !error && (
          <div className="text-center py-12">
            <div className="mx-auto w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No upcoming tasks</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Plan ahead by scheduling future tasks</p>
            <button className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600">
              Create Upcoming Task
            </button>
          </div>
        )}
      </div>
    </ViewLayout>
  );
};