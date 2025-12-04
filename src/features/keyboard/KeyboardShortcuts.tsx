import React, { useEffect, useCallback } from 'react';
import { useKeyboardShortcuts } from '../../../hooks/useKeyboardShortcuts';
import { KeyboardShortcut } from '../../../types/keyboard';

interface KeyboardShortcutsProps {
  children: React.ReactNode;
}

export const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ children }) => {
  const { registerShortcut, unregisterShortcut, executeShortcut } = useKeyboardShortcuts();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Check if the event target is an input, textarea, or contenteditable element
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      return;
    }

    // Find and execute matching shortcuts
    executeShortcut(event);
  }, [executeShortcut]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return <>{children}</>;
};