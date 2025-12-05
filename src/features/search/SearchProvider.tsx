import React, { useEffect } from "react";
import { useSearchStore } from "../../store/useSearchStore";
import { useSearch } from "../../hooks/useSearch";
import { useCommandPalette } from "../../hooks/useCommandPalette";
import { getCommandService } from "../../services/commandService";
import { getSearchService } from "../../services/searchService";
import { useTaskStore } from "../../store/useTaskStore";
import { useProjectStore } from "../../store/useProjectStore";
import { useLabelStore } from "../../store/useLabelStore";

interface SearchProviderProps {
  children: React.ReactNode;
}

export const SearchProvider: React.FC<SearchProviderProps> = ({ children }) => {
  const { setCommands, setSearchResults, setSearchQuery, clearSearch } =
    useSearchStore();

  const { search } = useSearch();
  const { commands, filteredCommands, searchCommands } = useCommandPalette();

  const tasks = useTaskStore((state) => state.tasks);
  const projects = useProjectStore((state) => state.projects);
  const labels = useLabelStore((state) => state.labels);

  // Initialize services with data
  useEffect(() => {
    const searchService = getSearchService();
    searchService.setData(tasks, projects, labels);

    const commandService = getCommandService();
    setCommands(commandService.getCommands());
  }, [tasks, projects, labels, setCommands]);

  // Sync search results with store
  useEffect(() => {
    if (useSearchStore.getState().query) {
      const results = search(useSearchStore.getState().query);
      setSearchResults(results);
    }
  }, [search, setSearchResults]);

  // Handle command search
  const handleCommandSearch = (query: string) => {
    const filtered = searchCommands(query);
    useSearchStore.getState().setFilteredCommands(filtered);
  };

  return <div className="search-provider">{children}</div>;
};
