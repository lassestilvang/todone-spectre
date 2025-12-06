// @ts-nocheck
import { Filter, Task } from "../types/models";

/**
 * Filter Utilities
 * Helper functions for working with filters
 */
export class FilterUtils {
  /**
   * Apply filter to tasks
   * @param tasks - Array of tasks to filter
   * @param filter - Filter to apply
   * @returns Filtered array of tasks
   */
  static applyFilter(tasks: Task[], filter: Filter): Task[] {
    if (
      !filter ||
      !filter.criteria ||
      Object.keys(filter.criteria).length === 0
    ) {
      return [...tasks];
    }

    return tasks.filter((task) => {
      // Apply each criterion
      for (const [key, value] of Object.entries(filter.criteria)) {
        if (key === "title" && typeof value === "string") {
          if (!task.title.toLowerCase().includes(value.toLowerCase())) {
            return false;
          }
        }

        if (key === "priority" && task.priority !== value) {
          return false;
        }

        if (key === "status" && task.status !== value) {
          return false;
        }

        if (key === "completed" && task.completed !== value) {
          return false;
        }

        if (key === "projectId" && task.projectId !== value) {
          return false;
        }

        if (key === "labelIds" && Array.isArray(value)) {
          const hasMatchingLabel = value.some((labelId: string) =>
            task.labelIds?.includes(labelId),
          );
          if (!hasMatchingLabel) {
            return false;
          }
        }
      }

      return true;
    });
  }

  /**
   * Create filter from search query
   * @param query - Search query string
   * @returns Filter object
   */
  static createFilterFromQuery(query: string): Partial<Filter> {
    return {
      name: `Search: ${query}`,
      criteria: {
        title: query,
      },
      color: "#4F46E5",
    };
  }

  /**
   * Parse filter criteria from string
   * @param criteriaString - Criteria string (e.g., "priority:P1 status:active")
   * @returns Parsed criteria object
   */
  static parseCriteriaString(criteriaString: string): Record<string, any> {
    const criteria: Record<string, any> = {};

    // Simple parsing logic - can be enhanced
    const parts = criteriaString.split(" ");
    parts.forEach((part) => {
      if (part.includes(":")) {
        const [key, value] = part.split(":");
        criteria[key.trim()] = value.trim();
      }
    });

    return criteria;
  }

  /**
   * Validate filter criteria
   * @param criteria - Criteria object to validate
   * @returns Validation result
   */
  static validateFilterCriteria(criteria: Record<string, any>): boolean {
    if (!criteria || typeof criteria !== "object") {
      return false;
    }

    // Check for valid criteria keys
    const validKeys = [
      "title",
      "priority",
      "status",
      "completed",
      "projectId",
      "labelIds",
    ];
    for (const key of Object.keys(criteria)) {
      if (!validKeys.includes(key)) {
        return false;
      }
    }

    return true;
  }

  /**
   * Convert filter to query string
   * @param filter - Filter to convert
   * @returns Query string representation
   */
  static filterToQueryString(filter: Filter): string {
    if (!filter.criteria || Object.keys(filter.criteria).length === 0) {
      return "";
    }

    const queryParts: string[] = [];

    for (const [key, value] of Object.entries(filter.criteria)) {
      if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        queryParts.push(`${key}:${value}`);
      } else if (Array.isArray(value)) {
        queryParts.push(`${key}:[${value.join(",")}]`);
      }
    }

    return queryParts.join(" ");
  }

  /**
   * Merge multiple filters
   * @param filters - Array of filters to merge
   * @returns Merged filter
   */
  static mergeFilters(filters: Filter[]): Filter {
    if (filters.length === 0) {
      throw new Error("No filters provided to merge");
    }

    const mergedCriteria: Record<string, any> = {};

    // Merge criteria from all filters
    filters.forEach((filter) => {
      if (filter.criteria) {
        Object.assign(mergedCriteria, filter.criteria);
      }
    });

    return {
      id: "merged_" + Math.random().toString(36).substr(2, 9),
      name: `Merged Filter (${filters.length})`,
      criteria: mergedCriteria,
      color: filters[0].color || "#4F46E5",
      favorite: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  /**
   * Check if filter matches task
   * @param task - Task to check
   * @param filter - Filter to test against
   * @returns True if task matches filter
   */
  static filterMatchesTask(task: Task, filter: Filter): boolean {
    return this.applyFilter([task], filter).length > 0;
  }
}
