import { Filter, FilterModel } from "../types/models";
import { Result, AsyncResult } from "../types/common";

/**
 * Filter Service
 * Provides CRUD operations for filters
 */
class FilterService {
  private filters: Filter[] = [];
  private storageKey = "todone_filters";

  constructor() {
    this.loadFilters();
  }

  /**
   * Load filters from localStorage
   */
  private loadFilters(): void {
    try {
      const savedFilters = localStorage.getItem(this.storageKey);
      if (savedFilters) {
        const parsedFilters = JSON.parse(savedFilters);
        this.filters = parsedFilters.map(
          (filter: any) => new FilterModel(filter),
        );
      }
    } catch (error) {
      console.error("Failed to load filters:", error);
    }
  }

  /**
   * Save filters to localStorage
   */
  private saveFilters(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.filters));
    } catch (error) {
      console.error("Failed to save filters:", error);
    }
  }

  /**
   * Get all filters
   */
  getAllFilters(): AsyncResult<Filter[]> {
    return Promise.resolve({
      success: true,
      data: [...this.filters],
    });
  }

  /**
   * Get filter by ID
   */
  getFilterById(id: string): AsyncResult<Filter | null> {
    const filter = this.filters.find((f) => f.id === id);
    return Promise.resolve({
      success: true,
      data: filter ? { ...filter } : null,
    });
  }

  /**
   * Create new filter
   */
  createFilter(filterData: Partial<Filter>): AsyncResult<Filter> {
    try {
      const newFilter = new FilterModel(filterData);
      this.filters.push(newFilter);
      this.saveFilters();
      return Promise.resolve({
        success: true,
        data: { ...newFilter },
      });
    } catch (error) {
      return Promise.resolve({
        success: false,
        error:
          error instanceof Error ? error : new Error("Failed to create filter"),
      });
    }
  }

  /**
   * Update existing filter
   */
  updateFilter(id: string, filterData: Partial<Filter>): AsyncResult<Filter> {
    try {
      const index = this.filters.findIndex((f) => f.id === id);
      if (index === -1) {
        throw new Error("Filter not found");
      }

      const updatedFilter = new FilterModel({
        ...this.filters[index],
        ...filterData,
      });

      this.filters[index] = updatedFilter;
      this.saveFilters();

      return Promise.resolve({
        success: true,
        data: { ...updatedFilter },
      });
    } catch (error) {
      return Promise.resolve({
        success: false,
        error:
          error instanceof Error ? error : new Error("Failed to update filter"),
      });
    }
  }

  /**
   * Delete filter
   */
  deleteFilter(id: string): AsyncResult<boolean> {
    try {
      const initialLength = this.filters.length;
      this.filters = this.filters.filter((f) => f.id !== id);

      if (this.filters.length === initialLength) {
        throw new Error("Filter not found");
      }

      this.saveFilters();
      return Promise.resolve({
        success: true,
        data: true,
      });
    } catch (error) {
      return Promise.resolve({
        success: false,
        error:
          error instanceof Error ? error : new Error("Failed to delete filter"),
      });
    }
  }

  /**
   * Toggle favorite status
   */
  toggleFavorite(id: string): AsyncResult<Filter> {
    try {
      const filter = this.filters.find((f) => f.id === id);
      if (!filter) {
        throw new Error("Filter not found");
      }

      filter.toggleFavorite();
      this.saveFilters();

      return Promise.resolve({
        success: true,
        data: { ...filter },
      });
    } catch (error) {
      return Promise.resolve({
        success: false,
        error:
          error instanceof Error
            ? error
            : new Error("Failed to toggle favorite"),
      });
    }
  }

  /**
   * Search filters by name
   */
  searchFilters(query: string): AsyncResult<Filter[]> {
    try {
      const results = this.filters.filter((filter) =>
        filter.name.toLowerCase().includes(query.toLowerCase()),
      );

      return Promise.resolve({
        success: true,
        data: [...results],
      });
    } catch (error) {
      return Promise.resolve({
        success: false,
        error:
          error instanceof Error
            ? error
            : new Error("Failed to search filters"),
      });
    }
  }

  /**
   * Get favorite filters
   */
  getFavoriteFilters(): AsyncResult<Filter[]> {
    try {
      const favorites = this.filters.filter((filter) => filter.favorite);
      return Promise.resolve({
        success: true,
        data: [...favorites],
      });
    } catch (error) {
      return Promise.resolve({
        success: false,
        error:
          error instanceof Error
            ? error
            : new Error("Failed to get favorite filters"),
      });
    }
  }

  /**
   * Clear all filters
   */
  clearAllFilters(): AsyncResult<boolean> {
    try {
      this.filters = [];
      this.saveFilters();
      return Promise.resolve({
        success: true,
        data: true,
      });
    } catch (error) {
      return Promise.resolve({
        success: false,
        error:
          error instanceof Error ? error : new Error("Failed to clear filters"),
      });
    }
  }
}

// Singleton instance
const filterService = new FilterService();
export default filterService;
