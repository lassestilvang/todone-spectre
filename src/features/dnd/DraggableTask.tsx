import React, { useRef, useEffect } from "react";
import { useDragAndDrop } from "./DragAndDropProvider";
import { Task } from "../../types/task";

interface DraggableTaskProps {
  task: Task;
  children: React.ReactNode;
  className?: string;
  source?: string;
}

export const DraggableTask: React.FC<DraggableTaskProps> = ({
  task,
  children,
  className = "",
  source = "task-list",
}) => {
  const { handleDragStart, handleDragEnd, isDragging, draggedTask } =
    useDragAndDrop();
  const dragRef = useRef<HTMLDivElement>(null);
  const isBeingDragged = isDragging && draggedTask?.id === task.id;

  useEffect(() => {
    const element = dragRef.current;
    if (!element) return;

    const handleDragStartEvent = (e: DragEvent) => {
      e.dataTransfer?.setData("text/plain", task.id);
      handleDragStart(task, source);
    };

    const handleDragEndEvent = () => {
      handleDragEnd();
    };

    element.addEventListener(
      "dragstart",
      handleDragStartEvent as EventListener,
    );
    element.addEventListener("dragend", handleDragEndEvent);

    return () => {
      element.removeEventListener(
        "dragstart",
        handleDragStartEvent as EventListener,
      );
      element.removeEventListener("dragend", handleDragEndEvent);
    };
  }, [task, source, handleDragStart, handleDragEnd]);

  return (
    <div
      ref={dragRef}
      draggable
      className={`draggable-task ${className} ${isBeingDragged ? "opacity-50" : ""}`}
      data-task-id={task.id}
      data-source={source}
    >
      {children}
    </div>
  );
};
