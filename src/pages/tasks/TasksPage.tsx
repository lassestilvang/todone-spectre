// @ts-nocheck
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import TaskManagementSystem from "../../features/tasks/TaskManagementSystem";
import TaskForm from "../../features/tasks/TaskForm";
import { useTasks } from "../../hooks/useTasks";
import { PlusIcon, FilterIcon, SearchIcon } from "@heroicons/react/outline";

const TasksPage: React.FC = () => {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const {
    searchTasks,
    filterByStatus,
    filterByPriority,
    resetFilters,
    sortTasks: sortTasksAction,
    searchQuery,
    statusFilter,
    priorityFilter,
    sortBy,
    sortDirection,
  } = useTasks();

  const handleTaskClick = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
  };

  const handleCreateTask = async (taskData: any) => {
    try {
      await useTasks().createTask(taskData);
      setShowForm(false);
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/tasks/recurring")}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h5M20 20v-5h-5M4 20h5v-5M20 4h-5v5"
              />
            </svg>
            <span>Recurring Tasks</span>
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="w-5 h-5" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Search
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="search"
                type="text"
                value={searchQuery}
                onChange={(e) => searchTasks(e.target.value)}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search tasks..."
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="status-filter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => filterByStatus(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="todo">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="priority-filter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Priority
            </label>
            <select
              id="priority-filter"
              value={priorityFilter}
              onChange={(e) => filterByPriority(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={resetFilters}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Reset Filters
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) =>
                sortTasksAction(e.target.value as any, sortDirection)
              }
              className="px-2 py-1 text-sm border border-gray-300 rounded-md"
            >
              <option value="priority">Priority</option>
              <option value="dueDate">Due Date</option>
              <option value="createdAt">Created Date</option>
            </select>

            <select
              value={sortDirection}
              onChange={(e) =>
                sortTasksAction(sortBy, e.target.value as "asc" | "desc")
              }
              className="px-2 py-1 text-sm border border-gray-300 rounded-md"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Create New Task
          </h2>
          <TaskForm
            onSubmit={handleCreateTask}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Task Management System */}
      <TaskManagementSystem />
    </div>
  );
};

export { TasksPage };
export default TasksPage;
