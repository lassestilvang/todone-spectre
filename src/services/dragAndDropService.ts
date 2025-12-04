import { Task } from '../types/task';
import { useTaskStore } from '../store/useTaskStore';
import { useProjectStore } from '../store/useProjectStore';

interface DragAndDropService {
  handleTaskDragStart: (task: Task, source: string) => void;
  handleTaskDragEnd: () => void;
  handleTaskDrop: (targetId: string, position?: 'before' | 'after') => Promise<void>;
  handleProjectDrop: (taskId: string, projectId: string) => Promise<void>;
  handleColumnDrop: (taskId: string, columnId: string) => Promise<void>;
  getDragState: () => { isDragging: boolean; draggedTask: Task | null; dragSource: string | null };
}

export const createDragAndDropService = (): DragAndDropService => {
  let draggedTask: Task | null = null;
  let isDragging = false;
  let dragSource: string | null = null;

  const { reorderTask, moveTask, moveTaskToProject, moveTaskToColumn } = useTaskStore.getState();
  const { getProject } = useProjectStore.getState();

  return {
    handleTaskDragStart: (task: Task, source: string) => {
      draggedTask = task;
      isDragging = true;
      dragSource = source;
    },

    handleTaskDragEnd: () => {
      draggedTask = null;
      isDragging = false;
      dragSource = null;
    },

    handleTaskDrop: async (targetId: string, position: 'before' | 'after' = 'after') => {
      if (!draggedTask || !isDragging) return;

      try {
        if (dragSource === 'task-list' && targetId.startsWith('task-')) {
          const targetTaskId = targetId.replace('task-', '');
          await reorderTask(draggedTask.id, targetTaskId, position);
        } else if (dragSource === 'board' && targetId.startsWith('column-')) {
          const columnId = targetId.replace('column-', '');
          await moveTaskToColumn(draggedTask.id, columnId);
        }

        this.handleTaskDragEnd();
      } catch (error) {
        console.error('Failed to handle task drop:', error);
        this.handleTaskDragEnd();
        throw error;
      }
    },

    handleProjectDrop: async (taskId: string, projectId: string) => {
      try {
        await moveTaskToProject(taskId, projectId);
      } catch (error) {
        console.error('Failed to handle project drop:', error);
        throw error;
      }
    },

    handleColumnDrop: async (taskId: string, columnId: string) => {
      try {
        await moveTaskToColumn(taskId, columnId);
      } catch (error) {
        console.error('Failed to handle column drop:', error);
        throw error;
      }
    },

    getDragState: () => ({
      isDragging,
      draggedTask,
      dragSource
    })
  };
};

export const dragAndDropService = createDragAndDropService();