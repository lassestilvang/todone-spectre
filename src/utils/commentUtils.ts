import { Comment } from '../types/common';
import { formatDistanceToNow, format } from 'date-fns';

/**
 * Comment utility functions
 */
export class CommentUtils {
  /**
   * Format comment timestamp for display
   */
  static formatCommentTimestamp(timestamp: Date): string {
    return formatDistanceToNow(timestamp, { addSuffix: true });
  }

  /**
   * Format comment timestamp as full date
   */
  static formatCommentDate(timestamp: Date): string {
    return format(timestamp, 'MMMM d, yyyy h:mm a');
  }

  /**
   * Generate a comment preview (first 100 characters)
   */
  static generateCommentPreview(content: string, maxLength: number = 100): string {
    if (!content) return '';
    return content.length > maxLength
      ? content.substring(0, maxLength) + '...'
      : content;
  }

  /**
   * Extract mentions from comment content
   */
  static extractMentions(content: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const matches = content.match(mentionRegex) || [];
    return matches.map(mention => mention.substring(1));
  }

  /**
   * Extract hashtags from comment content
   */
  static extractHashtags(content: string): string[] {
    const hashtagRegex = /#(\w+)/g;
    const matches = content.match(hashtagRegex) || [];
    return matches.map(hashtag => hashtag.substring(1));
  }

  /**
   * Extract URLs from comment content
   */
  static extractUrls(content: string): string[] {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return content.match(urlRegex) || [];
  }

  /**
   * Format comment content with basic markdown support
   */
  static formatCommentContent(content: string): string {
    if (!content) return '';

    let formatted = content;

    // Replace newlines with HTML line breaks
    formatted = formatted.replace(/\n/g, '<br>');

    // Simple URL detection and linking
    formatted = formatted.replace(
      /(https?:\/\/[^\s]+)/g,
      '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>'
    );

    // Simple mention formatting
    formatted = formatted.replace(
      /@(\w+)/g,
      '<span class="mention">@$1</span>'
    );

    // Simple hashtag formatting
    formatted = formatted.replace(
      /#(\w+)/g,
      '<span class="hashtag">#$1</span>'
    );

    return formatted;
  }

  /**
   * Group comments by date
   */
  static groupCommentsByDate(comments: Comment[]): Record<string, Comment[]> {
    const grouped: Record<string, Comment[]> = {};

    comments.forEach(comment => {
      const date = new Date(comment.timestamp);
      const dateKey = date.toDateString();

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(comment);
    });

    return grouped;
  }

  /**
   * Sort comments by timestamp (newest first by default)
   */
  static sortComments(
    comments: Comment[],
    direction: 'asc' | 'desc' = 'desc'
  ): Comment[] {
    return [...comments].sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return direction === 'desc' ? dateB - dateA : dateA - dateB;
    });
  }

  /**
   * Filter comments by user
   */
  static filterCommentsByUser(comments: Comment[], userId: string): Comment[] {
    return comments.filter(comment => comment.user === userId);
  }

  /**
   * Get comment statistics
   */
  static getCommentStatistics(comments: Comment[]): {
    total: number;
    byUser: Record<string, number>;
    recent: Comment[];
    averageLength: number;
  } {
    if (comments.length === 0) {
      return {
        total: 0,
        byUser: {},
        recent: [],
        averageLength: 0
      };
    }

    const byUser: Record<string, number> = {};
    const recent = [...comments]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);

    const totalLength = comments.reduce((sum, comment) => sum + comment.content.length, 0);

    comments.forEach(comment => {
      byUser[comment.user] = (byUser[comment.user] || 0) + 1;
    });

    return {
      total: comments.length,
      byUser,
      recent,
      averageLength: Math.round(totalLength / comments.length)
    };
  }

  /**
   * Create a comment summary
   */
  static createCommentSummary(comments: Comment[]): string {
    if (comments.length === 0) return 'No comments';

    const stats = this.getCommentStatistics(comments);

    if (comments.length === 1) {
      return '1 comment';
    }

    return `${comments.length} comments from ${Object.keys(stats.byUser).length} users`;
  }

  /**
   * Check if comment contains attachments
   */
  static hasAttachments(comment: Comment): boolean {
    return !!(comment.attachments && comment.attachments.length > 0);
  }

  /**
   * Get attachment count
   */
  static getAttachmentCount(comment: Comment): number {
    return comment.attachments ? comment.attachments.length : 0;
  }

  /**
   * Validate comment content
   */
  static validateCommentContent(content: string): {
    isValid: boolean;
    error?: string;
  } {
    if (!content || content.trim() === '') {
      return { isValid: false, error: 'Comment cannot be empty' };
    }

    if (content.length > 500) {
      return { isValid: false, error: 'Comment cannot exceed 500 characters' };
    }

    return { isValid: true };
  }

  /**
   * Sanitize comment content for security
   */
  static sanitizeCommentContent(content: string): string {
    // Basic XSS protection
    return content
      .replace(/</g, '<')
      .replace(/>/g, '>')
      .replace(/"/g, '"')
      .replace(/'/g, ''');
  }
}