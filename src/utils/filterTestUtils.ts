import { Filter, FilterModel } from "../types/models";

/**
 * Filter Test Utilities
 * Helper functions for testing filter functionality
 */
export class FilterTestUtils {
  /**
   * Generate mock filter data
   * @param overrides - Partial filter data to override defaults
   * @returns Mock filter object
   */
  static generateMockFilter(overrides: Partial<Filter> = {}): Filter {
    return new FilterModel({
      name: "Test Filter",
      criteria: {
        status: "active",
        priority: "medium",
      },
      color: "#4F46E5",
      favorite: false,
      ...overrides,
    });
  }

  /**
   * Generate array of mock filters
   * @param count - Number of filters to generate
   * @returns Array of mock filters
   */
  static generateMockFilters(count: number = 5): Filter[] {
    const filters: Filter[] = [];
    const statuses = ["active", "completed", "archived"];
    const priorities = ["low", "medium", "high", "critical"];
    const colors = ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6"];

    for (let i = 0; i < count; i++) {
      filters.push(
        new FilterModel({
          id: `filter-${i + 1}`,
          name: `Test Filter ${i + 1}`,
          criteria: {
            status: statuses[i % statuses.length],
            priority: priorities[i % priorities.length],
          },
          color: colors[i % colors.length],
          favorite: i % 3 === 0,
          createdAt: new Date(Date.now() - i * 1000 * 60 * 60 * 24), // Each filter created a day apart
          updatedAt: new Date(Date.now() - i * 1000 * 60 * 60 * 24),
        }),
      );
    }

    return filters;
  }

  /**
   * Create mock filter service
   * @returns Mock filter service with test data
   */
  static createMockFilterService() {
    return {
      filters: this.generateMockFilters(10),
      getAllFilters: async () => ({
        success: true,
        data: this.generateMockFilters(10),
      }),
      getFilterById: async (id: string) => {
        const filter = this.generateMockFilters(10).find((f) => f.id === id);
        return {
          success: true,
          data: filter || null,
        };
      },
      createFilter: async (filterData: Partial<Filter>) => {
        const newFilter = this.generateMockFilter(filterData);
        return {
          success: true,
          data: newFilter,
        };
      },
      updateFilter: async (id: string, filterData: Partial<Filter>) => {
        const updatedFilter = this.generateMockFilter({
          ...filterData,
          id,
        });
        return {
          success: true,
          data: updatedFilter,
        };
      },
      deleteFilter: async (id: string) => ({
        success: true,
        data: true,
      }),
      toggleFavorite: async (id: string) => {
        const filter = this.generateMockFilters(10).find((f) => f.id === id);
        if (filter) {
          filter.favorite = !filter.favorite;
        }
        return {
          success: true,
          data: filter || null,
        };
      },
      searchFilters: async (query: string) => {
        const allFilters = this.generateMockFilters(10);
        const results = allFilters.filter((filter) =>
          filter.name.toLowerCase().includes(query.toLowerCase()),
        );
        return {
          success: true,
          data: results,
        };
      },
      getFavoriteFilters: async () => {
        const allFilters = this.generateMockFilters(10);
        const favorites = allFilters.filter((filter) => filter.favorite);
        return {
          success: true,
          data: favorites,
        };
      },
    };
  }

  /**
   * Generate filter test scenarios
   * @returns Array of test scenarios with input and expected output
   */
  static generateFilterTestScenarios() {
    return [
      {
        name: "Basic status filter",
        input: {
          criteria: { status: "active" },
        },
        expected: {
          shouldMatch: (filter: Filter) => filter.criteria.status === "active",
        },
      },
      {
        name: "Priority filter",
        input: {
          criteria: { priority: "high" },
        },
        expected: {
          shouldMatch: (filter: Filter) => filter.criteria.priority === "high",
        },
      },
      {
        name: "Complex multi-criteria filter",
        input: {
          criteria: {
            status: "active",
            priority: "high",
          },
        },
        expected: {
          shouldMatch: (filter: Filter) =>
            filter.criteria.status === "active" &&
            filter.criteria.priority === "high",
        },
      },
    ];
  }

  /**
   * Validate filter criteria
   * @param filter - Filter to validate
   * @returns Validation result
   */
  static validateFilterCriteria(filter: Filter): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!filter.name || filter.name.trim() === "") {
      errors.push("Filter name is required");
    }

    if (filter.name && filter.name.length > 100) {
      errors.push("Filter name exceeds maximum length of 100 characters");
    }

    if (!filter.criteria || typeof filter.criteria !== "object") {
      errors.push("Filter criteria must be an object");
    }

    if (!filter.color || !filter.color.startsWith("#")) {
      errors.push("Filter color must be a valid hex color");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
