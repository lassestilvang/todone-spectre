import { Comment } from "../types/common";
import { commentApi } from "../api/commentApi";
import { CommentModel } from "../types/models";

/**
 * Comment Service - Business logic layer for comment operations
 */
export class CommentService {
  /**
   * Create a new comment
   */
  async createComment(
    taskId: string,
    userId: string,
    content: string,
  ): Promise<Comment> {
    const commentData = {
      taskId,
      user: userId,
      content,
      timestamp: new Date(),
    };

    const response = await commentApi.createComment(commentData);

    if (!response.success) {
      throw new Error(response.message || "Failed to create comment");
    }

    return response.data;
  }

  /**
   * Get comments by task ID
   */
  async getCommentsByTask(taskId: string): Promise<Comment[]> {
    const response = await commentApi.getCommentsByTask(taskId);

    if (!response.success) {
      throw new Error(response.message || "Failed to fetch comments");
    }

    return response.data;
  }

  /**
   * Get a single comment by ID
   */
  async getComment(commentId: string): Promise<Comment> {
    const response = await commentApi.getComment(commentId);

    if (!response.success) {
      throw new Error(response.message || "Failed to fetch comment");
    }

    return response.data;
  }

  /**
   * Update a comment
   */
  async updateComment(commentId: string, content: string): Promise<Comment> {
    const response = await commentApi.updateComment(commentId, { content });

    if (!response.success) {
      throw new Error(response.message || "Failed to update comment");
    }

    return response.data;
  }

  /**
   * Delete a comment
   */
  async deleteComment(commentId: string): Promise<void> {
    const response = await commentApi.deleteComment(commentId);

    if (!response.success) {
      throw new Error(response.message || "Failed to delete comment");
    }
  }

  /**
   * Like a comment
   */
  async likeComment(commentId: string): Promise<Comment> {
    const response = await commentApi.likeComment(commentId);

    if (!response.success) {
      throw new Error(response.message || "Failed to like comment");
    }

    return response.data;
  }

  /**
   * Unlike a comment
   */
  async unlikeComment(commentId: string): Promise<Comment> {
    const response = await commentApi.unlikeComment(commentId);

    if (!response.success) {
      throw new Error(response.message || "Failed to unlike comment");
    }

    return response.data;
  }

  /**
   * Create comment model from data
   */
  createCommentModel(data: Partial<Comment>): CommentModel {
    return new CommentModel(data);
  }

  /**
   * Validate comment data
   */
  validateComment(comment: Partial<Comment>): boolean {
    return !!comment.taskId && !!comment.user && !!comment.content;
  }

  /**
   * Format comment for display
   */
  formatCommentForDisplay(comment: Comment): string {
    if (!comment.content) return "";

    // Basic markdown formatting
    let formatted = comment.content;

    // Replace newlines with HTML line breaks
    formatted = formatted.replace(/\n/g, "<br>");

    // Simple URL detection
    formatted = formatted.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>',
    );

    return formatted;
  }

  /**
   * Filter comments by user
   */
  filterCommentsByUser(comments: Comment[], userId: string): Comment[] {
    return comments.filter((comment) => comment.user === userId);
  }

  /**
   * Sort comments by timestamp (newest first)
   */
  sortCommentsByTimestamp(comments: Comment[]): Comment[] {
    return [...comments].sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
    );
  }

  /**
   * Get comment statistics
   */
  getCommentStatistics(comments: Comment[]): {
    total: number;
    byUser: Record<string, number>;
    recent: Comment[];
  } {
    const byUser: Record<string, number> = {};
    const recent = [...comments]
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      )
      .slice(0, 5);

    comments.forEach((comment) => {
      byUser[comment.user] = (byUser[comment.user] || 0) + 1;
    });

    return {
      total: comments.length,
      byUser,
      recent,
    };
  }
}

// Singleton instance
export const commentService = new CommentService();
