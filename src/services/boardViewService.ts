import { Task } from '../types/task';
import { ViewType } from '../types/enums';

/**
 * Board View Service
 * Handles data transformation and business logic for board view
 */
export class BoardViewService {
  /**
   * Transform tasks for board view display
   */
  static transformTasksForBoardView(tasks: Task[]): Task[] {
    return tasks.map(task => ({
      ...task,
      // Add any board-specific transformations
      displayTitle: task.title || 'Untitled Task',
      displayStatus: task.status || 'todo',
      // Ensure status is compatible with board columns
      status: this.normalizeStatus(task.status || 'todo')
    }));
  }

  /**
   * Normalize status to match board columns
   */
  static normalizeStatus(status: string): string {
    const normalized = status.toLowerCase();
    if (['todo', 'to do', 'backlog'].includes(normalized)) return 'todo';
    if (['inprogress', 'in progress', 'doing', 'in_progress'].includes(normalized)) return 'in_progress';
    if (['done', 'completed', 'finished'].includes(normalized)) return 'done';
    return 'todo'; // default
  }

  /**
   * Group tasks by status for board columns
   */
  static groupTasksByStatus(tasks: Task[]): Record<string, Task[]> {
    return tasks.reduce((acc, task) => {
      const status = this.normalizeStatus(task.status || 'todo');
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
  }

  /**
   * Get default board columns
   */
  static getDefaultColumns(): string[] {
    return ['To Do', 'In Progress', 'Done'];
  }

  /**
   * Get board view configuration
   */
  static getBoardViewConfig(): { columns: string[], showTaskCount: boolean } {
    return {
      columns: this.getDefaultColumns(),
      showTaskCount: true
    };
  }

  /**
   * Update task status (for drag and drop)
   */
  static updateTaskStatus(task: Task, newStatus: string): Task {
    return {
      ...task,
      status: this.normalizeStatus(newStatus)
    };
  }

  /**
   * Filter tasks for board view
   */
  static filterTasks(tasks: Task[], filters: Partial<Task>): Task[] {
    return tasks.filter(task => {
      if (filters.projectId && task.projectId !== filters.projectId) return false;
      if (filters.priority && task.priority !== filters.priority) return false;
      if (filters.completed !== undefined && task.completed !== filters.completed) return false;
      return true;
    });
  }
}