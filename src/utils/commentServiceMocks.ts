import { Comment } from '../types/common';
import { CommentNotification } from '../types/store';
import { CommentTestUtils } from './commentTestUtils';

/**
 * Mock comment service for testing
 */
export class MockCommentService {
  private comments: Comment[];
  private notifications: CommentNotification[];

  constructor() {
    const testData = CommentTestUtils.generateServiceTestData();
    this.comments = testData.comments;
    this.notifications = testData.notifications;
  }

  /**
   * Mock create comment
   */
  async createComment(taskId: string, userId: string, content: string): Promise<Comment> {
    const newComment: Comment = {
      id: `comment_${Math.random().toString(36).substr(2, 9)}`,
      taskId,
      user: userId,
      content,
      timestamp: new Date(),
      likes: 0,
      dislikes: 0
    };

    this.comments.push(newComment);
    return newComment;
  }

  /**
   * Mock get comments by task
   */
  async getCommentsByTask(taskId: string): Promise<Comment[]> {
    return this.comments.filter(comment => comment.taskId === taskId);
  }

  /**
   * Mock get single comment
   */
  async getComment(commentId: string): Promise<Comment> {
    const comment = this.comments.find(c => c.id === commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }
    return comment;
  }

  /**
   * Mock update comment
   */
  async updateComment(commentId: string, content: string): Promise<Comment> {
    const commentIndex = this.comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) {
      throw new Error('Comment not found');
    }

    const updatedComment = {
      ...this.comments[commentIndex],
      content,
      timestamp: new Date()
    };

    this.comments[commentIndex] = updatedComment;
    return updatedComment;
  }

  /**
   * Mock delete comment
   */
  async deleteComment(commentId: string): Promise<void> {
    this.comments = this.comments.filter(c => c.id !== commentId);
  }

  /**
   * Mock like comment
   */
  async likeComment(commentId: string): Promise<Comment> {
    const commentIndex = this.comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) {
      throw new Error('Comment not found');
    }

    const updatedComment = {
      ...this.comments[commentIndex],
      likes: (this.comments[commentIndex].likes || 0) + 1
    };

    this.comments[commentIndex] = updatedComment;
    return updatedComment;
  }

  /**
   * Mock unlike comment
   */
  async unlikeComment(commentId: string): Promise<Comment> {
    const commentIndex = this.comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) {
      throw new Error('Comment not found');
    }

    const updatedComment = {
      ...this.comments[commentIndex],
      likes: Math.max((this.comments[commentIndex].likes || 0) - 1, 0)
    };

    this.comments[commentIndex] = updatedComment;
    return updatedComment;
  }

  /**
   * Mock dislike comment
   */
  async dislikeComment(commentId: string): Promise<Comment> {
    const commentIndex = this.comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) {
      throw new Error('Comment not found');
    }

    const updatedComment = {
      ...this.comments[commentIndex],
      dislikes: (this.comments[commentIndex].dislikes || 0) + 1
    };

    this.comments[commentIndex] = updatedComment;
    return updatedComment;
  }

  /**
   * Mock undislike comment
   */
  async undislikeComment(commentId: string): Promise<Comment> {
    const commentIndex = this.comments.findIndex(c => c.id === commentId);
    if (commentIndex === -1) {
      throw new Error('Comment not found');
    }

    const updatedComment = {
      ...this.comments[commentIndex],
      dislikes: Math.max((this.comments[commentIndex].dislikes || 0) - 1, 0)
    };

    this.comments[commentIndex] = updatedComment;
    return updatedComment;
  }

  /**
   * Mock get notifications
   */
  getNotifications(): CommentNotification[] {
    return this.notifications;
  }

  /**
   * Mock add notification
   */
  addNotification(notification: Omit<CommentNotification, 'id' | 'createdAt'>): CommentNotification {
    const newNotification: CommentNotification = {
      ...notification,
      id: `notification_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      read: false
    };

    this.notifications.push(newNotification);
    return newNotification;
  }

  /**
   * Mock mark notification as read
   */
  markNotificationAsRead(notificationId: string): void {
    this.notifications = this.notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
  }

  /**
   * Mock dismiss notification
   */
  dismissNotification(notificationId: string): void {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
  }

  /**
   * Reset mock data
   */
  reset(): void {
    const testData = CommentTestUtils.generateServiceTestData();
    this.comments = testData.comments;
    this.notifications = testData.notifications;
  }

  /**
   * Get all comments (for testing)
   */
  getAllComments(): Comment[] {
    return this.comments;
  }
}

// Singleton instance for testing
export const mockCommentService = new MockCommentService();