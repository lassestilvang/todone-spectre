import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  DragAndDropProvider,
  DraggableTask,
  DroppableContainer,
  DragPreview,
} from "../";
import { createMockTask } from "../../../../utils/dndTestUtils";
import { useDragAndDrop } from "../DragAndDropProvider";

jest.mock("../DragAndDropProvider", () => ({
  ...jest.requireActual("../DragAndDropProvider"),
  useDragAndDrop: jest.fn(),
}));

describe("DragAndDrop Components", () => {
  const mockTask = createMockTask();
  const mockUseDragAndDrop = {
    draggedTask: null,
    setDraggedTask: jest.fn(),
    isDragging: false,
    dragSource: null,
    setDragSource: jest.fn(),
    handleDrop: jest.fn(),
    handleDragStart: jest.fn(),
    handleDragEnd: jest.fn(),
  };

  beforeEach(() => {
    (useDragAndDrop as jest.Mock).mockReturnValue(mockUseDragAndDrop);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("DraggableTask", () => {
    it("should render children", () => {
      render(
        <DragAndDropProvider>
          <DraggableTask task={mockTask}>
            <div>Test Content</div>
          </DraggableTask>
        </DragAndDropProvider>,
      );

      expect(screen.getByText("Test Content")).toBeInTheDocument();
    });

    it("should have draggable attribute", () => {
      render(
        <DragAndDropProvider>
          <DraggableTask task={mockTask}>
            <div>Test Content</div>
          </DraggableTask>
        </DragAndDropProvider>,
      );

      const draggableElement = screen.getByText("Test Content").parentElement;
      expect(draggableElement).toHaveAttribute("draggable", "true");
    });
  });

  describe("DroppableContainer", () => {
    it("should render children", () => {
      render(
        <DragAndDropProvider>
          <DroppableContainer id="test-container">
            <div>Drop Zone</div>
          </DroppableContainer>
        </DragAndDropProvider>,
      );

      expect(screen.getByText("Drop Zone")).toBeInTheDocument();
    });
  });

  describe("DragPreview", () => {
    it("should not render when not dragging", () => {
      render(
        <DragAndDropProvider>
          <DragPreview />
        </DragAndDropProvider>,
      );

      expect(screen.queryByText(mockTask.title)).not.toBeInTheDocument();
    });
  });

  describe("DragAndDropProvider", () => {
    it("should provide context to children", () => {
      const TestComponent = () => {
        const context = useDragAndDrop();
        return <div>Context provided</div>;
      };

      render(
        <DragAndDropProvider>
          <TestComponent />
        </DragAndDropProvider>,
      );

      expect(screen.getByText("Context provided")).toBeInTheDocument();
    });
  });
});
