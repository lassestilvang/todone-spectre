import { useState, useEffect } from 'react';
import labelService from '../services/labelService';
import { Label } from '../types/models';

/**
 * Custom hook for managing labels
 */
export const useLabels = () => {
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);

  /**
   * Load all labels
   */
  const loadLabels = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await labelService.getAllLabels();

      if (result.success && result.data) {
        setLabels(result.data);
      } else {
        setError(result.error || new Error('Failed to load labels'));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load labels'));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create new label
   */
  const createLabel = async (labelData: Partial<Label>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await labelService.createLabel(labelData);

      if (result.success && result.data) {
        setLabels(prev => [...prev, result.data]);
        return result.data;
      } else {
        setError(result.error || new Error('Failed to create label'));
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create label'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update existing label
   */
  const updateLabel = async (id: string, labelData: Partial<Label>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await labelService.updateLabel(id, labelData);

      if (result.success && result.data) {
        setLabels(prev => prev.map(l => l.id === id ? result.data : l));
        return result.data;
      } else {
        setError(result.error || new Error('Failed to update label'));
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update label'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete label
   */
  const deleteLabel = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await labelService.deleteLabel(id);

      if (result.success) {
        setLabels(prev => prev.filter(l => l.id !== id));
        if (selectedLabelId === id) {
          setSelectedLabelId(null);
        }
        return true;
      } else {
        setError(result.error || new Error('Failed to delete label'));
        return false;
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete label'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Search labels
   */
  const searchLabels = async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await labelService.searchLabels(query);

      if (result.success && result.data) {
        return result.data;
      } else {
        setError(result.error || new Error('Failed to search labels'));
        return [];
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to search labels'));
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get personal labels
   */
  const getPersonalLabels = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await labelService.getPersonalLabels();

      if (result.success && result.data) {
        return result.data;
      } else {
        setError(result.error || new Error('Failed to get personal labels'));
        return [];
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to get personal labels'));
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get shared labels
   */
  const getSharedLabels = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await labelService.getSharedLabels();

      if (result.success && result.data) {
        return result.data;
      } else {
        setError(result.error || new Error('Failed to get shared labels'));
        return [];
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to get shared labels'));
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Select label
   */
  const selectLabel = (id: string | null) => {
    setSelectedLabelId(id);
  };

  // Load labels on initial render
  useEffect(() => {
    loadLabels();
  }, []);

  return {
    labels,
    loading,
    error,
    selectedLabelId,
    loadLabels,
    createLabel,
    updateLabel,
    deleteLabel,
    searchLabels,
    getPersonalLabels,
    getSharedLabels,
    selectLabel
  };
};