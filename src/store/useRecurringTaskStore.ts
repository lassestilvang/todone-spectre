// @ts-nocheck
/**
 * Recurring Task State Management Store
 * Comprehensive state management for recurring tasks with Zustand
 */
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import {
  RecurringTaskConfig,
  RecurringTaskInstance,
  Task,
} from "../types/task";
import { RecurringPattern, TaskStatus } from "../types/enums";

// Helper function to create localStorage
const createJSONStorage = (getStorage: () => Storage) => ({
  getItem: (name: string) => {
    const storage = getStorage();
    const item = storage.getItem(name);
    return item ? JSON.parse(item) : null;
  },
  setItem: (name: string, value: any) => {
    const storage = getStorage();
    storage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name: string) => {
    const storage = getStorage();
    storage.removeItem(name);
  },
});

/**
 * Recurring Task State Interface
 */
export interface RecurringTaskState {
  // Core State
  recurringTasks: Task[];
  recurringTaskInstances: RecurringTaskInstance[];
  isLoading: boolean;
  error: string | null;

  // Filtering and Sorting
  currentFilter: {
    pattern?: RecurringPattern;
    status?: TaskStatus;
    searchQuery?: string;
  };
  sortBy: "title" | "priority" | "dueDate" | "createdAt";
  sortDirection: "asc" | "desc";

  // CRUD Operations
  addRecurringTask: (task: Task) => void;
  updateRecurringTask: (taskId: string, updates: Partial<Task>) => void;
  deleteRecurringTask: (taskId: string) => void;

  // Instance Management
  addRecurringInstance: (instance: RecurringTaskInstance) => void;
  updateRecurringInstance: (
    instanceId: string,
    updates: Partial<RecurringTaskInstance>
  ) => void;
  deleteRecurringInstance: (instanceId: string) => void;
  deleteAllInstancesForTask: (taskId: string) => void;

  // Pattern Management
  updateRecurringPattern: (taskId: string, pattern: RecurringPattern) => void;
  updateRecurringConfig: (taskId: string, config: RecurringTaskConfig) => void;

  // State Management
  pauseRecurringTask: (taskId: string) => void;
  resumeRecurringTask: (taskId: string) => void;

  // Filtering and Sorting
  setFilter: (filter: RecurringTaskState["currentFilter"]) => void;
  setSort: (
    sortBy: RecurringTaskState["sortBy"],
    sortDirection: RecurringTaskState["sortDirection"]
  ) => void;
  applyFilters: () => void;

  // Data Management
  setRecurringTasks: (tasks: Task[]) => void;
  setRecurringTaskInstances: (instances: RecurringTaskInstance[]) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;

  // Utility Methods
  getRecurringInstancesForTask: (taskId: string) => RecurringTaskInstance[];
  getTaskById: (taskId: string) => Task | undefined;
  getInstanceById: (instanceId: string) => RecurringTaskInstance | undefined;

  // Statistics
  getRecurringTaskStats: (taskId: string) => {
    totalInstances: number;
    completedInstances: number;
    pendingInstances: number;
    nextInstanceDate?: Date;
  };

  // Bulk Operations
  bulkDeleteRecurringTasks: (taskIds: string[]) => void;
  bulkUpdateRecurringTaskStatus: (
    taskIds: string[],
    status: TaskStatus
  ) => void;
}

/**
 * Create Recurring Task Store
 */
