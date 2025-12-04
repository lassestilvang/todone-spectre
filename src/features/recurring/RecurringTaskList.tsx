import React, { useState, useMemo, useCallback } from 'react';
import { Task, RecurringPattern, TaskStatus } from '../../types/task';
import { format } from 'date-fns';
import { PriorityBadge } from '../../components/PriorityBadge';
import { StatusBadge } from '../../components/StatusBadge';
import { useRecurringTasks } from '../../hooks/useRecurringTasks';
import { recurringTaskService } from '../../services/recurringTaskService';

interface RecurringTaskListProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => void;
  onPauseTask?: (taskId: string) => void;
  onResumeTask?: (taskId: string) => void;
  onGenerateNextInstance?: (taskId: string) => void;
  showCompleted?: boolean;
}

const RecurringTaskList: React.FC<RecurringTaskListProps> = ({
  tasks,
  onTaskClick,
  onEditTask,
  onDeleteTask,
  onPauseTask,
  onResumeTask,
  onGenerateNextInstance,
  showCompleted = true
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPattern, setFilterPattern] = useState<'all' | 'recurring' | 'non-recurring'>('all');
  const [filterStatus, setFilterStatus] = useState<TaskStatus | 'all'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'priority' | 'status'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [bulkSelectMode, setBulkSelectMode] = useState(false);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

  const {
    getRecurringTaskStats,
    pauseRecurringTask,
    resumeRecurringTask,
    generateNextInstance
  } = useRecurringTasks();

  const filteredTasks = useMemo(() => {
    return tasks
      .filter(task => {
        // Filter by search query
        const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

        // Filter by recurring pattern
        const hasRecurringPattern = !!task.recurringPattern;
        const matchesPattern =
          filterPattern === 'all' ||
          (filterPattern === 'recurring' && hasRecurringPattern) ||
          (filterPattern === 'non-recurring' && !hasRecurringPattern);

        // Filter by status
        const matchesStatus = filterStatus === 'all' || task.status === filterStatus;

        // Filter by completion status
        const matchesCompletion = showCompleted || !task.completed;

        return matchesSearch && matchesPattern && matchesStatus && matchesCompletion;
      })
      .sort((a, b) => {
        let comparison = 0;

        switch (sortBy) {
          case 'title':
            comparison = a.title.localeCompare(b.title);
            break;
          case 'priority':
            // Convert priority to numerical value for comparison
            const priorityOrder: Record<string, number> = { P1: 1, P2: 2, P3: 3, P4: 4 };
            comparison = (priorityOrder[a.priority] || 999) - (priorityOrder[b.priority] || 999);
            break;
          case 'status':
            const statusOrder: Record<string, number> = {
              'in-progress': 1,
              'active': 2,
              'pending': 3,
              'completed': 4,
              'archived': 5
            };
            comparison = (statusOrder[a.status] || 999) - (statusOrder[b.status] || 999);
            break;
          case 'date':
          default:
            const dateA = a.dueDate ? new Date(a.dueDate).getTime() : 0;
            const dateB = b.dueDate ? new Date(b.dueDate).getTime() : 0;
            comparison = dateA - dateB;
            break;
        }

        return sortDirection === 'asc' ? comparison : -comparison;
      });
  }, [tasks, searchQuery, filterPattern, filterStatus, showCompleted, sortBy, sortDirection]);

  const handleSort = (field: 'date' | 'title' | 'priority' | 'status') => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortDirection('asc');
    }
  };

  const getSortIndicator = (field: 'date' | 'title' | 'priority' | 'status') => {
    if (sortBy !== field) return null;
    return sortDirection === 'asc' ? '↑' : '↓';
  };

  const handleTaskSelect = (taskId: string) => {
    if (bulkSelectMode) {
      if (selectedTaskIds.includes(taskId)) {
        setSelectedTaskIds(selectedTaskIds.filter(id => id !== taskId));
      } else {
        setSelectedTaskIds([...selectedTaskIds, taskId]);
      }
    } else {
      setSelectedTaskId(taskId);
    }
  };

  const toggleBulkSelectMode = () => {
    setBulkSelectMode(!bulkSelectMode);
    if (bulkSelectMode) {
      setSelectedTaskIds([]);
    }
  };

  const selectAllTasks = () => {
    setSelectedTaskIds(filteredTasks.map(task => task.id));
  };

  const deselectAllTasks = () => {
    setSelectedTaskIds([]);
  };

  const toggleTaskExpand = (taskId: string) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };

  const handlePauseTask = async (taskId: string) => {
    try {
      await pauseRecurringTask(taskId);
      // Refresh the list or show success message
    } catch (error) {
      console.error('Error pausing task:', error);
    }
  };

  const handleResumeTask = async (taskId: string) => {
    try {
      await resumeRecurringTask(taskId);
      // Refresh the list or show success message
    } catch (error) {
      console.error('Error resuming task:', error);
    }
  };

  const handleGenerateNextInstance = async (taskId: string) => {
    try {
      await generateNextInstance(taskId);
      // Refresh the list or show success message
    } catch (error) {
      console.error('Error generating next instance:', error);
    }
  };

  const handleBulkAction = async (action: 'pause' | 'resume' | 'delete') => {
    if (selectedTaskIds.length === 0) return;

    try {
      for (const taskId of selectedTaskIds) {
        switch (action) {
          case 'pause':
            await pauseRecurringTask(taskId);
            break;
          case 'resume':
            await resumeRecurringTask(taskId);
            break;
          case 'delete':
            if (onDeleteTask) {
              await onDeleteTask(taskId);
            }
            break;
        }
      }

      // Clear selection and exit bulk mode
      setSelectedTaskIds([]);
      setBulkSelectMode(false);

    } catch (error) {
      console.error(`Error performing bulk ${action} action:`, error);
    }
  };

  const getTaskStats = (taskId: string) => {
    return getRecurringTaskStats(taskId);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center space-y-2 md:space-y-0">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold text-gray-900">Recurring Tasks</h2>
          {bulkSelectMode && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedTaskIds.length} selected
              </span>
              <button
                onClick={() => handleBulkAction('pause')}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Pause Selected
              </button>
              <button
                onClick={() => handleBulkAction('resume')}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Resume Selected
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded-md hover:bg-red-50"
              >
                Delete Selected
              </button>
              <button
                onClick={deselectAllTasks}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Clear Selection
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />

          <select
            value={filterPattern}
            onChange={(e) => setFilterPattern(e.target.value as 'all' | 'recurring' | 'non-recurring')}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Tasks</option>
            <option value="recurring">Recurring Only</option>
            <option value="non-recurring">Non-Recurring</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as TaskStatus | 'all')}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="in-progress">In Progress</option>
            <option value="pending">Pending</option>
            <option value="archived">Archived</option>
          </select>

          <button
            onClick={toggleBulkSelectMode}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            {bulkSelectMode ? 'Exit Bulk Mode' : 'Bulk Actions'}
          </button>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        <div className="p-6 text-center text-gray-500 border border-gray-200 rounded-lg">
          <p className="mb-2">No recurring tasks found.</p>
          <p className="text-sm">Create a new recurring task to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="hidden md:grid grid-cols-12 gap-4 px-2 py-2 bg-gray-50 rounded-md text-sm font-medium text-gray-600 border-b">
            <div className="col-span-1">
              {bulkSelectMode && (
                <input
                  type="checkbox"
                  checked={selectedTaskIds.length === filteredTasks.length && filteredTasks.length > 0}
                  onChange={(e) => e.target.checked ? selectAllTasks() : deselectAllTasks()}
                  className="mt-1"
                />
              )}
            </div>
            <div className="col-span-3 cursor-pointer" onClick={() => handleSort('title')}>
              Title {getSortIndicator('title')}
            </div>
            <div className="col-span-2 cursor-pointer" onClick={() => handleSort('priority')}>
              Priority {getSortIndicator('priority')}
            </div>
            <div className="col-span-2 cursor-pointer" onClick={() => handleSort('date')}>
              Due Date {getSortIndicator('date')}
            </div>
            <div className="col-span-2 cursor-pointer" onClick={() => handleSort('status')}>
              Status {getSortIndicator('status')}
            </div>
            <div className="col-span-2">Pattern</div>
          </div>

          <div className="space-y-2">
            {filteredTasks.map((task) => {
              const stats = getTaskStats(task.id);
              const isSelected = selectedTaskIds.includes(task.id);
              const isPaused = task.customFields?.isPaused;

              return (
                <div
                  key={task.id}
                  className={`border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow ${
                    task.completed ? 'bg-gray-50 opacity-75' : 'bg-white'
                  } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                >
                  <div className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-1">
                      {bulkSelectMode ? (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleTaskSelect(task.id)}
                          className="mt-1"
                        />
                      ) : (
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => {}}
                          className="mt-1"
                          disabled
                        />
                      )}
                    </div>

                    <div className="col-span-11 md:col-span-3">
                      <div className="flex items-start space-x-2">
                        <div>
                          <h3
                            className={`font-medium ${
                              task.completed ? 'line-through text-gray-500' : 'text-gray-900'
                            }`}
                            onClick={() => onTaskClick?.(task)}
                          >
                            {task.title}
                          </h3>
                          {task.recurringPattern && (
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                {task.recurringPattern}
                              </span>
                              {task.customFields?.recurringCount && (
                                <span className="text-xs text-gray-500">
                                  ×{task.customFields.recurringCount}
                                </span>
                              )}
                              {isPaused && (
                                <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                                  Paused
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="col-span-6 md:col-span-2">
                      <PriorityBadge priority={task.priority} />
                    </div>

                    <div className="col-span-6 md:col-span-2">
                      <div className="text-sm text-gray-600">
                        {task.dueDate ? format(new Date(task.dueDate), 'PPP') : 'No due date'}
                        {task.dueTime && (
                          <span className="block text-xs text-gray-500">at {task.dueTime}</span>
                        )}
                      </div>
                    </div>

                    <div className="col-span-6 md:col-span-2">
                      <StatusBadge status={task.status} />
                    </div>

                    <div className="col-span-6 md:col-span-2">
                      {task.recurringPattern ? (
                        <div className="text-sm text-blue-600">
                          {task.recurringPattern}
                          {stats && (
                            <div className="text-xs text-gray-500">
                              {stats.completedInstances}/{stats.totalInstances} completed
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Single Task</span>
                      )}
                    </div>

                    <div className="col-span-12 md:col-span-2 flex justify-end space-x-2">
                      <button
                        onClick={() => toggleTaskExpand(task.id)}
                        className="px-2 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50"
                        title="Expand details"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={expandedTaskId === task.id ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"} />
                        </svg>
                      </button>

                      {onEditTask && (
                        <button
                          onClick={() => onEditTask(task)}
                          className="px-2 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50"
                          title="Edit task"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                      )}

                      {onDeleteTask && (
                        <button
                          onClick={() => onDeleteTask(task.id)}
                          className="px-2 py-1 text-xs border border-red-300 text-red-600 rounded-md hover:bg-red-50"
                          title="Delete task"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}

                      {task.recurringPattern && !isPaused && (
                        <button
                          onClick={() => handlePauseTask(task.id)}
                          className="px-2 py-1 text-xs border border-yellow-300 text-yellow-600 rounded-md hover:bg-yellow-50"
                          title="Pause recurring task"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </button>
                      )}

                      {task.recurringPattern && isPaused && (
                        <button
                          onClick={() => handleResumeTask(task.id)}
                          className="px-2 py-1 text-xs border border-green-300 text-green-600 rounded-md hover:bg-green-50"
                          title="Resume recurring task"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7-7m0 0l-7 7m7-7v18" />
                          </svg>
                        </button>
                      )}

                      {task.recurringPattern && (
                        <button
                          onClick={() => handleGenerateNextInstance(task.id)}
                          className="px-2 py-1 text-xs border border-blue-300 text-blue-600 rounded-md hover:bg-blue-50"
                          title="Generate next instance"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4l8 8-8 8" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedTaskId === task.id && (
                    <div className="col-span-12 mt-3 p-3 bg-gray-50 rounded-md">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div>
                          <strong>Status:</strong> {task.status}
                        </div>
                        <div>
                          <strong>Priority:</strong> {task.priority}
                        </div>
                        <div>
                          <strong>Created:</strong> {task.createdAt ? format(new Date(task.createdAt), 'PPP') : 'Unknown'}
                        </div>
                        <div>
                          <strong>Updated:</strong> {task.updatedAt ? format(new Date(task.updatedAt), 'PPP') : 'Unknown'}
                        </div>
                        {stats && (
                          <>
                            <div>
                              <strong>Total Instances:</strong> {stats.totalInstances}
                            </div>
                            <div>
                              <strong>Completed:</strong> {stats.completedInstances}
                            </div>
                            <div>
                              <strong>Pending:</strong> {stats.pendingInstances}
                            </div>
                            {stats.nextInstanceDate && (
                              <div>
                                <strong>Next Instance:</strong> {format(new Date(stats.nextInstanceDate), 'PPP')}
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      {task.description && (
                        <div className="mt-3 text-sm text-gray-600">
                          <strong>Description:</strong> {task.description}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecurringTaskList;