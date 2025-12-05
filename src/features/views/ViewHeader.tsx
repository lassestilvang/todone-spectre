import React from "react";

interface ViewHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  stats?: React.ReactNode;
}

export const ViewHeader: React.FC<ViewHeaderProps> = ({
  title,
  description,
  actions,
  stats,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
      <div className="mb-4 sm:mb-0">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
            {description}
          </p>
        )}
        {stats && (
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {stats}
          </div>
        )}
      </div>
      {actions && (
        <div className="flex items-center space-x-2 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};
