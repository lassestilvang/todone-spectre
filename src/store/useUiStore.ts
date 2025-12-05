import { create } from "zustand";
import { persist } from "zustand/middleware";
import { devtools } from "zustand/middleware";
import { UiState } from "../types/store";

export const useUiStore = create<UiState>()(
  devtools(
    persist(
      (set) => ({
        isSidebarOpen: true,
        theme: "system",
        currentView: "dashboard",
        isTaskModalOpen: false,
        isProjectModalOpen: false,
        isSettingsModalOpen: false,
        isSearchModalOpen: false,
        isCommandPaletteOpen: false,
        searchQuery: "",
        searchResults: [],
        commandHistory: [],

        toggleSidebar: () => {
          set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
        },

        setTheme: (theme: UiState["theme"]) => {
          set({ theme });
          // Apply theme to document
          if (theme === "dark") {
            document.documentElement.classList.add("dark");
            document.documentElement.classList.remove("light");
          } else if (theme === "light") {
            document.documentElement.classList.add("light");
            document.documentElement.classList.remove("dark");
          } else {
            // System theme - remove both classes and let OS decide
            document.documentElement.classList.remove("light", "dark");
          }
        },

        setCurrentView: (view: UiState["currentView"]) => {
          set({ currentView: view });
        },

        openTaskModal: () => {
          set({ isTaskModalOpen: true });
        },

        closeTaskModal: () => {
          set({ isTaskModalOpen: false });
        },

        openProjectModal: () => {
          set({ isProjectModalOpen: true });
        },

        closeProjectModal: () => {
          set({ isProjectModalOpen: false });
        },

        openSettingsModal: () => {
          set({ isSettingsModalOpen: true });
        },

        closeSettingsModal: () => {
          set({ isSettingsModalOpen: false });
        },

        // Search modal methods
        openSearchModal: () => {
          set({ isSearchModalOpen: true });
        },

        closeSearchModal: () => {
          set({ isSearchModalOpen: false, searchQuery: "", searchResults: [] });
        },

        // Command palette methods
        openCommandPalette: () => {
          set({ isCommandPaletteOpen: true });
        },

        closeCommandPalette: () => {
          set({ isCommandPaletteOpen: false });
        },

        // Search methods
        setSearchQuery: (query: string) => {
          set({ searchQuery: query });
        },

        setSearchResults: (results: SearchResult[]) => {
          set({ searchResults: results });
        },

        addToCommandHistory: (commandId: string) => {
          set((state) => ({
            commandHistory: [...state.commandHistory, commandId],
          }));
        },

        clearCommandHistory: () => {
          set({ commandHistory: [] });
        },

        closeAllModals: () => {
          set({
            isTaskModalOpen: false,
            isProjectModalOpen: false,
            isSettingsModalOpen: false,
            isSearchModalOpen: false,
            isCommandPaletteOpen: false,
          });
        },

        // View-specific state management
        viewFilters: {
          inbox: {
            status: "all",
            priority: "all",
            searchQuery: "",
          },
          today: {
            priority: "all",
            searchQuery: "",
          },
          upcoming: {
            priority: "all",
            timeRange: "all",
            searchQuery: "",
          },
        },

        // View layout configurations
        listViewConfig: {
          sortBy: "dueDate",
          groupBy: "project",
        },
        boardViewConfig: {
          columns: ["To Do", "In Progress", "Done"],
          showTaskCount: true,
        },
        calendarViewConfig: {
          viewMode: "week",
          showWeekends: true,
        },

        viewSorting: {
          inbox: {
            field: "priority",
            direction: "asc",
          },
          today: {
            field: "dueDate",
            direction: "asc",
          },
          upcoming: {
            field: "dueDate",
            direction: "asc",
          },
        },

        viewGrouping: {
          inbox: "status",
          today: "overdue-today",
          upcoming: "time-period",
        },

        viewPagination: {
          inbox: {
            page: 1,
            pageSize: 20,
          },
          today: {
            page: 1,
            pageSize: 20,
          },
          upcoming: {
            page: 1,
            pageSize: 20,
          },
        },

        setViewFilter: (
          view: "inbox" | "today" | "upcoming",
          filterType: string,
          value: any,
        ) => {
          set((state) => {
            const newFilters = { ...state.viewFilters };
            if (filterType === "status") {
              newFilters[view].status = value;
            } else if (filterType === "priority") {
              newFilters[view].priority = value;
            } else if (filterType === "timeRange") {
              newFilters[view].timeRange = value;
            } else if (filterType === "searchQuery") {
              newFilters[view].searchQuery = value;
            }
            return { viewFilters: newFilters };
          });
        },

        setViewSorting: (
          view: "inbox" | "today" | "upcoming",
          field: string,
          direction: "asc" | "desc",
        ) => {
          set((state) => {
            const newSorting = { ...state.viewSorting };
            newSorting[view] = { field, direction };
            return { viewSorting: newSorting };
          });
        },

        setViewGrouping: (
          view: "inbox" | "today" | "upcoming",
          grouping: string,
        ) => {
          set((state) => {
            const newGrouping = { ...state.viewGrouping };
            newGrouping[view] = grouping;
            return { viewGrouping: newGrouping };
          });
        },

        setViewPagination: (
          view: "inbox" | "today" | "upcoming",
          page: number,
          pageSize: number,
        ) => {
          set((state) => {
            const newPagination = { ...state.viewPagination };
            newPagination[view] = { page, pageSize };
            return { viewPagination: newPagination };
          });
        },

        resetViewFilters: (view: "inbox" | "today" | "upcoming") => {
          set((state) => {
            const newFilters = { ...state.viewFilters };
            newFilters[view] = {
              status: "all",
              priority: "all",
              searchQuery: "",
              ...(view === "upcoming" && { timeRange: "all" }),
            };
            return { viewFilters: newFilters };
          });
        },

        // View layout configuration methods
        setListViewConfig: (config: { sortBy: string; groupBy: string }) => {
          set({ listViewConfig: config });
        },

        setBoardViewConfig: (config: {
          columns: string[];
          showTaskCount: boolean;
        }) => {
          set({ boardViewConfig: config });
        },

        setCalendarViewConfig: (config: {
          viewMode: string;
          showWeekends: boolean;
        }) => {
          set({ calendarViewConfig: config });
        },
      }),
      {
        name: "todone-ui-storage",
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
