import { Task } from "../types/task";

interface DragEventData {
  taskId: string;
  source: string;
  clientX: number;
  clientY: number;
}

export const createDragEventData = (
  taskId: string,
  source: string,
  clientX: number,
  clientY: number,
): DragEventData => {
  return {
    taskId,
    source,
    clientX,
    clientY,
  };
};

export const parseDragEventData = (data: string): DragEventData | null => {
  try {
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to parse drag event data:", error);
    return null;
  }
};

export const getDragPosition = (
  event: React.DragEvent | MouseEvent,
): { x: number; y: number } => {
  if ("clientX" in event && "clientY" in event) {
    return { x: event.clientX, y: event.clientY };
  }
  return { x: 0, y: 0 };
};

export const getDropPosition = (
  event: React.DragEvent,
  element: HTMLElement,
): "before" | "after" | null => {
  const rect = element.getBoundingClientRect();
  const midPoint = rect.top + rect.height / 2;

  if (event.clientY < midPoint) {
    return "before";
  } else {
    return "after";
  }
};

export const createDragPreview = (task: Task): HTMLElement => {
  const preview = document.createElement("div");
  preview.className = "drag-preview";
  preview.style.position = "absolute";
  preview.style.pointerEvents = "none";
  preview.style.zIndex = "9999";
  preview.style.backgroundColor = "white";
  preview.style.border = "1px solid #ddd";
  preview.style.borderRadius = "4px";
  preview.style.padding = "8px";
  preview.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
  preview.style.minWidth = "200px";
  preview.style.maxWidth = "300px";

  preview.innerHTML = `
    <div class="drag-preview-title">${task.title}</div>
    ${task.description ? `<div class="drag-preview-description">${task.description}</div>` : ""}
  `;

  return preview;
};

export const updateDragPreviewPosition = (
  preview: HTMLElement,
  x: number,
  y: number,
) => {
  preview.style.left = `${x}px`;
  preview.style.top = `${y}px`;
};

export const cleanupDragPreview = (preview: HTMLElement) => {
  if (preview && preview.parentNode) {
    preview.parentNode.removeChild(preview);
  }
};

export const isValidDropTarget = (target: EventTarget | null): boolean => {
  if (!target || !(target instanceof HTMLElement)) return false;
  return target.hasAttribute("data-drop-id");
};
