import React, { useEffect } from 'react';
import { SearchBar } from './SearchBar';
import { SearchModal } from './SearchModal';
import { CommandPalette } from './CommandPalette';
import { useSearchStore } from '../../store/useSearchStore';
import { useSearch } from '../../hooks/useSearch';
import { useCommandPalette } from '../../hooks/useCommandPalette';
import { setupKeyboardShortcuts } from '../../utils/keyboardShortcuts';

export const SearchIntegration: React.FC = () => {
  const {
    isSearchModalOpen,
    isCommandPaletteOpen,
    openSearchModal,
    closeSearchModal,
    openCommandPalette,
    closeCommandPalette
  } = useSearchStore();

  const { search, results, clearResults } = useSearch();
  const { commands, filteredCommands, executeCommand } = useCommandPalette();

  // Set up keyboard shortcuts
  useEffect(() => {
    const cleanup = setupKeyboardShortcuts();
    return cleanup;
  }, []);

  // Handle search result selection
  const handleSearchResultSelect = (result: any) => {
    console.log('Selected search result:', result);
    // Here you would typically navigate to the selected item
    // For example: navigate(`/tasks/${result.data.id}`);
    closeSearchModal();
  };

  // Handle command execution
  const handleCommandExecute = async (command: any) => {
    const success = await executeCommand(command);
    if (success) {
      console.log('Command executed successfully:', command.name);
    } else {
      console.error('Command execution failed:', command.name);
    }
    closeCommandPalette();
  };

  return (
    <>
      {/* Search Bar in header */}
      <div className="w-full max-w-md mx-auto mb-4">
        <SearchBar
          placeholder="Search tasks, projects, labels..."
          className="w-full"
        />
      </div>

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchModalOpen}
        onClose={closeSearchModal}
        onSelect={handleSearchResultSelect}
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={closeCommandPalette}
      />
    </>
  );
};