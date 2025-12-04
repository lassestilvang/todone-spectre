import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { CommentState, Comment, CommentNotification } from '../types/store';

export const useCommentStore = create<CommentState>()(
  devtools(
    persist(
      (set, get) => ({
        comments: [],
        filteredComments: [],
        currentFilter: {},
        sortBy: 'timestamp',
        sortDirection: 'desc',
        commentError: null,
        selectedCommentIds: [],
        notifications: [],

        // CRUD Operations
        addComment: (commentData: Omit<Comment, 'id' | 'timestamp'>) => {
          const newComment: Comment = {
            ...commentData,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date(),
            likes: 0,
            dislikes: 0
          };
          set((state) => ({
            comments: [...state.comments, newComment],
          }));
          get().applyCommentFilters();
        },

        updateComment: (id: string, updates: Partial<Omit<Comment, 'id' | 'timestamp'>>) => {
          set((state) => ({
            comments: state.comments.map((comment) =>
              comment.id === id
                ? {
                    ...comment,
                    ...updates,
                    timestamp: new Date(),
                  }
                : comment
            ),
          }));
          get().applyCommentFilters();
        },

        deleteComment: (id: string) => {
          set((state) => ({
            comments: state.comments.filter((comment) => comment.id !== id),
          }));
          get().applyCommentFilters();
        },

        likeComment: (id: string) => {
          set((state) => ({
            comments: state.comments.map((comment) =>
              comment.id === id
                ? {
                    ...comment,
                    likes: (comment.likes || 0) + 1,
                  }
                : comment
            ),
          }));
        },

        unlikeComment: (id: string) => {
          set((state) => ({
            comments: state.comments.map((comment) =>
              comment.id === id
                ? {
                    ...comment,
                    likes: Math.max((comment.likes || 0) - 1, 0),
                  }
                : comment
            ),
          }));
        },

        dislikeComment: (id: string) => {
          set((state) => ({
            comments: state.comments.map((comment) =>
              comment.id === id
                ? {
                    ...comment,
                    dislikes: (comment.dislikes || 0) + 1,
                  }
                : comment
            ),
          }));
        },

        undislikeComment: (id: string) => {
          set((state) => ({
            comments: state.comments.map((comment) =>
              comment.id === id
                ? {
                    ...comment,
                    dislikes: Math.max((comment.dislikes || 0) - 1, 0),
                  }
                : comment
            ),
          }));
        },

        // Filtering and Sorting
        setCommentFilter: (filter: CommentState['currentFilter']) => {
          set({ currentFilter: filter });
          get().applyCommentFilters();
        },

        setCommentSort: (sortBy: CommentState['sortBy'], sortDirection: CommentState['sortDirection']) => {
          set({ sortBy, sortDirection });
          get().applyCommentFilters();
        },

        applyCommentFilters: () => {
          const { comments, currentFilter, sortBy, sortDirection } = get();
          let filtered = [...comments];

          // Apply task filter
          if (currentFilter.taskId) {
            filtered = filtered.filter((comment) => comment.taskId === currentFilter.taskId);
          }

          // Apply user filter
          if (currentFilter.userId) {
            filtered = filtered.filter((comment) => comment.user === currentFilter.userId);
          }

          // Apply search query filter
          if (currentFilter.searchQuery) {
            const query = currentFilter.searchQuery.toLowerCase();
            filtered = filtered.filter(
              (comment) =>
                comment.content.toLowerCase().includes(query) ||
                comment.user.toLowerCase().includes(query)
            );
          }

          // Apply sorting
          filtered.sort((a, b) => {
            if (sortBy === 'timestamp') {
              const dateA = new Date(a.timestamp).getTime();
              const dateB = new Date(b.timestamp).getTime();
              return sortDirection === 'asc' ? dateA - dateB : dateB - dateA;
            } else if (sortBy === 'likes') {
              const likesA = a.likes || 0;
              const likesB = b.likes || 0;
              return sortDirection === 'asc' ? likesA - likesB : likesB - likesA;
            } else if (sortBy === 'dislikes') {
              const dislikesA = a.dislikes || 0;
              const dislikesB = b.dislikes || 0;
              return sortDirection === 'asc' ? dislikesA - dislikesB : dislikesB - dislikesA;
            }

            return 0;
          });

          set({ filteredComments: filtered });
        },

        // Comment loading states
        setComments: (comments: Comment[]) => {
          set({ comments });
          get().applyCommentFilters();
        },

        // Comment error handling
        setCommentError: (error: string | null) => {
          set({ commentError: error });
        },

        // Comment selection
        setSelectedCommentIds: (commentIds: string[]) => {
          set({ selectedCommentIds: commentIds });
        },

        // Notification management
        addNotification: (notification: Omit<CommentNotification, 'id' | 'createdAt'>) => {
          const newNotification: CommentNotification = {
            ...notification,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date(),
            read: false
          };
          set((state) => ({
            notifications: [...state.notifications, newNotification],
          }));
        },

        markNotificationAsRead: (id: string) => {
          set((state) => ({
            notifications: state.notifications.map((notification) =>
              notification.id === id ? { ...notification, read: true } : notification
            ),
          }));
        },

        markAllNotificationsAsRead: () => {
          set((state) => ({
            notifications: state.notifications.map((notification) =>
              notification.read ? notification : { ...notification, read: true }
            ),
          }));
        },

        dismissNotification: (id: string) => {
          set((state) => ({
            notifications: state.notifications.filter((notification) => notification.id !== id),
          }));
        },

        // Get comments by task
        getCommentsByTask: (taskId: string): Comment[] => {
          return get().comments.filter(comment => comment.taskId === taskId);
        },

        // Get comment statistics
        getCommentStatistics: (): {
          total: number;
          byUser: Record<string, number>;
          recent: Comment[];
        } => {
          const comments = get().comments;
          const byUser: Record<string, number> = {};
          const recent = [...comments]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 5);

          comments.forEach(comment => {
            byUser[comment.user] = (byUser[comment.user] || 0) + 1;
          });

          return {
            total: comments.length,
            byUser,
            recent
          };
        },

        // Initialize with sample comments
        initializeSampleComments: () => {
          const sampleComments: Comment[] = [
            {
              id: 'comment-1',
              taskId: 'task-1',
              user: 'user-1',
              content: 'Great work on the documentation! This will be very helpful for new users.',
              timestamp: new Date(),
              likes: 2,
              dislikes: 0
            },
            {
              id: 'comment-2',
              taskId: 'task-1',
              user: 'user-2',
              content: 'I have a question about the authentication flow. Can you clarify how the token refresh works?',
              timestamp: new Date(Date.now() - 3600000), // 1 hour ago
              likes: 1,
              dislikes: 0
            },
            {
              id: 'comment-3',
              taskId: 'task-2',
              user: 'user-1',
              content: 'The pull request looks good overall. Just a few minor style suggestions.',
              timestamp: new Date(Date.now() - 7200000), // 2 hours ago
              likes: 3,
              dislikes: 0
            }
          ];

          set({ comments: sampleComments });
          get().applyCommentFilters();
        },
      }),
      {
        name: 'todone-comments-storage',
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
);

// Helper function to create localStorage
const createJSONStorage = (getStorage: () => Storage) => ({
  getItem: (name: string) => {
    const storage = getStorage();
    const item = storage.getItem(name);
    return item ? JSON.parse(item) : null;
  },
  setItem: (name: string, value: any) => {
    const storage = getStorage();
    storage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name: string) => {
    const storage = getStorage();
    storage.removeItem(name);
  },
});