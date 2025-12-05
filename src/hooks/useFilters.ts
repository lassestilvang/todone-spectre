import { useState, useEffect } from "react";
import filterService from "../services/filterService";
import { Filter } from "../types/models";

/**
 * Custom hook for managing filters
 */
export const useFilters = () => {
  const [filters, setFilters] = useState<Filter[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [selectedFilterId, setSelectedFilterId] = useState<string | null>(null);

  /**
   * Load all filters
   */
  const loadFilters = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await filterService.getAllFilters();

      if (result.success && result.data) {
        setFilters(result.data);
      } else {
        setError(result.error || new Error("Failed to load filters"));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to load filters"),
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create new filter
   */
  const createFilter = async (filterData: Partial<Filter>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await filterService.createFilter(filterData);

      if (result.success && result.data) {
        setFilters((prev) => [...prev, result.data]);
        return result.data;
      } else {
        setError(result.error || new Error("Failed to create filter"));
        return null;
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to create filter"),
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Update existing filter
   */
  const updateFilter = async (id: string, filterData: Partial<Filter>) => {
    try {
      setLoading(true);
      setError(null);
      const result = await filterService.updateFilter(id, filterData);

      if (result.success && result.data) {
        setFilters((prev) => prev.map((f) => (f.id === id ? result.data : f)));
        return result.data;
      } else {
        setError(result.error || new Error("Failed to update filter"));
        return null;
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to update filter"),
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Delete filter
   */
  const deleteFilter = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await filterService.deleteFilter(id);

      if (result.success) {
        setFilters((prev) => prev.filter((f) => f.id !== id));
        if (selectedFilterId === id) {
          setSelectedFilterId(null);
        }
        return true;
      } else {
        setError(result.error || new Error("Failed to delete filter"));
        return false;
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to delete filter"),
      );
      return false;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Toggle favorite status
   */
  const toggleFavorite = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await filterService.toggleFavorite(id);

      if (result.success && result.data) {
        setFilters((prev) => prev.map((f) => (f.id === id ? result.data : f)));
        return result.data;
      } else {
        setError(result.error || new Error("Failed to toggle favorite"));
        return null;
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to toggle favorite"),
      );
      return null;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Search filters
   */
  const searchFilters = async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await filterService.searchFilters(query);

      if (result.success && result.data) {
        return result.data;
      } else {
        setError(result.error || new Error("Failed to search filters"));
        return [];
      }
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to search filters"),
      );
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get favorite filters
   */
  const getFavoriteFilters = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await filterService.getFavoriteFilters();

      if (result.success && result.data) {
        return result.data;
      } else {
        setError(result.error || new Error("Failed to get favorite filters"));
        return [];
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Failed to get favorite filters"),
      );
      return [];
    } finally {
      setLoading(false);
    }
  };

  /**
   * Select filter
   */
  const selectFilter = (id: string | null) => {
    setSelectedFilterId(id);
  };

  // Load filters on initial render
  useEffect(() => {
    loadFilters();
  }, []);

  return {
    filters,
    loading,
    error,
    selectedFilterId,
    loadFilters,
    createFilter,
    updateFilter,
    deleteFilter,
    toggleFavorite,
    searchFilters,
    getFavoriteFilters,
    selectFilter,
  };
};
