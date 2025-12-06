import { Comment } from "../types/common";
import { formatDistanceToNow, format } from "date-fns";

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
   * Sanitize comment content for security
   */
  static sanitizeCommentContent(content: string): string {
    // Basic XSS protection
    return content
      .replace(/</g, "<")
      .replace(/>/g, ">")
      .replace(/"/g, """)
      .replace(/'/g, "'");
  }
}
