import { Label, Task } from '../types/models';

/**
 * Label Utilities
 * Helper functions for working with labels
 */
export class LabelUtils {
  /**
   * Get labels for task
   * @param task - Task to get labels for
   * @param allLabels - All available labels
   * @returns Array of labels for the task
   */
  static getLabelsForTask(task: Task, allLabels: Label[]): Label[] {
    if (!task.labelIds || task.labelIds.length === 0) {
      return [];
    }

    return allLabels.filter(label => task.labelIds?.includes(label.id));
  }

  /**
   * Add label to task
   * @param task - Task to modify
   * @param labelId - Label ID to add
   * @returns Updated task
   */
  static addLabelToTask(task: Task, labelId: string): Task {
    if (!task.labelIds) {
      task.labelIds = [];
    }

    if (!task.labelIds.includes(labelId)) {
      task.labelIds.push(labelId);
    }

    return { ...task };
  }

  /**
   * Remove label from task
   * @param task - Task to modify
   * @param labelId - Label ID to remove
   * @returns Updated task
   */
  static removeLabelFromTask(task: Task, labelId: string): Task {
    if (task.labelIds) {
      task.labelIds = task.labelIds.filter(id => id !== labelId);
    }

    return { ...task };
  }

  /**
   * Toggle label on task
   * @param task - Task to modify
   * @param labelId - Label ID to toggle
   * @returns Updated task
   */
  static toggleLabelOnTask(task: Task, labelId: string): Task {
    if (!task.labelIds) {
      task.labelIds = [];
    }

    const index = task.labelIds.indexOf(labelId);
    if (index === -1) {
      task.labelIds.push(labelId);
    } else {
      task.labelIds.splice(index, 1);
    }

    return { ...task };
  }

  /**
   * Get label color for display
   * @param label - Label to get color for
   * @returns CSS color string
   */
  static getLabelColor(label: Label): string {
    // Handle different color formats
    if (label.color.startsWith('#')) {
      return label.color;
    }

    // Handle Tailwind color classes
    if (label.color.includes('-')) {
      return `bg-${label.color} text-white`;
    }

    // Default color
    return 'bg-gray-500 text-white';
  }

  /**
   * Create label from text
   * @param text - Text to create label from
   * @returns Label object
   */
  static createLabelFromText(text: string): Partial<Label> {
    return {
      name: text.trim(),
      color: this.getColorForText(text),
      isPersonal: true
    };
  }

  /**
   * Get color for text (simple hash-based color assignment)
   * @param text - Text to generate color for
   * @returns Color string
   */
  static getColorForText(text: string): string {
    // Simple hash function to generate consistent colors
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = text.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Convert hash to color
    const colors = [
      '#EF4444', // red-500
      '#F59E0B', // yellow-500
      '#10B981', // green-500
      '#3B82F6', // blue-500
      '#8B5CF6', // purple-500
      '#EC4899', // pink-500
      '#F97316', // orange-500
      '#06B6D4'  // cyan-500
    ];

    return colors[Math.abs(hash) % colors.length];
  }

  /**
   * Filter labels by search query
   * @param labels - Array of labels to filter
   * @param query - Search query
   * @returns Filtered array of labels
   */
  static filterLabels(labels: Label[], query: string): Label[] {
    if (!query) {
      return [...labels];
    }

    const searchTerm = query.toLowerCase();
    return labels.filter(label =>
      label.name.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Sort labels by name
   * @param labels - Array of labels to sort
   * @param direction - Sort direction ('asc' or 'desc')
   * @returns Sorted array of labels
   */
  static sortLabels(labels: Label[], direction: 'asc' | 'desc' = 'asc'): Label[] {
    return [...labels].sort((a, b) => {
      if (direction === 'asc') {
        return a.name.localeCompare(b.name);
      } else {
        return b.name.localeCompare(a.name);
      }
    });
  }

  /**
   * Group labels by category
   * @param labels - Array of labels to group
   * @returns Object with personal and shared labels
   */
  static groupLabelsByCategory(labels: Label[]): {
    personal: Label[];
    shared: Label[];
  } {
    return {
      personal: labels.filter(label => label.isPersonal),
      shared: labels.filter(label => !label.isPersonal)
    };
  }
}