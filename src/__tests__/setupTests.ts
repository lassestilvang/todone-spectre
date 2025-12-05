import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";
import {
  cleanupAccessibilityTests,
} from "./accessibility/accessibilitySetup";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock matchMedia for CSS tests
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
class ResizeObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

vi.stubGlobal("ResizeObserver", ResizeObserver);

// Mock IntersectionObserver
class IntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  root = null;
  rootMargin = "";
  thresholds = [];
  takeRecords = vi.fn();
}

vi.stubGlobal("IntersectionObserver", IntersectionObserver);

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

console.error = vi.fn((...args) => {
  // Only show errors that aren't from React act warnings
  if (
    !args[0]?.includes?.(
      "Warning: An update to %s inside a test was not wrapped in act",
    )
  ) {
    originalConsoleError(...args);
  }
});

console.warn = vi.fn((...args) => {
  // Only show warnings that aren't from React act warnings
  if (
    !args[0]?.includes?.(
      "Warning: An update to %s inside a test was not wrapped in act",
    )
  ) {
    originalConsoleWarn(...args);
  }
});

// Clean up after tests
afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  cleanupAccessibilityTests();
});
