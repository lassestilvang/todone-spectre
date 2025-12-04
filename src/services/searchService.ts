import { SearchResult } from '../types/search';
import { Task } from '../types/task';
import { Project } from '../types/project';
import { Label } from '../types/label';

export class SearchService {
  private tasks: Task[] = [];
  private projects: Project[] = [];
  private labels: Label[] = [];

  constructor(tasks: Task[] = [], projects: Project[] = [], labels: Label[] = []) {
    this.tasks = tasks;
    this.projects = projects;
    this.labels = labels;
  }

  public setData(tasks: Task[], projects: Project[], labels: Label[]): void {
    this.tasks = tasks;
    this.projects = projects;
    this.labels = labels;
  }

  public search(query: string): SearchResult[] {
    if (!query || query.trim() === '') {
      return [];
    }

    const searchTerm = query.toLowerCase();
    const results: SearchResult[] = [];

    // Search tasks
    this.tasks.forEach(task => {
      if (task.title.toLowerCase().includes(searchTerm) ||
          (task.description && task.description.toLowerCase().includes(searchTerm))) {
        results.push({
          id: `task-${task.id}`,
          title: task.title,
          subtitle: task.description || '',
          type: 'Task',
          data: task
        });
      }
    });

    // Search projects
    this.projects.forEach(project => {
      if (project.name.toLowerCase().includes(searchTerm) ||
          (project.description && project.description.toLowerCase().includes(searchTerm))) {
        results.push({
          id: `project-${project.id}`,
          title: project.name,
          subtitle: project.description || '',
          type: 'Project',
          data: project
        });
      }
    });

    // Search labels
    this.labels.forEach(label => {
      if (label.name.toLowerCase().includes(searchTerm)) {
        results.push({
          id: `label-${label.id}`,
          title: label.name,
          subtitle: '',
          type: 'Label',
          data: label
        });
      }
    });

    return results;
  }

  public searchByType(query: string, type: 'task' | 'project' | 'label'): SearchResult[] {
    const allResults = this.search(query);
    return allResults.filter(result => result.type?.toLowerCase() === type);
  }
}

// Singleton instance
let searchServiceInstance: SearchService | null = null;

export function getSearchService(): SearchService {
  if (!searchServiceInstance) {
    searchServiceInstance = new SearchService();
  }
  return searchServiceInstance;
}