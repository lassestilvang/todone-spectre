import { Comment } from "../types/common";
import { CommentNotification } from "../types/store";

/**
 * Comment test utilities for generating test data
 */
export class CommentTestUtils {
  /**
   * Generate a mock comment
   */
  static generateMockComment(overrides: Partial<Comment> = {}): Comment {
    return {
      id: `comment_${Math.random().toString(36).substr(2, 9)}`,
      taskId: "task-1",
      user: "user-1",
      content: "This is a test comment",
      timestamp: new Date(),
      likes: 0,
      dislikes: 0,
      ...overrides,
    };
  }

  /**
   * Generate multiple mock comments
   */
  static generateMockComments(count: number = 5): Comment[] {
    return Array.from({ length: count }, (_, i) =>
      this.generateMockComment({
        id: `comment_${i + 1}`,
        user: `user_${(i % 3) + 1}`,
        content: `Test comment ${i + 1} with some content that should be long enough to test various scenarios.`,
        timestamp: new Date(Date.now() - i * 3600000), // Each comment 1 hour apart
        likes: Math.floor(Math.random() * 10),
        dislikes: Math.floor(Math.random() * 3),
      }),
    );
  }

  /**
   * Generate mock comment notifications
   */
  static generateMockNotifications(count: number = 3): CommentNotification[] {
    return Array.from({ length: count }, (_, i) => ({
      id: `notification_${i + 1}`,
      commentId: `comment_${i + 1}`,
      type: ["mention", "reply", "like", "dislike"][
        i % 4
      ] as CommentNotification["type"],
      userId: `user_${(i % 2) + 1}`,
      read: i % 2 === 0, // Every other notification is read
      createdAt: new Date(Date.now() - i * 1800000), // Each notification 30 minutes apart
      comment: this.generateMockComment({
        id: `comment_${i + 1}`,
        content: `Notification test comment ${i + 1}`,
      }),
    }));
  }

  /**
   * Generate a comment with mentions
   */
  static generateCommentWithMentions(): Comment {
    return {
      id: "comment_with_mentions",
      taskId: "task-1",
      user: "user-1",
      content:
        "Hey @user2 and @user3, what do you think about this approach? Also check out #feature-request and #bug-fix",
      timestamp: new Date(),
      likes: 2,
      dislikes: 0,
    };
  }

  /**
   * Generate a comment with URLs
   */
  static generateCommentWithUrls(): Comment {
    return {
      id: "comment_with_urls",
      taskId: "task-1",
      user: "user-1",
      content:
        "Check out these resources: https://example.com/docs and https://github.com/todone/app. Also see http://bit.ly/shortlink",
      timestamp: new Date(),
      likes: 1,
      dislikes: 0,
    };
  }

  /**
   * Generate a long comment
   */
  static generateLongComment(): Comment {
    return {
      id: "comment_long",
      taskId: "task-1",
      user: "user-1",
      content: `This is a very long comment that should test the system's ability to handle lengthy content.
      It contains multiple paragraphs and should demonstrate how the UI handles overflow and formatting.

      Here's another paragraph with some technical details about the implementation.
      The comment system should properly format this content with line breaks and appropriate styling.

      Finally, a conclusion paragraph that wraps up the long comment content.
      This should be sufficient to test various edge cases in the comment rendering system.`,
      timestamp: new Date(),
      likes: 3,
      dislikes: 1,
    };
  }

  /**
   * Generate a comment with attachments
   */
  static generateCommentWithAttachments(): Comment {
    return {
      id: "comment_with_attachments",
      taskId: "task-1",
      user: "user-1",
      content:
        "Here are the design files for the new feature. Let me know what you think!",
      timestamp: new Date(),
      likes: 4,
      dislikes: 0,
      attachments: ["attachment_1", "attachment_2", "attachment_3"],
    };
  }

  /**
   * Generate a comment thread (parent with replies)
   */
  static generateCommentThread(): Comment[] {
    const parentComment = this.generateMockComment({
      id: "parent_comment",
      content: "This is the parent comment that should have replies",
    });

    const replies = Array.from({ length: 3 }, (_, i) =>
      this.generateMockComment({
        id: `reply_${i + 1}`,
        content: `Reply ${i + 1} to the parent comment`,
        // In a real system, this would have a parentCommentId field
      }),
    );

    return [parentComment, ...replies];
  }

  /**
   * Generate test data for comment service mocks
   */
  static generateServiceTestData(): {
    comments: Comment[];
    notifications: CommentNotification[];
  } {
    return {
      comments: [
        ...this.generateMockComments(10),
        this.generateCommentWithMentions(),
        this.generateCommentWithUrls(),
        this.generateLongComment(),
        this.generateCommentWithAttachments(),
      ],
      notifications: this.generateMockNotifications(5),
    };
  }
}
