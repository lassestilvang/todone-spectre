import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ViewTestUtils } from "../../../utils/viewTestUtils";
import { ViewServiceMocks } from "../../../utils/viewServiceMocks";
import { ListView } from "../ListView";
import { BoardView } from "../BoardView";
import { CalendarView } from "../CalendarView";
import { ViewSwitcher } from "../ViewSwitcher";
import { ViewType } from "../../../types/enums";

describe("View Components", () => {
  const mockTasks = ViewTestUtils.generateMockTasks(5);
  const mockTasksForCalendar = ViewTestUtils.generateTasksWithSpecificDates(7);
  const mockTasksForBoard = ViewTestUtils.generateTasksForBoardView();

  const mockTaskClick = jest.fn();
  const mockTaskUpdate = jest.fn();
  const mockTaskDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("ListView", () => {
    it("should render list view with tasks", () => {
      render(
        <ListView
          tasks={mockTasks}
          onTaskClick={mockTaskClick}
          onTaskUpdate={mockTaskUpdate}
          onTaskDelete={mockTaskDelete}
        />,
      );

      expect(screen.getByText("List View")).toBeInTheDocument();
      mockTasks.forEach((task) => {
        expect(screen.getByText(task.title)).toBeInTheDocument();
      });
    });

    it("should show empty state when no tasks", () => {
      render(
        <ListView
          tasks={[]}
          onTaskClick={mockTaskClick}
          onTaskUpdate={mockTaskUpdate}
          onTaskDelete={mockTaskDelete}
        />,
      );

      expect(screen.getByText("No tasks found")).toBeInTheDocument();
    });
  });

  describe("BoardView", () => {
    it("should render board view with columns", () => {
      render(
        <BoardView
          tasks={mockTasksForBoard}
          columns={["To Do", "In Progress", "Done"]}
          onTaskClick={mockTaskClick}
          onTaskUpdate={mockTaskUpdate}
          onTaskDelete={mockTaskDelete}
        />,
      );

      expect(screen.getByText("Board View")).toBeInTheDocument();
      expect(screen.getByText("To Do")).toBeInTheDocument();
      expect(screen.getByText("In Progress")).toBeInTheDocument();
      expect(screen.getByText("Done")).toBeInTheDocument();
    });

    it("should group tasks by status", () => {
      render(
        <BoardView
          tasks={mockTasksForBoard}
          columns={["To Do", "In Progress", "Done"]}
          onTaskClick={mockTaskClick}
          onTaskUpdate={mockTaskUpdate}
          onTaskDelete={mockTaskDelete}
        />,
      );

      // Check that tasks are grouped by their status
      mockTasksForBoard.forEach((task) => {
        expect(screen.getByText(task.title)).toBeInTheDocument();
      });
    });
  });

  describe("CalendarView", () => {
    it("should render calendar view with week navigation", () => {
      render(
        <CalendarView
          tasks={mockTasksForCalendar}
          onTaskClick={mockTaskClick}
          onTaskUpdate={mockTaskUpdate}
          onTaskDelete={mockTaskDelete}
        />,
      );

      expect(screen.getByText("Calendar View")).toBeInTheDocument();
      expect(screen.getByText("Previous Week")).toBeInTheDocument();
      expect(screen.getByText("Today")).toBeInTheDocument();
      expect(screen.getByText("Next Week")).toBeInTheDocument();
    });

    it("should show tasks grouped by date", () => {
      render(
        <CalendarView
          tasks={mockTasksForCalendar}
          onTaskClick={mockTaskClick}
          onTaskUpdate={mockTaskUpdate}
          onTaskDelete={mockTaskDelete}
        />,
      );

      // Check that tasks are displayed in calendar days
      mockTasksForCalendar.forEach((task) => {
        expect(screen.getByText(task.title)).toBeInTheDocument();
      });
    });
  });

  describe("ViewSwitcher", () => {
    it("should render view switcher with available views", () => {
      render(
        <ViewSwitcher
          currentView={ViewType.LIST}
          onViewChange={jest.fn()}
          availableViews={[ViewType.LIST, ViewType.BOARD, ViewType.CALENDAR]}
        />,
      );

      expect(screen.getByText("List")).toBeInTheDocument();
      expect(screen.getByText("Board")).toBeInTheDocument();
      expect(screen.getByText("Calendar")).toBeInTheDocument();
    });

    it("should highlight the current view", () => {
      render(
        <ViewSwitcher
          currentView={ViewType.BOARD}
          onViewChange={jest.fn()}
          availableViews={[ViewType.LIST, ViewType.BOARD, ViewType.CALENDAR]}
        />,
      );

      const boardButton = screen.getByText("Board").closest("button");
      expect(boardButton).toHaveClass("active");
    });

    it("should call onViewChange when view is clicked", () => {
      const mockOnViewChange = jest.fn();

      render(
        <ViewSwitcher
          currentView={ViewType.LIST}
          onViewChange={mockOnViewChange}
          availableViews={[ViewType.LIST, ViewType.BOARD, ViewType.CALENDAR]}
        />,
      );

      fireEvent.click(screen.getByText("Board"));
      expect(mockOnViewChange).toHaveBeenCalledWith(ViewType.BOARD);
    });
  });

  describe("View Services", () => {
    it("should transform tasks for list view", () => {
      const listViewService = ViewServiceMocks.mockListViewService();
      const tasks = ViewTestUtils.generateMockTasks(3);
      const transformedTasks = listViewService.transformTasksForListView(tasks);

      expect(transformedTasks.length).toBe(3);
      expect(transformedTasks[0].displayTitle).toBeDefined();
    });

    it("should group tasks by project for list view", () => {
      const listViewService = ViewServiceMocks.mockListViewService();
      const tasks = ViewTestUtils.generateTasksByProject(2, 3);
      const groupedTasks = listViewService.groupTasksByProject(tasks);

      expect(Object.keys(groupedTasks).length).toBe(2);
    });

    it("should group tasks by status for board view", () => {
      const boardViewService = ViewServiceMocks.mockBoardViewService();
      const tasks = ViewTestUtils.generateTasksForBoardView();
      const groupedTasks = boardViewService.groupTasksByStatus(tasks);

      expect(groupedTasks["todo"]).toBeDefined();
      expect(groupedTasks["in_progress"]).toBeDefined();
      expect(groupedTasks["completed"]).toBeDefined();
    });

    it("should group tasks by date for calendar view", () => {
      const calendarViewService = ViewServiceMocks.mockCalendarViewService();
      const tasks = ViewTestUtils.generateTasksWithSpecificDates(5);
      const groupedTasks = calendarViewService.groupTasksByDate(tasks);

      expect(Object.keys(groupedTasks).length).toBe(5);
    });
  });
});
