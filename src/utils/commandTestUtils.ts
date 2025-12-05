import { Command } from "../types/command";

export const createMockCommands = (count = 5): Command[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `command-${i}`,
    name: `Command ${i + 1}`,
    description: `Description for command ${i + 1}`,
    shortcut: i % 2 === 0 ? `Ctrl+${i + 1}` : undefined,
    action: () => Promise.resolve(true),
  }));
};

export const createMockCommandService = () => {
  const mockCommands: Command[] = [
    {
      id: "create-task",
      name: "Create New Task",
      description: "Create a new task",
      shortcut: "Ctrl+N",
      action: () => Promise.resolve(true),
    },
    {
      id: "search-tasks",
      name: "Search Tasks",
      description: "Search through all tasks",
      shortcut: "Ctrl+F",
      action: () => Promise.resolve(true),
    },
    {
      id: "show-help",
      name: "Show Help",
      description: "Show help documentation",
      shortcut: "Ctrl+/",
      action: () => Promise.resolve(true),
    },
    {
      id: "settings",
      name: "Open Settings",
      description: "Open application settings",
      action: () => Promise.resolve(true),
    },
    {
      id: "logout",
      name: "Logout",
      description: "Logout from the application",
      action: () => Promise.resolve(true),
    },
  ];

  return {
    getCommands: () => [...mockCommands],
    getCommandById: (id: string) => mockCommands.find((cmd) => cmd.id === id),
    addCommand: (command: Command) => {
      mockCommands.push(command);
    },
    removeCommand: (id: string) => {
      const index = mockCommands.findIndex((cmd) => cmd.id === id);
      if (index !== -1) {
        mockCommands.splice(index, 1);
        return true;
      }
      return false;
    },
    executeCommand: (command: Command) => command.action(),
    executeCommandById: (id: string) => {
      const command = mockCommands.find((cmd) => cmd.id === id);
      return command ? command.action() : Promise.resolve(false);
    },
    searchCommands: (query: string) => {
      if (!query || query.trim() === "") {
        return [...mockCommands];
      }

      const searchTerm = query.toLowerCase();
      return mockCommands.filter(
        (command) =>
          command.name.toLowerCase().includes(searchTerm) ||
          (command.description &&
            command.description.toLowerCase().includes(searchTerm)),
      );
    },
  };
};

export const createMockCommand = (overrides?: Partial<Command>): Command => {
  return {
    id: "test-command",
    name: "Test Command",
    description: "Test command description",
    action: () => Promise.resolve(true),
    ...overrides,
  };
};
