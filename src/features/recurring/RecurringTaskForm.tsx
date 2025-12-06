// @ts-nocheck
import React, { useState, useEffect } from "react";
import {
  Task,
  TaskStatus,
  PriorityLevel,
  RecurringPattern,
} from "../../types/task";
import { useForm, SubmitHandler } from "react-hook-form";
import { useRecurringTasks } from "../../hooks/useRecurringTasks";
import { recurringTaskService } from "../../services/recurringTaskService";
import { RecurringPatternConfig, RecurringTaskConfig } from "../../types/task";
import { recurringPatternService } from "../../services/recurringPatternService";

interface RecurringTaskFormProps {
  task?: Task;
  onSubmit: (
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "completed">,
    config: RecurringTaskConfig,
  ) => Promise<void>;
  onCancel?: () => void;
  projectId?: string;
}

type FormValues = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: PriorityLevel;
  dueDate?: Date | null;
  dueTime?: string | null;
  recurringPattern?: RecurringPattern | null;
  recurringEndDate?: Date | null;
  recurringCount?: number | null;
  customInterval?: number | null;
  customUnit?: "days" | "weeks" | "months" | "years" | null;
  customDays?: number[];
  customMonthDays?: number[];
  customMonthPosition?: "first" | "second" | "third" | "fourth" | "last" | null;
  customMonthDay?:
    | "monday"
    | "tuesday"
    | "wednesday"
    | "thursday"
    | "friday"
    | "saturday"
    | "sunday"
    | null;
};

