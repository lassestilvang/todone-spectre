import { useState, useEffect } from "react";
import { Task } from "../types/task";
import { ListViewService } from "../services/listViewService";
import { useTaskStore } from "../store/useTaskStore";
import { useUiStore } from "../store/useUiStore";

export const useListView = () => {
  const { tasks, loading, error } = useTaskStore();
  const { listViewConfig, setListViewConfig } = useUiStore();
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [groupedTasks, setGroupedTasks] = useState<Record<string, Task[]>>({});
  const [sortBy, setSortBy] = useState<string>("dueDate");
  const [groupBy, setGroupBy] = useState<string>("project");

  // Initialize from stored config
  useEffect(() => {
    if (listViewConfig) {
      setSortBy(listViewConfig.sortBy || "dueDate");
      setGroupBy(listViewConfig.groupBy || "project");
    }
  }, [listViewConfig]);

  // Process tasks when they change
  useEffect(() => {
    if (!tasks || tasks.length === 0) {
      setFilteredTasks([]);
      setGroupedTasks({});
      return;
    }

    // Transform tasks for list view
    const transformedTasks = ListViewService.transformTasksForListView(tasks);

    // Apply sorting
    const sortedTasks = ListViewService.sortTasks(transformedTasks, sortBy);

    // Apply grouping
    const grouped = ListViewService.groupTasksByProject(sortedTasks);

    setFilteredTasks(sortedTasks);
    setGroupedTasks(grouped);

    // Update config
    setListViewConfig({
      sortBy,
      groupBy,
    });
  }, [tasks, sortBy, groupBy]);

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
  };

  const handleGroupChange = (newGroupBy: string) => {
    setGroupBy(newGroupBy);
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    // This would typically be handled by the task store
    // but we can trigger a re-process of tasks
    const currentTasks = tasks || [];
    const updatedTasks = currentTasks.map((task) =>
      task.id === updatedTask.id ? updatedTask : task,
    );

    // Re-process with updated task
    const transformedTasks =
      ListViewService.transformTasksForListView(updatedTasks);
    const sortedTasks = ListViewService.sortTasks(transformedTasks, sortBy);
    const grouped = ListViewService.groupTasksByProject(sortedTasks);

    setFilteredTasks(sortedTasks);
    setGroupedTasks(grouped);
  };

  return {
    tasks: filteredTasks,
    groupedTasks,
    loading,
    error,
    sortBy,
    groupBy,
    handleSortChange,
    handleGroupChange,
    handleTaskUpdate,
    setSortBy,
    setGroupBy,
  };
};
