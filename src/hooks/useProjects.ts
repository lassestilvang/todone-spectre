import { useState, useEffect, useCallback } from "react";
import { Project } from "../types/project";
import { projectApi } from "../api/projectApi";
import { ApiResponse } from "../types/api";

/**
 * Custom hook for managing project state and operations
 */
export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all projects
   */
  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response: ApiResponse<Project[]> = await projectApi.getProjects();

      if (response.success && response.data) {
        setProjects(response.data);
      } else {
        setError(response.message || "Failed to fetch projects");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Create a new project
   */
  const createProject = useCallback(
    async (projectData: Omit<Project, "id">): Promise<Project> => {
      try {
        setLoading(true);
        setError(null);

        const response: ApiResponse<Project> =
          await projectApi.createProject(projectData);

        if (response.success && response.data) {
          setProjects((prev) => [...prev, response.data]);
          return response.data;
        } else {
          throw new Error(response.message || "Failed to create project");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create project",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Update a project
   */
  const updateProject = useCallback(
    async (projectId: string, updates: Partial<Project>): Promise<Project> => {
      try {
        setLoading(true);
        setError(null);

        const response: ApiResponse<Project> = await projectApi.updateProject(
          projectId,
          updates,
        );

        if (response.success && response.data) {
          setProjects((prev) =>
            prev.map((project) =>
              project.id === projectId ? response.data : project,
            ),
          );
          return response.data;
        } else {
          throw new Error(response.message || "Failed to update project");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update project",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Delete a project
   */
  const deleteProject = useCallback(
    async (projectId: string): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const response: ApiResponse<void> =
          await projectApi.deleteProject(projectId);

        if (response.success) {
          setProjects((prev) =>
            prev.filter((project) => project.id !== projectId),
          );
        } else {
          throw new Error(response.message || "Failed to delete project");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete project",
        );
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Get project by ID
   */
  const getProjectById = useCallback(
    (projectId: string): Project | undefined => {
      return projects.find((project) => project.id === projectId);
    },
    [projects],
  );

  /**
   * Get projects by team ID
   */
  const getProjectsByTeam = useCallback(
    (teamId: string): Project[] => {
      return projects.filter((project) => project.teamId === teamId);
    },
    [projects],
  );

  // Initial fetch
  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    loading,
    error,
    fetchProjects,
    createProject,
    updateProject,
    deleteProject,
    getProjectById,
    getProjectsByTeam,
  };
};
