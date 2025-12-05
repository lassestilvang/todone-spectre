import React from "react";
import { Task } from "../../types/task";
import { PriorityBadge } from "../../components/PriorityBadge";
import { StatusBadge } from "../../components/StatusBadge";
import { MessageSquare } from "lucide-react";

interface TaskItemProps {
  task: Task;
  onToggleCompletion: (taskId: string) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  onClick?: (task: Task) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleCompletion,
  onDelete,
  onClick,
}) => {
  const handleToggleCompletion = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await onToggleCompletion(task.id);
    } catch (error) {
      console.error("Failed to toggle task completion:", error);
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await onDelete(task.id);
      } catch (error) {
        console.error("Failed to delete task:", error);
      }
    }
  };

  const handleClick = () => {
    if (onClick) {
      onClick(task);
    }
  };

  return (
    <div
      className={`p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
        task.completed
          ? "bg-gray-50 border-gray-200"
          : "bg-white border-gray-100"
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <input
            type="checkbox"
            checked={task.completed}
            onChange={handleToggleCompletion}
            onClick={(e) => e.stopPropagation()}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3
                className={`text-sm font-medium truncate ${
                  task.completed
                    ? "line-through text-gray-400"
                    : "text-gray-900"
                }`}
              >
                {task.title}
              </h3>
              <PriorityBadge priority={task.priority} />
              <StatusBadge status={task.status} />
            </div>

            {task.description && (
              <p
                className={`text-sm text-gray-500 mt-1 truncate ${
                  task.completed ? "line-through" : ""
                }`}
              >
                {task.description}
              </p>
            )}

            <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
              {task.dueDate && (
                <span className="flex items-center">
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {task.dueDate.toLocaleDateString()}
                </span>
              )}

              {task.projectId && (
                <span className="flex items-center">
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2h10a2 2 0 012 2"
                    />
                  </svg>
                  Project: {task.projectId}
                </span>
              )}

              {task.commentIds && task.commentIds.length > 0 && (
                <span className="flex items-center">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  {task.commentIds.length} comment
                  {task.commentIds.length > 1 ? "s" : ""}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleDelete}
              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50"
              title="Delete task"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
