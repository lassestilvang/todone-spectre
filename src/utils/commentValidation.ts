import { Comment } from '../types/common';

/**
 * Comment validation utilities
 */
export class CommentValidation {
  /**
   * Validate comment data
   */
  static validateComment(comment: Partial<Comment>): {
    isValid: boolean;
    errors: Record<string, string>;
  } {
    const errors: Record<string, string> = {};

    // Validate taskId
    if (!comment.taskId) {
      errors.taskId = 'Task ID is required';
    }

    // Validate user
    if (!comment.user) {
      errors.user = 'User is required';
    }

    // Validate content
    if (!comment.content || comment.content.trim() === '') {
      errors.content = 'Content is required';
    } else if (comment.content.length > 500) {
      errors.content = 'Content cannot exceed 500 characters';
    }

    // Validate timestamp
    if (comment.timestamp && isNaN(new Date(comment.timestamp).getTime())) {
      errors.timestamp = 'Invalid timestamp';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Validate comment content only
   */
  static validateCommentContent(content: string): {
    isValid: boolean;
    error?: string;
  } {
    if (!content || content.trim() === '') {
      return { isValid: false, error: 'Content is required' };
    }

    if (content.length > 500) {
      return { isValid: false, error: 'Content cannot exceed 500 characters' };
    }

    if (content.length < 1) {
      return { isValid: false, error: 'Content must be at least 1 character' };
    }

    return { isValid: true };
  }

  /**
   * Validate comment for creation
   */
  static validateCommentForCreation(
    taskId: string,
    userId: string,
    content: string
  ): {
    isValid: boolean;
    errors: Record<string, string>;
  } {
    const errors: Record<string, string> = {};

    if (!taskId) {
      errors.taskId = 'Task ID is required';
    }

    if (!userId) {
      errors.userId = 'User ID is required';
    }

    const contentValidation = this.validateCommentContent(content);
    if (!contentValidation.isValid) {
      errors.content = contentValidation.error || 'Invalid content';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Validate comment for update
   */
  static validateCommentForUpdate(
    commentId: string,
    content: string
  ): {
    isValid: boolean;
    errors: Record<string, string>;
  } {
    const errors: Record<string, string> = {};

    if (!commentId) {
      errors.commentId = 'Comment ID is required';
    }

    const contentValidation = this.validateCommentContent(content);
    if (!contentValidation.isValid) {
      errors.content = contentValidation.error || 'Invalid content';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Validate comment ID
   */
  static validateCommentId(commentId: string): boolean {
    return !!commentId && commentId.trim().length > 0;
  }

  /**
   * Validate attachment IDs
   */
  static validateAttachmentIds(attachmentIds: string[] = []): boolean {
    return attachmentIds.every(id => this.validateCommentId(id));
  }

  /**
   * Check if comment content contains spam
   */
  static containsSpam(content: string): boolean {
    const spamPatterns = [
      /http:\/\/bit\.ly\/\w+/i,
      /http:\/\/tinyurl\.com\/\w+/i,
      /(buy|purchase|discount|sale)\s+(viagra|cialis|pills|meds)/i,
      /(win|won|prize|award)\s+(money|cash|iphone|car)/i
    ];

    return spamPatterns.some(pattern => pattern.test(content));
  }

  /**
   * Check if comment content contains profanity
   */
  static containsProfanity(content: string): boolean {
    const profanityWords = [
      'fuck', 'shit', 'bitch', 'asshole', 'cunt',
      'dick', 'pussy', 'cock', 'nigger', 'faggot'
    ];

    const lowerContent = content.toLowerCase();
    return profanityWords.some(word =>
      lowerContent.includes(word)
    );
  }

  /**
   * Validate comment for moderation
   */
  static validateForModeration(content: string): {
    isValid: boolean;
    issues: string[];
  } {
    const issues: string[] = [];

    if (this.containsSpam(content)) {
      issues.push('Contains potential spam');
    }

    if (this.containsProfanity(content)) {
      issues.push('Contains profanity');
    }

    if (content.length > 1000) {
      issues.push('Content is too long');
    }

    return {
      isValid: issues.length === 0,
      issues
    };
  }
}