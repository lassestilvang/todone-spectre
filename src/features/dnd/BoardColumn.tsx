import React from 'react';
import { DroppableContainer } from './DroppableContainer';

interface BoardColumnProps {
  columnId: string;
  title: string;
  children: React.ReactNode;
  className?: string;
  onDrop?: (columnId: string) => void;
}

export const BoardColumn: React.FC<BoardColumnProps> = ({
  columnId,
  title,
  children,
  className = '',
  onDrop
}) => {
  return (
    <DroppableContainer
      id={`column-${columnId}`}
      className={`board-column ${className} bg-gray-50 rounded-lg p-4 min-w-[250px]`}
      onDrop={() => onDrop?.(columnId)}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-800">{title}</h3>
        <span className="text-sm text-gray-500">
          {React.Children.count(children)} tasks
        </span>
      </div>
      <div className="space-y-2">
        {children}
      </div>
    </DroppableContainer>
  );
};