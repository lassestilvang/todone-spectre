import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { AnimationProvider, useAnimationContext } from "../AnimationProvider";
import { TaskAnimation } from "../TaskAnimation";
import { ViewAnimation } from "../ViewAnimation";
import { MicroInteraction } from "../MicroInteraction";
import { AnimationControls } from "../AnimationControls";

describe("Animation Components", () => {
  afterEach(() => {
    // cleanup if needed
  });

  const renderWithProvider = (children: React.ReactNode) => {
    return render(<AnimationProvider>{children}</AnimationProvider>);
  };

  describe("AnimationProvider", () => {
    it("should provide animation context", () => {
      const TestComponent = () => {
        const context = useAnimationContext();
        return (
          <div data-testid="context">
            {context.isAnimating ? "true" : "false"}
          </div>
        );
      };

      renderWithProvider(<TestComponent />);
      expect(screen.getByTestId("context")).toHaveTextContent("true");
    });
  });

  describe("TaskAnimation", () => {
    it("should render children with task animation", () => {
      renderWithProvider(
        <TaskAnimation taskId="test-1">
          <div>Task Content</div>
        </TaskAnimation>,
      );
      expect(screen.getByText("Task Content")).toBeInTheDocument();
    });

    it("should handle completed state", () => {
      renderWithProvider(
        <TaskAnimation taskId="test-2" isCompleted>
          <div>Completed Task</div>
        </TaskAnimation>,
      );
      expect(screen.getByText("Completed Task")).toBeInTheDocument();
    });
  });

  describe("ViewAnimation", () => {
    it("should render children with view animation", () => {
      renderWithProvider(
        <ViewAnimation viewName="test-view">
          <div>View Content</div>
        </ViewAnimation>,
      );
      expect(screen.getByText("View Content")).toBeInTheDocument();
    });
  });

  describe("MicroInteraction", () => {
    it("should render children with micro-interaction", () => {
      renderWithProvider(
        <MicroInteraction type="click">
          <button>Click Me</button>
        </MicroInteraction>,
      );
      expect(screen.getByText("Click Me")).toBeInTheDocument();
    });

    it("should handle click interaction", () => {
      const handleInteraction = jest.fn();
      renderWithProvider(
        <MicroInteraction type="click" onInteraction={handleInteraction}>
          <button>Click Me</button>
        </MicroInteraction>,
      );

      fireEvent.click(screen.getByText("Click Me"));
      expect(handleInteraction).toHaveBeenCalled();
    });
  });

  describe("AnimationControls", () => {
    it("should render animation controls", () => {
      const handleClose = jest.fn();
      renderWithProvider(<AnimationControls onClose={handleClose} />);
      expect(screen.getByText("Animation Controls")).toBeInTheDocument();
    });
  });
});
