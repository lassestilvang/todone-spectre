import React from 'react';
import { useEmptyState } from '../../../hooks/useEmptyState';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No content available',
  description = 'There is nothing to display here yet',
  icon,
  actions,
  className = ''
}) => {
  const { emptyStateConfig } = useEmptyState();

  return (
    <div className={`empty-state ${className}`}>
      <div className="empty-state-content">
        {icon && <div className="empty-state-icon">{icon}</div>}
        <h3 className="empty-state-title">{title}</h3>
        <p className="empty-state-description">{description}</p>
        {actions && <div className="empty-state-actions">{actions}</div>}
      </div>
    </div>
  );
};