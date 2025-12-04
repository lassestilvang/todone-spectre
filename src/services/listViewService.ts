import { Task } from '../types/task';
import { ViewType } from '../types/enums';

/**
 * List View Service
 * Handles data transformation and business logic for list view
 */
export class ListViewService {
  /**
   * Transform tasks for list view display
   */
  static transformTasksForListView(tasks: Task[]): Task[] {
    return tasks.map(task => ({
      ...task,
      // Add any list-specific transformations
      displayTitle: task.title || 'Untitled Task',
      displayPriority: task.priority || 'medium',
      displayStatus: task.status || 'todo'
    }));
  }

  /**
   * Group tasks by project for list view
   */
  static groupTasksByProject(tasks: Task[]): Record<string, Task[]> {
    return tasks.reduce((acc, task) => {
      const projectKey = task.projectId || 'no-project';
      if (!acc[projectKey]) {
        acc[projectKey] = [];
      }
      acc[projectKey].push(task);
      return acc;
    }, {} as Record<string, Task[]>);
  }

  /**
   * Sort tasks for list view
   */
  static sortTasks(tasks: Task[], sortBy: string = 'dueDate'): Task[] {
    return [...tasks].sort((a, b) => {
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (sortBy === 'priority') {
        const priorityOrder = { high: 1, medium: 2, low: 3 };
        return (priorityOrder[a.priority || 'medium'] || 3) - (priorityOrder[b.priority || 'medium'] || 3);
      }
      if (sortBy === 'title') {
        return (a.title || '').localeCompare(b.title || '');
      }
      return 0;
    });
  }

  /**
   * Filter tasks for list view
   */
  static filterTasks(tasks: Task[], filters: Partial<Task>): Task[] {
    return tasks.filter(task => {
      if (filters.status && task.status !== filters.status) return false;
      if (filters.priority && task.priority !== filters.priority) return false;
      if (filters.projectId && task.projectId !== filters.projectId) return false;
      if (filters.completed !== undefined && task.completed !== filters.completed) return false;
      return true;
    });
  }

  /**
   * Get list view configuration
   */
  static getListViewConfig(): { sortBy: string, groupBy: string } {
    return {
      sortBy: 'dueDate',
      groupBy: 'project'
    };
  }
}