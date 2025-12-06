// @ts-nocheck
import { useState, useCallback } from "react";
import { useTaskStore } from "../store/useTaskStore";
import { Task } from "../types/task";

interface TaskDragAndDropOptions {
  onTaskDragStart?: (task: Task) => void;
  onTaskDragEnd?: (task: Task) => void;
  onTaskDrop?: (
    taskId: string,
    targetId: string,
    position?: "before" | "after",
  ) => void;
}

export const useTaskDragAndDrop = (options: TaskDragAndDropOptions = {}) => {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragSource, setDragSource] = useState<string | null>(null);
  const { reorderTask, moveTask, moveTaskToProject, moveTaskToColumn } =
    useTaskStore();

  const handleTaskDragStart = useCallback(
    (task: Task, source: string = "task-list") => {
      setDraggedTask(task);
      setIsDragging(true);
      setDragSource(source);
      options.onTaskDragStart?.(task);
    },
    [options.onTaskDragStart],
  );

  const handleTaskDragEnd = useCallback(() => {
    setDraggedTask(null);
    setIsDragging(false);
    setDragSource(null);
    if (draggedTask) {
      options.onTaskDragEnd?.(draggedTask);
    }
  }, [draggedTask, options.onTaskDragEnd]);

  const handleTaskDrop = useCallback(
    async (targetId: string, position: "before" | "after" = "after") => {
      if (!draggedTask) return;

      try {
        if (dragSource === "task-list" && targetId.startsWith("task-")) {
          const targetTaskId = targetId.replace("task-", "");
          await reorderTask(draggedTask.id, targetTaskId, position);
          options.onTaskDrop?.(draggedTask.id, targetTaskId, position);
        } else if (dragSource === "board" && targetId.startsWith("column-")) {
          const columnId = targetId.replace("column-", "");
          await moveTaskToColumn(draggedTask.id, columnId);
          options.onTaskDrop?.(draggedTask.id, columnId, position);
        } else if (
          dragSource === "project" &&
          targetId.startsWith("project-")
        ) {
          const projectId = targetId.replace("project-", "");
          await moveTaskToProject(draggedTask.id, projectId);
          options.onTaskDrop?.(draggedTask.id, projectId, position);
        }

        handleTaskDragEnd();
      } catch (error) {
        console.error("Failed to handle task drop:", error);
        handleTaskDragEnd();
      }
    },
    [
      draggedTask,
      dragSource,
      reorderTask,
      moveTaskToColumn,
      moveTaskToProject,
      options.onTaskDrop,
      handleTaskDragEnd,
    ],
  );

  const handleTaskMove = useCallback(
    async (
      taskId: string,
      targetTaskId: string,
      position: "before" | "after" = "after",
    ) => {
      try {
        await reorderTask(taskId, targetTaskId, position);
      } catch (error) {
        console.error("Failed to move task:", error);
        throw error;
      }
    },
    [reorderTask],
  );

  return {
    draggedTask,
    isDragging,
    dragSource,
    handleTaskDragStart,
    handleTaskDragEnd,
    handleTaskDrop,
    handleTaskMove,
  };
};
