import React, { useState } from "react";
import { ViewType } from "../../types/enums";
import { ListView } from "./ListView";
import { BoardView } from "./BoardView";
import { CalendarView } from "./CalendarView";
import { ViewSwitcher } from "./ViewSwitcher";
import { useTasks } from "../../hooks/useTasks";
import { useListView } from "../../hooks/useListView";
import { useBoardView } from "../../hooks/useBoardView";
import { useCalendarView } from "../../hooks/useCalendarView";

interface ViewLayoutProps {
  initialView?: ViewType;
  tasks?: any[];
  onTaskClick?: (task: any) => void;
  onTaskUpdate?: (task: any) => void;
  onTaskDelete?: (taskId: string) => void;
}

export const ViewLayout: React.FC<ViewLayoutProps> = ({
  initialView = ViewType.LIST,
  tasks: propTasks,
  onTaskClick,
  onTaskUpdate,
  onTaskDelete,
}) => {
  const [currentView, setCurrentView] = useState<ViewType>(initialView);
  const { tasks: storeTasks } = useTasks();

  // Use provided tasks or fall back to store tasks
  const tasks = propTasks || storeTasks;

  // List view hook
  const {
    tasks: listTasks,
    groupedTasks: listGroupedTasks,
    sortBy: listSortBy,
    groupBy: listGroupBy,
    handleSortChange: handleListSortChange,
    handleGroupChange: handleListGroupChange,
  } = useListView();

  // Board view hook
  const {
    tasks: boardTasks,
    groupedTasks: boardGroupedTasks,
    columns: boardColumns,
    handleTaskStatusUpdate: handleBoardTaskStatusUpdate,
  } = useBoardView();

  // Calendar view hook
  const {
    tasks: calendarTasks,
    tasksByDate: calendarTasksByDate,
    currentDate: calendarCurrentDate,
    viewMode: calendarViewMode,
    showWeekends: calendarShowWeekends,
    goToPreviousPeriod: goToCalendarPrevious,
    goToNextPeriod: goToCalendarNext,
    goToToday: goToCalendarToday,
  } = useCalendarView();

  const handleViewChange = (view: ViewType) => {
    setCurrentView(view);
  };

  const renderView = () => {
    switch (currentView) {
      case ViewType.LIST:
        return (
          <ListView
            tasks={listTasks}
            onTaskClick={onTaskClick}
            onTaskUpdate={onTaskUpdate}
            onTaskDelete={onTaskDelete}
          />
        );

      case ViewType.BOARD:
        return (
          <BoardView
            tasks={boardTasks}
            columns={boardColumns}
            onTaskClick={onTaskClick}
            onTaskUpdate={onTaskUpdate}
            onTaskDelete={onTaskDelete}
          />
        );

      case ViewType.CALENDAR:
        return (
          <CalendarView
            tasks={calendarTasks}
            onTaskClick={onTaskClick}
            onTaskUpdate={onTaskUpdate}
            onTaskDelete={onTaskDelete}
          />
        );

      default:
        return (
          <ListView
            tasks={listTasks}
            onTaskClick={onTaskClick}
            onTaskUpdate={onTaskUpdate}
            onTaskDelete={onTaskDelete}
          />
        );
    }
  };

  return (
    <div className="view-layout">
      <div className="view-switcher-container mb-4">
        <ViewSwitcher
          currentView={currentView}
          onViewChange={handleViewChange}
          availableViews={[ViewType.LIST, ViewType.BOARD, ViewType.CALENDAR]}
        />
      </div>

      <div className="view-content">{renderView()}</div>
    </div>
  );
};
