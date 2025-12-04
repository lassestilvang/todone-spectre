import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TaskDetail from '../../features/tasks/TaskDetail';
import TaskForm from '../../features/tasks/TaskForm';
import RecurringTaskForm from '../../features/recurring/RecurringTaskForm';
import RecurringTaskPreview from '../../features/recurring/RecurringTaskPreview';
import { useTask } from '../../hooks/useTasks';
import { useRecurringTaskIntegration } from '../../hooks/useRecurringTaskIntegration';
import { ArrowLeftIcon, PencilIcon } from '@heroicons/react/outline';

const TaskDetailPage: React.FC = () => {
  const { taskId } = useParams<{ taskId: string }>();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const { task, isLoading, error, refetch } = useTask(taskId);
  const { updateRecurringTaskIntegrated } = useRecurringTaskIntegration();

  const handleEdit = async (taskData: any) => {
    try {
      if (taskId) {
        await useTasks().updateTask(taskId, taskData);
        setIsEditing(false);
        refetch();
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const handleRecurringEdit = async (taskData: any, config: any) => {
    try {
      if (taskId) {
        await updateRecurringTaskIntegrated(taskId, taskData, config);
        setIsEditing(false);
        refetch();
      }
    } catch (error) {
      console.error('Failed to update recurring task:', error);
    }
  };

  const handleDelete = async () => {
    try {
      if (taskId) {
        await useTasks().deleteTask(taskId);
        navigate('/tasks');
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/tasks')}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to Tasks</span>
          </button>
        </div>

        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/tasks')}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to Tasks</span>
          </button>
        </div>

        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Error loading task: {error}
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/tasks')}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to Tasks</span>
          </button>
        </div>

        <div className="p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          Task not found
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/tasks')}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back to Tasks</span>
        </button>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PencilIcon className="w-5 h-5" />
            <span>Edit Task</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Edit Task</h2>
          {task.recurringPattern ? (
            <RecurringTaskForm
              task={task}
              onSubmit={handleRecurringEdit}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <TaskForm
              task={task}
              onSubmit={handleEdit}
              onCancel={() => setIsEditing(false)}
            />
          )}
        </div>
      ) : task.recurringPattern ? (
        <RecurringTaskPreview
          task={task}
          onEdit={() => setIsEditing(true)}
          onSchedule={() => navigate(`/tasks/${taskId}/schedule`)}
          showAdvancedStats={true}
        />
      ) : (
        <TaskDetail
          task={task}
          onEdit={() => setIsEditing(true)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default TaskDetailPage;