import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { KeyboardShortcut, KeyboardContextType } from '../../types/keyboard';

interface KeyboardProviderProps {
  children: ReactNode;
}

const KeyboardContext = createContext<KeyboardContextType | undefined>(undefined);

export const KeyboardProvider: React.FC<KeyboardProviderProps> = ({ children }) => {
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([]);
  const [isHelpVisible, setIsHelpVisible] = useState<boolean>(false);

  const registerShortcut = useCallback((shortcut: KeyboardShortcut) => {
    setShortcuts(prevShortcuts => {
      // Check if shortcut already exists
      const existingIndex = prevShortcuts.findIndex(
        s => s.key === shortcut.key && s.modifiers === shortcut.modifiers
      );

      if (existingIndex >= 0) {
        // Update existing shortcut
        const newShortcuts = [...prevShortcuts];
        newShortcuts[existingIndex] = shortcut;
        return newShortcuts;
      } else {
        // Add new shortcut
        return [...prevShortcuts, shortcut];
      }
    });
  }, []);

  const unregisterShortcut = useCallback((key: string, modifiers?: string[]) => {
    setShortcuts(prevShortcuts =>
      prevShortcuts.filter(
        shortcut => !(shortcut.key === key && arraysEqual(shortcut.modifiers, modifiers))
      )
    );
  }, []);

  const executeShortcut = useCallback((event: KeyboardEvent) => {
    const pressedModifiers = getPressedModifiers(event);
    const pressedKey = event.key.toLowerCase();

    // Find matching shortcuts
    const matchingShortcuts = shortcuts.filter(shortcut => {
      return (
        shortcut.key.toLowerCase() === pressedKey &&
        arraysEqual(shortcut.modifiers, pressedModifiers)
      );
    });

    // Execute the first matching shortcut
    if (matchingShortcuts.length > 0) {
      matchingShortcuts[0].action(event);
      event.preventDefault();
      event.stopPropagation();
      return true;
    }

    return false;
  }, [shortcuts]);

  const toggleHelp = useCallback(() => {
    setIsHelpVisible(prev => !prev);
  }, []);

  const getPressedModifiers = (event: KeyboardEvent): string[] => {
    const modifiers: string[] = [];
    if (event.ctrlKey || event.metaKey) modifiers.push('ctrl');
    if (event.shiftKey) modifiers.push('shift');
    if (event.altKey) modifiers.push('alt');
    return modifiers;
  };

  const arraysEqual = (a: string[] = [], b: string[] = []): boolean => {
    if (a.length !== b.length) return false;
    return a.every((val, idx) => val === b[idx]);
  };

  const value = {
    shortcuts,
    isHelpVisible,
    registerShortcut,
    unregisterShortcut,
    executeShortcut,
    toggleHelp,
  };

  return (
    <KeyboardContext.Provider value={value}>
      {children}
    </KeyboardContext.Provider>
  );
};

export const useKeyboardContext = () => {
  const context = useContext(KeyboardContext);
  if (context === undefined) {
    throw new Error('useKeyboardContext must be used within a KeyboardProvider');
  }
  return context;
};