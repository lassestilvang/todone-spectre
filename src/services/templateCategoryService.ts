/**
 * Template Category Service - Handles all template category-related business logic and CRUD operations
 */

import { TemplateCategory, CreateTemplateCategoryDto, UpdateTemplateCategoryDto } from '../types/template';
import { ApiResponse } from '../types/api';
import { templateApi } from '../api/templateApi';
import { useTemplateStore } from '../store/useTemplateStore';

/**
 * Template Category Service
 */
export class TemplateCategoryService {
  private static instance: TemplateCategoryService;
  private templateStore = useTemplateStore.getState();

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance of TemplateCategoryService
   */
  public static getInstance(): TemplateCategoryService {
    if (!TemplateCategoryService.instance) {
      TemplateCategoryService.instance = new TemplateCategoryService();
    }
    return TemplateCategoryService.instance;
  }

  /**
   * Validate template category data before creation/update
   */
  private validateTemplateCategory(categoryData: Partial<TemplateCategory>): void {
    if (!categoryData.name || categoryData.name.trim().length === 0) {
      throw new Error('Category name is required');
    }

    if (categoryData.name.length > 50) {
      throw new Error('Category name cannot exceed 50 characters');
    }

    if (categoryData.description && categoryData.description.length > 500) {
      throw new Error('Category description cannot exceed 500 characters');
    }
  }

  /**
   * Create a new template category with validation
   */
  async createTemplateCategory(categoryData: CreateTemplateCategoryDto): Promise<TemplateCategory> {
    this.validateTemplateCategory(categoryData);

    const newCategory: Omit<TemplateCategory, 'id'> = {
      ...categoryData,
      createdAt: new Date(),
      updatedAt: new Date(),
      order: this.templateStore.categories.length
    };

    try {
      // Optimistic update
      const optimisticCategory: TemplateCategory = {
        ...newCategory,
        id: `temp-${Date.now()}`
      };

      this.templateStore.addCategory(optimisticCategory);

      // Call API
      const response: ApiResponse<TemplateCategory> = await templateApi.createTemplateCategory(newCategory);

      if (response.success && response.data) {
        // Replace temporary ID with real ID
        this.templateStore.updateCategory(optimisticCategory.id, {
          id: response.data.id,
          ...response.data
        });
        return response.data;
      } else {
        // Revert optimistic update on failure
        this.templateStore.deleteCategory(optimisticCategory.id);
        throw new Error(response.message || 'Failed to create template category');
      }
    } catch (error) {
      console.error('Error creating template category:', error);
      throw error;
    }
  }

  /**
   * Get a single template category by ID
   */
  async getTemplateCategory(categoryId: string): Promise<TemplateCategory> {
    try {
      const response: ApiResponse<TemplateCategory> = await templateApi.getTemplateCategory(categoryId);

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Template category not found');
      }
    } catch (error) {
      console.error('Error fetching template category:', error);
      throw error;
    }
  }

  /**
   * Get all template categories
   */
  async getTemplateCategories(): Promise<TemplateCategory[]> {
    try {
      const response: ApiResponse<TemplateCategory[]> = await templateApi.getTemplateCategories();

      if (response.success && response.data) {
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch template categories');
      }
    } catch (error) {
      console.error('Error fetching template categories:', error);
      throw error;
    }
  }

  /**
   * Update a template category with optimistic updates
   */
  async updateTemplateCategory(categoryId: string, updates: UpdateTemplateCategoryDto): Promise<TemplateCategory> {
    this.validateTemplateCategory(updates);

    try {
      // Get current category for optimistic update
      const currentCategory = this.templateStore.categories.find(category => category.id === categoryId);
      if (!currentCategory) {
        throw new Error('Template category not found');
      }

      // Optimistic update
      const optimisticUpdate = {
        ...updates,
        updatedAt: new Date()
      };

      this.templateStore.updateCategory(categoryId, optimisticUpdate);

      // Call API
      const response: ApiResponse<TemplateCategory> = await templateApi.updateTemplateCategory(categoryId, updates);

      if (response.success && response.data) {
        return response.data;
      } else {
        // Revert optimistic update on failure
        this.templateStore.updateCategory(categoryId, currentCategory);
        throw new Error(response.message || 'Failed to update template category');
      }
    } catch (error) {
      console.error('Error updating template category:', error);
      throw error;
    }
  }

  /**
   * Delete a template category with confirmation
   */
  async deleteTemplateCategory(categoryId: string, confirm: boolean = true): Promise<void> {
    if (confirm) {
      // In a real app, this would show a confirmation dialog
      console.log('Template category deletion requires confirmation');
    }

    try {
      // Optimistic update
      this.templateStore.deleteCategory(categoryId);

      // Call API
      const response: ApiResponse<void> = await templateApi.deleteTemplateCategory(categoryId);

      if (!response.success) {
        // Revert optimistic update on failure
        console.error('Failed to delete template category:', response.message);
        throw new Error(response.message || 'Failed to delete template category');
      }
    } catch (error) {
      console.error('Error deleting template category:', error);
      throw error;
    }
  }

  /**
   * Sort categories by name or order
   */
  sortCategories(sortBy: 'name' | 'order' = 'order'): TemplateCategory[] {
    return [...this.templateStore.categories].sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'order':
          return a.order - b.order;
        default:
          return 0;
      }
    });
  }
}

// Singleton instance
export const templateCategoryService = TemplateCategoryService.getInstance();