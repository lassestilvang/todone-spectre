/**
 * Template test utilities for Todone application
 */

import {
  Template,
  TemplateCategory,
  CreateTemplateDto,
  CreateTemplateCategoryDto,
} from "../../../types/template";

/**
 * Generate mock template data for testing
 */
export const generateMockTemplate = (
  overrides: Partial<Template> = {},
): Template => {
  return {
    id: `template-${Math.random().toString(36).substr(2, 8)}`,
    name: overrides.name || `Test Template ${Math.floor(Math.random() * 1000)}`,
    description: overrides.description || "Test template description",
    content:
      overrides.content ||
      "## Test Content\n\nThis is a {{testVariable}} template.",
    categoryId: overrides.categoryId || "category-1",
    tags: overrides.tags || ["test", "mock"],
    createdAt: overrides.createdAt || new Date(),
    updatedAt: overrides.updatedAt || new Date(),
    usageCount: overrides.usageCount || 0,
    rating: overrides.rating || 3,
    isPublic: overrides.isPublic || true,
    variables: overrides.variables || { testVariable: "defaultValue" },
    ...overrides,
  };
};

/**
 * Generate mock template category data for testing
 */
export const generateMockTemplateCategory = (
  overrides: Partial<TemplateCategory> = {},
): TemplateCategory => {
  return {
    id: `category-${Math.random().toString(36).substr(2, 8)}`,
    name: overrides.name || `Test Category ${Math.floor(Math.random() * 1000)}`,
    description: overrides.description || "Test category description",
    color: overrides.color || "#3B82F6",
    icon: overrides.icon || "code",
    order: overrides.order || 0,
    createdAt: overrides.createdAt || new Date(),
    updatedAt: overrides.updatedAt || new Date(),
    ...overrides,
  };
};

/**
 * Generate mock create template DTO for testing
 */
export const generateMockCreateTemplateDto = (
  overrides: Partial<CreateTemplateDto> = {},
): CreateTemplateDto => {
  return {
    name: overrides.name || `New Template ${Math.floor(Math.random() * 1000)}`,
    description: overrides.description || "New template description",
    content:
      overrides.content ||
      "## New Content\n\nThis is a {{newVariable}} template.",
    categoryId: overrides.categoryId || "category-1",
    tags: overrides.tags || ["new", "test"],
    isPublic: overrides.isPublic || true,
    variables: overrides.variables || { newVariable: "defaultValue" },
    ...overrides,
  };
};

/**
 * Generate mock create template category DTO for testing
 */
export const generateMockCreateTemplateCategoryDto = (
  overrides: Partial<CreateTemplateCategoryDto> = {},
): CreateTemplateCategoryDto => {
  return {
    name: overrides.name || `New Category ${Math.floor(Math.random() * 1000)}`,
    description: overrides.description || "New category description",
    color: overrides.color || "#10B981",
    icon: overrides.icon || "briefcase",
    ...overrides,
  };
};

/**
 * Generate array of mock templates for testing
 */
export const generateMockTemplates = (count: number = 5): Template[] => {
  return Array.from({ length: count }, (_, i) =>
    generateMockTemplate({
      name: `Test Template ${i + 1}`,
      description: `Description for test template ${i + 1}`,
      content: `## Template ${i + 1}\n\nContent for template ${i + 1} with {{variable${i + 1}}}.`,
      categoryId: `category-${(i % 3) + 1}`,
      tags: ["test", `template-${i + 1}`],
      usageCount: i * 10,
      rating: (i % 5) + 1,
    }),
  );
};

/**
 * Generate array of mock template categories for testing
 */
export const generateMockTemplateCategories = (
  count: number = 3,
): TemplateCategory[] => {
  return Array.from({ length: count }, (_, i) =>
    generateMockTemplateCategory({
      name: `Test Category ${i + 1}`,
      description: `Description for test category ${i + 1}`,
      color: ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444"][i % 5],
      icon: ["code", "briefcase", "user", "folder", "book"][i % 5],
      order: i,
    }),
  );
};

/**
 * Create mock template service for testing
 */
