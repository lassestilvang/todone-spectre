import React from 'react';
import { Task } from '../../types/task';
import { ViewHeader } from './ViewHeader';
import { ViewToolbar } from './ViewToolbar';
import { ViewFilterControls } from './ViewFilterControls';
import { ViewSortControls } from './ViewSortControls';
import { TaskItem } from '../../features/tasks/TaskItem';

interface BoardViewProps {
  tasks: Task[];
  columns?: string[];
  onTaskClick?: (task: Task) => void;
  onTaskUpdate?: (task: Task) => void;
  onTaskDelete?: (taskId: string) => void;
}

export const BoardView: React.FC<BoardViewProps> = ({
  tasks,
  columns = ['To Do', 'In Progress', 'Done'],
  onTaskClick,
  onTaskUpdate,
  onTaskDelete,
}) => {
  // Group tasks by status for board columns
  const groupedTasks = columns.reduce((acc, column) => {
    acc[column] = tasks.filter(task => task.status === column.toLowerCase().replace(' ', '_'));
    return acc;
  }, {} as Record<string, Task[]>);

  return (
    <div className="board-view">
      <ViewHeader title="Board View" />
      <ViewToolbar>
        <ViewFilterControls />
        <ViewSortControls />
      </ViewToolbar>

      <div className="board-view-content">
        <div className="board-columns">
          {columns.map((column) => (
            <div key={column} className="board-column">
              <h3 className="column-header">{column}</h3>
              <div className="column-content">
                {groupedTasks[column].length === 0 ? (
                  <div className="empty-column">No tasks in this column</div>
                ) : (
                  groupedTasks[column].map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      onClick={() => onTaskClick?.(task)}
                      onUpdate={() => onTaskUpdate?.(task)}
                      onDelete={() => onTaskDelete?.(task.id)}
                      draggable
                    />
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};