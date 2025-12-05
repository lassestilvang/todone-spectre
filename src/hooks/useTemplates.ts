import { useState, useEffect, useCallback } from "react";
import {
  Template,
  TemplateCategory,
  TemplateFilterCriteria,
  TemplateSortOptions,
} from "../types/template";
import { templateService } from "../services/templateService";
import { templateCategoryService } from "../services/templateCategoryService";
import { useTemplateStore } from "../store/useTemplateStore";

/**
 * Custom hook for template management with data fetching, mutations, filtering, and sorting
 */
export const useTemplates = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string | "all">("all");
  const [sortBy, setSortBy] = useState<
    "name" | "createdAt" | "usageCount" | "rating"
  >("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [isPublicFilter, setIsPublicFilter] = useState<boolean | null>(null);

  const {
    templates,
    categories,
    filteredTemplates,
    currentFilter,
    sortBy: storeSortBy,
    sortDirection: storeSortDirection,
    setTemplateFilter,
    setTemplateSort,
    applyTemplateFilters,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    setTemplates,
    setTemplateError,
    setPreviewTemplate,
    clearPreviewTemplate,
    applyTemplate,
  } = useTemplateStore();

  /**
   * Fetch templates from API
   */
  const fetchTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const fetchedTemplates = await templateService.getTemplates();
      setTemplates(fetchedTemplates);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch templates",
      );
    } finally {
      setIsLoading(false);
    }
  }, [setTemplates]);

  /**
   * Create template mutation
   */
  const createTemplate = useCallback(
    async (templateData: Omit<Template, "id" | "createdAt" | "updatedAt">) => {
      try {
        setError(null);
        const newTemplate = await templateService.createTemplate(templateData);
        return newTemplate;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create template",
        );
        throw err;
      }
    },
    [],
  );

  /**
   * Update template mutation
   */
  const updateTemplateMutation = useCallback(
    async (templateId: string, updates: Partial<Template>) => {
      try {
        setError(null);
        const updatedTemplate = await templateService.updateTemplate(
          templateId,
          updates,
        );
        return updatedTemplate;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update template",
        );
        throw err;
      }
    },
    [],
  );

  /**
   * Delete template mutation
   */
  const deleteTemplateMutation = useCallback(async (templateId: string) => {
    try {
      setError(null);
      await templateService.deleteTemplate(templateId);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete template",
      );
      throw err;
    }
  }, []);

  /**
   * Apply template with variables
   */
  const applyTemplateWithVariables = useCallback(
    async (
      templateId: string,
      variables?: Record<string, string>,
    ): Promise<string> => {
      try {
        setError(null);
        const result = await templateService.applyTemplate(
          templateId,
          variables,
        );
        return result;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to apply template",
        );
        throw err;
      }
    },
    [],
  );

  /**
   * Preview template with variables
   */
  const previewTemplateWithVariables = useCallback(
    async (
      templateId: string,
      variables?: Record<string, string>,
    ): Promise<string> => {
      try {
        setError(null);
        const result = await templateService.previewTemplate(
          templateId,
          variables,
        );
        return result;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to preview template",
        );
        throw err;
      }
    },
    [],
  );

  /**
   * Apply filters based on current filter state
   */
  const applyCurrentFilters = useCallback(() => {
    const filters: TemplateFilterCriteria = {
      categoryId: categoryFilter === "all" ? undefined : categoryFilter,
      searchQuery: searchQuery || undefined,
      isPublic: isPublicFilter,
    };

    setTemplateFilter(filters);
    applyTemplateFilters();
  }, [
    categoryFilter,
    searchQuery,
    isPublicFilter,
    setTemplateFilter,
    applyTemplateFilters,
  ]);

  /**
   * Filter templates by category
   */
  const filterByCategory = useCallback((category: string | "all") => {
    setCategoryFilter(category);
  }, []);

  /**
   * Filter templates by public/private status
   */
  const filterByPublicStatus = useCallback((isPublic: boolean | null) => {
    setIsPublicFilter(isPublic);
  }, []);

  /**
   * Sort templates
   */
  const sortTemplates = useCallback(
    (
      sortField: "name" | "createdAt" | "usageCount" | "rating",
      direction: "asc" | "desc" = "asc",
    ) => {
      setSortBy(sortField);
      setSortDirection(direction);
      setTemplateSort(sortField, direction);
    },
    [setTemplateSort],
  );

  /**
   * Search templates
   */
  const searchTemplates = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  /**
   * Reset all filters
   */
  const resetFilters = useCallback(() => {
    setSearchQuery("");
    setCategoryFilter("all");
    setIsPublicFilter(null);
    setTemplateFilter({});
    applyTemplateFilters();
  }, [setTemplateFilter, applyTemplateFilters]);

  /**
   * Get filtered and sorted templates
   */
  const getProcessedTemplates = useCallback((): Template[] => {
    let result = [...templates];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (template) =>
          template.name.toLowerCase().includes(query) ||
          (template.description &&
            template.description.toLowerCase().includes(query)) ||
          (template.tags &&
            template.tags.some((tag) => tag.toLowerCase().includes(query))),
      );
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      result = result.filter(
        (template) => template.categoryId === categoryFilter,
      );
    }

    // Apply public/private filter
    if (isPublicFilter !== null) {
      result = result.filter(
        (template) => template.isPublic === isPublicFilter,
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      const aValue: any = a[sortBy];
      const bValue: any = b[sortBy];

      // Handle date sorting
      if (aValue instanceof Date && bValue instanceof Date) {
        return sortDirection === "asc"
          ? aValue.getTime() - bValue.getTime()
          : bValue.getTime() - aValue.getTime();
      }

      // Handle string sorting
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }

      // Handle numeric sorting (usageCount, rating)
      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
      }

      return 0;
    });

    return result;
  }, [
    templates,
    searchQuery,
    categoryFilter,
    isPublicFilter,
    sortBy,
    sortDirection,
  ]);

  /**
   * Initialize templates on mount
   */
  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    templates,
    categories,
    filteredTemplates,
    isLoading,
    error,
    searchQuery,
    categoryFilter,
    isPublicFilter,
    sortBy,
    sortDirection,

    // Data fetching
    fetchTemplates,
    refetch: fetchTemplates,

    // Mutations
    createTemplate,
    updateTemplate: updateTemplateMutation,
    deleteTemplate: deleteTemplateMutation,
    applyTemplate: applyTemplateWithVariables,
    previewTemplate: previewTemplateWithVariables,

    // Filtering
    filterByCategory,
    filterByPublicStatus,
    searchTemplates,
    resetFilters,
    applyCurrentFilters,

    // Sorting
    sortTemplates,

    // State management
    setSearchQuery,
    setCategoryFilter,
    setIsPublicFilter,
    setSortBy,
    setSortDirection,

    // Preview management
    setPreviewTemplate,
    clearPreviewTemplate,

    // Utility
    getProcessedTemplates,
  };
};

/**
 * Hook for single template management
 */
export const useTemplate = (templateId?: string) => {
  const [template, setTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplate = useCallback(async () => {
    if (!templateId) return;

    try {
      setIsLoading(true);
      setError(null);
      const fetchedTemplate = await templateService.getTemplate(templateId);
      setTemplate(fetchedTemplate);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch template");
    } finally {
      setIsLoading(false);
    }
  }, [templateId]);

  useEffect(() => {
    if (templateId) {
      fetchTemplate();
    }
  }, [templateId, fetchTemplate]);

  return {
    template,
    isLoading,
    error,
    refetch: fetchTemplate,
  };
};
