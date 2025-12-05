import { KeyboardShortcut } from "../types/keyboard";

/**
 * Generate mock keyboard shortcuts for testing
 */
export const generateMockShortcuts = (
  count: number = 5,
): KeyboardShortcut[] => {
  return Array.from({ length: count }, (_, i) => ({
    key: String.fromCharCode(97 + i), // a, b, c, etc.
    modifiers: i % 2 === 0 ? ["ctrl"] : [],
    description: `Mock shortcut ${i + 1}`,
    category: `Category ${(i % 3) + 1}`,
    action: jest.fn(),
  }));
};

/**
 * Create a mock keyboard event
 */
export const createMockKeyboardEvent = (
  key: string,
  modifiers: { ctrlKey?: boolean; shiftKey?: boolean; altKey?: boolean } = {},
): KeyboardEvent => {
  return {
    key,
    ctrlKey: modifiers.ctrlKey || false,
    shiftKey: modifiers.shiftKey || false,
    altKey: modifiers.altKey || false,
    metaKey: false,
    preventDefault: jest.fn(),
    stopPropagation: jest.fn(),
    target: document.createElement("div"),
  } as unknown as KeyboardEvent;
};

/**
 * Mock keyboard service for testing
 */
export class MockKeyboardService {
  private shortcuts: KeyboardShortcut[] = [];
  private executedActions: any[] = [];

  registerShortcut(shortcut: KeyboardShortcut) {
    this.shortcuts.push(shortcut);
  }

  unregisterShortcut(key: string, modifiers?: string[]) {
    this.shortcuts = this.shortcuts.filter(
      (s) =>
        !(
          s.key === key &&
          JSON.stringify(s.modifiers) === JSON.stringify(modifiers)
        ),
    );
  }

  executeShortcut(event: KeyboardEvent) {
    const matching = this.shortcuts.filter(
      (s) =>
        s.key === event.key &&
        JSON.stringify(s.modifiers) ===
          JSON.stringify(this.getModifiers(event)),
    );

    if (matching.length > 0) {
      matching[0].action(event);
      this.executedActions.push(matching[0]);
      return true;
    }
    return false;
  }

  getExecutedActions() {
    return this.executedActions;
  }

  getShortcuts() {
    return this.shortcuts;
  }

  private getModifiers(event: KeyboardEvent): string[] {
    const modifiers: string[] = [];
    if (event.ctrlKey || event.metaKey) modifiers.push("ctrl");
    if (event.shiftKey) modifiers.push("shift");
    if (event.altKey) modifiers.push("alt");
    return modifiers;
  }
}

/**
 * Test keyboard shortcut execution
 */
export const testShortcutExecution = async (
  service: any,
  event: KeyboardEvent,
  expectedShortcut?: KeyboardShortcut,
) => {
  const result = service.executeShortcut(event);

  if (expectedShortcut) {
    expect(result).toBe(true);
    // Add more specific assertions if needed
  } else {
    expect(result).toBe(false);
  }

  return result;
};
