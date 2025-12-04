import React from 'react';
import { Filter } from '../../types/models';

interface FilterItemProps {
  filter: Filter;
  onEdit: (filter: Filter) => void;
  onDelete: (filterId: string) => void;
  onSelect: (filterId: string) => void;
  isSelected: boolean;
}

const FilterItem: React.FC<FilterItemProps> = ({
  filter,
  onEdit,
  onDelete,
  onSelect,
  isSelected
}) => {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${
        isSelected ? 'bg-blue-100 border border-blue-300' : 'hover:bg-gray-50'
      }`}
      onClick={() => onSelect(filter.id)}
    >
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${filter.color || 'bg-gray-400'}`}></div>
        <span className="font-medium">{filter.name}</span>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(filter);
          }}
          className="text-blue-500 hover:text-blue-700"
        >
          Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(filter.id);
          }}
          className="text-red-500 hover:text-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default FilterItem;