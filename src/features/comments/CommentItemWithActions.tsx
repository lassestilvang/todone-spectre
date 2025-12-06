import React, { useState } from "react";
import { Comment } from "../../types/common";
import CommentDisplay from "./CommentDisplay";
import CommentManagement from "./CommentManagement";
import CommentEditor from "./CommentEditor";
import { useCommentForm } from "../../hooks/useCommentForm";

interface CommentItemWithActionsProps {
  comment: Comment;
  onEdit: (commentId: string, content: string) => Promise<void>;
  onDelete: (commentId: string) => void;
  onReply: (comment: Comment) => void;
  onLike: (commentId: string) => void;
  onDislike: (commentId: string) => void;
  currentUserId?: string;
}

const CommentItemWithActions: React.FC<CommentItemWithActionsProps> = ({
  comment,
  onEdit,
  onDelete,
  onReply,
  onLike,
  onDislike,
  currentUserId,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [likes, setLikes] = useState(comment.likes || 0);
  const [dislikes, setDislikes] = useState(comment.dislikes || 0);
  const [userLiked, setUserLiked] = useState(false);
  const [userDisliked, setUserDisliked] = useState(false);

  const { validateComment } = useCommentForm();

  const handleEdit = async (content: string) => {
    if (validateComment(content)) {
      await onEdit(comment.id, content);
      setIsEditing(false);
    }
  };

  const handleLike = () => {
    if (userLiked) {
      setLikes(likes - 1);
      setUserLiked(false);
      onLike(comment.id);
    } else {
      setLikes(likes + 1);
      setUserLiked(true);
      if (userDisliked) {
        setDislikes(dislikes - 1);
        setUserDisliked(false);
      }
      onLike(comment.id);
    }
  };

  const handleDislike = () => {
    if (userDisliked) {
      setDislikes(dislikes - 1);
      setUserDisliked(false);
      onDislike(comment.id);
    } else {
      setDislikes(dislikes + 1);
      setUserDisliked(true);
      if (userLiked) {
        setLikes(likes - 1);
        setUserLiked(false);
      }
      onDislike(comment.id);
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm mb-4">
      {isEditing ? (
        <CommentEditor
          comment={comment}
          onSave={handleEdit}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <>
          <CommentDisplay comment={comment} />

          <CommentManagement
            comment={comment}
            onEdit={() => setIsEditing(true)}
            onDelete={() => onDelete(comment.id)}
            onReply={() => onReply(comment)}
            onLike={handleLike}
            onDislike={handleDislike}
            likes={likes}
            dislikes={dislikes}
            userLiked={userLiked}
            userDisliked={userDisliked}
          />
        </>
      )}
    </div>
  );
};

export { CommentItemWithActions };
export default CommentItemWithActions;
