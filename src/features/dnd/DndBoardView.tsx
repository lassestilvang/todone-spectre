import React from 'react';
import { Task } from '../../types/task';
import { ViewHeader } from '../views/ViewHeader';
import { ViewToolbar } from '../views/ViewToolbar';
import { ViewFilterControls } from '../views/ViewFilterControls';
import { ViewSortControls } from '../views/ViewSortControls';
import { DraggableTaskItem } from './DraggableTaskItem';
import { BoardColumn } from './BoardColumn';
import { DragAndDropProvider } from './DragAndDropProvider';
import { DragPreview } from './DragPreview';

interface DndBoardViewProps {
  tasks: Task[];
  columns?: string[];
  onTaskClick?: (task: Task) => void;
  onTaskToggleCompletion?: (taskId: string) => Promise<void>;
  onTaskDelete?: (taskId: string) => Promise<void>;
}

export const DndBoardView: React.FC<DndBoardViewProps> = ({
  tasks,
  columns = ['To Do', 'In Progress', 'Done'],
  onTaskClick,
  onTaskToggleCompletion,
  onTaskDelete,
}) => {
  // Group tasks by status for board columns
  const groupedTasks = columns.reduce((acc, column) => {
    const statusKey = column.toLowerCase().replace(' ', '_') as Task['status'];
    acc[column] = tasks.filter(task => task.status === statusKey);
    return acc;
  }, {} as Record<string, Task[]>);

  const handleColumnDrop = (columnId: string) => {
    console.log(`Task dropped in column: ${columnId}`);
  };

  return (
    <DragAndDropProvider>
      <div className="dnd-board-view">
        <ViewHeader title="Board View" />
        <ViewToolbar>
          <ViewFilterControls />
          <ViewSortControls />
        </ViewToolbar>

        <div className="dnd-board-view-content">
          <div className="dnd-board-columns flex space-x-4 overflow-x-auto pb-4">
            {columns.map((column) => (
              <BoardColumn
                key={column}
                columnId={column.toLowerCase().replace(' ', '-')}
                title={column}
                onDrop={handleColumnDrop}
              >
                {groupedTasks[column].length === 0 ? (
                  <div className="empty-column text-gray-400 text-sm">No tasks in this column</div>
                ) : (
                  groupedTasks[column].map((task) => (
                    <DraggableTaskItem
                      key={task.id}
                      task={task}
                      onToggleCompletion={onTaskToggleCompletion}
                      onDelete={onTaskDelete}
                      onClick={onTaskClick}
                      source="board"
                    />
                  ))
                )}
              </BoardColumn>
            ))}
          </div>
        </div>

        <DragPreview />
      </div>
    </DragAndDropProvider>
  );
};