import React from 'react';
import { SearchResult } from '../../types/search';

interface SearchResultsProps {
  results: SearchResult[];
  onSelect?: (result: SearchResult) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  onSelect
}) => {
  const handleResultClick = (result: SearchResult) => {
    if (onSelect) {
      onSelect(result);
    }
  };

  if (results.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        No results found
      </div>
    );
  }

  return (
    <div className="max-h-60 overflow-y-auto">
      {results.map((result, index) => (
        <div
          key={`${result.id}-${index}`}
          onClick={() => handleResultClick(result)}
          className="px-4 py-2 cursor-pointer hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium text-sm">{result.title}</div>
              {result.subtitle && (
                <div className="text-xs text-gray-500 truncate">{result.subtitle}</div>
              )}
            </div>
            {result.type && (
              <div className="ml-2 text-xs text-gray-400 uppercase">
                {result.type}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};