import React, { useState, useEffect } from 'react';
import { Comment } from '../../types/common';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { useCommentForm } from '../../hooks/useCommentForm';

interface CommentEditorProps {
  taskId: string;
  comment?: Comment;
  onSave: (content: string) => Promise<void>;
  onCancel?: () => void;
}

const CommentEditor: React.FC<CommentEditorProps> = ({
  taskId,
  comment,
  onSave,
  onCancel
}) => {
  const [content, setContent] = useState(comment?.content || '');
  const { validateComment, errors } = useCommentForm();

  useEffect(() => {
    if (comment) {
      setContent(comment.content);
    }
  }, [comment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateComment(content)) {
      await onSave(content);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <Textarea
          id="comment-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your comment..."
          className="min-h-[100px] w-full"
          required
        />
        {errors.content && (
          <p className="text-sm text-red-600">{errors.content}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Button type="submit" variant="primary">
          {comment ? 'Update Comment' : 'Post Comment'}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

export default CommentEditor;