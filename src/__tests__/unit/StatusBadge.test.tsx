import React from "react";
import { render, screen } from "@testing-library/react";
import StatusBadge from "../../components/StatusBadge";
import { TaskStatus } from "../../types/task";

describe("StatusBadge Component", () => {
  const testStatuses: TaskStatus[] = [
    "completed",
    "in-progress",
    "archived",
    "todo",
  ];

  describe("Rendering", () => {
    it("should render with completed status", () => {
      render(<StatusBadge status="completed" />);
      expect(screen.getByText("Completed")).toBeInTheDocument();
      expect(screen.getByText("Completed")).toHaveClass(
        "bg-green-100 text-green-800",
      );
    });

    it("should render with in-progress status", () => {
      render(<StatusBadge status="in-progress" />);
      expect(screen.getByText("In Progress")).toBeInTheDocument();
      expect(screen.getByText("In Progress")).toHaveClass(
        "bg-blue-100 text-blue-800",
      );
    });

    it("should render with archived status", () => {
      render(<StatusBadge status="archived" />);
      expect(screen.getByText("Archived")).toBeInTheDocument();
      expect(screen.getByText("Archived")).toHaveClass(
        "bg-purple-100 text-purple-800",
      );
    });

    it("should render with todo status", () => {
      render(<StatusBadge status="todo" />);
      expect(screen.getByText("Todo")).toBeInTheDocument();
      expect(screen.getByText("Todo")).toHaveClass("bg-gray-100 text-gray-800");
    });

    it("should render with default status for unknown values", () => {
      render(<StatusBadge status="unknown" as any />);
      expect(screen.getByText("Unknown")).toBeInTheDocument();
      expect(screen.getByText("Unknown")).toHaveClass(
        "bg-gray-100 text-gray-800",
      );
    });
  });

  describe("Label Formatting", () => {
    it("should capitalize and format status labels correctly", () => {
      render(<StatusBadge status="in-progress" />);
      expect(screen.getByText("In Progress")).toBeInTheDocument();
    });

    it("should handle single word statuses", () => {
      render(<StatusBadge status="completed" />);
      expect(screen.getByText("Completed")).toBeInTheDocument();
    });

    it("should handle hyphenated statuses", () => {
      render(<StatusBadge status="in-progress" />);
      expect(screen.getByText("In Progress")).toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("should apply correct styles for each status level", () => {
      testStatuses.forEach((status) => {
        const { container } = render(<StatusBadge status={status} />);
        const badge = container.firstChild;
        expect(badge).toHaveClass(
          "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium",
        );
      });
    });

    it("should apply custom className when provided", () => {
      const customClass = "custom-status-class";
      const { container } = render(
        <StatusBadge status="completed" className={customClass} />,
      );
      expect(container.firstChild).toHaveClass(customClass);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty className prop", () => {
      const { container } = render(<StatusBadge status="todo" className="" />);
      expect(container.firstChild).toBeInTheDocument();
    });

    it("should handle undefined status gracefully", () => {
      // @ts-ignore - testing edge case
      const { container } = render(<StatusBadge status={undefined} />);
      expect(container.firstChild).toBeInTheDocument();
    });
  });
});
