import { create } from "zustand";
import { persist } from "zustand/middleware";
import { devtools } from "zustand/middleware";
import { TaskState, Task } from "../types/store";

export const useTaskStore = create<TaskState>()(
  devtools(
    persist(
      (set, get) => ({
        tasks: [],
        filteredTasks: [],
        currentFilter: {},
        sortBy: "createdAt",
        sortDirection: "desc",
        taskError: null,
        currentPage: 1,
        selectedTaskIds: [],

        // CRUD Operations
        addTask: (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
          const newTask: Task = {
            ...taskData,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date(),
            updatedAt: new Date(),
            completed: false,
          };
          set((state) => ({
            tasks: [...state.tasks, newTask],
          }));
          get().applyFilters();
        },

        updateTask: (
          id: string,
          updates: Partial<Omit<Task, "id" | "createdAt">>,
        ) => {
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id
                ? {
                    ...task,
                    ...updates,
                    updatedAt: new Date(),
                  }
                : task,
            ),
          }));
          get().applyFilters();
        },

        deleteTask: (id: string) => {
          set((state) => ({
            tasks: state.tasks.filter((task) => task.id !== id),
          }));
          get().applyFilters();
        },

        toggleTaskCompletion: (id: string) => {
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id
                ? {
                    ...task,
                    completed: !task.completed,
                    updatedAt: new Date(),
                  }
                : task,
            ),
          }));
          get().applyFilters();
        },

        // Filtering and Sorting
        setFilter: (filter: TaskState["currentFilter"]) => {
          set({ currentFilter: filter });
          get().applyFilters();
        },

        setSort: (
          sortBy: TaskState["sortBy"],
          sortDirection: TaskState["sortDirection"],
        ) => {
          set({ sortBy, sortDirection });
          get().applyFilters();
        },

        applyFilters: () => {
          const { tasks, currentFilter, sortBy, sortDirection } = get();
          let filtered = [...tasks];

          // Apply status filter
          if (currentFilter.status) {
            filtered = filtered.filter(
              (task) => task.status === currentFilter.status,
            );
          }

          // Apply priority filter
          if (currentFilter.priority) {
            filtered = filtered.filter(
              (task) => task.priority === currentFilter.priority,
            );
          }

          // Apply search query filter
          if (currentFilter.searchQuery) {
            const query = currentFilter.searchQuery.toLowerCase();
            filtered = filtered.filter(
              (task) =>
                task.title.toLowerCase().includes(query) ||
                task.description?.toLowerCase().includes(query),
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
              const priorityOrder = ["critical", "high", "medium", "low"];
              const aIndex = priorityOrder.indexOf(a.priority);
              const bIndex = priorityOrder.indexOf(b.priority);
              return sortDirection === "asc"
                ? aIndex - bIndex
                : bIndex - aIndex;
            }

            return 0;
          });

          set({ filteredTasks: filtered });
        },

        // Initialize with some sample tasks
        initializeSampleTasks: () => {
          const sampleTasks: Task[] = [
            {
              id: "task-1",
              title: "Complete project documentation",
              description:
                "Write comprehensive documentation for the Todone application",
              status: "in-progress",
              priority: "high",
              dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
              createdAt: new Date(),
              updatedAt: new Date(),
              completed: false,
            },
            {
              id: "task-2",
              title: "Review pull requests",
              description: "Review and merge pending pull requests",
              status: "todo",
              priority: "medium",
              createdAt: new Date(),
              updatedAt: new Date(),
              completed: false,
            },
            {
              id: "task-3",
              title: "Fix authentication bug",
              description: "Debug and fix the login redirect issue",
              status: "todo",
              priority: "critical",
              createdAt: new Date(),
              updatedAt: new Date(),
              completed: false,
            },
          ];

          set({ tasks: sampleTasks });
          get().applyFilters();
        },

        // Task loading states
        setTasks: (tasks: Task[]) => {
          set({ tasks });
          get().applyFilters();
        },

        // Task error handling
        setTaskError: (error: string | null) => {
          set({ taskError: error });
        },

        // Pagination support
        setCurrentPage: (page: number) => {
          set({ currentPage: page });
        },

        // Task selection
        setSelectedTaskIds: (taskIds: string[]) => {
          set({ selectedTaskIds: taskIds });
        },

        // Bulk operations
        bulkDeleteTasks: (taskIds: string[]) => {
          set((state) => ({
            tasks: state.tasks.filter((task) => !taskIds.includes(task.id)),
          }));
          get().applyFilters();
        },

        // Sub-task specific operations
        getSubTasks: (parentTaskId: string): Task[] => {
          return get().tasks.filter(
            (task) => task.parentTaskId === parentTaskId,
          );
        },

        getTaskHierarchy: (parentTaskId: string): Task[] => {
          const buildHierarchy = (taskId: string): Task[] => {
            const children = get().tasks.filter(
              (task) => task.parentTaskId === taskId,
            );
            return children.map((child) => ({
              ...child,
              children: buildHierarchy(child.id),
            }));
          };

          return buildHierarchy(parentTaskId);
        },

        calculateSubTaskCompletion: (parentTaskId: string): number => {
          const subTasks = get().getSubTasks(parentTaskId);
          if (subTasks.length === 0) return 0;

          const completedCount = subTasks.filter(
            (task) => task.completed,
          ).length;
          return Math.round((completedCount / subTasks.length) * 100);
        },

        // Task status updates
        updateTaskStatus: (id: string, status: TaskStatus) => {
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id
                ? {
                    ...task,
                    status,
                    updatedAt: new Date(),
                  }
                : task,
            ),
          }));
          get().applyFilters();
        },

        // Task priority updates
        updateTaskPriority: (id: string, priority: PriorityLevel) => {
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === id
                ? {
                    ...task,
                    priority,
                    updatedAt: new Date(),
                  }
                : task,
            ),
          }));
          get().applyFilters();
        },

        // Drag and Drop Operations
        reorderTask: (
          taskId: string,
          targetTaskId: string,
          position: "before" | "after" = "after",
        ) => {
          set((state) => {
            const taskIndex = state.tasks.findIndex(
              (task) => task.id === taskId,
            );
            const targetIndex = state.tasks.findIndex(
              (task) => task.id === targetTaskId,
            );

            if (taskIndex === -1 || targetIndex === -1)
              return { tasks: state.tasks };

            const newTasks = [...state.tasks];
            const [task] = newTasks.splice(taskIndex, 1);

            if (position === "before") {
              newTasks.splice(targetIndex, 0, task);
            } else {
              newTasks.splice(targetIndex + 1, 0, task);
            }

            return { tasks: newTasks };
          });
          get().applyFilters();
        },

        moveTask: (taskId: string, targetId: string) => {
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === taskId
                ? {
                    ...task,
                    projectId: targetId.startsWith("project-")
                      ? targetId.replace("project-", "")
                      : targetId,
                    updatedAt: new Date(),
                  }
                : task,
            ),
          }));
          get().applyFilters();
        },

        moveTaskToProject: (taskId: string, projectId: string) => {
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === taskId
                ? {
                    ...task,
                    projectId,
                    updatedAt: new Date(),
                  }
                : task,
            ),
          }));
          get().applyFilters();
        },

        moveTaskToColumn: (taskId: string, columnId: string) => {
          set((state) => ({
            tasks: state.tasks.map((task) =>
              task.id === taskId
                ? {
                    ...task,
                    columnId,
                    updatedAt: new Date(),
                  }
                : task,
            ),
          }));
          get().applyFilters();
        },
      }),
      {
        name: "todone-tasks-storage",
        storage: createJSONStorage(() => localStorage),
      },
    ),
  ),
);

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