export const createMockTemplateService = () => {
  const mockTemplates: Template[] = [];
  const mockCategories: TemplateCategory[] = [];

  return {
    getTemplates: async () => mockTemplates,
    getTemplate: async (id: string) =>
      mockTemplates.find((t) => t.id === id) || null,
    createTemplate: async (templateData: CreateTemplateDto) => {
      const newTemplate: Template = {
        ...templateData,
        id: `template-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 0,
        rating: 0,
      };
      mockTemplates.push(newTemplate);
      return newTemplate;
    },
    updateTemplate: async (id: string, updates: Partial<Template>) => {
      const index = mockTemplates.findIndex((t) => t.id === id);
      if (index === -1) throw new Error("Template not found");

      const updatedTemplate = {
        ...mockTemplates[index],
        ...updates,
        updatedAt: new Date(),
      };

      mockTemplates[index] = updatedTemplate;
      return updatedTemplate;
    },
    deleteTemplate: async (id: string) => {
      const index = mockTemplates.findIndex((t) => t.id === id);
      if (index === -1) throw new Error("Template not found");
      mockTemplates.splice(index, 1);
    },
    applyTemplate: async (id: string, variables?: Record<string, string>) => {
      const template = mockTemplates.find((t) => t.id === id);
      if (!template) throw new Error("Template not found");

      let result = template.content;
      if (variables) {
        for (const [key, value] of Object.entries(variables)) {
          const placeholder = `{{${key}}}`;
          result = result.replace(new RegExp(placeholder, "g"), value);
        }
      }

      return result;
    },
    previewTemplate: async (id: string, variables?: Record<string, string>) => {
      const template = mockTemplates.find((t) => t.id === id);
      if (!template) throw new Error("Template not found");

      let result = template.content;
      if (variables) {
        for (const [key, value] of Object.entries(variables)) {
          const placeholder = `{{${key}}}`;
          result = result.replace(new RegExp(placeholder, "g"), value);
        }
      }

      return result;
    },

    // Category methods
    getTemplateCategories: async () => mockCategories,
    getTemplateCategory: async (id: string) =>
      mockCategories.find((c) => c.id === id) || null,
    createTemplateCategory: async (categoryData: CreateTemplateCategoryDto) => {
      const newCategory: TemplateCategory = {
        ...categoryData,
        id: `category-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        order: mockCategories.length,
      };
      mockCategories.push(newCategory);
      return newCategory;
    },
    updateTemplateCategory: async (
      id: string,
      updates: Partial<TemplateCategory>,
    ) => {
      const index = mockCategories.findIndex((c) => c.id === id);
      if (index === -1) throw new Error("Category not found");

      const updatedCategory = {
        ...mockCategories[index],
        ...updates,
        updatedAt: new Date(),
      };

      mockCategories[index] = updatedCategory;
      return updatedCategory;
    },
    deleteTemplateCategory: async (id: string) => {
      const index = mockCategories.findIndex((c) => c.id === id);
      if (index === -1) throw new Error("Category not found");
      mockCategories.splice(index, 1);
    },

    // Test utilities
    addMockTemplates: (templates: Template[]) => {
      mockTemplates.push(...templates);
    },
    addMockCategories: (categories: TemplateCategory[]) => {
      mockCategories.push(...categories);
    },
    clearMockData: () => {
      mockTemplates.length = 0;
      mockCategories.length = 0;
    },
  };
};

/**
 * Template test assertions
 */
export const expectTemplateToMatch = (
  actual: Template,
  expected: Partial<Template>,
) => {
  expect(actual).toBeDefined();
  expect(actual.id).toBeDefined();

  if (expected.name !== undefined) {
    expect(actual.name).toBe(expected.name);
  }

  if (expected.description !== undefined) {
    expect(actual.description).toBe(expected.description);
  }

  if (expected.content !== undefined) {
    expect(actual.content).toBe(expected.content);
  }

  if (expected.categoryId !== undefined) {
    expect(actual.categoryId).toBe(expected.categoryId);
  }

  if (expected.isPublic !== undefined) {
    expect(actual.isPublic).toBe(expected.isPublic);
  }

  if (expected.tags !== undefined) {
    expect(actual.tags).toEqual(expect.arrayContaining(expected.tags));
  }
};
