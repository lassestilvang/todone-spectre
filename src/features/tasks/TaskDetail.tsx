import React from 'react';
import { Task } from '../../types/task';
import { PriorityBadge } from '../../components/PriorityBadge';
import { StatusBadge } from '../../components/StatusBadge';
import { formatDate } from '../../utils/dateUtils';
import { SubTaskList } from './SubTaskList';
import CommentFeatureImplementation from '../comments/CommentFeatureImplementation';

interface TaskDetailProps {
  task: Task;
  onEdit?: () => void;
  onDelete?: () => void;
  onClose?: () => void;
}

const TaskDetail: React.FC<TaskDetailProps> = ({
  task,
  onEdit,
  onDelete,
  onClose
}) => {
  const handleDelete = () => {
    if (onDelete && window.confirm('Are you sure you want to delete this task?')) {
      onDelete();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-semibold text-gray-900 truncate">{task.title}</h2>
          <PriorityBadge priority={task.priority} />
          <StatusBadge status={task.status} />
        </div>

        <div className="flex items-center space-x-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded-full"
              title="Edit task"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
          )}

          {onDelete && (
            <button
              onClick={handleDelete}
              className="p-1 text-red-600 hover:bg-red-50 rounded-full"
              title="Delete task"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 text-gray-600 hover:bg-gray-100 rounded-full"
              title="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      <div className="px-6 py-4">
        <div className="space-y-6">
          {task.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Description</h3>
              <p className="text-gray-700">{task.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Status</h3>
              <p className="text-gray-700 capitalize">{task.status}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Priority</h3>
              <p className="text-gray-700 capitalize">{task.priority}</p>
            </div>

            {task.dueDate && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Due Date</h3>
                <p className="text-gray-700">{formatDate(task.dueDate)}</p>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Created</h3>
              <p className="text-gray-700">{formatDate(task.createdAt)}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Last Updated</h3>
              <p className="text-gray-700">{formatDate(task.updatedAt)}</p>
            </div>

            {task.completedAt && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Completed</h3>
                <p className="text-gray-700">{formatDate(task.completedAt)}</p>
              </div>
            )}

            {task.projectId && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">Project</h3>
                <p className="text-gray-700">{task.projectId}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-6 border-t border-gray-200 pt-6">
        <CommentFeatureImplementation
          taskId={task.id}
          showNotifications={true}
          showAdvancedFeatures={true}
        />
      </div>
    </div>
  );
};

export default TaskDetail;