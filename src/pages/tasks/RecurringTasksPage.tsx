import React from "react";
import { useNavigate } from "react-router-dom";
import RecurringTaskList from "../../features/recurring/RecurringTaskList";
import { useRecurringTaskIntegration } from "../../hooks/useRecurringTaskIntegration";
import { ArrowLeftIcon, PlusIcon } from "@heroicons/react/outline";

const RecurringTasksPage: React.FC = () => {
  const navigate = useNavigate();
  const { getRecurringTasks, deleteRecurringTaskIntegrated } =
    useRecurringTaskIntegration();

  const recurringTasks = getRecurringTasks();

  const handleTaskClick = (task: any) => {
    navigate(`/tasks/${task.id}`);
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteRecurringTaskIntegrated(taskId);
    } catch (error) {
      console.error("Failed to delete recurring task:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/tasks")}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to All Tasks</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Recurring Tasks</h1>
        </div>

        <button
          onClick={() => navigate("/tasks/create")}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <PlusIcon className="w-5 h-5" />
          <span>New Recurring Task</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        {recurringTasks.length === 0 ? (
          <div className="p-6 text-center text-gray-500 border border-gray-200 rounded-lg">
            <p className="mb-2">No recurring tasks found.</p>
            <p className="text-sm">
              Create a new recurring task to get started.
            </p>
            <button
              onClick={() => navigate("/tasks/create")}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Create Recurring Task
            </button>
          </div>
        ) : (
          <RecurringTaskList
            tasks={recurringTasks}
            onTaskClick={handleTaskClick}
            onEditTask={handleTaskClick}
            onDeleteTask={handleDeleteTask}
            showCompleted={true}
          />
        )}
      </div>
    </div>
  );
};

export default RecurringTasksPage;
