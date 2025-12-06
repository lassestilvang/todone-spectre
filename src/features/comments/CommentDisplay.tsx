import React from "react";
import { Comment } from "../../types/common";
import { CommentUtils } from "../../utils/commentUtils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface CommentDisplayProps {
  comment: Comment;
  showUserInfo?: boolean;
  showTimestamp?: boolean;
  compact?: boolean;
}

const CommentDisplay: React.FC<CommentDisplayProps> = ({
  comment,
  showUserInfo = true,
  showTimestamp = true,
  compact = false,
}) => {
  const formattedContent = CommentUtils.formatCommentContent(comment.content);
  const timestamp = CommentUtils.formatCommentTimestamp(comment.timestamp);

  return (
    <div
      className={`comment-display ${compact ? "py-2" : "py-4"} border-b border-gray-100`}
    >
      <div className="flex items-start space-x-3">
        {showUserInfo && (
          <Avatar className="w-8 h-8">
            <AvatarImage
              src={comment.user?.avatar || ""}
              alt={comment.user?.name || "User"}
            />
            <AvatarFallback>
              {comment.user?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
        )}

        <div className="flex-1">
          {showUserInfo && (
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-medium text-sm">
                {comment.user?.name || "Anonymous"}
              </span>
              {showTimestamp && (
                <span className="text-xs text-gray-500">{timestamp}</span>
              )}
            </div>
          )}

          <div
            className={`prose prose-sm max-w-none ${compact ? "text-sm" : ""}`}
            dangerouslySetInnerHTML={{ __html: formattedContent }}
          />
        </div>
      </div>
    </div>
  );
};

export { CommentDisplay };
export default CommentDisplay;
