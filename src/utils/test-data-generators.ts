import { Task, Project, User } from "../types";

export function generateTestTasks(count: number = 5): Task[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `task-${i + 1}`,
    title: `Test Task ${i + 1}`,
    description: `Description for test task ${i + 1}`,
    status: i % 3 === 0 ? "todo" : i % 3 === 1 ? "in-progress" : "done",
    priority: i % 2 === 0 ? "high" : "medium",
    dueDate: new Date(Date.now() + (i + 1) * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
    updatedAt: new Date(),
    completed: i % 3 === 2,
  }));
}

export function generateTestProjects(count: number = 3): Project[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `project-${i + 1}`,
    name: `Test Project ${i + 1}`,
    description: `Description for test project ${i + 1}`,
    createdAt: new Date(),
    updatedAt: new Date(),
    tasks: generateTestTasks(3).map((task) => task.id),
  }));
}

export function generateTestUsers(count: number = 2): User[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `user-${i + 1}`,
    name: `Test User ${i + 1}`,
    email: `user${i + 1}@example.com`,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
}
