import React, { useMemo } from "react";
import { Task } from "../../types/task";
import TaskItem from "./TaskItem";
import RecurringTaskList from "../recurring/RecurringTaskList";
import { useTasks } from "../../hooks/useTasks";
import { useRecurringTaskIntegration } from "../../hooks/useRecurringTaskIntegration";

interface TaskListProps {
  projectId?: string;
  showCompleted?: boolean;
  onTaskClick?: (task: Task) => void;
  showRecurringTasks?: boolean;
}

const TaskList: React.FC<TaskListProps> = ({
  projectId,
  showCompleted = true,
  onTaskClick,
  showRecurringTasks = true,
}) => {
  const { getProcessedTasks, isLoading, error, toggleCompletion, deleteTask } =
    useTasks(projectId);

  const { getRecurringTasks } = useRecurringTaskIntegration();

  const processedTasks = useMemo(() => {
    const tasks = getProcessedTasks();
    return showCompleted ? tasks : tasks.filter((task) => !task.completed);
  }, [getProcessedTasks, showCompleted]);

  const recurringTasks = useMemo(() => {
    return getRecurringTasks();
  }, [getRecurringTasks]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        Error loading tasks: {error}
      </div>
    );
  }

  if (
    processedTasks.length === 0 &&
    (!showRecurringTasks || recurringTasks.length === 0)
  ) {
    return (
      <div className="p-4 text-center text-gray-500">
        No tasks found. Create a new task to get started!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Regular Tasks */}
      {processedTasks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Regular Tasks
          </h3>
          <div className="space-y-2">
            {processedTasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleCompletion={toggleCompletion}
                onDelete={deleteTask}
                onClick={onTaskClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recurring Tasks */}
      {showRecurringTasks && recurringTasks.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Recurring Tasks
          </h3>
          <RecurringTaskList
            tasks={recurringTasks}
            onTaskClick={onTaskClick}
            onEditTask={(task) => onTaskClick?.(task)}
            onDeleteTask={deleteTask}
          />
        </div>
      )}
    </div>
  );
};

export { TaskList };
export default TaskList;
