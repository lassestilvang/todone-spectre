import React, { useState, useCallback } from "react";
import { Task } from "../../types/task";
import { PriorityBadge } from "../../components/PriorityBadge";
import { StatusBadge } from "../../components/StatusBadge";
import { Button } from "../../components/Button";
import { SubTaskForm } from "./SubTaskForm";
import { formatDate } from "../../utils/dateUtils";

interface SubTaskItemProps {
  subTask: Task;
  onToggleCompletion: (subTaskId: string) => Promise<void>;
  onDelete: (subTaskId: string) => Promise<void>;
  onUpdate: (subTaskId: string, updates: Partial<Task>) => Promise<void>;
  parentTaskId: string;
  projectId?: string;
}

export const SubTaskItem: React.FC<SubTaskItemProps> = ({
  subTask,
  onToggleCompletion,
  onDelete,
  onUpdate,
  parentTaskId,
  projectId,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggleCompletion = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      try {
        await onToggleCompletion(subTask.id);
      } catch (error) {
        console.error("Failed to toggle sub-task completion:", error);
      }
    },
    [onToggleCompletion, subTask.id],
  );

  const handleDelete = useCallback(
    async (e: React.MouseEvent) => {
      e.stopPropagation();
      if (window.confirm("Are you sure you want to delete this sub-task?")) {
        try {
          await onDelete(subTask.id);
        } catch (error) {
          console.error("Failed to delete sub-task:", error);
        }
      }
    },
    [onDelete, subTask.id],
  );

  const handleUpdate = useCallback(
    async (updates: Partial<Task>) => {
      try {
        await onUpdate(subTask.id, updates);
        setIsEditing(false);
      } catch (error) {
        console.error("Failed to update sub-task:", error);
      }
    },
    [onUpdate, subTask.id],
  );

  const toggleExpand = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsExpanded(!isExpanded);
    },
    [isExpanded],
  );

  if (isEditing) {
    return (
      <div className="p-3 border rounded-lg bg-gray-50">
        <SubTaskForm
          subTask={subTask}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          parentTaskId={parentTaskId}
          projectId={projectId}
        />
      </div>
    );
  }

  return (
    <div
      className={`p-3 border rounded-lg shadow-sm hover:shadow-md transition-shadow ${
        subTask.completed
          ? "bg-green-50 border-green-200"
          : "bg-white border-gray-100"
      }`}
    >
      <div className="flex items-start space-x-3">
        <input
          type="checkbox"
          checked={subTask.completed}
          onChange={handleToggleCompletion}
          className="mt-1 flex-shrink-0 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h4
              className={`text-sm font-medium truncate ${
                subTask.completed
                  ? "line-through text-gray-400"
                  : "text-gray-900"
              }`}
            >
              {subTask.title}
            </h4>
            <PriorityBadge priority={subTask.priority} />
            <StatusBadge status={subTask.status} />
          </div>

          {subTask.description && (isExpanded || !subTask.completed) && (
            <p
              className={`text-sm text-gray-500 mt-1 truncate ${
                subTask.completed ? "line-through" : ""
              }`}
            >
              {subTask.description}
            </p>
          )}

          {subTask.dueDate && (
            <div className="flex items-center text-xs text-gray-500 mt-1">
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 002 2z"
                />
              </svg>
              {formatDate(subTask.dueDate)}
            </div>
          )}
        </div>

        <div className="flex flex-col space-y-1">
          <Button
            variant="ghost"
            size="xs"
            onClick={toggleExpand}
            className="text-gray-400 hover:text-gray-600"
          >
            {isExpanded ? "Less" : "More"}
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => setIsEditing(true)}
            className="text-blue-500 hover:text-blue-700"
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700"
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};
