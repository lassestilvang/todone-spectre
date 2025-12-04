import React, { useState, useCallback } from 'react';
import { SubTaskItem } from './SubTaskItem';
import { SubTaskForm } from './SubTaskForm';
import { Task } from '../../types/task';
import { useSubTasks } from '../../hooks/useSubTasks';
import { Button } from '../../components/Button';

interface SubTaskListProps {
  parentTaskId: string;
  projectId?: string;
  onSubTaskCreated?: (subTask: Task) => void;
  onSubTaskUpdated?: (subTask: Task) => void;
  onSubTaskDeleted?: (subTaskId: string) => void;
}

export const SubTaskList: React.FC<SubTaskListProps> = ({
  parentTaskId,
  projectId,
  onSubTaskCreated,
  onSubTaskUpdated,
  onSubTaskDeleted
}) => {
  const [isAddingSubTask, setIsAddingSubTask] = useState(false);
  const {
    subTasks,
    isLoading,
    error,
    createSubTask,
    updateSubTask,
    deleteSubTask,
    toggleSubTaskCompletion
  } = useSubTasks(parentTaskId);

  const handleCreateSubTask = useCallback(async (subTaskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'completed'>) => {
    try {
      const newSubTask = await createSubTask({
        ...subTaskData,
        parentTaskId,
        projectId: projectId || subTaskData.projectId
      });
      onSubTaskCreated?.(newSubTask);
      setIsAddingSubTask(false);
    } catch (error) {
      console.error('Failed to create sub-task:', error);
    }
  }, [createSubTask, parentTaskId, projectId, onSubTaskCreated]);

  const handleUpdateSubTask = useCallback(async (subTaskId: string, updates: Partial<Task>) => {
    try {
      const updatedSubTask = await updateSubTask(subTaskId, updates);
      onSubTaskUpdated?.(updatedSubTask);
    } catch (error) {
      console.error('Failed to update sub-task:', error);
    }
  }, [updateSubTask, onSubTaskUpdated]);

  const handleDeleteSubTask = useCallback(async (subTaskId: string) => {
    try {
      await deleteSubTask(subTaskId);
      onSubTaskDeleted?.(subTaskId);
    } catch (error) {
      console.error('Failed to delete sub-task:', error);
    }
  }, [deleteSubTask, onSubTaskDeleted]);

  const handleToggleCompletion = useCallback(async (subTaskId: string) => {
    try {
      await toggleSubTaskCompletion(subTaskId);
    } catch (error) {
      console.error('Failed to toggle sub-task completion:', error);
    }
  }, [toggleSubTaskCompletion]);

  if (isLoading) {
    return (
      <div className="p-4 text-center text-gray-500">
        Loading sub-tasks...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        Error loading sub-tasks: {error}
      </div>
    );
  }

  return (
    <div className="ml-4 border-l border-gray-200 pl-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-medium text-gray-600 uppercase tracking-wide">
          Sub-Tasks ({subTasks.length})
        </h3>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsAddingSubTask(!isAddingSubTask)}
        >
          {isAddingSubTask ? 'Cancel' : 'Add Sub-Task'}
        </Button>
      </div>

      {isAddingSubTask && (
        <div className="mb-4">
          <SubTaskForm
            onSubmit={handleCreateSubTask}
            onCancel={() => setIsAddingSubTask(false)}
            parentTaskId={parentTaskId}
            projectId={projectId}
          />
        </div>
      )}

      {subTasks.length === 0 ? (
        <div className="p-4 text-center text-gray-500 text-sm">
          No sub-tasks yet. Add a sub-task to break down this task.
        </div>
      ) : (
        <div className="space-y-2">
          {subTasks.map((subTask) => (
            <SubTaskItem
              key={subTask.id}
              subTask={subTask}
              onToggleCompletion={handleToggleCompletion}
              onDelete={handleDeleteSubTask}
              onUpdate={handleUpdateSubTask}
              parentTaskId={parentTaskId}
              projectId={projectId}
            />
          ))}
        </div>
      )}
    </div>
  );
};