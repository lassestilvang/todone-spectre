export interface Command {
  id: string;
  name: string;
  description?: string;
  shortcut?: string;
  action: () => Promise<boolean>;
}

export interface CommandPaletteState {
  isOpen: boolean;
  query: string;
  commands: Command[];
  filteredCommands: Command[];
  selectedIndex: number;
}
