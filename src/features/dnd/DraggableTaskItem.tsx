import React from "react";
import { DraggableTask } from "./DraggableTask";
import TaskItem from "../tasks/TaskItem";
import { Task } from "../../types/task";

interface DraggableTaskItemProps {
  task: Task;
  onToggleCompletion: (taskId: string) => Promise<void>;
  onDelete: (taskId: string) => Promise<void>;
  onClick?: (task: Task) => void;
  source?: string;
  className?: string;
}

export const DraggableTaskItem: React.FC<DraggableTaskItemProps> = ({
  task,
  onToggleCompletion,
  onDelete,
  onClick,
  source = "task-list",
  className = "",
}) => {
  return (
    <DraggableTask task={task} source={source} className={className}>
      <TaskItem
        task={task}
        onToggleCompletion={onToggleCompletion}
        onDelete={onDelete}
        onClick={onClick}
      />
    </DraggableTask>
  );
};
