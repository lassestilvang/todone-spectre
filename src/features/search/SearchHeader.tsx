import React from 'react';
import { SearchBar } from './SearchBar';
import { useSearchStore } from '../../store/useSearchStore';

interface SearchHeaderProps {
  className?: string;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({ className = '' }) => {
  const { openSearchModal, openCommandPalette } = useSearchStore();

  return (
    <div className={`flex items-center justify-between ${className}`}>
      <div className="flex-1">
        <SearchBar
          placeholder="Search tasks, projects, labels..."
          className="w-full"
        />
      </div>

      <div className="ml-4 flex items-center space-x-2">
        <button
          onClick={openSearchModal}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Search
          </span>
        </button>

        <button
          onClick={openCommandPalette}
          className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <span className="flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Commands
            <kbd className="ml-2 px-1 py-0.5 text-xs border border-gray-300 rounded bg-gray-100">Ctrl</kbd>
            <kbd className="px-1 py-0.5 text-xs border border-gray-300 rounded bg-gray-100">K</kbd>
          </span>
        </button>
      </div>
    </div>
  );
};