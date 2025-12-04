import React from 'react';
import { DroppableContainer } from './DroppableContainer';

interface DroppableTaskListProps {
  id: string;
  children: React.ReactNode;
  className?: string;
  onDrop?: (id: string) => void;
}

export const DroppableTaskList: React.FC<DroppableTaskListProps> = ({
  id,
  children,
  className = '',
  onDrop
}) => {
  return (
    <DroppableContainer
      id={id}
      className={`droppable-task-list ${className}`}
      onDrop={onDrop}
    >
      {children}
    </DroppableContainer>
  );
};