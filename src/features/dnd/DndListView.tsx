import React from 'react';
import { Task } from '../../types/task';
import { ViewHeader } from '../views/ViewHeader';
import { ViewToolbar } from '../views/ViewToolbar';
import { ViewFilterControls } from '../views/ViewFilterControls';
import { ViewSortControls } from '../views/ViewSortControls';
import { DraggableTaskItem } from './DraggableTaskItem';
import { DroppableTaskList } from './DroppableTaskList';
import { DragAndDropProvider } from './DragAndDropProvider';
import { DragPreview } from './DragPreview';

interface DndListViewProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onTaskToggleCompletion?: (taskId: string) => Promise<void>;
  onTaskDelete?: (taskId: string) => Promise<void>;
}

export const DndListView: React.FC<DndListViewProps> = ({
  tasks,
  onTaskClick,
  onTaskToggleCompletion,
  onTaskDelete,
}) => {
  return (
    <DragAndDropProvider>
      <div className="dnd-list-view">
        <ViewHeader title="List View" />
        <ViewToolbar>
          <ViewFilterControls />
          <ViewSortControls />
        </ViewToolbar>

        <div className="dnd-list-view-content">
          {tasks.length === 0 ? (
            <div className="empty-state">No tasks found</div>
          ) : (
            <DroppableTaskList id="task-list" className="dnd-task-list space-y-2">
              {tasks.map((task) => (
                <DraggableTaskItem
                  key={task.id}
                  task={task}
                  onToggleCompletion={onTaskToggleCompletion}
                  onDelete={onTaskDelete}
                  onClick={onTaskClick}
                  source="task-list"
                />
              ))}
            </DroppableTaskList>
          )}
        </div>

        <DragPreview />
      </div>
    </DragAndDropProvider>
  );
};