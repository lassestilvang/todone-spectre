import { Task } from "../types/task";
import { ListViewService } from "../services/listViewService";
import { BoardViewService } from "../services/boardViewService";
import { CalendarViewService } from "../services/calendarViewService";

/**
 * View Service Mocks
 * Mock implementations of view services for testing
 */
export class ViewServiceMocks {
  /**
   * Mock ListViewService
   */
  static mockListViewService(): jest.Mocked<ListViewService> {
    return {
      transformTasksForListView: jest.fn((tasks: Task[]) =>
        tasks.map((task) => ({
          ...task,
          displayTitle: task.title || "Mock Task",
          displayPriority: task.priority || "medium",
        })),
      ),
      groupTasksByProject: jest.fn((tasks: Task[]) => {
        return tasks.reduce(
          (acc, task) => {
            const projectKey = task.projectId || "no-project";
            if (!acc[projectKey]) acc[projectKey] = [];
            acc[projectKey].push(task);
            return acc;
          },
          {} as Record<string, Task[]>,
        );
      }),
      sortTasks: jest.fn((tasks: Task[], sortBy: string = "dueDate") => {
        return [...tasks].sort((a, b) => {
          if (sortBy === "dueDate") {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return (
              new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
            );
          }
          return 0;
        });
      }),
      filterTasks: jest.fn((tasks: Task[], filters: Partial<Task>) => {
        return tasks.filter((task) => {
          if (filters.status && task.status !== filters.status) return false;
          if (filters.priority && task.priority !== filters.priority)
            return false;
          return true;
        });
      }),
      getListViewConfig: jest.fn(() => ({
        sortBy: "dueDate",
        groupBy: "project",
      })),
    } as any;
  }

  /**
   * Mock BoardViewService
   */
  static mockBoardViewService(): jest.Mocked<BoardViewService> {
    return {
      transformTasksForBoardView: jest.fn((tasks: Task[]) =>
        tasks.map((task) => ({
          ...task,
          displayTitle: task.title || "Mock Task",
          displayStatus: task.status || "todo",
          status: this.normalizeStatus(task.status || "todo"),
        })),
      ),
      normalizeStatus: jest.fn((status: string) => {
        const normalized = status.toLowerCase();
        if (["todo", "to do", "backlog"].includes(normalized)) return "todo";
        if (
          ["inprogress", "in progress", "doing", "in_progress"].includes(
            normalized,
          )
        )
          return "in_progress";
        if (["done", "completed", "finished"].includes(normalized))
          return "done";
        return "todo";
      }),
      groupTasksByStatus: jest.fn((tasks: Task[]) => {
        return tasks.reduce(
          (acc, task) => {
            const status = this.normalizeStatus(task.status || "todo");
            if (!acc[status]) acc[status] = [];
            acc[status].push(task);
            return acc;
          },
          {} as Record<string, Task[]>,
        );
      }),
      getDefaultColumns: jest.fn(() => ["To Do", "In Progress", "Done"]),
      getBoardViewConfig: jest.fn(() => ({
        columns: ["To Do", "In Progress", "Done"],
        showTaskCount: true,
      })),
      updateTaskStatus: jest.fn((task: Task, newStatus: string) => ({
        ...task,
        status: this.normalizeStatus(newStatus),
      })),
      filterTasks: jest.fn((tasks: Task[], filters: Partial<Task>) => {
        return tasks.filter((task) => {
          if (filters.projectId && task.projectId !== filters.projectId)
            return false;
          if (filters.priority && task.priority !== filters.priority)
            return false;
          return true;
        });
      }),
    } as any;
  }

  /**
   * Mock CalendarViewService
   */
  static mockCalendarViewService(): jest.Mocked<CalendarViewService> {
    return {
      transformTasksForCalendarView: jest.fn((tasks: Task[]) =>
        tasks.map((task) => ({
          ...task,
          displayTitle: task.title || "Mock Task",
          displayDate: task.dueDate ? new Date(task.dueDate) : null,
          dueDate: task.dueDate || new Date().toISOString(),
        })),
      ),
      groupTasksByDate: jest.fn((tasks: Task[]) => {
        return tasks.reduce(
          (acc, task) => {
            if (task.dueDate) {
              const dateKey = new Date(task.dueDate)
                .toISOString()
                .split("T")[0];
              if (!acc[dateKey]) acc[dateKey] = [];
              acc[dateKey].push(task);
            }
            return acc;
          },
          {} as Record<string, Task[]>,
        );
      }),
      getTasksForDateRange: jest.fn(
        (tasks: Task[], startDate: Date, endDate: Date) => {
          return tasks.filter((task) => {
            if (!task.dueDate) return false;
            const taskDate = new Date(task.dueDate);
            return taskDate >= startDate && taskDate <= endDate;
          });
        },
      ),
      getTasksForToday: jest.fn((tasks: Task[]) => {
        const today = new Date();
        const startOfToday = new Date(today.setHours(0, 0, 0, 0));
        const endOfToday = new Date(today.setHours(23, 59, 59, 999));
        return this.getTasksForDateRange(tasks, startOfToday, endOfToday);
      }),
      getTasksForCurrentWeek: jest.fn((tasks: Task[]) => {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday
        const endOfWeek = new Date(today);
        endOfWeek.setDate(today.getDate() - today.getDay() + 7); // Sunday
        return this.getTasksForDateRange(tasks, startOfWeek, endOfWeek);
      }),
      getTasksForCurrentMonth: jest.fn((tasks: Task[]) => {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          0,
        );
        return this.getTasksForDateRange(tasks, startOfMonth, endOfMonth);
      }),
      getCalendarViewConfig: jest.fn(() => ({
        viewMode: "week",
        showWeekends: true,
      })),
      filterTasks: jest.fn((tasks: Task[], filters: Partial<Task>) => {
        return tasks.filter((task) => {
          if (filters.projectId && task.projectId !== filters.projectId)
            return false;
          if (filters.priority && task.priority !== filters.priority)
            return false;
          return true;
        });
      }),
      getDateRangeForNavigation: jest.fn(
        (currentDate: Date, viewMode: string = "week") => {
          if (viewMode === "day") {
            return {
              start: new Date(currentDate.setHours(0, 0, 0, 0)),
              end: new Date(currentDate.setHours(23, 59, 59, 999)),
            };
          } else if (viewMode === "week") {
            const start = new Date(currentDate);
            start.setDate(currentDate.getDate() - currentDate.getDay() + 1);
            const end = new Date(currentDate);
            end.setDate(currentDate.getDate() - currentDate.getDay() + 7);
            return { start, end };
          } else {
            // month
            const start = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              1,
            );
            const end = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth() + 1,
              0,
            );
            return { start, end };
          }
        },
      ),
    } as any;
  }

  /**
   * Create mock view services for all view types
   */
  static createMockViewServices() {
    return {
      listViewService: this.mockListViewService(),
      boardViewService: this.mockBoardViewService(),
      calendarViewService: this.mockCalendarViewService(),
    };
  }
}
