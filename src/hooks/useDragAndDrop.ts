import { useState, useCallback } from "react";
import { useTaskStore } from "../store/useTaskStore";
import { Task } from "../types/task";

interface UseDragAndDropOptions {
  onDragStart?: (task: Task) => void;
  onDragEnd?: (task: Task) => void;
  onDrop?: (targetId: string, position?: "before" | "after") => void;
}

export const useDragAndDrop = (options: UseDragAndDropOptions = {}) => {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragSource, setDragSource] = useState<string | null>(null);
  const { reorderTask, moveTask } = useTaskStore();

  const handleDragStart = useCallback(
    (task: Task, source: string = "task-list") => {
      setDraggedTask(task);
      setIsDragging(true);
      setDragSource(source);
      options.onDragStart?.(task);
    },
    [options.onDragStart],
  );

  const handleDragEnd = useCallback(() => {
    setDraggedTask(null);
    setIsDragging(false);
    setDragSource(null);
    if (draggedTask) {
      options.onDragEnd?.(draggedTask);
    }
  }, [draggedTask, options.onDragEnd]);

  const handleDrop = useCallback(
    async (targetId: string, position: "before" | "after" = "after") => {
      if (!draggedTask) return;

      try {
        if (dragSource === "task-list" && targetId.startsWith("task-")) {
          const targetTaskId = targetId.replace("task-", "");
          await reorderTask(draggedTask.id, targetTaskId, position);
        } else if (dragSource === "board" && targetId.startsWith("column-")) {
          const columnId = targetId.replace("column-", "");
          await moveTask(draggedTask.id, columnId);
        }

        options.onDrop?.(targetId, position);
        handleDragEnd();
      } catch (error) {
        console.error("Failed to handle drop:", error);
        handleDragEnd();
      }
    },
    [
      draggedTask,
      dragSource,
      reorderTask,
      moveTask,
      options.onDrop,
      handleDragEnd,
    ],
  );

  return {
    draggedTask,
    isDragging,
    dragSource,
    handleDragStart,
    handleDragEnd,
    handleDrop,
  };
};
