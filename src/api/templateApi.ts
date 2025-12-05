/**
 * Template API service for Todone application
 * Handles all template-related API calls
 */

import { ApiResponse } from "../types/api";
import {
  Template,
  CreateTemplateDto,
  UpdateTemplateDto,
  TemplateCategory,
  CreateTemplateCategoryDto,
  UpdateTemplateCategoryDto,
} from "../types/template";

/**
 * Mock database for templates (in-memory storage)
 */
const mockTemplates: Template[] = [];
const mockCategories: TemplateCategory[] = [];

/**
 * Template API service
 */
export const templateApi = {
  /**
   * Create a new template
   */
  async createTemplate(
    templateData: CreateTemplateDto,
  ): Promise<ApiResponse<Template>> {
    try {
      const newTemplate: Template = {
        ...templateData,
        id: `template-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 0,
        rating: 0,
        isPublic: templateData.isPublic || false,
        variables: templateData.variables || {},
      };

      mockTemplates.push(newTemplate);

      return {
        success: true,
        data: newTemplate,
        message: "Template created successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to create template",
      };
    }
  },

  /**
   * Get a single template by ID
   */
  async getTemplate(templateId: string): Promise<ApiResponse<Template>> {
    try {
      const template = mockTemplates.find((t) => t.id === templateId);

      if (!template) {
        return {
          success: false,
          message: "Template not found",
        };
      }

      return {
        success: true,
        data: template,
        message: "Template retrieved successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch template",
      };
    }
  },

  /**
   * Get all templates
   */
  async getTemplates(): Promise<ApiResponse<Template[]>> {
    try {
      return {
        success: true,
        data: [...mockTemplates],
        message: "Templates retrieved successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch templates",
      };
    }
  },

  /**
   * Update a template
   */
  async updateTemplate(
    templateId: string,
    updates: UpdateTemplateDto,
  ): Promise<ApiResponse<Template>> {
    try {
      const templateIndex = mockTemplates.findIndex((t) => t.id === templateId);

      if (templateIndex === -1) {
        return {
          success: false,
          message: "Template not found",
        };
      }

      const updatedTemplate = {
        ...mockTemplates[templateIndex],
        ...updates,
        updatedAt: new Date(),
      };

      mockTemplates[templateIndex] = updatedTemplate;

      return {
        success: true,
        data: updatedTemplate,
        message: "Template updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to update template",
      };
    }
  },

  /**
   * Delete a template
   */
  async deleteTemplate(templateId: string): Promise<ApiResponse<void>> {
    try {
      const templateIndex = mockTemplates.findIndex((t) => t.id === templateId);

      if (templateIndex === -1) {
        return {
          success: false,
          message: "Template not found",
        };
      }

      mockTemplates.splice(templateIndex, 1);

      return {
        success: true,
        message: "Template deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to delete template",
      };
    }
  },

  /**
   * Create a new template category
   */
  async createTemplateCategory(
    categoryData: CreateTemplateCategoryDto,
  ): Promise<ApiResponse<TemplateCategory>> {
    try {
      const newCategory: TemplateCategory = {
        ...categoryData,
        id: `category-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
        order: mockCategories.length,
      };

      mockCategories.push(newCategory);

      return {
        success: true,
        data: newCategory,
        message: "Template category created successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create template category",
      };
    }
  },

  /**
   * Get a single template category by ID
   */
  async getTemplateCategory(
    categoryId: string,
  ): Promise<ApiResponse<TemplateCategory>> {
    try {
      const category = mockCategories.find((c) => c.id === categoryId);

      if (!category) {
        return {
          success: false,
          message: "Template category not found",
        };
      }

      return {
        success: true,
        data: category,
        message: "Template category retrieved successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch template category",
      };
    }
  },

  /**
   * Get all template categories
   */
  async getTemplateCategories(): Promise<ApiResponse<TemplateCategory[]>> {
    try {
      return {
        success: true,
        data: [...mockCategories],
        message: "Template categories retrieved successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch template categories",
      };
    }
  },

  /**
   * Update a template category
   */
  async updateTemplateCategory(
    categoryId: string,
    updates: UpdateTemplateCategoryDto,
  ): Promise<ApiResponse<TemplateCategory>> {
    try {
      const categoryIndex = mockCategories.findIndex(
        (c) => c.id === categoryId,
      );

      if (categoryIndex === -1) {
        return {
          success: false,
          message: "Template category not found",
        };
      }

      const updatedCategory = {
        ...mockCategories[categoryIndex],
        ...updates,
        updatedAt: new Date(),
      };

      mockCategories[categoryIndex] = updatedCategory;

      return {
        success: true,
        data: updatedCategory,
        message: "Template category updated successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update template category",
      };
    }
  },

  /**
   * Delete a template category
   */
  async deleteTemplateCategory(categoryId: string): Promise<ApiResponse<void>> {
    try {
      const categoryIndex = mockCategories.findIndex(
        (c) => c.id === categoryId,
      );

      if (categoryIndex === -1) {
        return {
          success: false,
          message: "Template category not found",
        };
      }

      mockCategories.splice(categoryIndex, 1);

      return {
        success: true,
        message: "Template category deleted successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete template category",
      };
    }
  },

  /**
   * Apply a template with variables
   */
  async applyTemplate(
    templateId: string,
    variables?: Record<string, string>,
  ): Promise<ApiResponse<string>> {
    try {
      const template = mockTemplates.find((t) => t.id === templateId);

      if (!template) {
        return {
          success: false,
          message: "Template not found",
        };
      }

      // Simple variable replacement logic
      let result = template.content;
      if (variables) {
        for (const [key, value] of Object.entries(variables)) {
          const placeholder = `{{${key}}}`;
          result = result.replace(new RegExp(placeholder, "g"), value);
        }
      }

      // Increment usage count
      const templateIndex = mockTemplates.findIndex((t) => t.id === templateId);
      if (templateIndex !== -1) {
        mockTemplates[templateIndex] = {
          ...mockTemplates[templateIndex],
          usageCount: (mockTemplates[templateIndex].usageCount || 0) + 1,
        };
      }

      return {
        success: true,
        data: result,
        message: "Template applied successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to apply template",
      };
    }
  },

  /**
   * Preview a template with variables
   */
  async previewTemplate(
    templateId: string,
    variables?: Record<string, string>,
  ): Promise<ApiResponse<string>> {
    try {
      const template = mockTemplates.find((t) => t.id === templateId);

      if (!template) {
        return {
          success: false,
          message: "Template not found",
        };
      }

      // Simple variable replacement logic for preview
      let result = template.content;
      if (variables) {
        for (const [key, value] of Object.entries(variables)) {
          const placeholder = `{{${key}}}`;
          result = result.replace(new RegExp(placeholder, "g"), value);
        }
      }

      return {
        success: true,
        data: result,
        message: "Template preview generated successfully",
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to preview template",
      };
    }
  },
};
