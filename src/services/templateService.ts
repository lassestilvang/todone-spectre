/**
 * Template Service - Handles all template-related business logic and CRUD operations
 */

import {
  Template,
  CreateTemplateDto,
  UpdateTemplateDto,
  TemplateCategory,
  CreateTemplateCategoryDto,
  UpdateTemplateCategoryDto,
} from "../types/template";
import { ApiResponse } from "../types/api";
import { templateApi } from "../api/templateApi";
import { useTemplateStore } from "../store/useTemplateStore";

/**
 * Template Service
 */
export class TemplateService {
  private static instance: TemplateService;
  private templateStore = useTemplateStore.getState();

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance of TemplateService
   */
  public static getInstance(): TemplateService {
    if (!TemplateService.instance) {
      TemplateService.instance = new TemplateService();
    }
    return TemplateService.instance;
  }

  /**
   * Validate template data before creation/update
   */
  private validateTemplate(templateData: Partial<Template>): void {
    if (!templateData.name || templateData.name.trim().length === 0) {
      throw new Error("Template name is required");
    }

    if (templateData.name.length > 100) {
      throw new Error("Template name cannot exceed 100 characters");
    }

    if (!templateData.content || templateData.content.trim().length === 0) {
      throw new Error("Template content is required");
    }

    if (templateData.description && templateData.description.length > 1000) {
      throw new Error("Template description cannot exceed 1000 characters");
    }

    if (templateData.content.length > 10000) {
      throw new Error("Template content cannot exceed 10000 characters");
    }
  }

  /**
   * Create a new template with validation
   */
  async createTemplate(templateData: CreateTemplateDto): Promise<Template> {
    this.validateTemplate(templateData);

    const newTemplate: Omit<Template, "id"> = {
      ...templateData,
      createdAt: new Date(),
      updatedAt: new Date(),
      usageCount: 0,
      rating: 0,
      isPublic: templateData.isPublic || false,
      variables: templateData.variables || {},
    };

    try {
      // Optimistic update
      const optimisticTemplate: Template = {
        ...newTemplate,
        id: `temp-${Date.now()}`,
      };

      this.templateStore.addTemplate(optimisticTemplate);

      // Call API
      const response: ApiResponse<Template> =
        await templateApi.createTemplate(newTemplate);

      if (response.success && response.data) {
        // Replace temporary ID with real ID
        this.templateStore.updateTemplate(optimisticTemplate.id, {
          id: response.data.id,
          ...response.data,
        });
        return response.data;
      } else {
        // Revert optimistic update on failure
        this.templateStore.deleteTemplate(optimisticTemplate.id);
        throw new Error(response.message || "Failed to create template");
      }
    } catch (error) {
      console.error("Error creating template:", error);
      throw error;
    }
  }

  /**
   * Get a single template by ID
   */
  async getTemplate(templateId: string): Promise<Template> {
    try {
      const response: ApiResponse<Template> =
        await templateApi.getTemplate(templateId);

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Template not found");
      }
    } catch (error) {
      console.error("Error fetching template:", error);
      throw error;
    }
  }

  /**
   * Get all templates
   */
  async getTemplates(): Promise<Template[]> {
    try {
      const response: ApiResponse<Template[]> =
        await templateApi.getTemplates();

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to fetch templates");
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      throw error;
    }
  }

  /**
   * Update a template with optimistic updates
   */
  async updateTemplate(
    templateId: string,
    updates: UpdateTemplateDto,
  ): Promise<Template> {
    this.validateTemplate(updates);

    try {
      // Get current template for optimistic update
      const currentTemplate = this.templateStore.templates.find(
        (template) => template.id === templateId,
      );
      if (!currentTemplate) {
        throw new Error("Template not found");
      }

      // Optimistic update
      const optimisticUpdate = {
        ...updates,
        updatedAt: new Date(),
      };

      this.templateStore.updateTemplate(templateId, optimisticUpdate);

      // Call API
      const response: ApiResponse<Template> = await templateApi.updateTemplate(
        templateId,
        updates,
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        // Revert optimistic update on failure
        this.templateStore.updateTemplate(templateId, currentTemplate);
        throw new Error(response.message || "Failed to update template");
      }
    } catch (error) {
      console.error("Error updating template:", error);
      throw error;
    }
  }

  /**
   * Delete a template with confirmation
   */
  async deleteTemplate(
    templateId: string,
    confirm: boolean = true,
  ): Promise<void> {
    if (confirm) {
      // In a real app, this would show a confirmation dialog
      console.log("Template deletion requires confirmation");
    }

    try {
      // Optimistic update
      this.templateStore.deleteTemplate(templateId);

      // Call API
      const response: ApiResponse<void> =
        await templateApi.deleteTemplate(templateId);

      if (!response.success) {
        // Revert optimistic update on failure
        console.error("Failed to delete template:", response.message);
        throw new Error(response.message || "Failed to delete template");
      }
    } catch (error) {
      console.error("Error deleting template:", error);
      throw error;
    }
  }

  /**
   * Apply a template with variables
   */
  async applyTemplate(
    templateId: string,
    variables?: Record<string, string>,
  ): Promise<string> {
    try {
      const response: ApiResponse<string> = await templateApi.applyTemplate(
        templateId,
        variables,
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to apply template");
      }
    } catch (error) {
      console.error("Error applying template:", error);
      throw error;
    }
  }

  /**
   * Preview a template with variables
   */
  async previewTemplate(
    templateId: string,
    variables?: Record<string, string>,
  ): Promise<string> {
    try {
      const response: ApiResponse<string> = await templateApi.previewTemplate(
        templateId,
        variables,
      );

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || "Failed to preview template");
      }
    } catch (error) {
      console.error("Error previewing template:", error);
      throw error;
    }
  }

  /**
   * Filter templates by category
   */
  filterTemplatesByCategory(categoryId: string): Template[] {
    return this.templateStore.templates.filter(
      (template) => template.categoryId === categoryId,
    );
  }

  /**
   * Sort templates by name, usage count, or creation date
   */
  sortTemplates(
    sortBy: "name" | "usageCount" | "createdAt" = "name",
  ): Template[] {
    return [...this.templateStore.templates].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "usageCount":
          return (b.usageCount || 0) - (a.usageCount || 0);
        case "createdAt":
          return b.createdAt.getTime() - a.createdAt.getTime();
        default:
          return 0;
      }
    });
  }
}

// Singleton instance
export const templateService = TemplateService.getInstance();
