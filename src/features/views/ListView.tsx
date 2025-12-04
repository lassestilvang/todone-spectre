import React from 'react';
import { Task } from '../../types/task';
import { ViewHeader } from './ViewHeader';
import { ViewToolbar } from './ViewToolbar';
import { TaskItem } from '../../features/tasks/TaskItem';
import { ViewFilterControls } from './ViewFilterControls';
import { ViewSortControls } from './ViewSortControls';

interface ListViewProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onTaskUpdate?: (task: Task) => void;
  onTaskDelete?: (taskId: string) => void;
}

export const ListView: React.FC<ListViewProps> = ({
  tasks,
  onTaskClick,
  onTaskUpdate,
  onTaskDelete,
}) => {
  return (
    <div className="list-view">
      <ViewHeader title="List View" />
      <ViewToolbar>
        <ViewFilterControls />
        <ViewSortControls />
      </ViewToolbar>

      <div className="list-view-content">
        {tasks.length === 0 ? (
          <div className="empty-state">No tasks found</div>
        ) : (
          <div className="task-list">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onClick={() => onTaskClick?.(task)}
                onUpdate={() => onTaskUpdate?.(task)}
                onDelete={() => onTaskDelete?.(task.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};