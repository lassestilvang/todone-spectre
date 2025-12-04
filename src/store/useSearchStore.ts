import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { devtools } from 'zustand/middleware';
import { SearchResult, SearchState } from '../types/search';
import { Command } from '../types/command';

export interface SearchStoreState extends SearchState {
  isSearchModalOpen: boolean;
  isCommandPaletteOpen: boolean;
  commandHistory: string[];
  commands: Command[];
  filteredCommands: Command[];
  selectedCommandIndex: number;

  // Search modal methods
  openSearchModal: () => void;
  closeSearchModal: () => void;
  toggleSearchModal: () => void;

  // Command palette methods
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleCommandPalette: () => void;

  // Search methods
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: SearchResult[]) => void;
  clearSearch: () => void;

  // Command methods
  setCommands: (commands: Command[]) => void;
  addCommand: (command: Command) => void;
  removeCommand: (commandId: string) => void;
  setFilteredCommands: (commands: Command[]) => void;
  setSelectedCommandIndex: (index: number) => void;
  addToCommandHistory: (commandId: string) => void;
  clearCommandHistory: () => void;
  navigateCommands: (direction: 'up' | 'down') => void;
}

export const useSearchStore = create<SearchStoreState>()(
  devtools(
    persist(
      (set) => ({
        // Search state
        query: '',
        results: [],
        isLoading: false,
        error: null,

        // Modal state
        isSearchModalOpen: false,
        isCommandPaletteOpen: false,

        // Command state
        commandHistory: [],
        commands: [],
        filteredCommands: [],
        selectedCommandIndex: 0,

        // Search modal methods
        openSearchModal: () => {
          set({ isSearchModalOpen: true });
        },

        closeSearchModal: () => {
          set({
            isSearchModalOpen: false,
            query: '',
            results: [],
            error: null
          });
        },

        toggleSearchModal: () => {
          set((state) => ({
            isSearchModalOpen: !state.isSearchModalOpen,
            ...(!state.isSearchModalOpen && {
              query: '',
              results: [],
              error: null
            })
          }));
        },

        // Command palette methods
        openCommandPalette: () => {
          set({
            isCommandPaletteOpen: true,
            selectedCommandIndex: 0
          });
        },

        closeCommandPalette: () => {
          set({ isCommandPaletteOpen: false });
        },

        toggleCommandPalette: () => {
          set((state) => ({
            isCommandPaletteOpen: !state.isCommandPaletteOpen,
            ...(!state.isCommandPaletteOpen && {
              selectedCommandIndex: 0
            })
          }));
        },

        // Search methods
        setSearchQuery: (query: string) => {
          set({ query });
        },

        setSearchResults: (results: SearchResult[]) => {
          set({ results });
        },

        clearSearch: () => {
          set({
            query: '',
            results: [],
            error: null,
            isLoading: false
          });
        },

        // Command methods
        setCommands: (commands: Command[]) => {
          set({
            commands,
            filteredCommands: commands
          });
        },

        addCommand: (command: Command) => {
          set((state) => ({
            commands: [...state.commands, command],
            filteredCommands: [...state.filteredCommands, command]
          }));
        },

        removeCommand: (commandId: string) => {
          set((state) => ({
            commands: state.commands.filter(cmd => cmd.id !== commandId),
            filteredCommands: state.filteredCommands.filter(cmd => cmd.id !== commandId)
          }));
        },

        setFilteredCommands: (commands: Command[]) => {
          set({ filteredCommands: commands });
        },

        setSelectedCommandIndex: (index: number) => {
          set({ selectedCommandIndex: index });
        },

        addToCommandHistory: (commandId: string) => {
          set((state) => ({
            commandHistory: [...state.commandHistory, commandId]
          }));
        },

        clearCommandHistory: () => {
          set({ commandHistory: [] });
        },

        navigateCommands: (direction: 'up' | 'down') => {
          set((state) => {
            if (state.filteredCommands.length === 0) return {};

            if (direction === 'up') {
              return {
                selectedCommandIndex: Math.max(state.selectedCommandIndex - 1, 0)
              };
            } else {
              return {
                selectedCommandIndex: Math.min(
                  state.selectedCommandIndex + 1,
                  state.filteredCommands.length - 1
                )
              };
            }
          });
        }
      }),
      {
        name: 'todone-search-storage',
        storage: createJSONStorage(() => localStorage),
      }
    )
  )
);

// Helper function to create localStorage
const createJSONStorage = (getStorage: () => Storage) => ({
  getItem: (name: string) => {
    const storage = getStorage();
    const item = storage.getItem(name);
    return item ? JSON.parse(item) : null;
  },
  setItem: (name: string, value: any) => {
    const storage = getStorage();
    storage.setItem(name, JSON.stringify(value));
  },
  removeItem: (name: string) => {
    const storage = getStorage();
    storage.removeItem(name);
  },
});