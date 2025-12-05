import { useState, useCallback } from "react";
import { commentService } from "../services/commentService";

/**
 * Custom hook for managing comment form state and validation
 */
export const useCommentForm = () => {
  const [content, setContent] = useState<string>("");
  const [errors, setErrors] = useState<{ content?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /**
   * Validate comment content
   */
  const validateComment = useCallback((commentContent: string): boolean => {
    const newErrors: { content?: string } = {};

    if (!commentContent || commentContent.trim() === "") {
      newErrors.content = "Comment cannot be empty";
    } else if (commentContent.length > 500) {
      newErrors.content = "Comment cannot exceed 500 characters";
    } else if (commentContent.length < 1) {
      newErrors.content = "Comment must be at least 1 character";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, []);

  /**
   * Handle content change
   */
  const handleContentChange = useCallback(
    (value: string) => {
      setContent(value);
      // Clear errors when user starts typing
      if (errors.content && value.trim() !== "") {
        setErrors({});
      }
    },
    [errors.content],
  );

  /**
   * Reset form
   */
  const resetForm = useCallback(() => {
    setContent("");
    setErrors({});
    setSubmitError(null);
    setIsSubmitting(false);
  }, []);

  /**
   * Submit comment
   */
  const submitComment = useCallback(
    async (
      taskId: string,
      userId: string,
      onSuccess?: (comment: any) => void,
      onError?: (error: string) => void,
    ): Promise<boolean> => {
      if (!validateComment(content)) {
        return false;
      }

      try {
        setIsSubmitting(true);
        setSubmitError(null);

        const newComment = await commentService.createComment(
          taskId,
          userId,
          content,
        );

        if (onSuccess) {
          onSuccess(newComment);
        }

        resetForm();
        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to submit comment";
        setSubmitError(errorMessage);
        if (onError) {
          onError(errorMessage);
        }
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [content, validateComment, resetForm],
  );

  /**
   * Update comment
   */
  const updateComment = useCallback(
    async (
      commentId: string,
      newContent: string,
      onSuccess?: (comment: any) => void,
      onError?: (error: string) => void,
    ): Promise<boolean> => {
      if (!validateComment(newContent)) {
        return false;
      }

      try {
        setIsSubmitting(true);
        setSubmitError(null);

        const updatedComment = await commentService.updateComment(
          commentId,
          newContent,
        );

        if (onSuccess) {
          onSuccess(updatedComment);
        }

        return true;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to update comment";
        setSubmitError(errorMessage);
        if (onError) {
          onError(errorMessage);
        }
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [validateComment],
  );

  /**
   * Check if comment content is valid
   */
  const isValid = useCallback((): boolean => {
    return validateComment(content);
  }, [content, validateComment]);

  return {
    content,
    setContent: handleContentChange,
    errors,
    isSubmitting,
    submitError,
    validateComment,
    submitComment,
    updateComment,
    resetForm,
    isValid,
  };
};
