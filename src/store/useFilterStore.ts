// @ts-nocheck
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { devtools } from "zustand/middleware";
import { FilterState, Filter } from "../types/store";

export const useFilterStore = create<FilterState>()(
  devtools(
    persist(
      (set, get) => ({
        filters: [],
        currentFilterId: null,
        searchQuery: "",
        filterError: null,

        // CRUD Operations
        addFilter: (
          filterData: Omit<Filter, "id" | "createdAt" | "updatedAt">,
        ) => {
          const newFilter: Filter = {
            ...filterData,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          set((state) => ({
            filters: [...state.filters, newFilter],
          }));
        },

        updateFilter: (
          id: string,
          updates: Partial<Omit<Filter, "id" | "createdAt">>,
        ) => {
          set((state) => ({
            filters: state.filters.map((filter) =>
              filter.id === id
                ? {
                    ...filter,
                    ...updates,
                    updatedAt: new Date(),
                  }
                : filter,
            ),
          }));
        },

        deleteFilter: (id: string) => {
          set((state) => ({
            filters: state.filters.filter((filter) => filter.id !== id),
            currentFilterId:
              state.currentFilterId === id ? null : state.currentFilterId,
          }));
        },

        toggleFilterFavorite: (id: string) => {
          set((state) => ({
            filters: state.filters.map((filter) =>
              filter.id === id
                ? {
                    ...filter,
                    favorite: !filter.favorite,
                    updatedAt: new Date(),
                  }
                : filter,
            ),
          }));
        },

        // Selection operations
        setCurrentFilter: (filterId: string | null) => {
          set({ currentFilterId: filterId });
        },

        // Search operations
        setSearchQuery: (query: string) => {
          set({ searchQuery: query });
        },

        // Error handling
        setFilterError: (error: string | null) => {
          set({ filterError: error });
        },

        // Initialize with sample filters
        initializeSampleFilters: () => {
          const sampleFilters: Filter[] = [
            {
              id: "filter-1",
              name: "High Priority",
              criteria: {
                priority: "high",
              },
              color: "#EF4444",
              favorite: true,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: "filter-2",
              name: "In Progress",
              criteria: {
                status: "in-progress",
              },
              color: "#F59E0B",
              favorite: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
            {
              id: "filter-3",
              name: "Overdue",
              criteria: {
                dueDate: "overdue",
              },
              color: "#DC2626",
              favorite: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ];

          set({ filters: sampleFilters });
        },

        // Filter operations
        getFiltersByCriteria: (criteria: Record<string, any>) => {
          return get().filters.filter((filter) => {
            return Object.entries(criteria).every(
              ([key, value]) => filter.criteria[key] === value,
            );
          });
        },

        // Clear all filters
        clearAllFilters: () => {
          set({ filters: [] });
        },
      }),
      {
        name: "todone-filters-storage",
        storage: createJSONStorage(() => localStorage),
      },
    ),
  ),
);

// Helper function to create localStorage
const createJSONStorage = (getStorage: () => Storage) => ({
  getItem: (name: string) => {
    const storage = getStorage();
    const item = storage.getItem(name);
    return item ? JSON.parse(item) : null;
  },
  setItem: (name: string, value: any) => {
    const storage = getStorage();
    storage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name: string) => {
    const storage = getStorage();
    storage.removeItem(name);
  },
});
