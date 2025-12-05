import { useState, useEffect, useCallback } from "react";
import { commentService } from "../services/commentService";
import { Comment } from "../types/common";

/**
 * Custom hook for managing comments
 */
export const useComments = (taskId: string) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  /**
   * Fetch comments for a task
   */
  const fetchComments = useCallback(async () => {
    if (!taskId) return;

    try {
      setLoading(true);
      setError(null);
      const fetchedComments = await commentService.getCommentsByTask(taskId);
      setComments(fetchedComments);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch comments");
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  /**
   * Create a new comment
   */
  const createComment = useCallback(
    async (content: string): Promise<Comment> => {
      if (!taskId) {
        throw new Error("Task ID is required");
      }

      try {
        setError(null);
        const userId = localStorage.getItem("userId") || "anonymous";
        const newComment = await commentService.createComment(
          taskId,
          userId,
          content,
        );

        // Optimistic update
        setComments((prev) => [newComment, ...prev]);
        return newComment;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create comment",
        );
        throw err;
      }
    },
    [taskId],
  );

  /**
   * Update a comment
   */
  const updateComment = useCallback(
    async (commentId: string, content: string): Promise<Comment> => {
      try {
        setError(null);
        const updatedComment = await commentService.updateComment(
          commentId,
          content,
        );

        // Optimistic update
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId ? { ...comment, content } : comment,
          ),
        );

        return updatedComment;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update comment",
        );
        throw err;
      }
    },
    [],
  );

  /**
   * Delete a comment
   */
  const deleteComment = useCallback(
    async (commentId: string): Promise<void> => {
      try {
        setError(null);
        await commentService.deleteComment(commentId);

        // Optimistic update
        setComments((prev) =>
          prev.filter((comment) => comment.id !== commentId),
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete comment",
        );
        throw err;
      }
    },
    [],
  );

  /**
   * Like a comment
   */
  const likeComment = useCallback(
    async (commentId: string): Promise<Comment> => {
      try {
        setError(null);
        const updatedComment = await commentService.likeComment(commentId);

        // Optimistic update
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId ? updatedComment : comment,
          ),
        );

        return updatedComment;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to like comment");
        throw err;
      }
    },
    [],
  );

  /**
   * Unlike a comment
   */
  const unlikeComment = useCallback(
    async (commentId: string): Promise<Comment> => {
      try {
        setError(null);
        const updatedComment = await commentService.unlikeComment(commentId);

        // Optimistic update
        setComments((prev) =>
          prev.map((comment) =>
            comment.id === commentId ? updatedComment : comment,
          ),
        );

        return updatedComment;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to unlike comment",
        );
        throw err;
      }
    },
    [],
  );

  /**
   * Refresh comments
   */
  const refreshComments = useCallback(async () => {
    try {
      setRefreshing(true);
      await fetchComments();
    } finally {
      setRefreshing(false);
    }
  }, [fetchComments]);

  /**
   * Filter comments by user
   */
  const filterCommentsByUser = useCallback(
    (userId: string): Comment[] => {
      return comments.filter((comment) => comment.user === userId);
    },
    [comments],
  );

  /**
   * Sort comments by timestamp
   */
  const sortComments = useCallback(
    (direction: "asc" | "desc" = "desc"): Comment[] => {
      return [...comments].sort((a, b) => {
        const dateA = new Date(a.timestamp).getTime();
        const dateB = new Date(b.timestamp).getTime();
        return direction === "desc" ? dateB - dateA : dateA - dateB;
      });
    },
    [comments],
  );

  /**
   * Get comment statistics
   */
  const getCommentStats = useCallback((): {
    total: number;
    byUser: Record<string, number>;
    recent: Comment[];
  } => {
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
  }, [comments]);

  // Initial fetch
  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return {
    comments,
    loading,
    error,
    refreshing,
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
    likeComment,
    unlikeComment,
    refreshComments,
    filterCommentsByUser,
    sortComments,
    getCommentStats,
  };
};
