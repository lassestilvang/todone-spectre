import React from 'react';

interface BoardViewControlsProps {
  columns: string[];
  showTaskCount: boolean;
  onColumnsChange: (columns: string[]) => void;
  onShowTaskCountChange: (show: boolean) => void;
  onAddColumn: () => void;
  onRemoveColumn: (columnIndex: number) => void;
}

export const BoardViewControls: React.FC<BoardViewControlsProps> = ({
  columns,
  showTaskCount,
  onColumnsChange,
  onShowTaskCountChange,
  onAddColumn,
  onRemoveColumn,
}) => {
  return (
    <div className="board-view-controls flex flex-wrap items-center gap-3 mb-4">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Columns:</span>
        <div className="flex items-center space-x-1">
          {columns.map((column, index) => (
            <div key={index} className="flex items-center space-x-1">
              <span className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                {column}
              </span>
              {columns.length > 1 && (
                <button
                  onClick={() => onRemoveColumn(index)}
                  className="text-red-500 hover:text-red-700 text-xs"
                  title="Remove column"
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            onClick={onAddColumn}
            className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded hover:bg-green-200 dark:hover:bg-green-800"
          >
            + Add
          </button>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <label className="flex items-center space-x-1">
          <input
            type="checkbox"
            checked={showTaskCount}
            onChange={(e) => onShowTaskCountChange(e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <span className="text-sm text-gray-700 dark:text-gray-300">Show task count</span>
        </label>
      </div>
    </div>
  );
};