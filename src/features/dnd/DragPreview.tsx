// @ts-nocheck
import React, { useEffect, useState } from "react";
import { useDragAndDrop } from "./DragAndDropProvider";
import { Task } from "../../types/task";

interface DragPreviewProps {
  className?: string;
}

export const DragPreview: React.FC<DragPreviewProps> = ({ className = "" }) => {
  const { draggedTask, isDragging } = useDragAndDrop();
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isDragging || !draggedTask) {
      setIsVisible(false);
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX + 10, y: e.clientY + 10 });
      setIsVisible(true);
    };

    document.addEventListener("mousemove", handleMouseMove);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isDragging, draggedTask]);

  if (!isVisible || !draggedTask) return null;

  return (
    <div
      className={`drag-preview ${className}`}
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        pointerEvents: "none",
        zIndex: 9999,
        backgroundColor: "white",
        border: "1px solid #ddd",
        borderRadius: "4px",
        padding: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        minWidth: "200px",
        maxWidth: "300px",
      }}
    >
      <div className="drag-preview-title">{draggedTask.title}</div>
      {draggedTask.description && (
        <div className="drag-preview-description text-sm text-gray-600 mt-1">
          {draggedTask.description}
        </div>
      )}
    </div>
  );
};
