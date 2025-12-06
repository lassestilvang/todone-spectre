import React from "react";
import { useCommentForm } from "../../hooks/useCommentForm";
import { Button } from "../../components/ui/button";
import { Textarea } from "../../components/ui/textarea";

interface CommentFormWithValidationProps {
  taskId: string;
  onSubmit: (content: string) => Promise<void>;
  onCancel?: () => void;
  initialContent?: string;
  submitButtonText?: string;
}

const CommentFormWithValidation: React.FC<CommentFormWithValidationProps> = ({
  taskId,
  onSubmit,
  onCancel,
  initialContent = "",
  submitButtonText = "Post Comment",
}) => {
  const {
    content,
    setContent,
    errors,
    isSubmitting,
    submitError,
    validateComment,
    submitComment,
  } = useCommentForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateComment(content)) {
      const userId = localStorage.getItem("userId") || "anonymous";
      await submitComment(taskId, userId, onSubmit);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <Textarea
          id="comment-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your comment..."
          className="min-h-[100px] w-full"
          required
        />
        {errors.content && (
          <p className="text-sm text-red-600">{errors.content}</p>
        )}
        {submitError && <p className="text-sm text-red-600">{submitError}</p>}
      </div>

      <div className="flex items-center space-x-2">
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting || !validateComment(content)}
        >
          {isSubmitting ? "Posting..." : submitButtonText}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

export { CommentFormWithValidation };
export default CommentFormWithValidation;
