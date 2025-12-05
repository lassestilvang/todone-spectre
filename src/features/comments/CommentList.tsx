import React from "react";
import CommentItem from "./CommentItem";
import { Comment } from "../../types/models";

interface CommentListProps {
  comments: Comment[];
  onEdit: (comment: Comment) => void;
  onDelete: (commentId: string) => void;
  onReply: (comment: Comment) => void;
}

const CommentList: React.FC<CommentListProps> = ({
  comments,
  onEdit,
  onDelete,
  onReply,
}) => {
  if (!comments || comments.length === 0) {
    return <div className="text-gray-500 text-sm py-4">No comments yet</div>;
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onEdit={onEdit}
          onDelete={onDelete}
          onReply={onReply}
        />
      ))}
    </div>
  );
};

export default CommentList;
