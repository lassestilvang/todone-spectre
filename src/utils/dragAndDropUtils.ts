import { Task } from "../types/task";

interface DragAndDropConfig {
  dragThreshold: number;
  dropZones: string[];
  allowedSources: string[];
  dragPreviewEnabled: boolean;
}

export const defaultDragAndDropConfig: DragAndDropConfig = {
  dragThreshold: 5,
  dropZones: ["task-list", "board", "calendar", "project"],
  allowedSources: ["task-list", "board", "calendar", "project"],
  dragPreviewEnabled: true,
};

export const validateDragSource = (
  source: string,
  config: DragAndDropConfig = defaultDragAndDropConfig,
): boolean => {
  return config.allowedSources.includes(source);
};

export const validateDropTarget = (
  targetId: string,
  config: DragAndDropConfig = defaultDragAndDropConfig,
): boolean => {
  const prefix = targetId.split("-")[0];
  return config.dropZones.includes(prefix);
};

export const getDragOperation = (source: string, targetId: string): string => {
  if (source === "task-list" && targetId.startsWith("task-")) {
    return "reorder";
  } else if (source === "board" && targetId.startsWith("column-")) {
    return "move-to-column";
  } else if (source === "project" && targetId.startsWith("project-")) {
    return "move-to-project";
  }
  return "unknown";
};

export const calculateDropPosition = (
  event: React.DragEvent,
  targetElement: HTMLElement,
  threshold: number = 0.3,
): "before" | "after" => {
  const rect = targetElement.getBoundingClientRect();
  const relativeY = event.clientY - rect.top;
  const positionThreshold = rect.height * threshold;

  if (relativeY < positionThreshold) {
    return "before";
  } else {
    return "after";
  }
};

export const createDragAndDropHandlers = (
  onDragStart: (task: Task, source: string) => void,
  onDragEnd: () => void,
  onDrop: (targetId: string, position?: "before" | "after") => void,
) => {
  return {
    handleDragStart: (task: Task, source: string) => {
      if (validateDragSource(source)) {
        onDragStart(task, source);
      }
    },
    handleDragEnd: onDragEnd,
    handleDrop: (targetId: string, position?: "before" | "after") => {
      if (validateDropTarget(targetId)) {
        onDrop(targetId, position);
      }
    },
  };
};

export const getDragDataTransfer = (task: Task, source: string): string => {
  return JSON.stringify({
    taskId: task.id,
    source,
    timestamp: Date.now(),
  });
};

export const parseDragDataTransfer = (
  data: string,
): { taskId: string; source: string } | null => {
  try {
    const parsed = JSON.parse(data);
    if (parsed.taskId && parsed.source) {
      return {
        taskId: parsed.taskId,
        source: parsed.source,
      };
    }
    return null;
  } catch (error) {
    console.error("Failed to parse drag data transfer:", error);
    return null;
  }
};

export const setupDragAndDropListeners = (
  element: HTMLElement,
  handlers: {
    onDragOver?: (e: DragEvent) => void;
    onDragLeave?: (e: DragEvent) => void;
    onDrop?: (e: DragEvent) => void;
  },
) => {
  if (handlers.onDragOver) {
    element.addEventListener("dragover", handlers.onDragOver as EventListener);
  }
  if (handlers.onDragLeave) {
    element.addEventListener("dragleave", handlers.onDragLeave);
  }
  if (handlers.onDrop) {
    element.addEventListener("drop", handlers.onDrop as EventListener);
  }

  return () => {
    if (handlers.onDragOver) {
      element.removeEventListener(
        "dragover",
        handlers.onDragOver as EventListener,
      );
    }
    if (handlers.onDragLeave) {
      element.removeEventListener("dragleave", handlers.onDragLeave);
    }
    if (handlers.onDrop) {
      element.removeEventListener("drop", handlers.onDrop as EventListener);
    }
  };
};
