import React, { useState } from "react";
import { SearchBar } from "./SearchBar";
import { SearchResults } from "./SearchResults";
import { CommandPalette } from "./CommandPalette";
import { SearchModal } from "./SearchModal";
import { SearchHeader } from "./SearchHeader";
import { useSearch } from "../../hooks/useSearch";
import { useCommandPalette } from "../../hooks/useCommandPalette";
import { useSearchStore } from "../../store/useSearchStore";
import {
  createMockSearchResults,
  createMockCommands,
} from "../../utils/searchTestUtils";

export const SearchDemo: React.FC = () => {
  const [demoMode, setDemoMode] = useState<
    "search" | "commands" | "modal" | "header"
  >("search");
  const { search, results, clearResults } = useSearch();
  const { commands, filteredCommands, executeCommand, openCommandPalette } =
    useCommandPalette();
  const {
    isSearchModalOpen,
    isCommandPaletteOpen,
    openSearchModal,
    closeSearchModal,
    openCommandPalette: openCommandPaletteStore,
    closeCommandPalette,
  } = useSearchStore();

  // Mock data for demo
  const mockResults = createMockSearchResults(5);
  const mockCommands = createMockCommands(5);

  const handleSearch = (query: string) => {
    search(query);
  };

  const handleCommandExecute = async (command: any) => {
    const success = await executeCommand(command);
    console.log(
      `Command ${command.name} executed: ${success ? "success" : "failed"}`,
    );
    closeCommandPalette();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Todone Search Demo</h1>

      <div className="mb-4 flex space-x-2">
        <button
          onClick={() => setDemoMode("search")}
          className={`px-4 py-2 rounded ${demoMode === "search" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Search Bar
        </button>
        <button
          onClick={() => setDemoMode("commands")}
          className={`px-4 py-2 rounded ${demoMode === "commands" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Command Palette
        </button>
        <button
          onClick={() => setDemoMode("modal")}
          className={`px-4 py-2 rounded ${demoMode === "modal" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Search Modal
        </button>
        <button
          onClick={() => setDemoMode("header")}
          className={`px-4 py-2 rounded ${demoMode === "header" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Search Header
        </button>
      </div>

      <div className="mb-8 p-4 border border-gray-200 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Keyboard Shortcuts</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <span>Open Search</span>
            <kbd className="px-2 py-1 border border-gray-300 rounded bg-gray-100">
              Ctrl+F
            </kbd>
          </div>
          <div className="flex items-center justify-between">
            <span>Command Palette</span>
            <kbd className="px-2 py-1 border border-gray-300 rounded bg-gray-100">
              Ctrl+K
            </kbd>
          </div>
          <div className="flex items-center justify-between">
            <span>Navigate Down</span>
            <kbd className="px-2 py-1 border border-gray-300 rounded bg-gray-100">
              ↓
            </kbd>
          </div>
          <div className="flex items-center justify-between">
            <span>Navigate Up</span>
            <kbd className="px-2 py-1 border border-gray-300 rounded bg-gray-100">
              ↑
            </kbd>
          </div>
        </div>
      </div>

      {demoMode === "search" && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Search Bar Demo</h2>
          <div className="max-w-md">
            <SearchBar
              placeholder="Search tasks, projects, labels..."
              onSearch={handleSearch}
            />
            {results.length > 0 && (
              <div className="mt-2">
                <SearchResults results={results} />
              </div>
            )}
          </div>
        </div>
      )}

      {demoMode === "header" && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Search Header Demo</h2>
          <SearchHeader />
        </div>
      )}

      {demoMode === "modal" && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Search Modal Demo</h2>
          <button
            onClick={openSearchModal}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Open Search Modal
          </button>

          <SearchModal isOpen={isSearchModalOpen} onClose={closeSearchModal} />
        </div>
      )}

      {demoMode === "commands" && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Command Palette Demo</h2>
          <button
            onClick={() => {
              openCommandPaletteStore();
              openCommandPalette();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Open Command Palette
          </button>

          <CommandPalette
            isOpen={isCommandPaletteOpen}
            onClose={closeCommandPalette}
          />
        </div>
      )}

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Implementation Notes</h3>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Search functionality with autocomplete and real-time results</li>
          <li>Command palette with keyboard navigation and execution</li>
          <li>Global keyboard shortcuts (Ctrl+K, Ctrl+F)</li>
          <li>Search across tasks, projects, and labels</li>
          <li>State management with Zustand for search state</li>
          <li>Comprehensive testing utilities and mocks</li>
          <li>Responsive UI components with Tailwind CSS</li>
          <li>Accessibility features and keyboard navigation</li>
        </ul>
      </div>
    </div>
  );
};
