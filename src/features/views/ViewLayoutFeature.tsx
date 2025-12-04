import React, { useState } from 'react';
import { ViewLayout } from './ViewLayout';
import { ViewType } from '../../types/enums';
import { Task } from '../../types/task';
import { ViewTestUtils } from '../../utils/viewTestUtils';

/**
 * View Layout Feature Component
 * Demonstrates the complete view layout functionality with all three view types
 */
export const ViewLayoutFeature: React.FC = () => {
  // Generate sample tasks for demonstration
  const [tasks, setTasks] = useState<Task[]>(ViewTestUtils.generateMockTasks(15));
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.LIST);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    console.log('Task clicked:', task.title);
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === updatedTask.id ? updatedTask : task
      )
    );
    console.log('Task updated:', updatedTask.title);
  };

  const handleTaskDelete = (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.filter(task => task.id !== taskId)
    );
    console.log('Task deleted:', taskId);
  };

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
    console.log('View changed to:', view);
  };

  const addSampleTask = () => {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: `New Task ${tasks.length + 1}`,
      description: 'This is a newly added task',
      status: 'todo',
      priority: 'medium',
      dueDate: new Date(Date.now() + 86400000), // Tomorrow
      createdAt: new Date(),
      updatedAt: new Date(),
      projectId: 'demo-project',
      completed: false
    };

    setTasks([...tasks, newTask]);
  };

  return (
    <div className="view-layout-feature">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Todone View Layouts
      </h1>

      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Experience three different ways to view and manage your tasks:
      </p>

      <div className="feature-controls mb-6 flex flex-wrap gap-4 items-center">
        <div className="view-switcher-controls">
          <button
            onClick={() => handleViewChange(ViewType.LIST)}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              currentView === ViewType.LIST
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📋 List View
          </button>

          <button
            onClick={() => handleViewChange(ViewType.BOARD)}
            className={`px-4 py-2 rounded-md text-sm font-medium ml-2 ${
              currentView === ViewType.BOARD
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📊 Board View
          </button>

          <button
            onClick={() => handleViewChange(ViewType.CALENDAR)}
            className={`px-4 py-2 rounded-md text-sm font-medium ml-2 ${
              currentView === ViewType.CALENDAR
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📅 Calendar View
          </button>
        </div>

        <button
          onClick={addSampleTask}
          className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700"
        >
          + Add Sample Task
        </button>
      </div>

      <div className="feature-description mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        {currentView === ViewType.LIST && (
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">List View Features:</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Tasks displayed in a vertical list</li>
              <li>• Grouping by project, priority, status, or due date</li>
              <li>• Sorting by due date, priority, or title</li>
              <li>• Filtering by status, priority, and search</li>
              <li>• Compact task display with key information</li>
            </ul>
          </div>
        )}

        {currentView === ViewType.BOARD && (
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Board View Features:</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Kanban-style columns for different statuses</li>
              <li>• Drag-and-drop task movement between columns</li>
              <li>• Visual task grouping by workflow stage</li>
              <li>• Customizable column configuration</li>
              <li>• Task count display per column</li>
            </ul>
          </div>
        )}

        {currentView === ViewType.CALENDAR && (
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Calendar View Features:</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
              <li>• Week-based task visualization</li>
              <li>• Tasks grouped by due dates</li>
              <li>• Navigation between weeks/months</li>
              <li>• Day, week, and month view modes</li>
              <li>• Weekend display toggle</li>
            </ul>
          </div>
        )}
      </div>

      <div className="view-layout-container">
        <ViewLayout
          initialView={currentView}
          tasks={tasks}
          onTaskClick={handleTaskClick}
          onTaskUpdate={handleTaskUpdate}
          onTaskDelete={handleTaskDelete}
        />
      </div>

      {selectedTask && (
        <div className="selected-task-info mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Selected Task:</h3>
          <div className="task-details">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{selectedTask.title}</p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {selectedTask.description}
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">
                {selectedTask.priority} priority
              </span>
              <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">
                {selectedTask.status}
              </span>
              {selectedTask.dueDate && (
                <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 rounded">
                  Due: {new Date(selectedTask.dueDate).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};