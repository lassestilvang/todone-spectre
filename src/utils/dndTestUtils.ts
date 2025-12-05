import { Task } from "../types/task";

export const createMockTask = (overrides: Partial<Task> = {}): Task => {
  return {
    id: `task-${Math.random().toString(36).substr(2, 9)}`,
    title: `Mock Task ${Math.floor(Math.random() * 1000)}`,
    description: "This is a mock task for testing",
    status: "todo",
    priority: "medium",
    createdAt: new Date(),
    updatedAt: new Date(),
    completed: false,
    ...overrides,
  };
};

export const createMockTasks = (count: number = 5): Task[] => {
  return Array.from({ length: count }, (_, i) =>
    createMockTask({
      title: `Task ${i + 1}`,
      description: `Description for task ${i + 1}`,
    }),
  );
};

export const createDragEvent = (taskId: string, source: string): DragEvent => {
  const event = new Event("dragstart") as DragEvent;
  event.dataTransfer = {
    setData: jest.fn(),
    getData: jest.fn().mockReturnValue(JSON.stringify({ taskId, source })),
    clearData: jest.fn(),
    setDragImage: jest.fn(),
    dropEffect: "move",
    effectAllowed: "all",
    files: [],
    items: [],
    types: ["text/plain"],
  } as any;

  return event;
};

export const createDropEvent = (targetId: string): DragEvent => {
  const event = new Event("drop") as DragEvent;
  event.preventDefault = jest.fn();
  event.dataTransfer = {
    getData: jest
      .fn()
      .mockReturnValue(
        JSON.stringify({ taskId: "test-task", source: "task-list" }),
      ),
    setData: jest.fn(),
    clearData: jest.fn(),
    setDragImage: jest.fn(),
    dropEffect: "move",
    effectAllowed: "all",
    files: [],
    items: [],
    types: ["text/plain"],
  } as any;

  return event;
};

export const mockDragAndDropService = {
  handleTaskDragStart: jest.fn(),
  handleTaskDragEnd: jest.fn(),
  handleTaskDrop: jest.fn(),
  handleProjectDrop: jest.fn(),
  handleColumnDrop: jest.fn(),
  getDragState: jest.fn().mockReturnValue({
    isDragging: false,
    draggedTask: null,
    dragSource: null,
  }),
};

export const mockDndService = {
  moveTask: jest.fn(),
  reorderTask: jest.fn(),
  moveTaskToProject: jest.fn(),
  moveTaskToColumn: jest.fn(),
  getDragData: jest.fn(),
};
