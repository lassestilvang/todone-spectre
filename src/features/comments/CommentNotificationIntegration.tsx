import React from 'react';
import { useCommentStore } from '../../store/useCommentStore';
import CommentNotifications from './CommentNotifications';

const CommentNotificationIntegration: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    dismissNotification,
    markAllNotificationsAsRead
  } = useCommentStore();

  const handleViewComment = (commentId: string) => {
    // In a real implementation, this would navigate to the task with the comment
    console.log('Navigate to comment:', commentId);
  };

  return (
    <CommentNotifications
      notifications={notifications}
      onMarkAsRead={markNotificationAsRead}
      onViewComment={handleViewComment}
      onDismiss={dismissNotification}
    />
  );
};

export default CommentNotificationIntegration;