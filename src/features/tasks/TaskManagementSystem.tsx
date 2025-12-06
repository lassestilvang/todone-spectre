// @ts-nocheck
import React from "react";
import { useNavigate } from "react-router-dom";
import TaskList from "./TaskList";
import RecurringTaskList from "../recurring/RecurringTaskList";
import { useTasks } from "../../hooks/useTasks";
import { useRecurringTaskIntegration } from "../../hooks/useRecurringTaskIntegration";
import {
  PlusIcon,
  ArrowRightIcon,
  CalendarIcon,
} from "@heroicons/react/outline";

interface TaskManagementSystemProps {
  showRecurringTasks?: boolean;
  projectId?: string;
}

const TaskManagementSystem: React.FC<TaskManagementSystemProps> = ({
  showRecurringTasks = true,
  projectId,
}) => {
  const navigate = useNavigate();
  const { getProcessedTasks, deleteTask } = useTasks(projectId);
  const { getRecurringTasks, deleteRecurringTaskIntegrated } =
    useRecurringTaskIntegration();

  const regularTasks = getProcessedTasks();
  const recurringTasks = getRecurringTasks();

  const handleTaskClick = (task: any) => {
    navigate(`/tasks/${task.id}`);
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const handleDeleteRecurringTask = async (taskId: string) => {
    try {
      await deleteRecurringTaskIntegrated(taskId);
    } catch (error) {
      console.error("Failed to delete recurring task:", error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Task Creation Section */}
      <div className="flex flex-wrap gap-3 justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Task Management</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate("/tasks/create")}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 text-sm"
          >
            <PlusIcon className="w-4 h-4" />
            <span>New Task</span>
          </button>
          <button
            onClick={() => navigate("/tasks/recurring")}
            className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 text-sm"
          >
            <CalendarIcon className="w-4 h-4" />
            <span>Recurring Tasks</span>
          </button>
        </div>
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-blue-600 font-medium text-sm">Regular Tasks</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {regularTasks.length}
          </div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="text-purple-600 font-medium text-sm">
            Recurring Tasks
          </div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {recurringTasks.length}
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-green-600 font-medium text-sm">Total Tasks</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {regularTasks.length + recurringTasks.length}
          </div>
        </div>
      </div>

      {/* Regular Tasks Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Regular Tasks</h3>
          {recurringTasks.length > 0 && (
            <button
              onClick={() => navigate("/tasks/recurring")}
              className="flex items-center space-x-2 text-sm text-purple-600 hover:text-purple-800"
            >
              <span>View All Recurring Tasks</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          )}
        </div>

        {regularTasks.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <p>No regular tasks found.</p>
          </div>
        ) : (
          <TaskList
            projectId={projectId}
            showCompleted={true}
            onTaskClick={handleTaskClick}
            showRecurringTasks={false}
          />
        )}
      </div>

      {/* Recurring Tasks Section (if enabled) */}
      {showRecurringTasks && recurringTasks.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Recurring Tasks
            </h3>
            <button
              onClick={() => navigate("/tasks/recurring")}
              className="flex items-center space-x-2 text-sm text-purple-600 hover:text-purple-800"
            >
              <span>View All Recurring Tasks</span>
              <ArrowRightIcon className="w-4 h-4" />
            </button>
          </div>

          <RecurringTaskList
            tasks={recurringTasks.slice(0, 5)} // Show preview of 5 recurring tasks
            onTaskClick={handleTaskClick}
            onEditTask={handleTaskClick}
            onDeleteTask={handleDeleteRecurringTask}
            showCompleted={true}
          />

          {recurringTasks.length > 5 && (
            <div className="mt-4 text-center">
              <button
                onClick={() => navigate("/tasks/recurring")}
                className="text-sm text-purple-600 hover:text-purple-800 font-medium"
              >
                View All {recurringTasks.length} Recurring Tasks
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { TaskManagementSystem };
export default TaskManagementSystem;
