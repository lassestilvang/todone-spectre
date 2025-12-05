import { Project } from "../types/project";
import { ApiResponse } from "../types/api";
import { API_BASE_URL } from "../config/app.config";

/**
 * Project API Service - Handles all API communication for project CRUD operations
 */
export class ProjectApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/projects`;
  }

  /**
   * Transform project data for API requests
   */
  private transformRequest(projectData: Partial<Project>): any {
    const { id, createdAt, updatedAt, ...rest } = projectData;

    return {
      ...rest,
      createdAt: projectData.createdAt?.toISOString(),
      updatedAt: projectData.updatedAt?.toISOString(),
    };
  }

  /**
   * Transform API response to Project object
   */
  private transformResponse(responseData: any): Project {
    return {
      ...responseData,
      id: responseData.id,
      name: responseData.name,
      description: responseData.description || "",
      color: responseData.color || "#3b82f6",
      viewType: responseData.viewType || "list",
      favorite: responseData.favorite || false,
      shared: responseData.shared || false,
      createdAt: new Date(responseData.createdAt),
      updatedAt: new Date(responseData.updatedAt),
      parentProjectId: responseData.parentProjectId || null,
      childProjectIds: responseData.childProjectIds || [],
      sectionIds: responseData.sectionIds || [],
      taskIds: responseData.taskIds || [],
      labelIds: responseData.labelIds || [],
      memberIds: responseData.memberIds || [],
      ownerId: responseData.ownerId || null,
      status: responseData.status || "active",
      visibility: responseData.visibility || "private",
      settings: responseData.settings || {
        allowComments: true,
        allowAttachments: true,
        taskCreationRestricted: false,
        maxTaskSize: 100,
      },
      customFields: responseData.customFields || {},
      metadata: responseData.metadata || {},
    };
  }

  /**
   * Handle API errors with retry logic
   */
  private async handleApiRequest<T>(
    requestFn: () => Promise<Response>,
  ): Promise<ApiResponse<T>> {
    const MAX_RETRIES = 3;
    let retryCount = 0;

    while (retryCount < MAX_RETRIES) {
      try {
        const response = await requestFn();

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          return {
            success: false,
            message:
              errorData.message || `HTTP error! status: ${response.status}`,
            data: null,
          };
        }

        const data = await response.json();
        return {
          success: true,
          message: "Success",
          data: data,
        };
      } catch (error) {
        retryCount++;
        if (retryCount >= MAX_RETRIES) {
          return {
            success: false,
            message: error instanceof Error ? error.message : "Unknown error",
            data: null,
          };
        }
        // Exponential backoff
        await new Promise((resolve) => setTimeout(resolve, 1000 * retryCount));
      }
    }

    return {
      success: false,
      message: "Max retries exceeded",
      data: null,
    };
  }

  /**
   * Create a new project
   */
  async createProject(
    projectData: Omit<Project, "id">,
  ): Promise<ApiResponse<Project>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(this.transformRequest(projectData)),
        });
      });

      if (response.success && response.data) {
        return {
          ...response,
          data: this.transformResponse(response.data),
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to create project",
        data: null,
      };
    }
  }

  /**
   * Get a single project by ID
   */
  async getProject(projectId: string): Promise<ApiResponse<Project>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}/${projectId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      });

      if (response.success && response.data) {
        return {
          ...response,
          data: this.transformResponse(response.data),
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch project",
        data: null,
      };
    }
  }

  /**
   * Get all projects
   */
  async getProjects(): Promise<ApiResponse<Project[]>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      });

      if (response.success && response.data) {
        return {
          ...response,
          data: response.data.map((project: any) =>
            this.transformResponse(project),
          ),
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch projects",
        data: null,
      };
    }
  }

  /**
   * Update a project
   */
  async updateProject(
    projectId: string,
    projectData: Partial<Project>,
  ): Promise<ApiResponse<Project>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}/${projectId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(this.transformRequest(projectData)),
        });
      });

      if (response.success && response.data) {
        return {
          ...response,
          data: this.transformResponse(response.data),
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to update project",
        data: null,
      };
    }
  }

  /**
   * Delete a project
   */
  async deleteProject(projectId: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}/${projectId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      });

      return {
        success: response.success,
        message: response.message,
        data: undefined,
      };
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to delete project",
        data: undefined,
      };
    }
  }
}

// Singleton instance
export const projectApi = new ProjectApi();
