import React, { useState } from "react";
import CommentListWithPagination from "./CommentListWithPagination";
import CommentFormWithValidation from "./CommentFormWithValidation";
import { Comment } from "../../types/common";
import { Button } from "../../components/ui/button";
import { useComments } from "../../hooks/useComments";

interface CommentSectionWithHeaderProps {
  taskId: string;
  title?: string;
  showCommentFormInitially?: boolean;
}

const CommentSectionWithHeader: React.FC<CommentSectionWithHeaderProps> = ({
  taskId,
  title = "Comments",
  showCommentFormInitially = false,
}) => {
  const {
    comments,
    loading,
    error,
    createComment,
    updateComment,
    deleteComment,
  } = useComments(taskId);
  const [showCommentForm, setShowCommentForm] = useState(
    showCommentFormInitially,
  );
  const [editingComment, setEditingComment] = useState<Comment | null>(null);

  const handleCreateComment = async (content: string) => {
    await createComment(content);
    setShowCommentForm(false);
  };

  const handleEditComment = async (commentId: string, content: string) => {
    await updateComment(commentId, content);
    setEditingComment(null);
    setShowCommentForm(false);
  };

  const handleEditClick = (comment: Comment) => {
    setEditingComment(comment);
    setShowCommentForm(true);
  };

  if (loading) {
    return <div className="text-center py-4">Loading comments...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-600">
        Error loading comments
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
        <h3 className="text-lg font-medium">{title}</h3>
        {!showCommentForm && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setShowCommentForm(true);
              setEditingComment(null);
            }}
          >
            Add Comment
          </Button>
        )}
      </div>

      {showCommentForm && (
        <CommentFormWithValidation
          taskId={taskId}
          onSubmit={
            editingComment
              ? (content) => handleEditComment(editingComment.id, content)
              : handleCreateComment
          }
          onCancel={() => {
            setShowCommentForm(false);
            setEditingComment(null);
          }}
          initialContent={editingComment?.content || ""}
          submitButtonText={editingComment ? "Update Comment" : "Post Comment"}
        />
      )}

      <CommentListWithPagination
        comments={comments}
        onEdit={handleEditClick}
        onDelete={deleteComment}
        onReply={(comment) => console.log("Reply to:", comment.id)}
      />
    </div>
  );
};

export default CommentSectionWithHeader;
