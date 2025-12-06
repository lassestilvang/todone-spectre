// @ts-nocheck
import { Comment } from "../types/common";
import { ApiResponse } from "../types/api";
import { API_BASE_URL } from "../config/app.config";

/**
 * Comment API Service - Handles all API communication for comment CRUD operations
 */
export class CommentApi {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}/comments`;
  }

  /**
   * Transform comment data for API requests
   */
  private transformRequest(commentData: Partial<Comment>): any {
    const { id, timestamp, ...rest } = commentData;

    return {
      ...rest,
      timestamp: commentData.timestamp?.toISOString(),
    };
  }

  /**
   * Transform API response to Comment object
   */
  private transformResponse(responseData: any): Comment {
    return {
      ...responseData,
      id: responseData.id,
      taskId: responseData.taskId,
      user: responseData.user,
      content: responseData.content,
      attachments: responseData.attachments || [],
      timestamp: new Date(responseData.timestamp),
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
   * Create a new comment
   */
  async createComment(
    commentData: Omit<Comment, "id">,
  ): Promise<ApiResponse<Comment>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(this.transformRequest(commentData)),
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
          error instanceof Error ? error.message : "Failed to create comment",
        data: null,
      };
    }
  }

  /**
   * Get comments by task ID
   */
  async getCommentsByTask(taskId: string): Promise<ApiResponse<Comment[]>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}?taskId=${taskId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
      });

      if (response.success && response.data) {
        return {
          ...response,
          data: response.data.map((comment: any) =>
            this.transformResponse(comment),
          ),
        };
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to fetch comments",
        data: null,
      };
    }
  }

  /**
   * Get a single comment by ID
   */
  async getComment(commentId: string): Promise<ApiResponse<Comment>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}/${commentId}`, {
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
          error instanceof Error ? error.message : "Failed to fetch comment",
        data: null,
      };
    }
  }

  /**
   * Update a comment
   */
  async updateComment(
    commentId: string,
    commentData: Partial<Comment>,
  ): Promise<ApiResponse<Comment>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}/${commentId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(this.transformRequest(commentData)),
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
          error instanceof Error ? error.message : "Failed to update comment",
        data: null,
      };
    }
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string): Promise<ApiResponse<void>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}/${commentId}`, {
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
          error instanceof Error ? error.message : "Failed to delete comment",
        data: undefined,
      };
    }
  }

  /**
   * Like a comment
   */
  async likeComment(commentId: string): Promise<ApiResponse<Comment>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}/${commentId}/like`, {
          method: "POST",
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
          error instanceof Error ? error.message : "Failed to like comment",
        data: null,
      };
    }
  }

  /**
   * Unlike a comment
   */
  async unlikeComment(commentId: string): Promise<ApiResponse<Comment>> {
    try {
      const response = await this.handleApiRequest<Response>(async () => {
        return await fetch(`${this.baseUrl}/${commentId}/like`, {
          method: "DELETE",
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
          error instanceof Error ? error.message : "Failed to unlike comment",
        data: null,
      };
    }
  }
}

// Singleton instance
export const commentApi = new CommentApi();
