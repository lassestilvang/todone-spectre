// @ts-nocheck
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { devtools } from "zustand/middleware";
import { ProjectState, Project } from "../types/store";

export const useProjectStore = create<ProjectState>()(
  devtools(
    persist(
      (set, get) => ({
        projects: [],
        currentProjectId: null,

        // CRUD Operations
        addProject: (
          projectData: Omit<
            Project,
            "id" | "createdAt" | "updatedAt" | "taskIds"
          >,
        ) => {
          const newProject: Project = {
            ...projectData,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date(),
            updatedAt: new Date(),
            taskIds: [],
          };
          set((state) => ({
            projects: [...state.projects, newProject],
          }));
        },

        updateProject: (
          id: string,
          updates: Partial<Omit<Project, "id" | "createdAt">>,
        ) => {
          set((state) => ({
            projects: state.projects.map((project) =>
              project.id === id
                ? {
                    ...project,
                    ...updates,
                    updatedAt: new Date(),
                  }
                : project,
            ),
          }));
        },

        deleteProject: (id: string) => {
          set((state) => ({
            projects: state.projects.filter((project) => project.id !== id),
            currentProjectId:
              state.currentProjectId === id ? null : state.currentProjectId,
          }));
        },

        setCurrentProject: (projectId: string | null) => {
          set({ currentProjectId: projectId });
        },

        // Project organization functions
        addTaskToProject: (projectId: string, taskId: string) => {
          set((state) => ({
            projects: state.projects.map((project) =>
              project.id === projectId
                ? {
                    ...project,
                    taskIds: [...project.taskIds, taskId],
                    updatedAt: new Date(),
                  }
                : project,
            ),
          }));
        },

        removeTaskFromProject: (projectId: string, taskId: string) => {
          set((state) => ({
            projects: state.projects.map((project) =>
              project.id === projectId
                ? {
                    ...project,
                    taskIds: project.taskIds.filter((id) => id !== taskId),
                    updatedAt: new Date(),
                  }
                : project,
            ),
          }));
        },

        getProjectTasks: (projectId: string) => {
          const project = get().projects.find((p) => p.id === projectId);
          return project ? project.taskIds : [];
        },

        // Initialize with some sample projects
        initializeSampleProjects: () => {
          const sampleProjects: Project[] = [
            {
              id: "proj-1",
              name: "Website Redesign",
              description: "Complete redesign of company website",
              color: "#4F46E5",
              createdAt: new Date(),
              updatedAt: new Date(),
              taskIds: [],
            },
            {
              id: "proj-2",
              name: "Mobile App Development",
              description: "Develop native mobile application",
              color: "#10B981",
              createdAt: new Date(),
              updatedAt: new Date(),
              taskIds: [],
            },
            {
              id: "proj-3",
              name: "API Integration",
              description: "Integrate third-party APIs",
              color: "#F59E0B",
              createdAt: new Date(),
              updatedAt: new Date(),
              taskIds: [],
            },
          ];

          set({ projects: sampleProjects });
        },
      }),
      {
        name: "todone-projects-storage",
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
