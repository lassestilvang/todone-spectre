import { useState, useEffect } from 'react';
import { Task } from '../types/task';
import { CalendarViewService } from '../services/calendarViewService';
import { useTaskStore } from '../store/useTaskStore';
import { useUiStore } from '../store/useUiStore';
import { format, addDays, subDays } from 'date-fns';

export const useCalendarView = () => {
  const { tasks, loading, error } = useTaskStore();
  const { calendarViewConfig, setCalendarViewConfig } = useUiStore();
  const [tasksByDate, setTasksByDate] = useState<Record<string, Task[]>>({});
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<string>('week');
  const [showWeekends, setShowWeekends] = useState<boolean>(true);

  // Initialize from stored config
  useEffect(() => {
    if (calendarViewConfig) {
      setViewMode(calendarViewConfig.viewMode || 'week');
      setShowWeekends(calendarViewConfig.showWeekends !== undefined ?
        calendarViewConfig.showWeekends : true);
    }
  }, [calendarViewConfig]);

  // Process tasks when they change
  useEffect(() => {
    if (!tasks || tasks.length === 0) {
      setTasksByDate({});
      return;
    }

    // Transform tasks for calendar view
    const transformedTasks = CalendarViewService.transformTasksForCalendarView(tasks);

    // Apply grouping by date
    const grouped = CalendarViewService.groupTasksByDate(transformedTasks);

    setTasksByDate(grouped);

    // Update config
    setCalendarViewConfig({
      viewMode,
      showWeekends
    });

  }, [tasks, viewMode, showWeekends]);

  const goToPreviousPeriod = () => {
    setCurrentDate(prevDate => {
      if (viewMode === 'day') {
        return subDays(prevDate, 1);
      } else if (viewMode === 'week') {
        return subDays(prevDate, 7);
      } else { // month
        // Simple month navigation - go back 30 days as approximation
        return subDays(prevDate, 30);
      }
    });
  };

  const goToNextPeriod = () => {
    setCurrentDate(prevDate => {
      if (viewMode === 'day') {
        return addDays(prevDate, 1);
      } else if (viewMode === 'week') {
        return addDays(prevDate, 7);
      } else { // month
        // Simple month navigation - go forward 30 days as approximation
        return addDays(prevDate, 30);
      }
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleViewModeChange = (newViewMode: string) => {
    setViewMode(newViewMode);
  };

  const handleShowWeekendsChange = (show: boolean) => {
    setShowWeekends(show);
  };

  const getDateRange = () => {
    return CalendarViewService.getDateRangeForNavigation(currentDate, viewMode);
  };

  const getTasksForDate = (date: Date): Task[] => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return tasksByDate[dateKey] || [];
  };

  return {
    tasks: tasks || [],
    tasksByDate,
    currentDate,
    viewMode,
    showWeekends,
    loading,
    error,
    goToPreviousPeriod,
    goToNextPeriod,
    goToToday,
    handleViewModeChange,
    handleShowWeekendsChange,
    getDateRange,
    getTasksForDate,
    setCurrentDate,
    setViewMode,
    setShowWeekends
  };
};