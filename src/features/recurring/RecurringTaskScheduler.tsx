import React, { useState, useEffect, useCallback } from "react";
import { Task, RecurringPattern, TaskStatus } from "../../types/task";
import {
  format,
  addDays,
  addWeeks,
  addMonths,
  addYears,
  isBefore,
  isAfter,
  parseISO,
} from "date-fns";
import { useRecurringTasks } from "../../hooks/useRecurringTasks";
import { recurringTaskService } from "../../services/recurringTaskService";
import { recurringPatternService } from "../../services/recurringPatternService";
import { PriorityBadge } from "../../components/PriorityBadge";
import { StatusBadge } from "../../components/StatusBadge";

interface RecurringTaskSchedulerProps {
  task: Task;
  onScheduleUpdate: (updatedTask: Task) => void;
  onCancel?: () => void;
  showAdvancedOptions?: boolean;
}

interface RecurringInstance {
  id: string;
  date: Date;
  isGenerated: boolean;
  status: Task["status"];
  completed: boolean;
  originalTaskId: string;
}

const RecurringTaskScheduler: React.FC<RecurringTaskSchedulerProps> = ({
  task,
  onScheduleUpdate,
  onCancel,
  showAdvancedOptions = false,
}) => {
  const [instances, setInstances] = useState<RecurringInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingInstance, setEditingInstance] =
    useState<RecurringInstance | null>(null);
  const [editStatus, setEditStatus] = useState<Task["status"]>("active");
  const [showAll, setShowAll] = useState(false);
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [selectedInstanceIds, setSelectedInstanceIds] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<Task["status"]>("active");
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all");
  const [sortBy, setSortBy] = useState<"date" | "status">("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const {
    updateRecurringTask,
    completeRecurringInstance,
    generateNextInstance,
    regenerateAllInstances,
  } = useRecurringTasks();

  const loadInstances = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!task.recurringPattern || !task.dueDate) {
        setInstances([]);
        setIsLoading(false);
        return;
      }

      // Get instances from service
      const taskInstances = recurringTaskService.getRecurringInstances(task.id);

      // Map to our instance format
      const mappedInstances: RecurringInstance[] = taskInstances.map(
        (taskInstance) => ({
          id: taskInstance.id,
          date: taskInstance.dueDate || new Date(),
          isGenerated: !!taskInstance.customFields?.isRecurringInstance,
          status: taskInstance.status,
          completed: taskInstance.completed,
          originalTaskId: task.id,
        }),
      );

      setInstances(mappedInstances);
    } catch (err) {
      setError("Failed to load recurring instances");
      console.error("Error loading instances:", err);
      setInstances([]);
    } finally {
      setIsLoading(false);
    }
  }, [task]);

  useEffect(() => {
    loadInstances();
  }, [task, loadInstances]);

  const handleStatusChange = useCallback(
    async (instanceId: string, newStatus: Task["status"]) => {
      try {
        // Update local state optimistically
        setInstances((prevInstances) =>
          prevInstances.map((instance) =>
            instance.id === instanceId
              ? { ...instance, status: newStatus }
              : instance,
          ),
        );

        // Find the task instance to update
        const instanceToUpdate = instances.find(
          (instance) => instance.id === instanceId,
        );
        if (!instanceToUpdate) return;

        // Update the task via service
        await updateRecurringTask(instanceId, {
          status: newStatus,
        });

        // Refresh instances
        await loadInstances();
      } catch (err) {
        console.error("Error updating instance status:", err);
        // Revert on error
        await loadInstances();
      }
    },
    [instances, updateRecurringTask, loadInstances],
  );

  const startEditing = (instance: RecurringInstance) => {
    setEditingInstance(instance);
    setEditStatus(instance.status);
  };

  const saveEdit = async () => {
    if (editingInstance) {
      await handleStatusChange(editingInstance.id, editStatus);
      setEditingInstance(null);
    }
  };

  const cancelEdit = () => {
    setEditingInstance(null);
  };

  const handleCompleteInstance = async (instanceId: string) => {
    try {
      await completeRecurringInstance(instanceId);
      await loadInstances();
    } catch (err) {
      console.error("Error completing instance:", err);
    }
  };

  const handleGenerateNextInstance = async () => {
    try {
      await generateNextInstance(task.id);
      await loadInstances();
    } catch (err) {
      console.error("Error generating next instance:", err);
    }
  };

  const handleRegenerateAllInstances = async () => {
    try {
      await regenerateAllInstances(task.id);
      await loadInstances();
    } catch (err) {
      console.error("Error regenerating instances:", err);
    }
  };

  const toggleBulkEditMode = () => {
    setBulkEditMode(!bulkEditMode);
    if (bulkEditMode) {
      setSelectedInstanceIds([]);
    }
  };

  const handleInstanceSelect = (instanceId: string) => {
    if (selectedInstanceIds.includes(instanceId)) {
      setSelectedInstanceIds(
        selectedInstanceIds.filter((id) => id !== instanceId),
      );
    } else {
      setSelectedInstanceIds([...selectedInstanceIds, instanceId]);
    }
  };

  const selectAllInstances = () => {
    setSelectedInstanceIds(instances.map((instance) => instance.id));
  };

  const deselectAllInstances = () => {
    setSelectedInstanceIds([]);
  };

  const handleBulkStatusChange = async () => {
    try {
      for (const instanceId of selectedInstanceIds) {
        await handleStatusChange(instanceId, bulkStatus);
      }

      // Clear selection and exit bulk mode
      setSelectedInstanceIds([]);
      setBulkEditMode(false);
    } catch (err) {
      console.error("Error applying bulk status change:", err);
    }
  };

  const handleBulkComplete = async () => {
    try {
      for (const instanceId of selectedInstanceIds) {
        await completeRecurringInstance(instanceId);
      }

      // Clear selection and exit bulk mode
      setSelectedInstanceIds([]);
      setBulkEditMode(false);

      await loadInstances();
    } catch (err) {
      console.error("Error completing instances in bulk:", err);
    }
  };

  const handleSaveAll = async () => {
    try {
      // Create updated task with instance information
      const updatedTask = {
        ...task,
        customFields: {
          ...task.customFields,
          recurringInstances: instances.map((instance) => ({
            id: instance.id,
            date: instance.date.toISOString(),
            status: instance.status,
            isGenerated: instance.isGenerated,
            completed: instance.completed,
          })),
        },
      };

      await onScheduleUpdate(updatedTask);
    } catch (err) {
      console.error("Error saving schedule changes:", err);
    }
  };

  const handleSort = (field: "date" | "status") => {
    if (sortBy === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortDirection("asc");
    }
  };

  const getSortIndicator = (field: "date" | "status") => {
    if (sortBy !== field) return null;
    return sortDirection === "asc" ? "↑" : "↓";
  };

  const filteredInstances = instances.filter((instance) => {
    if (filterStatus === "all") return true;
    return instance.status === filterStatus;
  });

  const sortedInstances = [...filteredInstances].sort((a, b) => {
    if (sortBy === "status") {
      const statusOrder: Record<string, number> = {
        "in-progress": 1,
        active: 2,
        pending: 3,
        completed: 4,
        archived: 5,
      };
      return (
        (statusOrder[a.status] - statusOrder[b.status]) *
        (sortDirection === "asc" ? 1 : -1)
      );
    } else {
      return (
        (a.date.getTime() - b.date.getTime()) *
        (sortDirection === "asc" ? 1 : -1)
      );
    }
  });

  const visibleInstances = showAll
    ? sortedInstances
    : sortedInstances.slice(0, 10);

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
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">
          Recurring Task Schedule: {task.title}
        </h2>
        <div className="flex space-x-2">
          {instances.length > 10 && (
            <button
              onClick={() => setShowAll(!showAll)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {showAll ? "Show Less" : `Show All (${instances.length})`}
            </button>
          )}
          {onCancel && (
            <button
              onClick={onCancel}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">
              <strong>Pattern:</strong> {task.recurringPattern || "None"}
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <strong>Start Date:</strong>{" "}
              {task.dueDate ? format(new Date(task.dueDate), "PPP") : "Not set"}
            </p>
            {task.customFields?.recurringEndDate && (
              <p className="text-sm text-gray-600 mb-1">
                <strong>End Date:</strong>{" "}
                {format(new Date(task.customFields.recurringEndDate), "PPP")}
              </p>
            )}
            {task.customFields?.recurringCount && (
              <p className="text-sm text-gray-600 mb-1">
                <strong>Occurrences:</strong> {task.customFields.recurringCount}
              </p>
            )}
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">
              <strong>Status:</strong> <StatusBadge status={task.status} />
            </p>
            <p className="text-sm text-gray-600 mb-1">
              <strong>Priority:</strong>{" "}
              <PriorityBadge priority={task.priority} />
            </p>
            {task.description && (
              <p className="text-sm text-gray-600 mb-1">
                <strong>Description:</strong> {task.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <button
            onClick={handleGenerateNextInstance}
            className="px-3 py-1 text-sm border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
            title="Generate next instance"
          >
            <svg
              className="w-4 h-4 inline mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4l8 8-8 8"
              />
            </svg>
            Generate Next
          </button>

          <button
            onClick={handleRegenerateAllInstances}
            className="px-3 py-1 text-sm border border-green-600 text-green-600 rounded-md hover:bg-green-50"
            title="Regenerate all instances"
          >
            <svg
              className="w-4 h-4 inline mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h5M20 20v-5h-5M4 20h5v-5M20 4h-5v5"
              />
            </svg>
            Regenerate All
          </button>

          <button
            onClick={toggleBulkEditMode}
            className="px-3 py-1 text-sm border border-purple-600 text-purple-600 rounded-md hover:bg-purple-50"
            title="Bulk edit instances"
          >
            <svg
              className="w-4 h-4 inline mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            {bulkEditMode ? "Exit Bulk Mode" : "Bulk Actions"}
          </button>
        </div>
      </div>

      {/* Bulk Edit Controls */}
      {bulkEditMode && (
        <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedInstanceIds.length} selected
              </span>
              <button
                onClick={deselectAllInstances}
                className="px-2 py-1 text-xs border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Clear
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={bulkStatus}
                onChange={(e) =>
                  setBulkStatus(e.target.value as Task["status"])
                }
                className="px-2 py-1 border border-gray-300 rounded-md text-sm"
              >
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="in-progress">In Progress</option>
                <option value="pending">Pending</option>
                <option value="archived">Archived</option>
              </select>

              <button
                onClick={handleBulkStatusChange}
                className="px-3 py-1 text-sm border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
              >
                Apply Status
              </button>

              <button
                onClick={handleBulkComplete}
                className="px-3 py-1 text-sm border border-green-600 text-green-600 rounded-md hover:bg-green-50"
              >
                Mark Completed
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {visibleInstances.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No recurring instances found. This task doesn't have a recurring
            pattern.
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-3">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Filter:</span>
                <select
                  value={filterStatus}
                  onChange={(e) =>
                    setFilterStatus(e.target.value as TaskStatus | "all")
                  }
                  className="px-2 py-1 border border-gray-300 rounded-md text-sm"
                >
                  <option value="all">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="in-progress">In Progress</option>
                  <option value="pending">Pending</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Sort:</span>
                <button
                  onClick={() => handleSort("date")}
                  className={`px-2 py-1 text-sm border border-gray-300 rounded-md ${sortBy === "date" ? "bg-gray-100" : "hover:bg-gray-50"}`}
                >
                  Date {getSortIndicator("date")}
                </button>
                <button
                  onClick={() => handleSort("status")}
                  className={`px-2 py-1 text-sm border border-gray-300 rounded-md ${sortBy === "status" ? "bg-gray-100" : "hover:bg-gray-50"}`}
                >
                  Status {getSortIndicator("status")}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {visibleInstances.map((instance) => {
                const isSelected = selectedInstanceIds.includes(instance.id);
                const isPaused = task.customFields?.isPaused;

                return (
                  <div
                    key={instance.id}
                    className={`border border-gray-200 rounded-lg p-3 ${isSelected ? "ring-2 ring-blue-500" : ""}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium text-gray-900">
                          {format(instance.date, "PPP")}
                        </p>
                        <p className="text-xs text-gray-500">
                          {instance.isGenerated ? "Generated" : "Original"}{" "}
                          Instance
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          instance.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : instance.status === "in-progress"
                              ? "bg-blue-100 text-blue-800"
                              : instance.status === "archived"
                                ? "bg-gray-100 text-gray-800"
                                : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {instance.status.replace("-", " ")}
                      </span>
                    </div>

                    {bulkEditMode ? (
                      <div className="flex space-x-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleInstanceSelect(instance.id)}
                          className="mt-1"
                        />
                      </div>
                    ) : editingInstance?.id === instance.id ? (
                      <div className="space-y-2">
                        <select
                          value={editStatus}
                          onChange={(e) =>
                            setEditStatus(e.target.value as Task["status"])
                          }
                          className="w-full px-2 py-1 border border-gray-300 rounded-md text-sm"
                        >
                          <option value="active">Active</option>
                          <option value="completed">Completed</option>
                          <option value="in-progress">In Progress</option>
                          <option value="pending">Pending</option>
                          <option value="archived">Archived</option>
                        </select>
                        <div className="flex space-x-2">
                          <button
                            onClick={saveEdit}
                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1 border border-gray-300 text-sm rounded-md hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <button
                          onClick={() => startEditing(instance)}
                          className="w-full mt-2 px-2 py-1 border border-gray-300 text-sm rounded-md hover:bg-gray-50 text-left"
                        >
                          Change Status
                        </button>

                        {!instance.completed && (
                          <button
                            onClick={() => handleCompleteInstance(instance.id)}
                            className="w-full px-2 py-1 border border-green-300 text-green-600 text-sm rounded-md hover:bg-green-50"
                          >
                            Mark Completed
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleSaveAll}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Save Schedule Changes
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RecurringTaskScheduler;
