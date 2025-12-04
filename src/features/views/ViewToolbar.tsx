import React from 'react';
import CommentNotificationIntegration from '../comments/CommentNotificationIntegration';

interface ViewToolbarProps {
  leftActions?: React.ReactNode;
  rightActions?: React.ReactNode;
  children?: React.ReactNode;
  showCommentNotifications?: boolean;
}

export const ViewToolbar: React.FC<ViewToolbarProps> = ({
  leftActions,
  rightActions,
  children,
  showCommentNotifications = true
}) => {
  return (
    <div className="flex items-center justify-between mb-4 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
      <div className="flex items-center space-x-2">
        {leftActions}
      </div>
      <div className="flex items-center space-x-2">
        {showCommentNotifications && <CommentNotificationIntegration />}
        {rightActions}
      </div>
      {children}
    </div>
  );
};