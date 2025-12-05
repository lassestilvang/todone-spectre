import React, { useRef, useEffect } from "react";
import { useDragAndDrop } from "./DragAndDropProvider";

interface DroppableContainerProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  onDrop?: (id: string) => void;
  dropPosition?: "before" | "after";
}

export const DroppableContainer: React.FC<DroppableContainerProps> = ({
  id,
  children,
  className = "",
  onDrop,
  dropPosition = "after",
}) => {
  const { isDragging, draggedTask, handleDrop } = useDragAndDrop();
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = dropRef.current;
    if (!element) return;

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (isDragging) {
        element.classList.add("drag-over");
      }
    };

    const handleDragLeave = () => {
      element.classList.remove("drag-over");
    };

    const handleDropEvent = (e: DragEvent) => {
      e.preventDefault();
      element.classList.remove("drag-over");

      if (draggedTask && isDragging) {
        handleDrop(id, dropPosition);
        onDrop?.(id);
      }
    };

    element.addEventListener("dragover", handleDragOver as EventListener);
    element.addEventListener("dragleave", handleDragLeave);
    element.addEventListener("drop", handleDropEvent as EventListener);

    return () => {
      element.removeEventListener("dragover", handleDragOver as EventListener);
      element.removeEventListener("dragleave", handleDragLeave);
      element.removeEventListener("drop", handleDropEvent as EventListener);
    };
  }, [id, isDragging, draggedTask, handleDrop, onDrop, dropPosition]);

  return (
    <div
      ref={dropRef}
      className={`droppable-container ${className} ${isDragging ? "drag-active" : ""}`}
      data-drop-id={id}
      data-drop-position={dropPosition}
    >
      {children}
    </div>
  );
};
