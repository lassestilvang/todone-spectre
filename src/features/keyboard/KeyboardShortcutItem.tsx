import React from "react";
import { KeyboardShortcut } from "../../types/keyboard";

interface KeyboardShortcutItemProps {
  shortcut: KeyboardShortcut;
}

export const KeyboardShortcutItem: React.FC<KeyboardShortcutItemProps> = ({
  shortcut,
}) => {
  const formatModifiers = (modifiers: string[] = []) => {
    return modifiers
      .map((mod) => {
        switch (mod.toLowerCase()) {
          case "ctrl":
            return "Ctrl";
          case "shift":
            return "Shift";
          case "alt":
            return "Alt";
          case "meta":
            return "Cmd";
          default:
            return mod;
        }
      })
      .join(" + ");
  };

  const formatKey = (key: string) => {
    // Handle special keys
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

  return (
    <div className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
      <div className="flex-1">
        <div className="font-medium text-gray-900 dark:text-white">
          {shortcut.description}
        </div>
        {shortcut.category && (
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {shortcut.category}
          </div>
        )}
      </div>
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          {shortcut.modifiers && shortcut.modifiers.length > 0 && (
            <>
              {shortcut.modifiers.map((modifier, index) => (
                <kbd
                  key={`${modifier}-${index}`}
                  className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs font-medium rounded"
                >
                  {modifier === "meta"
                    ? "⌘"
                    : modifier === "ctrl"
                      ? "Ctrl"
                      : modifier}
                </kbd>
              ))}
              <span className="text-gray-400">+</span>
            </>
          )}
          <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200 text-xs font-medium rounded">
            {formatKey(shortcut.key)}
          </kbd>
        </div>
      </div>
    </div>
  );
};
