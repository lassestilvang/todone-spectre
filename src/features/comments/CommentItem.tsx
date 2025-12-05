import React, { useState } from "react";
import { Comment } from "../../types/models";
import { formatDistanceToNow } from "date-fns";
import { Button } from "../../components/ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Edit2,
  Trash2,
  Reply,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";

interface CommentItemProps {
  comment: Comment;
  onEdit: (comment: Comment) => void;
  onDelete: (commentId: string) => void;
  onReply: (comment: Comment) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  onEdit,
  onDelete,
  onReply,
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState("");
  const [likes, setLikes] = useState(comment.likes || 0);
  const [dislikes, setDislikes] = useState(comment.dislikes || 0);
  const [userLiked, setUserLiked] = useState(false);
  const [userDisliked, setUserDisliked] = useState(false);

  const handleLike = () => {
    if (userLiked) {
      setLikes(likes - 1);
      setUserLiked(false);
    } else {
      setLikes(likes + 1);
      setUserLiked(true);
      if (userDisliked) {
        setDislikes(dislikes - 1);
        setUserDisliked(false);
      }
    }
  };

  const handleDislike = () => {
    if (userDisliked) {
      setDislikes(dislikes - 1);
      setUserDisliked(false);
    } else {
      setDislikes(dislikes + 1);
      setUserDisliked(true);
      if (userLiked) {
        setLikes(likes - 1);
        setUserLiked(false);
      }
    }
  };

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (replyContent.trim()) {
      // In a real implementation, this would call an API to create the reply
      console.log("Reply submitted:", replyContent);
      setShowReplyForm(false);
      setReplyContent("");
    }
  };

  return (
    <div className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex items-start space-x-3">
        <Avatar className="w-8 h-8">
          <AvatarImage
            src={comment.user?.avatar || ""}
            alt={comment.user?.name || "User"}
          />
          <AvatarFallback>
            {comment.user?.name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-sm">
              {comment.user?.name || "Anonymous"}
            </span>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(comment.createdAt), {
                addSuffix: true,
              })}
            </span>
          </div>

          <div className="prose prose-sm max-w-none mb-3">
            <p>{comment.content}</p>
          </div>

          <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 hover:text-blue-600 ${userLiked ? "text-blue-600" : ""}`}
            >
              <ThumbsUp className="w-3 h-3" />
              <span>{likes}</span>
            </button>
            <button
              onClick={handleDislike}
              className={`flex items-center space-x-1 hover:text-red-600 ${userDisliked ? "text-red-600" : ""}`}
            >
              <ThumbsDown className="w-3 h-3" />
              <span>{dislikes}</span>
            </button>
            <button
              onClick={() => setShowReplyForm(!showReplyForm)}
              className="flex items-center space-x-1 hover:text-gray-700"
            >
              <Reply className="w-3 h-3" />
              <span>Reply</span>
            </button>
          </div>

          {showReplyForm && (
            <div className="mt-3 border-l-2 border-gray-200 pl-4">
              <form onSubmit={handleReplySubmit} className="space-y-2">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="Write a reply..."
                  className="w-full p-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                />
                <div className="flex space-x-2">
                  <Button type="submit" size="sm" variant="primary">
                    Post Reply
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => setShowReplyForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          <div className="flex items-center space-x-2 mt-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(comment)}>
                  <Edit2 className="mr-2 h-3 w-3" />
                  <span>Edit</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onDelete(comment.id)}>
                  <Trash2 className="mr-2 h-3 w-3" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
