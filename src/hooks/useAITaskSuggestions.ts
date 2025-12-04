import { useState, useCallback } from 'react';
import { aiTaskService } from '../services/aiTaskService';

interface AITaskSuggestionsState {
  suggestions: string[];
  loading: boolean;
  error: string | null;
}

export const useAITaskSuggestions = (): AITaskSuggestionsState & {
  generateSuggestions: (taskId: string) => Promise<void>;
  refreshSuggestions: () => void;
  clearSuggestions: () => void;
} => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const generateSuggestions = useCallback(async (taskId: string) => {
    try {
      setLoading(true);
      setError(null);
      setSuggestions([]);

      if (!taskId || taskId.trim() === '') {
        throw new Error('Task ID cannot be empty');
      }

      const taskSuggestions = await aiTaskService.getTaskSuggestions(taskId);

      const suggestionsText = taskSuggestions.map(suggestion => suggestion.suggestion);
      setSuggestions(suggestionsText);
    } catch (err) {
      console.error('Task suggestions error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate task suggestions');
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshSuggestions = useCallback(() => {
    // Clear cache and regenerate suggestions
    aiTaskService.clearCache();
  }, []);

  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  return {
    suggestions,
    loading,
    error,
    generateSuggestions,
    refreshSuggestions,
    clearSuggestions
  };
};