/**
 * Template category utility functions for Todone application
 */

import { TemplateCategory } from '../types/template';

/**
 * Generate a unique category ID
 */
export const generateCategoryId = (): string => {
  return `category-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
};

/**
 * Validate category data
 */
export const validateCategory = (category: Partial<TemplateCategory>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!category.name || category.name.trim().length === 0) {
    errors.push('Category name is required');
  }

  if (category.name && category.name.length > 50) {
    errors.push('Category name cannot exceed 50 characters');
  }

  if (category.description && category.description.length > 500) {
    errors.push('Category description cannot exceed 500 characters');
  }

  if (category.color && !/^#[0-9A-F]{6}$/i.test(category.color)) {
    errors.push('Category color must be a valid hex color code');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Get default category colors
 */
export const getDefaultCategoryColors = (): string[] => {
  return [
    '#3B82F6', // Blue
    '#10B981', // Green
    '#8B5CF6', // Purple
    '#F59E0B', // Yellow
    '#EF4444', // Red
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#EC4899', // Pink
  ];
};

/**
 * Get default category icons
 */
export const getDefaultCategoryIcons = (): string[] => {
  return [
    'code', 'briefcase', 'user', 'folder', 'book', 'star', 'rocket', 'lightbulb',
    'pencil', 'document', 'chart', 'calendar', 'settings', 'tag', 'grid', 'list'
  ];
};

/**
 * Sort categories by name or order
 */
export const sortCategories = (
  categories: TemplateCategory[],
  sortBy: 'name' | 'order' = 'order',
  direction: 'asc' | 'desc' = 'asc'
): TemplateCategory[] => {
  return [...categories].sort((a, b) => {
    if (sortBy === 'name') {
      return direction === 'asc'
        ? a.name.localeCompare(b.name)
        : b.name.localeCompare(a.name);
    } else {
      return direction === 'asc'
        ? a.order - b.order
        : b.order - a.order;
    }
  });
};

/**
 * Filter categories by search query
 */
export const filterCategories = (
  categories: TemplateCategory[],
  searchQuery?: string
): TemplateCategory[] => {
  if (!searchQuery) {
    return [...categories];
  }

  const query = searchQuery.toLowerCase();
  return categories.filter(category =>
    category.name.toLowerCase().includes(query) ||
    (category.description && category.description.toLowerCase().includes(query))
  );
};

/**
 * Get category statistics
 */
export const getCategoryStatistics = (categories: TemplateCategory[]): {
  total: number;
  withTemplates: number;
  withoutTemplates: number;
} => {
  // Note: This would need template data to be fully accurate
  // For now, we'll just return basic stats
  return {
    total: categories.length,
    withTemplates: Math.floor(categories.length * 0.7), // Mock data
    withoutTemplates: Math.ceil(categories.length * 0.3) // Mock data
  };
};

/**
 * Generate category color based on name
 */
export const generateCategoryColor = (name: string): string => {
  // Simple hash function to generate consistent colors
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Convert hash to hex color
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }

  return color;
};

/**
 * Format category for display
 */
export const formatCategoryForDisplay = (category: TemplateCategory): string => {
  return `${category.icon ? `${category.icon} ` : ''}${category.name}`;
};

/**
 * Create default categories
 */
export const createDefaultCategories = (): TemplateCategory[] => {
  const defaultColors = getDefaultCategoryColors();
  const defaultIcons = getDefaultCategoryIcons();

  return [
    {
      id: generateCategoryId(),
      name: 'Technical',
      description: 'Templates for technical documentation and development',
      color: defaultColors[0],
      icon: defaultIcons[0],
      order: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: generateCategoryId(),
      name: 'Business',
      description: 'Templates for business processes and meetings',
      color: defaultColors[1],
      icon: defaultIcons[1],
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: generateCategoryId(),
      name: 'Personal',
      description: 'Templates for personal productivity',
      color: defaultColors[2],
      icon: defaultIcons[2],
      order: 2,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: generateCategoryId(),
      name: 'Creative',
      description: 'Templates for creative projects and ideas',
      color: defaultColors[3],
      icon: defaultIcons[3],
      order: 3,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: generateCategoryId(),
      name: 'Education',
      description: 'Templates for educational content and learning',
      color: defaultColors[4],
      icon: defaultIcons[4],
      order: 4,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];
};