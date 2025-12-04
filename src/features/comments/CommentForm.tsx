import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { useCommentForm } from '../../hooks/useCommentForm';

interface CommentFormProps {
  taskId: string;
  parentCommentId?: string;
  onSubmit: (content: string) => Promise<void>;
  onCancel?: () => void;
  initialContent?: string;
}

const CommentForm: React.FC<CommentFormProps> = ({
  taskId,
  parentCommentId,
  onSubmit,
  onCancel,
  initialContent = ''
}) => {
  const [content, setContent] = useState(initialContent);
  const { validateComment, errors } = useCommentForm();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateComment(content)) {
      await onSubmit(content);
      setContent('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <Textarea
          id="comment-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={parentCommentId ? "Write a reply..." : "Write a comment..."}
          className="min-h-[100px] w-full"
          required
        />
        {errors.content && (
          <p className="text-sm text-red-600">{errors.content}</p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <Button type="submit" variant="primary">
          {parentCommentId ? 'Post Reply' : 'Post Comment'}
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

export default CommentForm;