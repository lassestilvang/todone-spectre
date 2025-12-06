// @ts-nocheck
import { useState, useEffect } from "react";
import { Task } from "../types/task";
import { BoardViewService } from "../services/boardViewService";
import { useTaskStore } from "../store/useTaskStore";
import { useUiStore } from "../store/useUiStore";

export const useBoardView = () => {
  const { tasks, loading, error } = useTaskStore();
  const { boardViewConfig, setBoardViewConfig } = useUiStore();
  const [groupedTasks, setGroupedTasks] = useState<Record<string, Task[]>>({});
  const [columns, setColumns] = useState<string[]>([]);

  // Initialize from stored config
  useEffect(() => {
    if (boardViewConfig) {
      setColumns(
        boardViewConfig.columns || BoardViewService.getDefaultColumns(),
      );
    } else {
      setColumns(BoardViewService.getDefaultColumns());
    }
  }, [boardViewConfig]);

  // Process tasks when they change
  useEffect(() => {
    if (!tasks || tasks.length === 0) {
      setGroupedTasks({});
      return;
    }

    // Transform tasks for board view
    const transformedTasks = BoardViewService.transformTasksForBoardView(tasks);

    // Apply grouping by status
    const grouped = BoardViewService.groupTasksByStatus(transformedTasks);

    setGroupedTasks(grouped);

    // Update config
    setBoardViewConfig({
      columns,
      showTaskCount: true,
    });
  }, [tasks, columns]);

  const handleTaskStatusUpdate = (
    taskId: string,
    newStatus: string,
  ): Task | undefined => {
    const taskToUpdate = tasks?.find((task) => task.id === taskId);
    if (!taskToUpdate) return undefined;

    const updatedTask = BoardViewService.updateTaskStatus(
      taskToUpdate,
      newStatus,
    );

    // This would typically be handled by the task store
    // but we can trigger a re-process of tasks
    const currentTasks = tasks || [];
    const updatedTasks = currentTasks.map((task) =>
      task.id === taskId ? updatedTask : task,
    );

    // Re-process with updated task
    const transformedTasks =
      BoardViewService.transformTasksForBoardView(updatedTasks);
    const grouped = BoardViewService.groupTasksByStatus(transformedTasks);

    setGroupedTasks(grouped);

    return updatedTask;
  };

  const handleColumnsChange = (newColumns: string[]) => {
    setColumns(newColumns);
  };

  const getTasksForColumn = (columnStatus: string): Task[] => {
    const normalizedStatus = BoardViewService.normalizeStatus(columnStatus);
    return groupedTasks[normalizedStatus] || [];
  };

  return {
    tasks: tasks || [],
    groupedTasks,
    columns,
    loading,
    error,
    handleTaskStatusUpdate,
    handleColumnsChange,
    getTasksForColumn,
    setColumns,
  };
};
