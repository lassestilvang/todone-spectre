import { Task } from "../types/task";
import { useTaskStore } from "../store/useTaskStore";

interface DndService {
  moveTask: (
    taskId: string,
    targetId: string,
    position?: "before" | "after",
  ) => Promise<void>;
  reorderTask: (
    taskId: string,
    targetTaskId: string,
    position?: "before" | "after",
  ) => Promise<void>;
  moveTaskToProject: (taskId: string, projectId: string) => Promise<void>;
  moveTaskToColumn: (taskId: string, columnId: string) => Promise<void>;
  getDragData: (taskId: string) => Promise<Task | null>;
}

export const createDndService = (): DndService => {
  const {
    moveTask,
    reorderTask,
    moveTaskToProject,
    moveTaskToColumn,
    getTask,
  } = useTaskStore.getState();

  return {
    moveTask: async (
      taskId: string,
      targetId: string,
      position: "before" | "after" = "after",
    ) => {
      try {
        await reorderTask(taskId, targetId, position);
      } catch (error) {
        console.error("Failed to move task:", error);
        throw error;
      }
    },

    reorderTask: async (
      taskId: string,
      targetTaskId: string,
      position: "before" | "after" = "after",
    ) => {
      try {
        await reorderTask(taskId, targetTaskId, position);
      } catch (error) {
        console.error("Failed to reorder task:", error);
        throw error;
      }
    },

    moveTaskToProject: async (taskId: string, projectId: string) => {
      try {
        await moveTaskToProject(taskId, projectId);
      } catch (error) {
        console.error("Failed to move task to project:", error);
        throw error;
      }
    },

    moveTaskToColumn: async (taskId: string, columnId: string) => {
      try {
        await moveTaskToColumn(taskId, columnId);
      } catch (error) {
        console.error("Failed to move task to column:", error);
        throw error;
      }
    },

    getDragData: async (taskId: string) => {
      try {
        return await getTask(taskId);
      } catch (error) {
        console.error("Failed to get drag data:", error);
        return null;
      }
    },
  };
};

export const dndService = createDndService();
