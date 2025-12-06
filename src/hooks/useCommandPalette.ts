// @ts-nocheck
import { useState, useEffect } from "react";
import { Command } from "../types/command";
import { getCommandService } from "../services/commandService";

export const useCommandPalette = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [commands, setCommands] = useState<Command[]>([]);
  const [filteredCommands, setFilteredCommands] = useState<Command[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const commandService = getCommandService();

  // Initialize commands
  useEffect(() => {
    setCommands(commandService.getCommands());
    setFilteredCommands(commandService.getCommands());
  }, []);

  const openCommandPalette = () => {
    setIsOpen(true);
    setQuery("");
    setSelectedIndex(0);
    setFilteredCommands(commands);
  };

  const closeCommandPalette = () => {
    setIsOpen(false);
  };

  const toggleCommandPalette = () => {
    setIsOpen(!isOpen);
  };

  const executeCommand = (command: Command): Promise<boolean> => {
    return commandService.executeCommand(command);
  };

  const executeCommandById = (id: string): Promise<boolean> => {
    return commandService.executeCommandById(id);
  };

  const searchCommands = (searchQuery: string) => {
    setQuery(searchQuery);
    const filtered = commandService.searchCommands(searchQuery);
    setFilteredCommands(filtered);
    setSelectedIndex(0);
  };

  const navigateCommands = (direction: "up" | "down") => {
    setSelectedIndex((prev) => {
      if (direction === "up") {
        return Math.max(prev - 1, 0);
      } else {
        return Math.min(prev + 1, filteredCommands.length - 1);
      }
    });
  };

  const selectCurrentCommand = () => {
    if (filteredCommands.length > 0 && selectedIndex >= 0) {
      return executeCommand(filteredCommands[selectedIndex]);
    }
    return Promise.resolve(false);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        openCommandPalette();
      } else if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        closeCommandPalette();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return {
    isOpen,
    query,
    commands,
    filteredCommands,
    selectedIndex,
    openCommandPalette,
    closeCommandPalette,
    toggleCommandPalette,
    executeCommand,
    executeCommandById,
    searchCommands,
    navigateCommands,
    selectCurrentCommand,
  };
};
