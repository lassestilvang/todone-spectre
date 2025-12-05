import { accessibilityUtils } from "../utils/accessibilityUtils";
import { accessibilityConfigUtils } from "../utils/accessibilityConfigUtils";

interface AccessibilityState {
  isHighContrast: boolean;
  fontSize: string;
  reduceMotion: boolean;
  screenReaderEnabled: boolean;
  keyboardNavigation: boolean;
  features: string[];
  lastUpdated: Date;
}

interface AccessibilityPreferences {
  preferredContrast: "default" | "high" | "auto";
  preferredFontSize: "small" | "medium" | "large" | "xlarge" | "auto";
  preferredMotion: "default" | "reduced" | "auto";
  preferredScreenReader: boolean;
  preferredKeyboardNavigation: boolean;
}

interface AccessibilityFeature {
  id: string;
  name: string;
  description: string;
  isEnabled: boolean;
  category: "visual" | "motion" | "navigation" | "assistive";
}

class AccessibilityService {
  private state: AccessibilityState;
  private preferences: AccessibilityPreferences;
  private availableFeatures: AccessibilityFeature[];
  private storageKey: string;

  constructor() {
    this.storageKey = "todone-accessibility-state";
    this.state = this.loadState();
    this.preferences = this.loadPreferences();
    this.availableFeatures = this.initializeAvailableFeatures();
  }

  private initializeAvailableFeatures(): AccessibilityFeature[] {
    return [
      {
        id: "high-contrast",
        name: "High Contrast",
        description: "Increases color contrast for better visibility",
        isEnabled: false,
        category: "visual",
      },
      {
        id: "custom-font-size",
        name: "Custom Font Size",
        description: "Adjusts text size for better readability",
        isEnabled: false,
        category: "visual",
      },
      {
        id: "reduce-motion",
        name: "Reduce Motion",
        description: "Reduces animations and motion effects",
        isEnabled: false,
        category: "motion",
      },
      {
        id: "screen-reader",
        name: "Screen Reader Support",
        description: "Enhances compatibility with screen readers",
        isEnabled: false,
        category: "assistive",
      },
      {
        id: "keyboard-navigation",
        name: "Keyboard Navigation",
        description: "Improves keyboard-only navigation experience",
        isEnabled: false,
        category: "navigation",
      },
    ];
  }

  private loadState(): AccessibilityState {
    try {
      const savedState = localStorage.getItem(this.storageKey);
      if (savedState) {
        const parsed = JSON.parse(savedState);
        return {
          isHighContrast: parsed.isHighContrast || false,
          fontSize: parsed.fontSize || "medium",
          reduceMotion: parsed.reduceMotion || false,
          screenReaderEnabled: parsed.screenReaderEnabled || false,
          keyboardNavigation: parsed.keyboardNavigation || false,
          features: parsed.features || [],
          lastUpdated: new Date(parsed.lastUpdated) || new Date(),
        };
      }
    } catch (error) {
      console.error("Failed to load accessibility state:", error);
    }

    return {
      isHighContrast: false,
      fontSize: "medium",
      reduceMotion: false,
      screenReaderEnabled: false,
      keyboardNavigation: false,
      features: [],
      lastUpdated: new Date(),
    };
  }

  private saveState(state: AccessibilityState): void {
    try {
      const stateToSave = {
        ...state,
        lastUpdated: state.lastUpdated.toISOString(),
      };
      localStorage.setItem(this.storageKey, JSON.stringify(stateToSave));
    } catch (error) {
      console.error("Failed to save accessibility state:", error);
    }
  }

  private loadPreferences(): AccessibilityPreferences {
    try {
      const savedPrefs = localStorage.getItem(
        "todone-accessibility-preferences",
      );
      if (savedPrefs) {
        return JSON.parse(savedPrefs);
      }
    } catch (error) {
      console.error("Failed to load accessibility preferences:", error);
    }

    return {
      preferredContrast: "auto",
      preferredFontSize: "auto",
      preferredMotion: "auto",
      preferredScreenReader: false,
      preferredKeyboardNavigation: false,
    };
  }

  private savePreferences(preferences: AccessibilityPreferences): void {
    try {
      localStorage.setItem(
        "todone-accessibility-preferences",
        JSON.stringify(preferences),
      );
    } catch (error) {
      console.error("Failed to save accessibility preferences:", error);
    }
  }

  getCurrentState(): AccessibilityState {
    return { ...this.state };
  }

  getCurrentPreferences(): AccessibilityPreferences {
    return { ...this.preferences };
  }

  updateState(newState: Partial<AccessibilityState>): void {
    this.state = { ...this.state, ...newState, lastUpdated: new Date() };
    this.saveState(this.state);
  }

  updatePreferences(newPreferences: Partial<AccessibilityPreferences>): void {
    this.preferences = { ...this.preferences, ...newPreferences };
    this.savePreferences(this.preferences);
  }

  toggleHighContrast(): void {
    const newValue = !this.state.isHighContrast;
    this.updateState({ isHighContrast: newValue });
    this.updatePreferences({
      preferredContrast: newValue ? "high" : "default",
    });

    if (newValue) {
      document.body.classList.add("high-contrast-mode");
    } else {
      document.body.classList.remove("high-contrast-mode");
    }
  }

