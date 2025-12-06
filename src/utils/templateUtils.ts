// @ts-nocheck
/**
 * Template utility functions for Todone application
 */

import { Template, TemplateCategory } from "../types/template";

/**
 * Generate a unique template ID
 */
export const generateTemplateId = (): string => {
  return `template-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
};

/**
 * Generate a unique category ID
 */
export const generateCategoryId = (): string => {
  return `category-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
};

/**
 * Validate template data
 */
export const validateTemplate = (
  template: Partial<Template>,
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!template.name || template.name.trim().length === 0) {
    errors.push("Template name is required");
  }

  if (template.name && template.name.length > 100) {
    errors.push("Template name cannot exceed 100 characters");
  }

  if (!template.content || template.content.trim().length === 0) {
    errors.push("Template content is required");
  }

  if (template.content && template.content.length > 10000) {
    errors.push("Template content cannot exceed 10000 characters");
  }

  if (template.description && template.description.length > 1000) {
    errors.push("Template description cannot exceed 1000 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate template category data
 */
export const validateTemplateCategory = (
  category: Partial<TemplateCategory>,
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!category.name || category.name.trim().length === 0) {
    errors.push("Category name is required");
  }

  if (category.name && category.name.length > 50) {
    errors.push("Category name cannot exceed 50 characters");
  }

  if (category.description && category.description.length > 500) {
    errors.push("Category description cannot exceed 500 characters");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Extract variables from template content
 */
export const extractTemplateVariables = (content: string): string[] => {
  const variableRegex = /{{\s*([a-zA-Z][a-zA-Z0-9_]*)\s*}}/g;
  const variables: string[] = [];
  let match;

  while ((match = variableRegex.exec(content)) !== null) {
    variables.push(match[1]);
  }

  return Array.from(new Set(variables)); // Remove duplicates
};

/**
 * Apply variables to template content
 */
export const applyTemplateVariables = (
  content: string,
  variables: Record<string, string>,
): string => {
  let result = content;

  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    result = result.replace(new RegExp(placeholder, "g"), value);
  }

  return result;
};

/**
 * Generate preview content from template
 */
export const generateTemplatePreview = (
  template: Template,
  variables?: Record<string, string>,
): string => {
  // If no variables provided, use template's default variables
  const finalVariables = variables || template.variables || {};

  // Apply variables to content
  let previewContent = applyTemplateVariables(template.content, finalVariables);

  // Truncate long content for preview
  if (previewContent.length > 500) {
    previewContent = previewContent.substring(0, 500) + "...";
  }

  return previewContent;
};

/**
 * Format template for display
 */
export const formatTemplateForDisplay = (template: Template): string => {
  // Simple markdown to HTML conversion for display
  let formatted = template.content;

  // Headers
  formatted = formatted.replace(/^#\s+(.*)$/gm, "<h1>$1</h1>");
  formatted = formatted.replace(/^##\s+(.*)$/gm, "<h2>$1</h2>");
  formatted = formatted.replace(/^###\s+(.*)$/gm, "<h3>$1</h3>");

  // Bold and italic
  formatted = formatted.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  formatted = formatted.replace(/\*(.*?)\*/g, "<em>$1</em>");

  // Lists
  formatted = formatted.replace(/^\*\s+(.*)$/gm, "<li>$1</li>");
  formatted = formatted.replace(/^\d+\.\s+(.*)$/gm, "<li>$1</li>");

  // Code blocks
  formatted = formatted.replace(
    /```([\s\S]*?)```/g,
    "<pre><code>$1</code></pre>",
  );

  // Links
  formatted = formatted.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');

  return formatted;
};

/**
 * Get template statistics
 */
export const getTemplateStatistics = (
  templates: Template[],
): {
  total: number;
  public: number;
  private: number;
  byCategory: Record<string, number>;
} => {
  const stats = {
    total: templates.length,
    public: templates.filter((t) => t.isPublic).length,
    private: templates.filter((t) => !t.isPublic).length,
    byCategory: {} as Record<string, number>,
  };

  // Count templates by category
  templates.forEach((template) => {
    if (template.categoryId) {
      stats.byCategory[template.categoryId] =
        (stats.byCategory[template.categoryId] || 0) + 1;
    }
  });

  return stats;
};

/**
 * Sort templates by various criteria
 */
export const sortTemplates = (
  templates: Template[],
  sortBy: "name" | "createdAt" | "usageCount" | "rating" = "name",
  direction: "asc" | "desc" = "asc",
): Template[] => {
  return [...templates].sort((a, b) => {
    const aValue: any = a[sortBy];
    const bValue: any = b[sortBy];

    // Handle date sorting
    if (aValue instanceof Date && bValue instanceof Date) {
      return direction === "asc"
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime();
    }

    // Handle string sorting
    if (typeof aValue === "string" && typeof bValue === "string") {
      return direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    // Handle numeric sorting (usageCount, rating)
    if (typeof aValue === "number" && typeof bValue === "number") {
      return direction === "asc" ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });
};

/**
 * Filter templates by various criteria
 */
export const filterTemplates = (
  templates: Template[],
  criteria: {
    categoryId?: string;
    searchQuery?: string;
    isPublic?: boolean;
    tags?: string[];
  },
): Template[] => {
  let result = [...templates];

  if (criteria.categoryId) {
    result = result.filter(
      (template) => template.categoryId === criteria.categoryId,
    );
  }

  if (criteria.searchQuery) {
    const query = criteria.searchQuery.toLowerCase();
    result = result.filter(
      (template) =>
        template.name.toLowerCase().includes(query) ||
        (template.description &&
          template.description.toLowerCase().includes(query)) ||
        (template.tags &&
          template.tags.some((tag) => tag.toLowerCase().includes(query))),
    );
  }

  if (criteria.isPublic !== undefined) {
    result = result.filter(
      (template) => template.isPublic === criteria.isPublic,
    );
  }

  if (criteria.tags && criteria.tags.length > 0) {
    result = result.filter(
      (template) =>
        template.tags &&
        criteria.tags!.some((tag) => template.tags!.includes(tag)),
    );
  }

  return result;
};
