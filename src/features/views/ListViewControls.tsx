import React from 'react';
import { ViewFilterControls } from './ViewFilterControls';
import { ViewSortControls } from './ViewSortControls';

interface ListViewControlsProps {
  sortBy: string;
  sortDirection: 'asc' | 'desc';
  groupBy: string;
  filters: {
    status?: string;
    priority?: string;
    searchQuery?: string;
  };
  onSortChange: (field: string, direction: 'asc' | 'desc') => void;
  onGroupChange: (groupBy: string) => void;
  onFilterChange: (filterType: string, value: string) => void;
  onResetFilters: () => void;
}

export const ListViewControls: React.FC<ListViewControlsProps> = ({
  sortBy,
  sortDirection,
  groupBy,
  filters,
  onSortChange,
  onGroupChange,
  onFilterChange,
  onResetFilters,
}) => {
  const groupOptions = [
    { value: 'project', label: 'Group by Project' },
    { value: 'priority', label: 'Group by Priority' },
    { value: 'status', label: 'Group by Status' },
    { value: 'dueDate', label: 'Group by Due Date' },
    { value: 'none', label: 'No Grouping' }
  ];

  return (
    <div className="list-view-controls flex flex-wrap items-center gap-3 mb-4">
      <ViewFilterControls
        filters={filters}
        onStatusChange={(status) => onFilterChange('status', status)}
        onPriorityChange={(priority) => onFilterChange('priority', priority)}
        onSearchChange={(query) => onFilterChange('searchQuery', query)}
        onReset={onResetFilters}
        viewType="inbox"
      />

      <ViewSortControls
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSortChange={onSortChange}
        viewType="inbox"
      />

      <select
        value={groupBy}
        onChange={(e) => onGroupChange(e.target.value)}
        className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
      >
        {groupOptions.map(option => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </div>
  );
};