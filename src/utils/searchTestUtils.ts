import { SearchResult } from '../types/search';
import { Task } from '../types/task';
import { Project } from '../types/project';
import { Label } from '../types/label';

export const createMockSearchResults = (count = 5): SearchResult[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `result-${i}`,
    title: `Search Result ${i + 1}`,
    subtitle: `Description for result ${i + 1}`,
    type: i % 2 === 0 ? 'Task' : 'Project',
    data: i % 2 === 0
      ? { id: i, title: `Task ${i + 1}`, description: `Task description ${i + 1}` }
      : { id: i, name: `Project ${i + 1}`, description: `Project description ${i + 1}` }
  }));
};

export const createMockTaskSearchResults = (count = 3): SearchResult[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `task-${i}`,
    title: `Task ${i + 1}`,
    subtitle: `Task description ${i + 1}`,
    type: 'Task',
    data: {
      id: i,
      title: `Task ${i + 1}`,
      description: `Task description ${i + 1}`,
      completed: i % 2 === 0
    }
  }));
};

export const createMockProjectSearchResults = (count = 3): SearchResult[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `project-${i}`,
    title: `Project ${i + 1}`,
    subtitle: `Project description ${i + 1}`,
    type: 'Project',
    data: {
      id: i,
      name: `Project ${i + 1}`,
      description: `Project description ${i + 1}`
    }
  }));
};

export const createMockLabelSearchResults = (count = 3): SearchResult[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `label-${i}`,
    title: `Label ${i + 1}`,
    subtitle: '',
    type: 'Label',
    data: {
      id: i,
      name: `Label ${i + 1}`,
      color: '#ff0000'
    }
  }));
};

export const createMockSearchService = () => {
  const mockTasks: Task[] = [
    { id: 1, title: 'Complete project', description: 'Finish the Todone project', completed: false },
    { id: 2, title: 'Review code', description: 'Review the search implementation', completed: false },
    { id: 3, title: 'Write tests', description: 'Write unit tests for search', completed: true }
  ];

  const mockProjects: Project[] = [
    { id: 1, name: 'Todone App', description: 'Task management application' },
    { id: 2, name: 'Search Feature', description: 'Search functionality implementation' }
  ];

  const mockLabels: Label[] = [
    { id: 1, name: 'Important', color: '#ff0000' },
    { id: 2, name: 'Urgent', color: '#ff9900' }
  ];

  return {
    mockTasks,
    mockProjects,
    mockLabels,
    search: (query: string) => {
      const results: SearchResult[] = [];

      // Search tasks
      mockTasks.forEach(task => {
        if (task.title.toLowerCase().includes(query.toLowerCase()) ||
            (task.description && task.description.toLowerCase().includes(query.toLowerCase()))) {
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
      mockProjects.forEach(project => {
        if (project.name.toLowerCase().includes(query.toLowerCase()) ||
            (project.description && project.description.toLowerCase().includes(query.toLowerCase()))) {
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
      mockLabels.forEach(label => {
        if (label.name.toLowerCase().includes(query.toLowerCase())) {
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
  };
};