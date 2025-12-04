import React, { useState } from 'react';
import { Task } from '../../types/task';
import { DndListView, DndBoardView } from './';
import { createMockTasks } from '../../utils/dndTestUtils';

interface DndFeatureDemoProps {
  initialTasks?: Task[];
}

export const DndFeatureDemo: React.FC<DndFeatureDemoProps> = ({
  initialTasks = createMockTasks(10)
}) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [viewMode, setViewMode] = useState<'list' | 'board'>('list');

  const handleTaskToggleCompletion = async (taskId: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? { ...task, completed: !task.completed, updatedAt: new Date() }
          : task
      )
    );
  };

  const handleTaskDelete = async (taskId: string) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  const handleTaskClick = (task: Task) => {
    console.log('Task clicked:', task.title);
  };

  return (
    <div className="dnd-feature-demo">
      <div className="demo-controls mb-4 flex space-x-4">
        <button
          onClick={() => setViewMode('list')}
          className={`px-4 py-2 rounded ${viewMode === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          List View
        </button>
        <button
          onClick={() => setViewMode('board')}
          className={`px-4 py-2 rounded ${viewMode === 'board' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Board View
        </button>
      </div>

      <div className="demo-info mb-4 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-2">Drag and Drop Features:</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>✅ Task reordering within lists</li>
          <li>✅ Task moving between columns (board view)</li>
          <li>✅ Visual drag preview with task information</li>
          <li>✅ Drag-and-drop state management</li>
          <li>✅ Customizable drag sources and drop targets</li>
          <li>✅ Integration with existing task components</li>
        </ul>
      </div>

      {viewMode === 'list' ? (
        <DndListView
          tasks={tasks}
          onTaskToggleCompletion={handleTaskToggleCompletion}
          onTaskDelete={handleTaskDelete}
          onTaskClick={handleTaskClick}
        />
      ) : (
        <DndBoardView
          tasks={tasks}
          onTaskToggleCompletion={handleTaskToggleCompletion}
          onTaskDelete={handleTaskDelete}
          onTaskClick={handleTaskClick}
        />
      )}
    </div>
  );
};