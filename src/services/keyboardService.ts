import { KeyboardShortcut } from '../types/keyboard';

class KeyboardService {
  private shortcuts: KeyboardShortcut[] = [];
  private isHelpVisible = false;

  /**
   * Register a new keyboard shortcut
   * @param shortcut The keyboard shortcut to register
   */
  registerShortcut(shortcut: KeyboardShortcut): void {
    // Check if shortcut already exists
    const existingIndex = this.shortcuts.findIndex(
      s => s.key === shortcut.key && this.arraysEqual(s.modifiers, shortcut.modifiers)
    );

    if (existingIndex >= 0) {
      // Update existing shortcut
      this.shortcuts[existingIndex] = shortcut;
    } else {
      // Add new shortcut
      this.shortcuts.push(shortcut);
    }
  }

  /**
   * Unregister a keyboard shortcut
   * @param key The key to unregister
   * @param modifiers The modifiers to match
   */
  unregisterShortcut(key: string, modifiers?: string[]): void {
    this.shortcuts = this.shortcuts.filter(
      shortcut => !(shortcut.key === key && this.arraysEqual(shortcut.modifiers, modifiers))
    );
  }

  /**
   * Execute a shortcut based on keyboard event
   * @param event The keyboard event
   * @returns True if a shortcut was executed, false otherwise
   */
  executeShortcut(event: KeyboardEvent): boolean {
    const pressedModifiers = this.getPressedModifiers(event);
    const pressedKey = event.key.toLowerCase();

    // Find matching shortcuts
    const matchingShortcuts = this.shortcuts.filter(shortcut => {
      return (
        shortcut.key.toLowerCase() === pressedKey &&
        this.arraysEqual(shortcut.modifiers, pressedModifiers)
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
  }

  /**
   * Toggle help visibility
   */
  toggleHelp(): void {
    this.isHelpVisible = !this.isHelpVisible;
  }

  /**
   * Get current help visibility state
   */
  isHelpVisibleState(): boolean {
    return this.isHelpVisible;
  }

  /**
   * Get all registered shortcuts
   */
  getShortcuts(): KeyboardShortcut[] {
    return [...this.shortcuts];
  }

  /**
   * Get pressed modifiers from keyboard event
   * @param event The keyboard event
   * @returns Array of pressed modifier keys
   */
  private getPressedModifiers(event: KeyboardEvent): string[] {
    const modifiers: string[] = [];
    if (event.ctrlKey || event.metaKey) modifiers.push('ctrl');
    if (event.shiftKey) modifiers.push('shift');
    if (event.altKey) modifiers.push('alt');
    return modifiers;
  }

  /**
   * Compare two arrays for equality
   * @param a First array
   * @param b Second array
   * @returns True if arrays are equal
   */
  private arraysEqual(a: string[] = [], b: string[] = []): boolean {
    if (a.length !== b.length) return false;
    return a.every((val, idx) => val === b[idx]);
  }
}

// Singleton instance
const keyboardService = new KeyboardService();

export default keyboardService;