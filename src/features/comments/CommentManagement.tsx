import React, { useState } from 'react';
import { Comment } from '../../types/common';
import { Button } from '../../components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../../components/ui/dropdown-menu';
import { MoreHorizontal, Edit2, Trash2, Reply, ThumbsUp, ThumbsDown } from 'lucide-react';

interface CommentManagementProps {
  comment: Comment;
  onEdit: () => void;
  onDelete: () => void;
  onReply: () => void;
  onLike: () => void;
  onDislike: () => void;
  likes?: number;
  dislikes?: number;
  userLiked?: boolean;
  userDisliked?: boolean;
}

const CommentManagement: React.FC<CommentManagementProps> = ({
  comment,
  onEdit,
  onDelete,
  onReply,
  onLike,
  onDislike,
  likes = 0,
  dislikes = 0,
  userLiked = false,
  userDisliked = false
}) => {
  return (
    <div className="flex items-center space-x-4 text-xs text-gray-500 mt-2">
      <button
        onClick={onLike}
        className={`flex items-center space-x-1 hover:text-blue-600 ${userLiked ? 'text-blue-600' : ''}`}
        title="Like this comment"
      >
        <ThumbsUp className="w-3 h-3" />
        <span>{likes}</span>
      </button>
      <button
        onClick={onDislike}
        className={`flex items-center space-x-1 hover:text-red-600 ${userDisliked ? 'text-red-600' : ''}`}
        title="Dislike this comment"
      >
        <ThumbsDown className="w-3 h-3" />
        <span>{dislikes}</span>
      </button>
      <button
        onClick={onReply}
        className="flex items-center space-x-1 hover:text-gray-700"
        title="Reply to this comment"
      >
        <Reply className="w-3 h-3" />
        <span>Reply</span>
      </button>

      <div className="flex items-center space-x-2 ml-auto">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Edit2 className="mr-2 h-3 w-3" />
              <span>Edit</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete}>
              <Trash2 className="mr-2 h-3 w-3" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default CommentManagement;