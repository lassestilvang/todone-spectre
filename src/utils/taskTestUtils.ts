import { Task, TaskStatus, PriorityLevel } from "../types/task";

/**
 * Generate mock task data for testing
 */
export const generateMockTask = (overrides: Partial<Task> = {}): Task => {
  return {
    id: `task-${Math.random().toString(36).substr(2, 9)}`,
    title: overrides.title || `Test Task ${Math.floor(Math.random() * 1000)}`,
    description: overrides.description || "This is a test task description",
    status: overrides.status || "todo",
    priority: overrides.priority || "medium",
    dueDate: overrides.dueDate || null,
    createdAt: new Date(),
    updatedAt: new Date(),
    completed: overrides.completed || false,
    projectId: overrides.projectId || undefined,
    ...overrides,
  };
};

/**
 * Generate multiple mock tasks
 */
export const generateMockTasks = (count: number = 5): Task[] => {
  const statuses: TaskStatus[] = [
    "todo",
    "in-progress",
    "completed",
    "archived",
  ];
  const priorities: PriorityLevel[] = ["low", "medium", "high", "critical"];

  return Array.from({ length: count }, (_, i) =>
    generateMockTask({
      title: `Task ${i + 1}`,
      description: `Description for task ${i + 1}`,
      status: statuses[i % statuses.length] as TaskStatus,
      priority: priorities[i % priorities.length] as PriorityLevel,
      dueDate: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000), // Future dates
      completed: i % 3 === 0, // Every 3rd task is completed
    }),
  );
};

/**
 * Mock task API responses
 */
export const mockTaskApiResponse = <T>(
  data: T,
  success: boolean = true,
  message: string = "Success",
): { success: boolean; message: string; data: T } => {
  return {
    success,
    message,
    data,
  };
};

/**
 * Mock task service for testing
 */
export class MockTaskService {
  private tasks: Task[] = [];

  constructor(initialTasks: Task[] = []) {
    this.tasks = [...initialTasks];
  }

  async createTask(
    taskData: Omit<Task, "id" | "createdAt" | "updatedAt" | "completed">,
  ): Promise<Task> {
    const newTask: Task = {
      ...taskData,
      id: `task-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      completed: false,
    };

    this.tasks.push(newTask);
    return newTask;
  }

  async getTask(taskId: string): Promise<Task> {
    const task = this.tasks.find((t) => t.id === taskId);
    if (!task) {
      throw new Error("Task not found");
    }
    return task;
  }

  async getTasks(): Promise<Task[]> {
    return [...this.tasks];
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    const taskIndex = this.tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) {
      throw new Error("Task not found");
    }

    const updatedTask = {
      ...this.tasks[taskIndex],
      ...updates,
      updatedAt: new Date(),
    };

    this.tasks[taskIndex] = updatedTask;
    return updatedTask;
  }

  async deleteTask(taskId: string): Promise<void> {
    this.tasks = this.tasks.filter((t) => t.id !== taskId);
  }

  async toggleTaskCompletion(taskId: string): Promise<Task> {
    const task = await this.getTask(taskId);
    const updatedTask = {
      ...task,
      completed: !task.completed,
      status: !task.completed ? "completed" : "todo",
      updatedAt: new Date(),
      completedAt: !task.completed ? new Date() : null,
    };

    return this.updateTask(taskId, updatedTask);
  }
}

/**
 * Task validation test cases
 */
export const taskValidationTestCases = [
  {
    name: "Valid task",
    task: {
      title: "Valid Task",
      description: "Valid description",
      status: "todo",
      priority: "medium",
    },
    shouldPass: true,
  },
  {
    name: "Empty title",
    task: {
      title: "",
      description: "Valid description",
      status: "todo",
      priority: "medium",
    },
    shouldPass: false,
    expectedError: "Task title is required",
  },
  {
    name: "Title too long",
    task: {
      title: "A".repeat(256),
      description: "Valid description",
      status: "todo",
      priority: "medium",
    },
    shouldPass: false,
    expectedError: "Task title cannot exceed 255 characters",
  },
  {
    name: "Invalid priority",
    task: {
      title: "Valid Task",
      description: "Valid description",
      status: "todo",
      priority: "invalid" as PriorityLevel,
    },
    shouldPass: false,
    expectedError: "Invalid priority level",
  },
];

/**
 * Task comparison test cases
 */
export const taskComparisonTestCases = [
  {
    name: "Priority comparison",
    tasks: [
      generateMockTask({ priority: "high" }),
      generateMockTask({ priority: "medium" }),
      generateMockTask({ priority: "low" }),
    ],
    expectedOrder: ["high", "medium", "low"],
  },
  {
    name: "Due date comparison",
    tasks: [
      generateMockTask({
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      }), // 3 days from now
      generateMockTask({
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      }), // 1 day from now
      generateMockTask({
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      }), // 2 days from now
    ],
    expectedOrder: ["1 day", "2 days", "3 days"], // Ascending by due date
  },
];
