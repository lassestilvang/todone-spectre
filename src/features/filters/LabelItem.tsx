import React from 'react';
import { Label } from '../../types/models';

interface LabelItemProps {
  label: Label;
  onEdit: (label: Label) => void;
  onDelete: (labelId: string) => void;
  onSelect: (labelId: string) => void;
  isSelected: boolean;
}

const LabelItem: React.FC<LabelItemProps> = ({
  label,
  onEdit,
  onDelete,
  onSelect,
  isSelected
}) => {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer ${
        isSelected ? 'bg-green-100 border border-green-300' : 'hover:bg-gray-50'
      }`}
      onClick={() => onSelect(label.id)}
    >
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${label.color || 'bg-gray-400'}`}></div>
        <span className="font-medium">{label.name}</span>
      </div>
      <div className="flex space-x-2">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit(label);
          }}
          className="text-blue-500 hover:text-blue-700"
        >
          Edit
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(label.id);
          }}
          className="text-red-500 hover:text-red-700"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default LabelItem;