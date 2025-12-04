import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { useTaskStore } from '../../store/useTaskStore';
import { Task } from '../../types/task';

interface DragAndDropContextType {
  draggedTask: Task | null;
  setDraggedTask: (task: Task | null) => void;
  isDragging: boolean;
  dragSource: string | null;
  setDragSource: (source: string | null) => void;
  handleDrop: (targetId: string, position?: 'before' | 'after') => void;
  handleDragStart: (task: Task, source: string) => void;
  handleDragEnd: () => void;
}

const DragAndDropContext = createContext<DragAndDropContextType | undefined>(undefined);

export const DragAndDropProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragSource, setDragSource] = useState<string | null>(null);
  const { moveTask, reorderTask } = useTaskStore();

  const handleDragStart = useCallback((task: Task, source: string) => {
    setDraggedTask(task);
    setIsDragging(true);
    setDragSource(source);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedTask(null);
    setIsDragging(false);
    setDragSource(null);
  }, []);

  const handleDrop = useCallback((targetId: string, position: 'before' | 'after' = 'after') => {
    if (!draggedTask) return;

    if (dragSource === 'task-list' && targetId.startsWith('task-')) {
      const targetTaskId = targetId.replace('task-', '');
      reorderTask(draggedTask.id, targetTaskId, position);
    } else if (dragSource === 'board' && targetId.startsWith('column-')) {
      const columnId = targetId.replace('column-', '');
      moveTask(draggedTask.id, columnId);
    }

    handleDragEnd();
  }, [draggedTask, dragSource, reorderTask, moveTask, handleDragEnd]);

  return (
    <DragAndDropContext.Provider value={{
      draggedTask,
      setDraggedTask,
      isDragging,
      dragSource,
      setDragSource,
      handleDrop,
      handleDragStart,
      handleDragEnd
    }}>
      {children}
    </DragAndDropContext.Provider>
  );
};

export const useDragAndDrop = () => {
  const context = useContext(DragAndDropContext);
  if (!context) {
    throw new Error('useDragAndDrop must be used within a DragAndDropProvider');
  }
  return context;
};