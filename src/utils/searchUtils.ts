import { SearchResult } from '../types/search';
import { Task } from '../types/task';
import { Project } from '../types/project';
import { Label } from '../types/label';

export const createSearchResultFromTask = (task: Task): SearchResult => {
  return {
    id: `task-${task.id}`,
    title: task.title,
    subtitle: task.description || '',
    type: 'Task',
    data: task
  };
};

export const createSearchResultFromProject = (project: Project): SearchResult => {
  return {
    id: `project-${project.id}`,
    title: project.name,
    subtitle: project.description || '',
    type: 'Project',
    data: project
  };
};

export const createSearchResultFromLabel = (label: Label): SearchResult => {
  return {
    id: `label-${label.id}`,
    title: label.name,
    subtitle: '',
    type: 'Label',
    data: label
  };
};

export const filterSearchResults = (
  results: SearchResult[],
  filters: {
    types?: string[];
    query?: string;
  }
): SearchResult[] => {
  return results.filter(result => {
    // Filter by type if specified
    if (filters.types && filters.types.length > 0) {
      if (!result.type || !filters.types.includes(result.type)) {
        return false;
      }
    }

    // Filter by query if specified
    if (filters.query) {
      const searchTerm = filters.query.toLowerCase();
      const titleMatch = result.title.toLowerCase().includes(searchTerm);
      const subtitleMatch = result.subtitle?.toLowerCase().includes(searchTerm) || false;

      if (!titleMatch && !subtitleMatch) {
        return false;
      }
    }

    return true;
  });
};

export const sortSearchResults = (
  results: SearchResult[],
  sortBy: 'relevance' | 'title' | 'type' = 'relevance'
): SearchResult[] => {
  return [...results].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title.localeCompare(b.title);
      case 'type':
        return (a.type || '').localeCompare(b.type || '');
      case 'relevance':
      default:
        // Simple relevance sorting - could be enhanced with more sophisticated algorithms
        return 0;
    }
  });
};

export const highlightSearchTerm = (text: string, term: string): string => {
  if (!term || term.trim() === '') return text;

  const searchTerm = term.toLowerCase();
  const parts = text.split(new RegExp(`(${term})`, 'gi'));

  return parts.map((part, index) =>
    part.toLowerCase() === searchTerm.toLowerCase()
      ? `<span class="bg-yellow-200">${part}</span>`
      : part
  ).join('');
};