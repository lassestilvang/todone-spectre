import React, { useState, useEffect } from 'react';
import { useComments } from '../../hooks/useComments';
import { useCommentForm } from '../../hooks/useCommentForm';
import { CommentUtils } from '../../utils/commentUtils';
import { CommentValidation } from '../../utils/commentValidation';
import CommentSectionWithHeader from './CommentSectionWithHeader';
import CommentListWithPagination from './CommentListWithPagination';
import CommentFormWithValidation from './CommentFormWithValidation';
import CommentItemWithActions from './CommentItemWithActions';
import CommentNotifications from './CommentNotifications';
import { Comment } from '../../types/common';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';

interface CommentFeatureImplementationProps {
  taskId: string;
  showNotifications?: boolean;
  showAdvancedFeatures?: boolean;
}

const CommentFeatureImplementation: React.FC<CommentFeatureImplementationProps> = ({
  taskId,
  showNotifications = true,
  showAdvancedFeatures = true
}) => {
  const {
    comments,
    loading,
    error,
    createComment,
    updateComment,
    deleteComment,
    likeComment,
    unlikeComment,
    refreshComments,
    filterCommentsByUser,
    sortComments,
    getCommentStats
  } = useComments(taskId);

  const [activeTab, setActiveTab] = useState<'all' | 'mine' | 'recent'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'popular'>('newest');
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [filteredComments, setFilteredComments] = useState<Comment[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    byUser: {} as Record<string, number>,
    recent: [] as Comment[]
  });

  // Update filtered comments when dependencies change
  useEffect(() => {
    let result = [...comments];

    // Apply tab filtering
    if (activeTab === 'mine') {
      const currentUserId = localStorage.getItem('userId') || 'user-1';
      result = filterCommentsByUser(currentUserId);
    } else if (activeTab === 'recent') {
      result = sortComments('desc').slice(0, 10);
    }

    // Apply sorting
    if (sortBy === 'newest') {
      result = sortComments('desc');
    } else if (sortBy === 'oldest') {
      result = sortComments('asc');
    } else if (sortBy === 'popular') {
      result = [...comments].sort((a, b) => (b.likes || 0) - (a.likes || 0));
    }

    setFilteredComments(result);
    setStats(getCommentStats());
  }, [comments, activeTab, sortBy, filterCommentsByUser, sortComments, getCommentStats]);

  const handleCreateComment = async (content: string) => {
    await createComment(content);
    setShowCommentForm(false);
  };

  const handleEditComment = async (commentId: string, content: string) => {
    await updateComment(commentId, content);
    setEditingComment(null);
    setShowCommentForm(false);
  };

  const handleEditClick = (comment: Comment) => {
    setEditingComment(comment);
    setShowCommentForm(true);
  };

  const handleLike = async (commentId: string) => {
    await likeComment(commentId);
  };

  const handleDislike = async (commentId: string) => {
    await unlikeComment(commentId);
  };

  const handleReply = (comment: Comment) => {
    // In a real implementation, this would handle replies
    console.log('Reply to comment:', comment.id);
  };

  if (loading) {
    return <div className="text-center py-4">Loading comments...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with stats and controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-medium">Comments</h3>
          <p className="text-sm text-gray-500">
            {stats.total} comment{stats.total !== 1 ? 's' : ''} from {Object.keys(stats.byUser).length} user{Object.keys(stats.byUser).length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="flex items-center space-x-2 mt-2 sm:mt-0">
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setShowCommentForm(!showCommentForm);
              setEditingComment(null);
            }}
          >
            {showCommentForm ? 'Cancel' : 'Add Comment'}
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={refreshComments}
            disabled={loading}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* Comment form */}
      {showCommentForm && (
        <CommentFormWithValidation
          taskId={taskId}
          onSubmit={editingComment
            ? (content) => handleEditComment(editingComment.id, content)
            : handleCreateComment}
          onCancel={() => {
            setShowCommentForm(false);
            setEditingComment(null);
          }}
          initialContent={editingComment?.content || ''}
          submitButtonText={editingComment ? 'Update Comment' : 'Post Comment'}
        />
      )}

      {/* Tabs and controls */}
      {showAdvancedFeatures && (
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
          <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="w-full sm:w-auto">
            <TabsList className="grid grid-cols-3 w-full sm:w-auto">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="mine">My Comments</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center space-x-2">
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}

      {/* Comment list */}
      <CommentListWithPagination
        comments={filteredComments}
        onEdit={handleEditClick}
        onDelete={deleteComment}
        onReply={handleReply}
      />

      {/* Notifications */}
      {showNotifications && (
        <div className="mt-6">
          <CommentNotifications
            notifications={[]} // In a real implementation, this would come from state
            onMarkAsRead={() => {}}
            onViewComment={() => {}}
            onDismiss={() => {}}
          />
        </div>
      )}
    </div>
  );
};

export default CommentFeatureImplementation;