import React, { useEffect } from 'react';
import { useEmptyState } from '../../../hooks/useEmptyState';
import { EmptyStateConfig } from '../../../types/emptyStateTypes';

interface EmptyStateManagerProps {
  children: React.ReactNode;
  defaultEmptyStates?: Record<string, EmptyStateConfig>;
}

export const EmptyStateManager: React.FC<EmptyStateManagerProps> = ({
  children,
  defaultEmptyStates = {}
}) => {
  // Initialize empty states
  useEffect(() => {
    Object.entries(defaultEmptyStates).forEach(([key, config]) => {
      useEmptyState(key).registerEmptyState(config);
    });
  }, [defaultEmptyStates]);

  return <>{children}</>;
};

/**
 * Empty State Provider Component
 * Manages global empty state configurations and provides context
 */
export const EmptyStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <EmptyStateManager>
      {children}
    </EmptyStateManager>
  );
};