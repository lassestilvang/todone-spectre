export interface KeyboardShortcut {
  key: string;
  modifiers?: string[];
  description: string;
  category?: string;
  action: (event: KeyboardEvent) => void;
}

export interface KeyboardContextType {
  shortcuts: KeyboardShortcut[];
  isHelpVisible: boolean;
  registerShortcut: (shortcut: KeyboardShortcut) => void;
  unregisterShortcut: (key: string, modifiers?: string[]) => void;
  executeShortcut: (event: KeyboardEvent) => boolean;
  toggleHelp: () => void;
}