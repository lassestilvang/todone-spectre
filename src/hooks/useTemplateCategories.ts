import { useState, useEffect, useCallback } from "react";
import { TemplateCategory } from "../types/template";
import { templateCategoryService } from "../services/templateCategoryService";
import { useTemplateStore } from "../store/useTemplateStore";

/**
 * Custom hook for template category management
 */
export const useTemplateCategories = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<"name" | "order">("order");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const {
    categories,
    setCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    setTemplateError,
  } = useTemplateStore();

  /**
   * Fetch template categories from API
   */
  const fetchTemplateCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const fetchedCategories =
        await templateCategoryService.getTemplateCategories();
      setCategories(fetchedCategories);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch template categories",
      );
    } finally {
      setIsLoading(false);
    }
  }, [setCategories]);

  /**
   * Create template category mutation
   */
  const createTemplateCategory = useCallback(
    async (
      categoryData: Omit<TemplateCategory, "id" | "createdAt" | "updatedAt">,
    ) => {
      try {
        setError(null);
        const newCategory =
          await templateCategoryService.createTemplateCategory(categoryData);
        return newCategory;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to create template category",
        );
        throw err;
      }
    },
    [],
  );

  /**
   * Update template category mutation
   */
  const updateTemplateCategory = useCallback(
    async (categoryId: string, updates: Partial<TemplateCategory>) => {
      try {
        setError(null);
        const updatedCategory =
          await templateCategoryService.updateTemplateCategory(
            categoryId,
            updates,
          );
        return updatedCategory;
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to update template category",
        );
        throw err;
      }
    },
    [],
  );

  /**
   * Delete template category mutation
   */
  const deleteTemplateCategory = useCallback(async (categoryId: string) => {
    try {
      setError(null);
      await templateCategoryService.deleteTemplateCategory(categoryId);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete template category",
      );
      throw err;
    }
  }, []);

  /**
   * Sort categories
   */
  const sortCategories = useCallback(
    (sortField: "name" | "order", direction: "asc" | "desc" = "asc") => {
      setSortBy(sortField);
      setSortDirection(direction);
    },
    [],
  );

  /**
   * Search categories
   */
  const searchCategories = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  /**
   * Get filtered and sorted categories
   */
  const getProcessedCategories = useCallback((): TemplateCategory[] => {
    let result = [...categories];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (category) =>
          category.name.toLowerCase().includes(query) ||
          (category.description &&
            category.description.toLowerCase().includes(query)),
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortBy === "name") {
        return sortDirection === "asc"
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else {
        return sortDirection === "asc" ? a.order - b.order : b.order - a.order;
      }
    });

    return result;
  }, [categories, searchQuery, sortBy, sortDirection]);

  /**
   * Initialize categories on mount
   */
  useEffect(() => {
    fetchTemplateCategories();
  }, [fetchTemplateCategories]);

  return {
    categories,
    isLoading,
    error,
    searchQuery,
    sortBy,
    sortDirection,

    // Data fetching
    fetchTemplateCategories,
    refetch: fetchTemplateCategories,

    // Mutations
    createTemplateCategory,
    updateTemplateCategory,
    deleteTemplateCategory,

    // Sorting
    sortCategories,

    // Searching
    searchCategories,

    // State management
    setSearchQuery,
    setSortBy,
    setSortDirection,

    // Utility
    getProcessedCategories,
  };
};

/**
 * Hook for single template category management
 */
export const useTemplateCategory = (categoryId?: string) => {
  const [category, setCategory] = useState<TemplateCategory | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategory = useCallback(async () => {
    if (!categoryId) return;

    try {
      setIsLoading(true);
      setError(null);
      const fetchedCategory =
        await templateCategoryService.getTemplateCategory(categoryId);
      setCategory(fetchedCategory);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch template category",
      );
    } finally {
      setIsLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId, fetchCategory]);

  return {
    category,
    isLoading,
    error,
    refetch: fetchCategory,
  };
};
