import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TaskForm from '../../features/tasks/TaskForm';
import RecurringTaskForm from '../../features/recurring/RecurringTaskForm';
import { useTasks } from '../../hooks/useTasks';
import { useRecurringTaskIntegration } from '../../hooks/useRecurringTaskIntegration';
import { ArrowLeftIcon } from '@heroicons/react/outline';

const TaskCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { createTask } = useTasks();
  const { createRecurringTaskIntegrated } = useRecurringTaskIntegration();
  const [isRecurring, setIsRecurring] = useState(false);

  const handleSubmit = async (taskData: any) => {
    try {
      await createTask(taskData);
      navigate('/tasks');
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleRecurringSubmit = async (taskData: any, config: any) => {
    try {
      await createRecurringTaskIntegrated(taskData, config);
      navigate('/tasks');
    } catch (error) {
      console.error('Failed to create recurring task:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate('/tasks')}
          className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
        >
          <ArrowLeftIcon className="w-5 h-5" />
          <span>Back to Tasks</span>
        </button>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {isRecurring ? 'Create New Recurring Task' : 'Create New Task'}
            </h1>
            <div className="flex items-center space-x-2">
              <label className="flex items-center space-x-2 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={() => setIsRecurring(!isRecurring)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Make this a recurring task</span>
              </label>
            </div>
          </div>

          {isRecurring ? (
            <RecurringTaskForm
              onSubmit={handleRecurringSubmit}
              onCancel={() => navigate('/tasks')}
            />
          ) : (
            <TaskForm
              onSubmit={handleSubmit}
              onCancel={() => navigate('/tasks')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskCreatePage;