import React from 'react';
import { useEmptyState } from '../../../hooks/useEmptyState';
import { EmptyStateConfig } from '../../../types/emptyStateTypes';

interface EmptyStateWithCustomizationProps {
  emptyStateKey: string;
  customConfig?: Partial<EmptyStateConfig>;
  className?: string;
  onActionClick?: () => void;
}

export const EmptyStateWithCustomization: React.FC<EmptyStateWithCustomizationProps> = ({
  emptyStateKey,
  customConfig,
  className = '',
  onActionClick
}) => {
  const { emptyStateConfig, isVisible, updateEmptyState } = useEmptyState(emptyStateKey);

  // Merge default config with custom config
  const mergedConfig = React.useMemo(() => {
    return {
      ...emptyStateConfig,
      ...customConfig,
      actions: customConfig?.actions || emptyStateConfig.actions
    };
  }, [emptyStateConfig, customConfig]);

  const handleActionClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onActionClick) {
      onActionClick();
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`empty-state-custom ${className}`}>
      <div className="empty-state-content">
        {mergedConfig.icon && (
          <div className="empty-state-icon">
            {mergedConfig.icon}
          </div>
        )}

        <div className="empty-state-text">
          <h3 className="empty-state-title">{mergedConfig.title}</h3>
          <p className="empty-state-description">{mergedConfig.description}</p>
        </div>

        {mergedConfig.actions && (
          <div className="empty-state-actions">
            {React.cloneElement(mergedConfig.actions as React.ReactElement, {
              onClick: handleActionClick
            })}
          </div>
        )}
      </div>
    </div>
  );
};