  setFontSize(size: string): void {
    const validSizes = ["small", "medium", "large", "xlarge"];
    if (validSizes.includes(size)) {
      this.updateState({ fontSize: size });
      this.updatePreferences({ preferredFontSize: size as any });

      // Apply font size to document
      document.documentElement.style.setProperty(
        "--base-font-size",
        accessibilityUtils.getFontSizeValue(size),
      );
    }
  }

  toggleReduceMotion(): void {
    const newValue = !this.state.reduceMotion;
    this.updateState({ reduceMotion: newValue });
    this.updatePreferences({
      preferredMotion: newValue ? "reduced" : "default",
    });

    if (newValue) {
      document.body.classList.add("reduce-motion");
    } else {
      document.body.classList.remove("reduce-motion");
    }
  }

  toggleScreenReaderSupport(enabled: boolean): void {
    this.updateState({ screenReaderEnabled: enabled });
    this.updatePreferences({ preferredScreenReader: enabled });

    if (enabled) {
      document.body.setAttribute("aria-live", "polite");
      document.body.classList.add("screen-reader-enhanced");
    } else {
      document.body.removeAttribute("aria-live");
      document.body.classList.remove("screen-reader-enhanced");
    }
  }

  toggleKeyboardNavigation(enabled: boolean): void {
    this.updateState({ keyboardNavigation: enabled });
    this.updatePreferences({ preferredKeyboardNavigation: enabled });

    if (enabled) {
      document.body.classList.add("keyboard-navigation-enhanced");
    } else {
      document.body.classList.remove("keyboard-navigation-enhanced");
    }
  }

  addFeature(featureId: string): void {
    if (!this.state.features.includes(featureId)) {
      this.updateState({ features: [...this.state.features, featureId] });
    }
  }

  removeFeature(featureId: string): void {
    this.updateState({
      features: this.state.features.filter((f) => f !== featureId),
    });
  }

  getAvailableFeatures(): AccessibilityFeature[] {
    return this.availableFeatures.map((feature) => ({
      ...feature,
      isEnabled: this.state.features.includes(feature.id),
    }));
  }

  applySystemPreferences(): void {
    // Check for system preferences (browser/OS level)
    const systemPrefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const systemPrefersContrast = window.matchMedia(
      "(prefers-contrast: more)",
    ).matches;

    if (
      this.preferences.preferredContrast === "auto" &&
      systemPrefersContrast
    ) {
      this.updateState({ isHighContrast: true });
    }

    if (
      this.preferences.preferredMotion === "auto" &&
      systemPrefersReducedMotion
    ) {
      this.updateState({ reduceMotion: true });
    }
  }

  resetToDefaults(): void {
    this.updateState({
      isHighContrast: false,
      fontSize: "medium",
      reduceMotion: false,
      screenReaderEnabled: false,
      keyboardNavigation: false,
      features: [],
      lastUpdated: new Date(),
    });

    this.updatePreferences({
      preferredContrast: "auto",
      preferredFontSize: "auto",
      preferredMotion: "auto",
      preferredScreenReader: false,
      preferredKeyboardNavigation: false,
    });

    // Reset DOM changes
    document.body.classList.remove(
      "high-contrast-mode",
      "reduce-motion",
      "screen-reader-enhanced",
      "keyboard-navigation-enhanced",
    );
    document.body.removeAttribute("aria-live");
    document.documentElement.style.removeProperty("--base-font-size");
  }

  getAccessibilityScore(): number {
    // Calculate accessibility score based on enabled features
    let score = 0;

    if (this.state.isHighContrast) score += 20;
    if (this.state.reduceMotion) score += 15;
    if (this.state.screenReaderEnabled) score += 25;
    if (this.state.keyboardNavigation) score += 20;
    if (this.state.fontSize !== "medium") score += 10;
    if (this.state.features.length > 0) score += 10;

    // Cap at 100
    return Math.min(100, score);
  }

  getAccessibilityStatus(): { level: string; message: string; score: number } {
    const score = this.getAccessibilityScore();

    if (score >= 80) {
      return {
        level: "excellent",
        message: "Excellent accessibility support enabled",
        score,
      };
    } else if (score >= 50) {
      return {
        level: "good",
        message: "Good accessibility support enabled",
        score,
      };
    } else if (score >= 20) {
      return {
        level: "basic",
        message: "Basic accessibility support enabled",
        score,
      };
    } else {
      return {
        level: "minimal",
        message: "Minimal accessibility support",
        score,
      };
    }
  }
}

// Singleton instance
const accessibilityServiceInstance = new AccessibilityService();

export const accessibilityService = {
  ...accessibilityServiceInstance,

  // Static methods for convenience
  getInstance: () => accessibilityServiceInstance,
  initialize: () => {
    accessibilityServiceInstance.applySystemPreferences();
    return accessibilityServiceInstance;
  },
};

export type {
  AccessibilityState,
  AccessibilityPreferences,
  AccessibilityFeature,
};
