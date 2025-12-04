import React from 'react';
import { ViewLayout } from './ViewLayout';
import { Task, TaskStatus } from '../../types/task';
import { TaskList } from '../tasks/TaskList';
import { useTasks } from '../../hooks/useTasks';

interface InboxViewProps {
  projectId?: string;
  onTaskClick?: (taskId: string) => void;
}

export const InboxView: React.FC<InboxViewProps> = ({ projectId, onTaskClick }) => {
  const {
    tasks,
    isLoading,
    error,
    getProcessedTasks,
    filterByStatus,
    sortTasks
  } = useTasks(projectId);

  // Filter tasks for inbox view (show all non-completed tasks)
  const inboxTasks = getProcessedTasks().filter(task => !task.completed);

  // Sort by priority (highest first) and due date
  const sortedTasks = [...inboxTasks].sort((a, b) => {
    // First by priority (critical, high, medium, low)
    const priorityOrder: Record<string, number> = {
      'critical': 1,
      'high': 2,
      'medium': 3,
      'low': 4
    };

    const priorityCompare = (priorityOrder[a.priority] || 5) - (priorityOrder[b.priority] || 5);
    if (priorityCompare !== 0) return priorityCompare;

    // Then by due date (earlier dates first)
    const aDueDate = a.dueDate?.getTime() || Number.MAX_SAFE_INTEGER;
    const bDueDate = b.dueDate?.getTime() || Number.MAX_SAFE_INTEGER;
    return aDueDate - bDueDate;
  });

  // Group tasks by status for better organization
  const tasksByStatus: Record<TaskStatus, Task[]> = {
    'todo': [],
    'in-progress': [],
    'completed': [],
    'archived': []
  };

  sortedTasks.forEach(task => {
    tasksByStatus[task.status].push(task);
  });

  return (
    <ViewLayout
      title="Inbox"
      description="All your active tasks in one place"
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
              {sortedTasks.length} tasks
            </span>
            <button className="px-3 py-1 text-sm bg-primary-500 text-white rounded-md hover:bg-primary-600">
              New Task
            </button>
          </div>
        </>
      }
    >
      <div className="space-y-6">
        {/* Todo Section */}
        {tasksByStatus['todo'].length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
              To Do ({tasksByStatus['todo'].length})
            </h3>
            <TaskList
              tasks={tasksByStatus['todo']}
              onTaskClick={onTaskClick}
              showProject={true}
              showDueDate={true}
            />
          </div>
        )}

        {/* In Progress Section */}
        {tasksByStatus['in-progress'].length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
              <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
              In Progress ({tasksByStatus['in-progress'].length})
            </h3>
            <TaskList
              tasks={tasksByStatus['in-progress']}
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
              <svg className="w-8 h-8 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks in your inbox</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Start by creating a new task</p>
            <button className="px-4 py-2 bg-primary-500 text-white rounded-md hover:bg-primary-600">
              Create Task
            </button>
          </div>
        )}
      </div>
    </ViewLayout>
  );
};