import React, { useState } from 'react';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
import { Comment } from '../../types/models';
import { Button } from '../../components/ui/button';
import { useComments } from '../../hooks/useComments';

interface CommentSectionProps {
  taskId: string;
}

const CommentSection: React.FC<CommentSectionProps> = ({ taskId }) => {
  const { comments, loading, error, createComment, updateComment, deleteComment } = useComments(taskId);
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);

  const handleCreateComment = async (content: string) => {
    await createComment(taskId, content);
    setShowCommentForm(false);
  };

  const handleEditComment = async (content: string) => {
    if (editingComment) {
      await updateComment(editingComment.id, content);
      setEditingComment(null);
    }
  };

  const handleEditClick = (comment: Comment) => {
    setEditingComment(comment);
    setShowCommentForm(true);
  };

  const handleDeleteComment = async (commentId: string) => {
    await deleteComment(commentId);
  };

  const handleReply = (comment: Comment) => {
    // In a real implementation, this would handle replies
    console.log('Reply to comment:', comment.id);
  };

  if (loading) {
    return <div className="text-center py-4">Loading comments...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-600">Error loading comments</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Comments</h3>
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
        <CommentForm
          taskId={taskId}
          onSubmit={editingComment ? handleEditComment : handleCreateComment}
          onCancel={() => {
            setShowCommentForm(false);
            setEditingComment(null);
          }}
          initialContent={editingComment?.content || ''}
        />
      )}

      <CommentList
        comments={comments}
        onEdit={handleEditClick}
        onDelete={handleDeleteComment}
        onReply={handleReply}
      />
    </div>
  );
};

export default CommentSection;