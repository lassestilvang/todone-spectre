import { KeyboardShortcut } from "../types/keyboard";

/**
 * Format a keyboard shortcut for display
 * @param shortcut The keyboard shortcut to format
 * @returns Formatted string representation
 */
export const formatShortcut = (shortcut: KeyboardShortcut): string => {
  const formatModifiers = (modifiers: string[] = []) => {
    return modifiers
      .map((mod) => {
        switch (mod.toLowerCase()) {
          case "ctrl":
            return "Ctrl";
          case "meta":
            return "⌘";
          case "shift":
            return "Shift";
          case "alt":
            return "Alt";
          default:
            return mod;
        }
      })
      .join(" + ");
  };

  const formatKey = (key: string) => {
    switch (key.toLowerCase()) {
      case " ":
        return "Space";
      case "escape":
        return "Esc";
      case "arrowup":
        return "↑";
      case "arrowdown":
        return "↓";
      case "arrowleft":
        return "←";
      case "arrowright":
        return "→";
      default:
        return key;
    }
  };

  const modifiersText = formatModifiers(shortcut.modifiers);
  const keyText = formatKey(shortcut.key);

  if (modifiersText) {
    return `${modifiersText} + ${keyText}`;
  }
  return keyText;
};

/**
 * Check if a keyboard event matches a shortcut
 * @param event The keyboard event
 * @param shortcut The shortcut to check against
 * @returns True if the event matches the shortcut
 */
export const isShortcutMatch = (
  event: KeyboardEvent,
  shortcut: KeyboardShortcut,
): boolean => {
  // Check key match
  if (event.key.toLowerCase() !== shortcut.key.toLowerCase()) {
    return false;
  }

  // Check modifiers
  const eventModifiers = getEventModifiers(event);
  if (!arraysEqual(eventModifiers, shortcut.modifiers)) {
    return false;
  }

  return true;
};

/**
 * Get modifiers from keyboard event
 * @param event The keyboard event
 * @returns Array of modifier keys
 */
export const getEventModifiers = (event: KeyboardEvent): string[] => {
  const modifiers: string[] = [];
  if (event.ctrlKey || event.metaKey) modifiers.push("ctrl");
  if (event.shiftKey) modifiers.push("shift");
  if (event.altKey) modifiers.push("alt");
  return modifiers;
};

/**
 * Compare two arrays for equality
 * @param a First array
 * @param b Second array
 * @returns True if arrays are equal
 */
export const arraysEqual = (a: string[] = [], b: string[] = []): boolean => {
  if (a.length !== b.length) return false;
  return a.every((val, idx) => val === b[idx]);
};

/**
 * Check if event target is an input element
 * @param event The keyboard event
 * @returns True if target is an input element
 */
export const isInputTarget = (event: KeyboardEvent): boolean => {
  const target = event.target as HTMLElement;
  return (
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.isContentEditable
  );
};

/**
 * Default keyboard shortcuts configuration
 */
export const DEFAULT_SHORTCUTS: KeyboardShortcut[] = [
  {
    key: "f",
    modifiers: ["ctrl"],
    description: "Open search",
    category: "Navigation",
    action: () => console.log("Search opened"),
  },
  {
    key: "k",
    modifiers: ["ctrl"],
    description: "Open command palette",
    category: "Navigation",
    action: () => console.log("Command palette opened"),
  },
  {
    key: "Escape",
    modifiers: [],
    description: "Close modal/dialog",
    category: "Navigation",
    action: () => console.log("Modal closed"),
  },
  {
    key: "n",
    modifiers: ["ctrl"],
    description: "Create new task",
    category: "Task Management",
    action: () => console.log("New task created"),
  },
  {
    key: "t",
    modifiers: ["ctrl"],
    description: "Toggle task completion",
    category: "Task Management",
    action: () => console.log("Task toggled"),
  },
];
