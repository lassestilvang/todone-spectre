import { Command } from "../types/command";

export const createCommand = (
  id: string,
  name: string,
  action: () => Promise<boolean>,
  options?: {
    description?: string;
    shortcut?: string;
  },
): Command => {
  return {
    id,
    name,
    description: options?.description,
    shortcut: options?.shortcut,
    action,
  };
};

export const validateCommand = (command: Command): boolean => {
  if (!command.id || typeof command.id !== "string") {
    return false;
  }

  if (!command.name || typeof command.name !== "string") {
    return false;
  }

  if (!command.action || typeof command.action !== "function") {
    return false;
  }

  return true;
};

export const parseCommandShortcut = (
  shortcut?: string,
): { key: string; modifiers: string[] } | null => {
  if (!shortcut) return null;

  const parts = shortcut.split("+");
  if (parts.length === 1) {
    return {
      key: parts[0].trim(),
      modifiers: [],
    };
  }

  const modifiers = parts.slice(0, -1).map((m) => m.trim());
  const key = parts[parts.length - 1].trim();

  return {
    key,
    modifiers,
  };
};

export const formatCommandForDisplay = (command: Command): string => {
  let display = command.name;

  if (command.shortcut) {
    display += ` (${command.shortcut})`;
  }

  if (command.description) {
    display += `: ${command.description}`;
  }

  return display;
};

export const getCommandSuggestions = (
  commands: Command[],
  query: string,
  limit = 5,
): Command[] => {
  if (!query || query.trim() === "") {
    return commands.slice(0, limit);
  }

  const searchTerm = query.toLowerCase();
  return commands
    .filter(
      (command) =>
        command.name.toLowerCase().includes(searchTerm) ||
        (command.description &&
          command.description.toLowerCase().includes(searchTerm)),
    )
    .slice(0, limit);
};