const RecurringTaskForm: React.FC<RecurringTaskFormProps> = ({
  task,
  onSubmit,
  onCancel,
  projectId,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
    getValues,
  } = useForm<FormValues>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvancedRecurring, setShowAdvancedRecurring] = useState(false);
  const [patternPresets, setPatternPresets] = useState<
    { id: string; name: string; config: RecurringPatternConfig }[]
  >([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [previewInstances, setPreviewInstances] = useState<
    { date: Date; isGenerated: boolean }[]
  >([]);

  const recurringPattern = watch("recurringPattern");
  const customInterval = watch("customInterval");
  const customUnit = watch("customUnit");
  const customDays = watch("customDays");
  const customMonthDays = watch("customMonthDays");
  const customMonthPosition = watch("customMonthPosition");
  const customMonthDay = watch("customMonthDay");

  const { validateRecurringConfig } = useRecurringTasks();

  // Load pattern presets on mount
  useEffect(() => {
    const presets = recurringPatternService.getPatternPresets();
    setPatternPresets(presets);
  }, []);

  // Initialize form with task data if editing
  useEffect(() => {
    if (task) {
      const config = task.customFields?.recurringConfig || {};
      reset({
        title: task.title,
        description: task.description || "",
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate || null,
        dueTime: task.dueTime || null,
        recurringPattern: task.recurringPattern || null,
        recurringEndDate: config.endDate || null,
        recurringCount: config.maxOccurrences || null,
        customInterval: config.customInterval || null,
        customUnit: config.customUnit || null,
        customDays: config.customDays || [],
        customMonthDays: config.customMonthDays || [],
        customMonthPosition: config.customMonthPosition || null,
        customMonthDay: config.customMonthDay || null,
      });
    } else {
      reset({
        title: "",
        description: "",
        status: "active",
        priority: "P2",
        dueDate: null,
        dueTime: null,
        recurringPattern: null,
        recurringEndDate: null,
        recurringCount: null,
        customInterval: 1,
        customUnit: null,
        customDays: [],
        customMonthDays: [],
        customMonthPosition: null,
        customMonthDay: null,
      });
    }
  }, [task, reset]);

  // Generate preview when pattern changes
  useEffect(() => {
    if (recurringPattern && getValues("dueDate")) {
      generatePreview();
    }
  }, [
    recurringPattern,
    customInterval,
    customUnit,
    customDays,
    customMonthDays,
    customMonthPosition,
    customMonthDay,
  ]);

  const generatePreview = () => {
    const formValues = getValues();
    if (!formValues.dueDate || !formValues.recurringPattern) {
      setPreviewInstances([]);
      return;
    }

    try {
      const config: RecurringTaskConfig = {
        pattern: formValues.recurringPattern,
        startDate: formValues.dueDate,
        endDate: formValues.recurringEndDate || null,
        maxOccurrences: formValues.recurringCount || 5,
        customInterval: formValues.customInterval || 1,
        customUnit: formValues.customUnit || null,
      };

      const patternConfig: RecurringPatternConfig = {
        pattern: config.pattern,
        frequency: config.customUnit || config.pattern,
        endCondition: config.endDate
          ? "on_date"
          : config.maxOccurrences
            ? "after_occurrences"
            : "never",
        endDate: config.endDate || null,
        maxOccurrences: config.maxOccurrences || null,
        interval: config.customInterval || 1,
        customDays: formValues.customDays || null,
        customMonthDays: formValues.customMonthDays || null,
        customMonthPosition: formValues.customMonthPosition || null,
        customMonthDay: formValues.customMonthDay || null,
      };

      const instances = recurringTaskService.generateRecurringInstances(
        {
          ...task,
          id: task?.id || "preview-task",
          title: formValues.title || "Preview Task",
          dueDate: formValues.dueDate,
          customFields: {
            recurringConfig: config,
          },
        },
        config,
      );

      setPreviewInstances(
        instances.slice(0, 5).map((instance) => ({
          date: instance.date,
          isGenerated: instance.isGenerated,
        })),
      );
    } catch (error) {
      console.error("Preview generation error:", error);
      setPreviewInstances([]);
    }
  };

  const validateForm = (): boolean => {
    const formValues = getValues();
    const config: RecurringTaskConfig = {
      pattern: formValues.recurringPattern || "weekly",
      startDate: formValues.dueDate || new Date(),
      endDate: formValues.recurringEndDate || null,
      maxOccurrences: formValues.recurringCount || null,
      customInterval: formValues.customInterval || 1,
      customUnit: formValues.customUnit || null,
    };

    const validation = validateRecurringConfig(config);
    setValidationErrors(validation.errors);
    return validation.valid;
  };

  const onSubmitForm: SubmitHandler<FormValues> = async (data) => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const config: RecurringTaskConfig = {
        pattern: data.recurringPattern || "weekly",
        startDate: data.dueDate || new Date(),
        endDate: data.recurringEndDate || null,
        maxOccurrences: data.recurringCount || null,
        customInterval: data.customInterval || 1,
        customUnit: data.customUnit || null,
      };

      const taskData: Omit<
        Task,
        "id" | "createdAt" | "updatedAt" | "completed"
      > = {
        title: data.title,
        description: data.description || "",
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate || null,
        dueTime: data.dueTime || null,
        recurringPattern: data.recurringPattern || null,
        projectId: projectId || task?.projectId || undefined,
        completed: false,
        order: task?.order || 0,
        customFields: {
          recurringConfig: config,
          recurringEndDate: data.recurringEndDate,
          recurringCount: data.recurringCount,
          customInterval: data.customInterval,
          customUnit: data.customUnit,
          customDays: data.customDays,
          customMonthDays: data.customMonthDays,
          customMonthPosition: data.customMonthPosition,
          customMonthDay: data.customMonthDay,
          ...(task?.customFields || {}),
        },
      };

      await onSubmit(taskData, config);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePatternPresetSelect = (presetId: string) => {
    const preset = patternPresets.find((p) => p.id === presetId);
    if (preset) {
      setValue("recurringPattern", preset.config.pattern);
      setValue("customInterval", preset.config.interval || 1);
      setValue("customUnit", (preset.config.frequency as any) || null);
      setValue("customDays", preset.config.customDays || []);
      setValue("customMonthDays", preset.config.customMonthDays || []);
      setValue(
        "customMonthPosition",
        preset.config.customMonthPosition || null,
      );
      setValue("customMonthDay", preset.config.customMonthDay || null);
    }
  };

  const handleDayToggle = (day: number) => {
    const currentDays = watch("customDays") || [];
    if (currentDays.includes(day)) {
      setValue(
        "customDays",
        currentDays.filter((d) => d !== day),
      );
    } else {
      setValue("customDays", [...currentDays, day]);
    }
  };

  const handleMonthDayToggle = (day: number) => {
    const currentDays = watch("customMonthDays") || [];
    if (currentDays.includes(day)) {
      setValue(
        "customMonthDays",
        currentDays.filter((d) => d !== day),
      );
    } else {
      setValue("customMonthDays", [...currentDays, day]);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
      <div>
        <label
          htmlFor="title"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          {...register("title", {
            required: "Title is required",
            maxLength: {
              value: 255,
              message: "Title cannot exceed 255 characters",
            },
          })}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            errors.title ? "border-red-500" : "border-gray-300"
          }`}
          placeholder="Enter task title"
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          {...register("description", {
            maxLength: {
              value: 5000,
              message: "Description cannot exceed 5000 characters",
            },
          })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          placeholder="Enter task description"
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Status
          </label>
          <select
            id="status"
            {...register("status")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="priority"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Priority
          </label>
          <select
            id="priority"
            {...register("priority")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="P1">P1 - Critical</option>
            <option value="P2">P2 - High</option>
            <option value="P3">P3 - Medium</option>
            <option value="P4">P4 - Low</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="dueDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Due Date
          </label>
          <input
            id="dueDate"
            type="date"
            {...register("dueDate")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label
            htmlFor="dueTime"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Due Time
          </label>
          <input
            id="dueTime"
            type="time"
            {...register("dueTime")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Recurring Task Settings
        </h3>

        <div>
          <label
            htmlFor="recurringPattern"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Recurring Pattern
          </label>
          <select
            id="recurringPattern"
            {...register("recurringPattern")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            onChange={(e) => {
              if (e.target.value !== "custom") {
                setShowAdvancedRecurring(false);
              } else {
                setShowAdvancedRecurring(true);
              }
            }}
          >
            <option value="">None (Single Task)</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {recurringPattern && recurringPattern !== "" && (
          <div className="mt-3 ml-4">
            <button
              type="button"
              onClick={() => setShowAdvancedRecurring(!showAdvancedRecurring)}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
            >
              {showAdvancedRecurring ? "Hide" : "Show"} Advanced Settings
              <svg
                className={`ml-1 h-4 w-4 transform ${showAdvancedRecurring ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showAdvancedRecurring && (
              <div className="mt-3 space-y-3">
                {/* Pattern Presets */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                  {patternPresets.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handlePatternPresetSelect(preset.id)}
                      className="px-2 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>

                {/* Custom Interval */}
                <div>
                  <label
                    htmlFor="customInterval"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Interval
                  </label>
                  <input
                    id="customInterval"
                    type="number"
                    min="1"
                    {...register("customInterval")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Interval"
                  />
                </div>

                {/* Custom Unit */}
                <div>
                  <label
                    htmlFor="customUnit"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Unit
                  </label>
                  <select
                    id="customUnit"
                    {...register("customUnit")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select unit</option>
                    <option value="days">Days</option>
                    <option value="weeks">Weeks</option>
                    <option value="months">Months</option>
                    <option value="years">Years</option>
                  </select>
                </div>

                {/* Custom Days (for weekly patterns) */}
                {recurringPattern === "weekly" && (
                  <div className="border p-3 rounded-md">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Days of Week
                    </h4>
                    <div className="grid grid-cols-7 gap-1 text-xs">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                        (day, index) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => handleDayToggle(index)}
                            className={`px-2 py-1 rounded-md ${
                              (watch("customDays") || []).includes(index)
                                ? "bg-blue-600 text-white"
                                : "border border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {day}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {/* Custom Month Days (for monthly patterns) */}
                {recurringPattern === "monthly" && (
                  <div className="border p-3 rounded-md">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      Days of Month
                    </h4>
                    <div className="grid grid-cols-7 gap-1 text-xs">
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(
                        (day) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => handleMonthDayToggle(day)}
                            className={`px-2 py-1 rounded-md ${
                              (watch("customMonthDays") || []).includes(day)
                                ? "bg-blue-600 text-white"
                                : "border border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {day}
                          </button>
                        ),
                      )}
                    </div>
                  </div>
                )}

                {/* Custom Month Position (for monthly patterns) */}
                {recurringPattern === "monthly" && (
                  <div className="space-y-2">
                    <div>
                      <label
                        htmlFor="customMonthPosition"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Month Position
                      </label>
                      <select
                        id="customMonthPosition"
                        {...register("customMonthPosition")}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select position</option>
                        <option value="first">First</option>
                        <option value="second">Second</option>
                        <option value="third">Third</option>
                        <option value="fourth">Fourth</option>
                        <option value="last">Last</option>
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="customMonthDay"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Day of Week
                      </label>
                      <select
                        id="customMonthDay"
                        {...register("customMonthDay")}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select day</option>
                        <option value="monday">Monday</option>
                        <option value="tuesday">Tuesday</option>
                        <option value="wednesday">Wednesday</option>
                        <option value="thursday">Thursday</option>
                        <option value="friday">Friday</option>
                        <option value="saturday">Saturday</option>
                        <option value="sunday">Sunday</option>
                      </select>
                    </div>
                  </div>
                )}

                <div>
                  <label
                    htmlFor="recurringEndDate"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    End Date (optional)
                  </label>
                  <input
                    id="recurringEndDate"
                    type="date"
                    {...register("recurringEndDate")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label
                    htmlFor="recurringCount"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Number of Occurrences (optional)
                  </label>
                  <input
                    id="recurringCount"
                    type="number"
                    min="1"
                    {...register("recurringCount")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter number of times this task should repeat"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Preview Section */}
      {previewInstances.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-900 mb-2">
            Preview of Next 5 Instances
          </h4>
          <div className="space-y-2">
            {previewInstances.map((instance, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 border border-gray-100 rounded-md bg-gray-50"
              >
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      instance.isGenerated ? "bg-blue-500" : "bg-green-500"
                    }`}
                  ></div>
                  <span className="text-sm text-gray-700">
                    {instance.date.toLocaleDateString()}
                  </span>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-600">
                  {instance.isGenerated ? "Generated" : "Original"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <div className="border border-red-200 bg-red-50 p-3 rounded-md">
          <h4 className="text-sm font-medium text-red-700 mb-2">
            Configuration Errors
          </h4>
          <ul className="text-sm text-red-600 list-disc list-inside">
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {projectId && (
        <div className="pt-2">
          <p className="text-sm text-gray-500">
            Project: <span className="font-medium">{projectId}</span>
          </p>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Saving...
            </>
          ) : task ? (
            "Update Recurring Task"
          ) : (
            "Create Recurring Task"
          )}
        </button>
      </div>
    </form>
  );
};

export { RecurringTaskForm };
export default RecurringTaskForm;