export const useRecurringTaskStore = create<RecurringTaskState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial State
        recurringTasks: [],
        recurringTaskInstances: [],
        isLoading: false,
        error: null,
        currentFilter: {},
        sortBy: "dueDate",
        sortDirection: "asc",

        /**
         * Add a new recurring task
         */
        addRecurringTask: (task) => {
          set((state) => ({
            recurringTasks: [...state.recurringTasks, task],
          }));
          get().applyFilters();
        },

        /**
         * Update an existing recurring task
         */
        updateRecurringTask: (taskId, updates) => {
          set((state) => ({
            recurringTasks: state.recurringTasks.map((task) =>
              task.id === taskId ? { ...task, ...updates } : task
            ),
          }));
          get().applyFilters();
        },

        /**
         * Delete a recurring task
         */
        deleteRecurringTask: (taskId) => {
          set((state) => ({
            recurringTasks: state.recurringTasks.filter(
              (task) => task.id !== taskId
            ),
            recurringTaskInstances: state.recurringTaskInstances.filter(
              (instance) => instance.originalTaskId !== taskId
            ),
          }));
          get().applyFilters();
        },

        /**
         * Add a new recurring task instance
         */
        addRecurringInstance: (instance) => {
          set((state) => ({
            recurringTaskInstances: [...state.recurringTaskInstances, instance],
          }));
        },

        /**
         * Update an existing recurring task instance
         */
        updateRecurringInstance: (instanceId, updates) => {
          set((state) => ({
            recurringTaskInstances: state.recurringTaskInstances.map(
              (instance) =>
                instance.id === instanceId
                  ? { ...instance, ...updates }
                  : instance
            ),
          }));
        },

        /**
         * Delete a recurring task instance
         */
        deleteRecurringInstance: (instanceId) => {
          set((state) => ({
            recurringTaskInstances: state.recurringTaskInstances.filter(
              (instance) => instance.id !== instanceId
            ),
          }));
        },

        /**
         * Delete all instances for a specific task
         */
        deleteAllInstancesForTask: (taskId) => {
          set((state) => ({
            recurringTaskInstances: state.recurringTaskInstances.filter(
              (instance) => instance.originalTaskId !== taskId
            ),
          }));
        },

        /**
         * Update recurring pattern for a task
         */
        updateRecurringPattern: (taskId, pattern) => {
          set((state) => ({
            recurringTasks: state.recurringTasks.map((task) =>
              task.id === taskId
                ? {
                    ...task,
                    recurringPattern: pattern,
                    customFields: {
                      ...task.customFields,
                      recurringConfig: {
                        ...task.customFields?.recurringConfig,
                        pattern,
                      },
                    },
                  }
                : task
            ),
          }));
        },

        /**
         * Update recurring configuration for a task
         */
        updateRecurringConfig: (taskId, config) => {
          set((state) => ({
            recurringTasks: state.recurringTasks.map((task) =>
              task.id === taskId
                ? {
                    ...task,
                    customFields: {
                      ...task.customFields,
                      recurringConfig: config,
                    },
                  }
                : task
            ),
          }));
        },

        /**
         * Pause a recurring task
         */
        pauseRecurringTask: (taskId) => {
          set((state) => ({
            recurringTasks: state.recurringTasks.map((task) =>
              task.id === taskId
                ? {
                    ...task,
                    status: "archived" as TaskStatus,
                    customFields: {
                      ...task.customFields,
                      isPaused: true,
                    },
                  }
                : task
            ),
          }));
        },

        /**
         * Resume a paused recurring task
         */
        resumeRecurringTask: (taskId) => {
          set((state) => ({
            recurringTasks: state.recurringTasks.map((task) =>
              task.id === taskId
                ? {
                    ...task,
                    status: "active" as TaskStatus,
                    customFields: {
                      ...task.customFields,
                      isPaused: false,
                    },
                  }
                : task
            ),
          }));
        },

        /**
         * Set filter criteria
         */
        setFilter: (filter) => {
          set({ currentFilter: filter });
          get().applyFilters();
        },

        /**
         * Set sorting options
         */
        setSort: (sortBy, sortDirection) => {
          set({ sortBy, sortDirection });
          get().applyFilters();
        },

        /**
         * Apply filters and sorting to recurring tasks
         */
        applyFilters: () => {
          const { recurringTasks, currentFilter, sortBy, sortDirection } =
            get();
          let filtered = [...recurringTasks];

          // Apply pattern filter
          if (currentFilter.pattern) {
            filtered = filtered.filter(
              (task) => task.recurringPattern === currentFilter.pattern
            );
          }

          // Apply status filter
          if (currentFilter.status) {
            filtered = filtered.filter(
              (task) => task.status === currentFilter.status
            );
          }

          // Apply search query filter
          if (currentFilter.searchQuery) {
            const query = currentFilter.searchQuery.toLowerCase();
            filtered = filtered.filter(
              (task) =>
                task.title.toLowerCase().includes(query) ||
                (task.description &&
                  task.description.toLowerCase().includes(query))
            );
          }

          // Apply sorting
          filtered.sort((a, b) => {
            const aValue: any = a[sortBy];
            const bValue: any = b[sortBy];

            // Handle date sorting
            if (aValue instanceof Date && bValue instanceof Date) {
              return sortDirection === "asc"
                ? aValue.getTime() - bValue.getTime()
                : bValue.getTime() - aValue.getTime();
            }

            // Handle string sorting
            if (typeof aValue === "string" && typeof bValue === "string") {
              return sortDirection === "asc"
                ? aValue.localeCompare(bValue)
                : bValue.localeCompare(aValue);
            }

            // Handle priority sorting (custom order)
            if (sortBy === "priority") {
              const priorityOrder: Record<string, number> = {
                P1: 1,
                P2: 2,
                P3: 3,
                P4: 4,
              };
              const aIndex = priorityOrder[a.priority] || 999;
              const bIndex = priorityOrder[b.priority] || 999;
              return sortDirection === "asc"
                ? aIndex - bIndex
                : bIndex - aIndex;
            }

            return 0;
          });

          // Update the filtered state (this would be used in a more complex UI)
          // In this implementation, we just re-sort the main array
          set({ recurringTasks: filtered });
        },

        /**
         * Set recurring tasks directly
         */
        setRecurringTasks: (tasks) => {
          set({ recurringTasks: tasks });
          get().applyFilters();
        },

        /**
         * Set recurring task instances directly
         */
        setRecurringTaskInstances: (instances) => {
          set({ recurringTaskInstances: instances });
        },

        /**
         * Set loading state
         */
        setLoading: (isLoading) => {
          set({ isLoading });
        },

        /**
         * Set error state
         */
        setError: (error) => {
          set({ error });
        },

        /**
         * Get all recurring instances for a specific task
         */
        getRecurringInstancesForTask: (taskId) => {
          return get().recurringTaskInstances.filter(
            (instance) => instance.originalTaskId === taskId
          );
        },

        /**
         * Get task by ID
         */
        getTaskById: (taskId) => {
          return get().recurringTasks.find((task) => task.id === taskId);
        },

        /**
         * Get instance by ID
         */
        getInstanceById: (instanceId) => {
          return get().recurringTaskInstances.find(
            (instance) => instance.id === instanceId
          );
        },

        /**
         * Get recurring task statistics
         */
        getRecurringTaskStats: (taskId) => {
          const instances = get().getRecurringInstancesForTask(taskId);
          const completedInstances = instances.filter((i) => i.completed);
          const pendingInstances = instances.filter(
            (i) => !i.completed && i.status !== "archived"
          );

          const futureInstances = instances
            .filter(
              (i) => !i.completed && i.date && new Date(i.date) > new Date()
            )
            .sort(
              (a, b) => (a.date?.getTime() || 0) - (b.date?.getTime() || 0)
            );

          return {
            totalInstances: instances.length,
            completedInstances: completedInstances.length,
            pendingInstances: pendingInstances.length,
            nextInstanceDate:
              futureInstances.length > 0 ? futureInstances[0].date : undefined,
          };
        },

        /**
         * Bulk delete recurring tasks
         */
        bulkDeleteRecurringTasks: (taskIds) => {
          set((state) => ({
            recurringTasks: state.recurringTasks.filter(
              (task) => !taskIds.includes(task.id)
            ),
            recurringTaskInstances: state.recurringTaskInstances.filter(
              (instance) => !taskIds.includes(instance.originalTaskId)
            ),
          }));
        },

        /**
         * Bulk update recurring task status
         */
        bulkUpdateRecurringTaskStatus: (taskIds, status) => {
          set((state) => ({
            recurringTasks: state.recurringTasks.map((task) =>
              taskIds.includes(task.id) ? { ...task, status } : task
            ),
          }));
        },
      }),
      {
        name: "todone-recurring-tasks-storage",
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
);
