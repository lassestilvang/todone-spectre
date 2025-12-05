import React, { useState } from "react";
import { Task } from "../../types/task";
import { ViewHeader } from "./ViewHeader";
import { ViewToolbar } from "./ViewToolbar";
import { ViewFilterControls } from "./ViewFilterControls";
import { ViewSortControls } from "./ViewSortControls";
import { TaskItem } from "../../features/tasks/TaskItem";
import {
  format,
  addDays,
  subDays,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
} from "date-fns";

interface CalendarViewProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onTaskUpdate?: (task: Task) => void;
  onTaskDelete?: (taskId: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  tasks,
  onTaskClick,
  onTaskUpdate,
  onTaskDelete,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  const goToPreviousWeek = () => {
    setCurrentDate(subDays(currentDate, 7));
  };

  const goToNextWeek = () => {
    setCurrentDate(addDays(currentDate, 7));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 }); // Sunday
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Group tasks by date
  const tasksByDate = tasks.reduce(
    (acc, task) => {
      if (task.dueDate) {
        const dateKey = format(new Date(task.dueDate), "yyyy-MM-dd");
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(task);
      }
      return acc;
    },
    {} as Record<string, Task[]>,
  );

  return (
    <div className="calendar-view">
      <ViewHeader title="Calendar View" />
      <ViewToolbar>
        <ViewFilterControls />
        <ViewSortControls />
      </ViewToolbar>

      <div className="calendar-navigation">
        <button onClick={goToPreviousWeek}>Previous Week</button>
        <button onClick={goToToday}>Today</button>
        <button onClick={goToNextWeek}>Next Week</button>
        <div className="current-week-range">
          {format(weekStart, "MMM d")} - {format(weekEnd, "MMM d, yyyy")}
        </div>
      </div>

      <div className="calendar-view-content">
        <div className="calendar-week">
          {weekDays.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const dayTasks = tasksByDate[dateKey] || [];

            return (
              <div key={dateKey} className="calendar-day">
                <div className="day-header">
                  <div className="day-name">{format(day, "EEE")}</div>
                  <div className="day-date">{format(day, "d")}</div>
                </div>
                <div className="day-tasks">
                  {dayTasks.length === 0 ? (
                    <div className="empty-day">No tasks</div>
                  ) : (
                    dayTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onClick={() => onTaskClick?.(task)}
                        onUpdate={() => onTaskUpdate?.(task)}
                        onDelete={() => onTaskDelete?.(task.id)}
                        showDate
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
