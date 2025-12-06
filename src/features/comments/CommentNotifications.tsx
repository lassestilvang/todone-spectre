import React, { useState, useEffect } from "react";
import { Comment } from "../../types/common";
import { Bell, MessageSquare, AlertCircle } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";

interface CommentNotification {
  id: string;
  commentId: string;
  type: "mention" | "reply" | "like" | "dislike";
  userId: string;
  read: boolean;
  createdAt: Date;
  comment?: Comment;
}

interface CommentNotificationsProps {
  notifications: CommentNotification[];
  onMarkAsRead: (notificationId: string) => void;
  onViewComment: (commentId: string) => void;
  onDismiss: (notificationId: string) => void;
}

const CommentNotifications: React.FC<CommentNotificationsProps> = ({
  notifications,
  onMarkAsRead,
  onViewComment,
  onDismiss,
}) => {
  const [expanded, setExpanded] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNotificationClick = (notification: CommentNotification) => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    onViewComment(notification.commentId);
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        className="relative"
        onClick={() => setExpanded(!expanded)}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs">
            {unreadCount}
          </Badge>
        )}
      </Button>

      {expanded && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-50">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-medium text-sm">Comment Notifications</h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <AlertCircle className="mx-auto w-8 h-8 mb-2" />
                <p>No notifications</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className={`p-3 hover:bg-gray-50 cursor-pointer ${!notification.read ? "bg-blue-50" : ""}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        {notification.type === "mention" && (
                          <MessageSquare className="w-5 h-5 text-blue-500" />
                        )}
                        {notification.type === "reply" && (
                          <MessageSquare className="w-5 h-5 text-green-500" />
                        )}
                        {notification.type === "like" && (
                          <Bell className="w-5 h-5 text-yellow-500" />
                        )}
                        {notification.type === "dislike" && (
                          <Bell className="w-5 h-5 text-red-500" />
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">
                            {getNotificationMessage(notification)}
                          </span>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full" />
                          )}
                        </div>

                        {notification.comment && (
                          <p className="text-xs text-gray-500 mt-1 truncate">
                            {notification.comment.content.substring(0, 50)}
                            {notification.comment.content.length > 50
                              ? "..."
                              : ""}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDismiss(notification.id);
                        }}
                        className="text-gray-400 hover:text-gray-600"
                        title="Dismiss"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="p-2 border-t border-gray-100">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center"
              onClick={() => {
                notifications.forEach((n) => !n.read && onMarkAsRead(n.id));
                setExpanded(false);
              }}
            >
              Mark all as read
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

function getNotificationMessage(notification: CommentNotification): string {
  switch (notification.type) {
    case "mention":
      return "Someone mentioned you in a comment";
    case "reply":
      return "Someone replied to your comment";
    case "like":
      return "Someone liked your comment";
    case "dislike":
      return "Someone disliked your comment";
    default:
      return "New comment activity";
  }
}

export { CommentNotifications };
export default CommentNotifications;
