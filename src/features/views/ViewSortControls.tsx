import React from 'react';

interface ViewSortControlsProps {
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  onSortChange: (field: string, direction: 'asc' | 'desc') => void;
  viewType: 'inbox' | 'today' | 'upcoming';
}

export const ViewSortControls: React.FC<ViewSortControlsProps> = ({
  sortBy,
  sortDirection,
  onSortChange,
  viewType
}) => {
  const sortOptions = {
    inbox: [
      { value: 'priority', label: 'Priority' },
      { value: 'dueDate', label: 'Due Date' },
      { value: 'createdAt', label: 'Created Date' }
    ],
    today: [
      { value: 'dueDate', label: 'Due Date' },
      { value: 'priority', label: 'Priority' },
      { value: 'urgency', label: 'Urgency' }
    ],
    upcoming: [
      { value: 'dueDate', label: 'Due Date' },
      { value: 'priority', label: 'Priority' },
      { value: 'createdAt', label: 'Created Date' }
    ]
  };

  const currentOptions = sortOptions[viewType] || sortOptions.inbox;

  return (
    <div className="flex items-center space-x-2">
      <select
        value={sortBy}
        onChange={(e) => onSortChange(e.target.value, sortDirection)}
        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
      >
        {currentOptions.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>

      <button
        onClick={() => onSortChange(sortBy, sortDirection === 'asc' ? 'desc' : 'asc')}
        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white flex items-center"
      >
        {sortDirection === 'asc' ? '↑' : '↓'}
        <span className="ml-1">{sortDirection === 'asc' ? 'Asc' : 'Desc'}</span>
      </button>
    </div>
  );
};