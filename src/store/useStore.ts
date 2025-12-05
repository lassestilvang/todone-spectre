import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { devtools } from "zustand/middleware";
import { AppState } from "../types/store";

export const useStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        auth: {
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
          token: null,
        },
        tasks: {
          tasks: [],
          filteredTasks: [],
          currentFilter: {},
          sortBy: "createdAt",
          sortDirection: "desc",
        },
        projects: {
          projects: [],
          currentProjectId: null,
        },
        ui: {
          isSidebarOpen: true,
          theme: "system",
          currentView: "dashboard",
          isTaskModalOpen: false,
          isProjectModalOpen: false,
          isSettingsModalOpen: false,
        },
        comments: {
          comments: [],
          filteredComments: [],
          currentFilter: {},
          sortBy: "timestamp",
          sortDirection: "desc",
          commentError: null,
          selectedCommentIds: [],
          notifications: [],
        },
      }),
      {
        name: "todone-storage",
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          auth: {
            user: state.auth.user,
            token: state.auth.token,
          },
          ui: {
            theme: state.ui.theme,
            isSidebarOpen: state.ui.isSidebarOpen,
          },
          comments: {
            comments: state.comments.comments,
            notifications: state.comments.notifications,
          },
        }),
      },
    ),
  ),
);
