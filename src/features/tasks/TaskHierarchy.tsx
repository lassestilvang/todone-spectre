import React, { useState, useCallback } from "react";
import { Task } from "../../types/task";
import { TaskItem } from "./TaskItem";
import { SubTaskList } from "./SubTaskList";
import { Button } from "../../components/Button";
import { useTaskHierarchy } from "../../hooks/useTaskHierarchy";

interface TaskHierarchyProps {
  task: Task;
  projectId?: string;
  onTaskClick?: (task: Task) => void;
  onTaskUpdate?: (taskId: string, updates: Partial<Task>) => void;
  onTaskDelete?: (taskId: string) => void;
  onToggleCompletion?: (taskId: string) => void;
  depth?: number;
}

export const TaskHierarchy: React.FC<TaskHierarchyProps> = ({
  task,
  projectId,
  onTaskClick,
  onTaskUpdate,
  onTaskDelete,
  onToggleCompletion,
  depth = 0,
}) => {
  const [isExpanded, setIsExpanded] = useState(depth < 2); // Auto-expand first 2 levels
  const { getSubTasks, createSubTask, updateSubTask, deleteSubTask } =
    useTaskHierarchy();

  const handleToggleExpand = useCallback(() => {
    setIsExpanded(!isExpanded);
  }, [isExpanded]);

  const handleSubTaskCreated = useCallback((subTask: Task) => {
    // Handle sub-task creation
    console.log("Sub-task created:", subTask);
  }, []);

  const handleSubTaskUpdated = useCallback((subTask: Task) => {
    // Handle sub-task update
    console.log("Sub-task updated:", subTask);
  }, []);

  const handleSubTaskDeleted = useCallback((subTaskId: string) => {
    // Handle sub-task deletion
    console.log("Sub-task deleted:", subTaskId);
  }, []);

  const subTasks = getSubTasks(task.id);

  return (
    <div className={`task-hierarchy-item ml-${depth * 4}`}>
      <div className="mb-2">
        <TaskItem
          task={task}
          onToggleCompletion={onToggleCompletion}
          onDelete={onTaskDelete}
          onClick={onTaskClick}
        />
      </div>

      {subTasks.length > 0 && (
        <div className="mt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleExpand}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? "Collapse" : `Expand (${subTasks.length} sub-tasks)`}
          </Button>

          {isExpanded && (
            <div className="mt-2 border-l border-gray-200 pl-4">
              {subTasks.map((subTask) => (
                <TaskHierarchy
                  key={subTask.id}
                  task={subTask}
                  projectId={projectId}
                  onTaskClick={onTaskClick}
                  onTaskUpdate={onTaskUpdate}
                  onTaskDelete={onTaskDelete}
                  onToggleCompletion={onToggleCompletion}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-3">
        <SubTaskList
          parentTaskId={task.id}
          projectId={projectId}
          onSubTaskCreated={handleSubTaskCreated}
          onSubTaskUpdated={handleSubTaskUpdated}
          onSubTaskDeleted={handleSubTaskDeleted}
        />
      </div>
    </div>
  );
};
