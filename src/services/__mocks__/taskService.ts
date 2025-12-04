import { Task } from '../../types';

export class MockTaskService {
  private tasks: Task[] = [];

  constructor(initialTasks: Task[] = []) {
    this.tasks = initialTasks;
  }

  async getTasks(): Promise<Task[]> {
    return this.tasks;
  }

  async createTask(task: Task): Promise<Task> {
    const newTask = { ...task, id: `mock-${Date.now()}` };
    this.tasks.push(newTask);
    return newTask;
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<Task> {
    const index = this.tasks.findIndex(t => t.id === taskId);
    if (index === -1) throw new Error('Task not found');
    this.tasks[index] = { ...this.tasks[index], ...updates };
    return this.tasks[index];
  }

  async deleteTask(taskId: string): Promise<void> {
    this.tasks = this.tasks.filter(t => t.id !== taskId);
  }

  async clear(): Promise<void> {
    this.tasks = [];
  }
}