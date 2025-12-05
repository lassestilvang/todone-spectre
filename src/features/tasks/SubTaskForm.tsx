import React, { useState, useEffect, useCallback } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Task, TaskStatus, PriorityLevel } from "../../types/task";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Textarea } from "../../components/Textarea";
import { Select } from "../../components/Select";
import { DatePicker } from "../../components/DatePicker";

interface SubTaskFormProps {
  subTask?: Task;
  onSubmit: (subTaskData: Partial<Task>) => Promise<void>;
  onCancel?: () => void;
  parentTaskId: string;
  projectId?: string;
}

type FormValues = {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: PriorityLevel;
  dueDate?: Date | null;
};

export const SubTaskForm: React.FC<SubTaskFormProps> = ({
  subTask,
  onSubmit,
  onCancel,
  parentTaskId,
  projectId,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      title: subTask?.title || "",
      description: subTask?.description || "",
      status: subTask?.status || "todo",
      priority: subTask?.priority || "medium",
      dueDate: subTask?.dueDate || null,
    },
  });

  // Reset form when subTask changes
  useEffect(() => {
    if (subTask) {
      reset({
        title: subTask.title,
        description: subTask.description || "",
        status: subTask.status,
        priority: subTask.priority,
        dueDate: subTask.dueDate || null,
      });
    }
  }, [subTask, reset]);

  const onSubmitForm: SubmitHandler<FormValues> = useCallback(
    async (data) => {
      setIsSubmitting(true);
      try {
        const subTaskData: Partial<Task> = {
          title: data.title,
          description: data.description || "",
          status: data.status,
          priority: data.priority,
          dueDate: data.dueDate || null,
          parentTaskId,
          projectId: projectId || subTask?.projectId,
        };

        await onSubmit(subTaskData);
      } catch (error) {
        console.error("Form submission error:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [onSubmit, parentTaskId, projectId, subTask?.projectId],
  );

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      <div>
        <Input
          {...register("title", { required: "Title is required" })}
          label="Title"
          placeholder="Enter sub-task title"
          error={errors.title?.message}
          disabled={isSubmitting}
        />
      </div>

      <div>
        <Textarea
          {...register("description")}
          label="Description"
          placeholder="Enter sub-task description (optional)"
          rows={3}
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Select
            {...register("status")}
            label="Status"
            options={[
              { value: "todo", label: "To Do" },
              { value: "in-progress", label: "In Progress" },
              { value: "completed", label: "Completed" },
              { value: "archived", label: "Archived" },
            ]}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <Select
            {...register("priority")}
            label="Priority"
            options={[
              { value: "low", label: "Low" },
              { value: "medium", label: "Medium" },
              { value: "high", label: "High" },
              { value: "critical", label: "Critical" },
            ]}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div>
        <DatePicker
          label="Due Date"
          selected={watch("dueDate")}
          onChange={(date) => setValue("dueDate", date)}
          placeholderText="Select due date"
          disabled={isSubmitting}
          isClearable
        />
      </div>

      <div className="flex space-x-3">
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : subTask
              ? "Update Sub-Task"
              : "Create Sub-Task"}
        </Button>

        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};
