import React, { useState, useEffect } from 'react';
import { Task, RecurringPattern, RecurringTaskConfig } from '../../types/task';
import { format, addDays, addWeeks, addMonths, addYears } from 'date-fns';
import { PriorityBadge } from '../../components/PriorityBadge';
import { StatusBadge } from '../../components/StatusBadge';
import { useRecurringTasks } from '../../hooks/useRecurringTasks';
import { recurringTaskService } from '../../services/recurringTaskService';
import { recurringPatternService } from '../../services/recurringPatternService';

interface RecurringTaskPreviewProps {
  task: Task;
  onEdit?: () => void;
  onSchedule?: () => void;
  onCompleteInstance?: (instanceId: string) => void;
  onRegenerateInstances?: () => void;
  showAdvancedStats?: boolean;
}

interface PreviewInstance {
  id: string;
  date: Date;
  isGenerated: boolean;
  status: Task['status'];
  completed: boolean;
}

const RecurringTaskPreview: React.FC<RecurringTaskPreviewProps> = ({
  task,
  onEdit,
  onSchedule,
  onCompleteInstance,
  onRegenerateInstances,
  showAdvancedStats = false
}) => {
  const [previewInstances, setPreviewInstances] = useState<PreviewInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllInstances, setShowAllInstances] = useState(false);
  const [expandedInstanceId, setExpandedInstanceId] = useState<string | null>(null);

  const { getRecurringTaskStats, completeRecurringInstance } = useRecurringTasks();

  const stats = getRecurringTaskStats(task.id);

  useEffect(() => {
    if (task.recurringPattern && task.dueDate) {
      generatePreviewInstances();
    } else {
      setPreviewInstances([]);
      setIsLoading(false);
    }
  }, [task]);

  const generatePreviewInstances = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!task.dueDate || !task.recurringPattern) {
        setPreviewInstances([]);
        setIsLoading(false);
        return;
      }

      const config = task.customFields?.recurringConfig || {
        pattern: task.recurringPattern,
        startDate: task.dueDate,
        endDate: null,
        maxOccurrences: 10,
        customInterval: 1,
        customUnit: null
      };

      // Generate instances using the service
      const instances = await recurringTaskService.generateRecurringInstances(task, config);

      // Map to preview format
      const previewData: PreviewInstance[] = instances.map(instance => ({
        id: instance.id,
        date: instance.date,
        isGenerated: instance.isGenerated,
        status: instance.status,
        completed: instance.completed
      }));

      setPreviewInstances(previewData);
    } catch (err) {
      setError('Failed to generate preview instances');
      console.error('Error generating preview:', err);
      setPreviewInstances([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getNextDate = (currentDate: Date, pattern: RecurringPattern): Date => {
    switch (pattern) {
      case 'daily':
        return addDays(currentDate, 1);
      case 'weekly':
        return addWeeks(currentDate, 1);
      case 'monthly':
        return addMonths(currentDate, 1);
      case 'yearly':
        return addYears(currentDate, 1);
      case 'custom':
      default:
        return addWeeks(currentDate, 1);
    }
  };

  const handleCompleteInstance = async (instanceId: string) => {
    try {
      if (onCompleteInstance) {
        await onCompleteInstance(instanceId);
      } else {
        await completeRecurringInstance(instanceId);
      }
      // Refresh the preview
      await generatePreviewInstances();
    } catch (error) {
      console.error('Error completing instance:', error);
    }
  };

  const handleRegenerateInstances = async () => {
    try {
      if (onRegenerateInstances) {
        await onRegenerateInstances();
      }
      // Refresh the preview
      await generatePreviewInstances();
    } catch (error) {
      console.error('Error regenerating instances:', error);
    }
  };

  const toggleInstanceExpand = (instanceId: string) => {
    setExpandedInstanceId(expandedInstanceId === instanceId ? null : instanceId);
  };

  const visibleInstances = showAllInstances ? previewInstances : previewInstances.slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        {error}
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{task.title}</h3>
          <div className="flex items-center space-x-2">
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={task.status} />
          </div>
        </div>
        <div className="flex space-x-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Edit
            </button>
          )}
          {onSchedule && (
            <button
              onClick={onSchedule}
              className="px-3 py-1 text-sm border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Manage Schedule
            </button>
          )}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-gray-700 mb-2">{task.description || 'No description'}</p>
        {task.dueDate && (
          <p className="text-sm text-gray-500">
            <strong>Due:</strong> {format(new Date(task.dueDate), 'PPP')}
            {task.dueTime && ` at ${task.dueTime}`}
          </p>
        )}
      </div>

      {/* Advanced Statistics */}
      {showAdvancedStats && stats && (
        <div className="border-t pt-4 mb-4">
          <h4 className="font-medium text-gray-900 mb-3">Recurring Task Statistics</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="bg-blue-50 p-2 rounded-md">
              <div className="text-blue-600 font-medium">Total Instances</div>
              <div className="text-gray-800">{stats.totalInstances}</div>
            </div>
            <div className="bg-green-50 p-2 rounded-md">
              <div className="text-green-600 font-medium">Completed</div>
              <div className="text-gray-800">{stats.completedInstances}</div>
            </div>
            <div className="bg-yellow-50 p-2 rounded-md">
              <div className="text-yellow-600 font-medium">Pending</div>
              <div className="text-gray-800">{stats.pendingInstances}</div>
            </div>
            {stats.nextInstanceDate && (
              <div className="bg-purple-50 p-2 rounded-md">
                <div className="text-purple-600 font-medium">Next Instance</div>
                <div className="text-gray-800">{format(new Date(stats.nextInstanceDate), 'MMM d')}</div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="border-t pt-4">
        <div className="flex justify-between items-center mb-3">
          <h4 className="font-medium text-gray-900">Upcoming Recurring Instances</h4>
          <div className="flex space-x-2">
            {previewInstances.length > 5 && (
              <button
                onClick={() => setShowAllInstances(!showAllInstances)}
                className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                {showAllInstances ? 'Show Less' : `Show All (${previewInstances.length})`}
              </button>
            )}
            <button
              onClick={handleRegenerateInstances}
              className="px-3 py-1 text-sm border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
              title="Regenerate all instances"
            >
              <svg className="w-4 h-4 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 20h5v-5M20 4h-5v5" />
              </svg>
            </button>
          </div>
        </div>

        {previewInstances.length === 0 ? (
          <div className="p-3 text-center text-gray-500 text-sm">
            This task is not recurring. It will only occur once.
          </div>
        ) : (
          <div className="space-y-2">
            {visibleInstances.map((instance) => (
              <div
                key={instance.id}
                className="border border-gray-100 rounded-md bg-gray-50"
              >
                <div className="flex items-center justify-between p-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      instance.isGenerated ? 'bg-blue-500' : 'bg-green-500'
                    }`}></div>
                    <span className="text-sm text-gray-700">
                      {format(instance.date, 'PPP')}
                    </span>
                    {instance.completed && (
                      <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        Completed
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-600">
                      {instance.isGenerated ? 'Generated' : 'Original'}
                    </span>

                    <button
                      onClick={() => toggleInstanceExpand(instance.id)}
                      className="px-2 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50"
                      title="Expand details"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={expandedInstanceId === instance.id ? "M19 9l-7 7-7-7" : "M9 5l7 7-7 7"} />
                      </svg>
                    </button>

                    {!instance.completed && (
                      <button
                        onClick={() => handleCompleteInstance(instance.id)}
                        className="px-2 py-1 text-xs border border-green-300 text-green-600 rounded-md hover:bg-green-50"
                        title="Mark as completed"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>

                {/* Expanded Instance Details */}
                {expandedInstanceId === instance.id && (
                  <div className="p-3 bg-white border-t">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <strong>Instance ID:</strong> {instance.id}
                      </div>
                      <div>
                        <strong>Status:</strong> {instance.status}
                      </div>
                      <div>
                        <strong>Type:</strong> {instance.isGenerated ? 'Generated' : 'Original'}
                      </div>
                      <div>
                        <strong>Date:</strong> {format(instance.date, 'PPP')}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {task.recurringPattern && (
              <div className="mt-3 p-2 bg-blue-50 border border-blue-100 rounded-md text-sm">
                <p className="text-blue-700">
                  <strong>Pattern:</strong> {task.recurringPattern}
                  {task.customFields?.recurringCount && (
                    <span>, {task.customFields.recurringCount} occurrences</span>
                  )}
                  {task.customFields?.recurringEndDate && (
                    <span>, ending {format(new Date(task.customFields.recurringEndDate), 'PPP')}</span>
                  )}
                </p>

                {/* Pattern Configuration Details */}
                {task.customFields?.recurringConfig && (
                  <div className="mt-2 text-xs text-blue-600">
                    <div>
                      <strong>Interval:</strong> {task.customFields.recurringConfig.customInterval || 1}
                    </div>
                    <div>
                      <strong>Unit:</strong> {task.customFields.recurringConfig.customUnit || 'weeks'}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RecurringTaskPreview;