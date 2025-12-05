import { configureAxe } from "jest-axe";
import { vi } from "vitest";

// Configure axe for accessibility testing
export const axe = configureAxe({
  rules: {
    // Enable all WCAG 2.1 AA rules
    "color-contrast": { enabled: true },
    "aria-required-attr": { enabled: true },
    "aria-valid-attr": { enabled: true },
    "button-name": { enabled: true },
    bypass: { enabled: true },
    "html-has-lang": { enabled: true },
    "image-alt": { enabled: true },
    label: { enabled: true },
    "link-name": { enabled: true },
    "page-has-heading-one": { enabled: true },
    region: { enabled: true },
    "skip-link": { enabled: true },
    "table-fake-caption": { enabled: true },
    "td-has-header": { enabled: true },
    "th-has-data-cells": { enabled: true },
    "valid-lang": { enabled: true },
    "video-caption": { enabled: true },
    "frame-title": { enabled: true },
    "heading-order": { enabled: true },
    "html-lang-valid": { enabled: true },
    "landmark-one-main": { enabled: true },
    "landmark-unique": { enabled: true },
    list: { enabled: true },
    listitem: { enabled: true },
    "meta-viewport": { enabled: true },
    "object-alt": { enabled: true },
    "role-img-alt": { enabled: true },
    "scope-attr-valid": { enabled: true },
    "server-side-image-map": { enabled: true },
    "svg-img-alt": { enabled: true },
  },
});

// Mock screen reader APIs
export const mockScreenReaderAPI = () => {
  const mockAPI = {
    speak: vi.fn(),
    announce: vi.fn(),
    isRunning: vi.fn().mockReturnValue(true),
    setLanguage: vi.fn(),
    getCurrentLanguage: vi.fn().mockReturnValue("en"),
    pause: vi.fn(),
    resume: vi.fn(),
    stop: vi.fn(),
  };

  return mockAPI;
};

// Mock keyboard navigation utilities
export const mockKeyboardNavigation = () => {
  return {
    isKeyboardNavigationEnabled: vi.fn().mockReturnValue(true),
    getCurrentFocus: vi.fn().mockReturnValue(null),
    setFocus: vi.fn(),
    trapFocus: vi.fn(),
    releaseFocus: vi.fn(),
    getFocusableElements: vi.fn().mockReturnValue([]),
    handleTabKey: vi.fn(),
    handleEscapeKey: vi.fn(),
    handleArrowKeys: vi.fn(),
  };
};

// Mock reduced motion preferences
export const mockReducedMotion = () => {
  return {
    prefersReducedMotion: vi.fn().mockReturnValue(false),
    setReducedMotion: vi.fn(),
    getAnimationState: vi.fn().mockReturnValue("normal"),
    pauseAnimations: vi.fn(),
    resumeAnimations: vi.fn(),
  };
};

// Mock color contrast utilities
export const mockColorContrast = () => {
  return {
    checkContrastRatio: vi.fn().mockReturnValue(true),
    getContrastRatio: vi.fn().mockReturnValue(7.5),
    isAACompliant: vi.fn().mockReturnValue(true),
    isAAACompliant: vi.fn().mockReturnValue(false),
    suggestBetterColors: vi
      .fn()
      .mockReturnValue({ foreground: "#000000", background: "#FFFFFF" }),
  };
};

// Global accessibility test setup
export const setupAccessibilityTests = () => {
  // Mock matchMedia for prefers-reduced-motion
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query) => ({
      matches: query === "(prefers-reduced-motion: reduce)",
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // Mock screen reader detection
  Object.defineProperty(navigator, "userAgent", {
    value:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 NVDA/2021.1",
    configurable: true,
  });

  // Add accessibility helpers to window
  window.__accessibility__ = {
    screenReader: mockScreenReaderAPI(),
    keyboardNav: mockKeyboardNavigation(),
    reducedMotion: mockReducedMotion(),
    colorContrast: mockColorContrast(),
  };
};

// Cleanup after tests
export const cleanupAccessibilityTests = () => {
  delete window.__accessibility__;
  vi.restoreAllMocks();
};
