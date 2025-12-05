/**
 * Template-related types for Todone application
 * Contains comprehensive template management interfaces and types
 */

import { PriorityLevel, TaskStatus } from "./enums";

/**
 * Base template interface
 */
export interface BaseTemplate {
  /**
   * Unique template identifier
   */
  id: string;

  /**
   * Template name
   */
  name: string;

  /**
   * Template description
   */
  description?: string;

  /**
   * Template content/structure
   */
  content: string;

  /**
   * Template category ID
   */
  categoryId?: string | null;

  /**
   * Template tags for organization
   */
  tags?: string[];

  /**
   * Creation timestamp
   */
  createdAt: Date;

  /**
   * Last update timestamp
   */
  updatedAt: Date;

  /**
   * Template metadata
   */
  metadata?: {
    source?: string;
    createdBy?: string;
    lastUpdatedBy?: string;
    version?: number;
  };
}

/**
 * Extended template interface with relationships
 */
export interface Template extends BaseTemplate {
  /**
   * User who created this template
   */
  createdBy?: string | null;

  /**
   * Template usage count
   */
  usageCount?: number;

  /**
   * Template rating (0-5)
   */
  rating?: number;

  /**
   * Template is public/private
   */
  isPublic?: boolean;

  /**
   * Template variables for dynamic content
   */
  variables?: Record<string, string>;

  /**
   * Template preview image URL
   */
  previewImage?: string | null;
}

/**
 * Template creation DTO (Data Transfer Object)
 */
export interface CreateTemplateDto extends Omit<
  Template,
  "id" | "createdAt" | "updatedAt"
> {
  /**
   * Optional ID for client-side generation
   */
  id?: string;
}

/**
 * Template update DTO
 */
export interface UpdateTemplateDto extends Partial<
  Omit<Template, "id" | "createdAt" | "updatedAt">
> {
  /**
   * Template ID (required for updates)
   */
  id: string;
}

/**
 * Template category interface
 */
export interface TemplateCategory {
  /**
   * Unique category identifier
   */
  id: string;

  /**
   * Category name
   */
  name: string;

  /**
   * Category description
   */
  description?: string;

  /**
   * Category color for UI
   */
  color?: string;

  /**
   * Category icon
   */
  icon?: string;

  /**
   * Category order/position
   */
  order: number;

  /**
   * Creation timestamp
   */
  createdAt: Date;

  /**
   * Last update timestamp
   */
  updatedAt: Date;
}

/**
 * Template category creation DTO
 */
export interface CreateTemplateCategoryDto extends Omit<
  TemplateCategory,
  "id" | "createdAt" | "updatedAt"
> {
  /**
   * Optional ID for client-side generation
   */
  id?: string;
}

/**
 * Template category update DTO
 */
export interface UpdateTemplateCategoryDto extends Partial<
  Omit<TemplateCategory, "id" | "createdAt" | "updatedAt">
> {
  /**
   * Category ID (required for updates)
   */
  id: string;
}

/**
 * Template filter criteria
 */
export interface TemplateFilterCriteria {
  /**
   * Filter by category ID
   */
  categoryId?: string | string[];

  /**
   * Filter by tags
   */
  tags?: string | string[];

  /**
   * Filter by search query
   */
  searchQuery?: string;

  /**
   * Filter by public/private status
   */
  isPublic?: boolean;

  /**
   * Filter by created by user
   */
  createdBy?: string | string[];
}

/**
 * Template sort options
 */
export interface TemplateSortOptions {
  /**
   * Field to sort by
   */
  field: "name" | "createdAt" | "updatedAt" | "usageCount" | "rating";

  /**
   * Sort direction
   */
  direction: "asc" | "desc";
}

/**
 * Template query parameters
 */
export interface TemplateQueryParams {
  /**
   * Filter criteria
   */
  filter?: TemplateFilterCriteria;

  /**
   * Sort options
   */
  sort?: TemplateSortOptions;

  /**
   * Pagination options
   */
  pagination?: {
    page: number;
    pageSize: number;
  };
}

/**
 * Template application result
 */
export interface TemplateApplicationResult {
  /**
   * Successfully applied template
   */
  success: boolean;

  /**
   * Applied template ID
   */
  templateId: string;

  /**
   * Resulting content
   */
  result: string;

  /**
   * Applied variables
   */
  variables?: Record<string, string>;

  /**
   * Error message if failed
   */
  error?: string;
}

/**
 * Template preview data
 */
export interface TemplatePreview {
  /**
   * Template ID
   */
  templateId: string;

  /**
   * Preview content
   */
  content: string;

  /**
   * Preview variables
   */
  variables: Record<string, string>;

  /**
   * Preview timestamp
   */
  timestamp: Date;
}
