import { useState, useEffect } from 'react';
import { SearchResult } from '../types/search';
import { getSearchService } from '../services/searchService';
import { useTaskStore } from '../store/useTaskStore';
import { useProjectStore } from '../store/useProjectStore';
import { useLabelStore } from '../store/useLabelStore';

export const useSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const tasks = useTaskStore(state => state.tasks);
  const projects = useProjectStore(state => state.projects);
  const labels = useLabelStore(state => state.labels);

  const searchService = getSearchService();

  // Initialize search service with current data
  useEffect(() => {
    searchService.setData(tasks, projects, labels);
  }, [tasks, projects, labels]);

  const search = (searchQuery: string) => {
    setQuery(searchQuery);
    setIsLoading(true);
    setError(null);

    try {
      const searchResults = searchService.search(searchQuery);
      setResults(searchResults);
    } catch (err) {
      setError('Search failed. Please try again.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
    setQuery('');
  };

  const searchByType = (searchQuery: string, type: 'task' | 'project' | 'label') => {
    setQuery(searchQuery);
    setIsLoading(true);
    setError(null);

    try {
      const searchResults = searchService.searchByType(searchQuery, type);
      setResults(searchResults);
    } catch (err) {
      setError('Search failed. Please try again.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    query,
    results,
    isLoading,
    error,
    search,
    clearResults,
    searchByType
  };
};