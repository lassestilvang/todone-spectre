import {
  AccessibilityFeature,
  AccessibilityState,
} from "../../../services/accessibilityService";
import { AccessibilityConfig } from "../../../services/accessibilityConfigService";

interface AccessibilityTestData {
  mockState: AccessibilityState;
  mockConfig: AccessibilityConfig;
  mockFeatures: AccessibilityFeature[];
  testScenarios: {
    highContrast: boolean;
    fontSize: string;
    reduceMotion: boolean;
    screenReader: boolean;
    keyboardNavigation: boolean;
  }[];
}

interface AccessibilityTestUtils {
  generateTestData: () => AccessibilityTestData;
  createMockAccessibilityState: (
    overrides?: Partial<AccessibilityState>,
  ) => AccessibilityState;
  createMockAccessibilityConfig: (
    overrides?: Partial<AccessibilityConfig>,
  ) => AccessibilityConfig;
  createMockAccessibilityFeature: (
    overrides?: Partial<AccessibilityFeature>,
  ) => AccessibilityFeature;
  generateTestScenarios: (count: number) => AccessibilityTestData;
  validateAccessibilityState: (state: AccessibilityState) => {
    isValid: boolean;
    errors: string[];
  };
  validateAccessibilityConfig: (config: AccessibilityConfig) => {
    isValid: boolean;
    errors: string[];
  };
  createAccessibilityTestContext: () => {
    state: AccessibilityState;
    config: AccessibilityConfig;
    features: AccessibilityFeature[];
  };
  generatePerformanceTestData: (
    size: "small" | "medium" | "large",
  ) => AccessibilityTestData;
  createAccessibilityServiceMock: () => {
    getCurrentState: () => AccessibilityState;
    getCurrentPreferences: () => any;
    updateState: (state: Partial<AccessibilityState>) => void;
    updatePreferences: (preferences: any) => void;
    toggleHighContrast: () => void;
    setFontSize: (size: string) => void;
    toggleReduceMotion: () => void;
    toggleScreenReaderSupport: (enabled: boolean) => void;
    toggleKeyboardNavigation: (enabled: boolean) => void;
    addFeature: (featureId: string) => void;
    removeFeature: (featureId: string) => void;
    resetToDefaults: () => void;
    getAccessibilityStatus: () => {
      level: string;
      message: string;
      score: number;
    };
    applySystemPreferences: () => void;
  };
  createAccessibilityConfigServiceMock: () => {
    getConfig: () => AccessibilityConfig;
    updateConfig: (config: Partial<AccessibilityConfig>, options?: any) => void;
    resetToDefaults: () => void;
    getFeatureDefault: (featureId: string) => boolean;
    setFeatureDefault: (featureId: string, value: boolean) => void;
    validateConfig: (config: Partial<AccessibilityConfig>) => {
      isValid: boolean;
      errors: string[];
    };
    getConfigSummary: () => string;
    exportConfig: () => string;
    importConfig: (configString: string) => {
      success: boolean;
      error?: string;
    };
    getThemeCompatibility: () => { darkMode: boolean; lightMode: boolean };
    setThemeCompatibility: (darkMode: boolean, lightMode: boolean) => void;
    getNotificationPreferences: () => { tips: boolean; suggestions: boolean };
    setNotificationPreferences: (tips: boolean, suggestions: boolean) => void;
    applyConfigToDOM: () => void;
  };
}

const accessibilityTestUtils: AccessibilityTestUtils = {
  generateTestData: (): AccessibilityTestData => {
    return {
      mockState: this.createMockAccessibilityState(),
      mockConfig: this.createMockAccessibilityConfig(),
      mockFeatures: [
        this.createMockAccessibilityFeature({
          id: "high-contrast",
          name: "High Contrast",
          isEnabled: true,
        }),
        this.createMockAccessibilityFeature({
          id: "reduce-motion",
          name: "Reduce Motion",
          isEnabled: false,
        }),
        this.createMockAccessibilityFeature({
          id: "screen-reader",
          name: "Screen Reader",
          isEnabled: true,
        }),
      ],
      testScenarios: [
        {
          highContrast: true,
          fontSize: "large",
          reduceMotion: false,
          screenReader: true,
          keyboardNavigation: true,
        },
        {
          highContrast: false,
          fontSize: "medium",
          reduceMotion: true,
          screenReader: false,
          keyboardNavigation: false,
        },
        {
          highContrast: true,
          fontSize: "xlarge",
          reduceMotion: true,
          screenReader: true,
          keyboardNavigation: true,
        },
      ],
    };
  },

  createMockAccessibilityState: (
    overrides: Partial<AccessibilityState> = {},
  ): AccessibilityState => {
    return {
      isHighContrast: false,
      fontSize: "medium",
      reduceMotion: false,
      screenReaderEnabled: false,
      keyboardNavigation: false,
      features: [],
      lastUpdated: new Date(),
      ...overrides,
    };
  },

  createMockAccessibilityConfig: (
    overrides: Partial<AccessibilityConfig> = {},
  ): AccessibilityConfig => {
    return {
      defaultHighContrast: false,
      defaultFontSize: "medium",
      defaultReduceMotion: false,
      defaultScreenReader: false,
      defaultKeyboardNavigation: false,
      autoApply: true,
      persistSettings: true,
      featureDefaults: {
        "high-contrast": false,
        "custom-font-size": false,
        "reduce-motion": false,
        "screen-reader": false,
        "keyboard-navigation": false,
      },
      themePreferences: {
        darkModeCompatible: true,
        lightModeCompatible: true,
      },
      notificationPreferences: {
        showAccessibilityTips: true,
        showFeatureSuggestions: true,
      },
      ...overrides,
    };
  },

  createMockAccessibilityFeature: (
    overrides: Partial<AccessibilityFeature> = {},
  ): AccessibilityFeature => {
    return {
      id: "test-feature",
      name: "Test Feature",
      description: "Test accessibility feature",
      isEnabled: false,
      category: "visual",
      ...overrides,
    };
  },

  generateTestScenarios: (count: number): AccessibilityTestData => {
    const scenarios: AccessibilityTestData["testScenarios"] = [];
    const fontSizes = ["small", "medium", "large", "xlarge"];

    for (let i = 0; i < count; i++) {
      scenarios.push({
        highContrast: Math.random() > 0.5,
        fontSize: fontSizes[Math.floor(Math.random() * fontSizes.length)],
        reduceMotion: Math.random() > 0.5,
        screenReader: Math.random() > 0.5,
        keyboardNavigation: Math.random() > 0.5,
      });
    }

    return {
      mockState: this.createMockAccessibilityState(),
      mockConfig: this.createMockAccessibilityConfig(),
      mockFeatures: [
        this.createMockAccessibilityFeature({
          id: "test-1",
          name: "Test 1",
          isEnabled: true,
        }),
        this.createMockAccessibilityFeature({
          id: "test-2",
          name: "Test 2",
          isEnabled: false,
        }),
      ],
      testScenarios: scenarios,
    };
  },

  validateAccessibilityState: (
    state: AccessibilityState,
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const validFontSizes = ["small", "medium", "large", "xlarge"];

    if (typeof state.isHighContrast !== "boolean") {
      errors.push("isHighContrast must be a boolean");
    }

    if (!validFontSizes.includes(state.fontSize)) {
      errors.push(`fontSize must be one of: ${validFontSizes.join(", ")}`);
    }

    if (typeof state.reduceMotion !== "boolean") {
      errors.push("reduceMotion must be a boolean");
    }

    if (typeof state.screenReaderEnabled !== "boolean") {
      errors.push("screenReaderEnabled must be a boolean");
    }

    if (typeof state.keyboardNavigation !== "boolean") {
      errors.push("keyboardNavigation must be a boolean");
    }

    if (!Array.isArray(state.features)) {
      errors.push("features must be an array");
    }

    if (!(state.lastUpdated instanceof Date)) {
      errors.push("lastUpdated must be a Date");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  validateAccessibilityConfig: (
    config: AccessibilityConfig,
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const validFontSizes = ["small", "medium", "large", "xlarge"];

    if (typeof config.defaultHighContrast !== "boolean") {
      errors.push("defaultHighContrast must be a boolean");
    }

    if (!validFontSizes.includes(config.defaultFontSize)) {
      errors.push(
        `defaultFontSize must be one of: ${validFontSizes.join(", ")}`,
      );
    }

    if (typeof config.defaultReduceMotion !== "boolean") {
      errors.push("defaultReduceMotion must be a boolean");
    }

    if (typeof config.defaultScreenReader !== "boolean") {
      errors.push("defaultScreenReader must be a boolean");
    }

    if (typeof config.defaultKeyboardNavigation !== "boolean") {
      errors.push("defaultKeyboardNavigation must be a boolean");
    }

    if (typeof config.autoApply !== "boolean") {
      errors.push("autoApply must be a boolean");
    }

    if (typeof config.persistSettings !== "boolean") {
      errors.push("persistSettings must be a boolean");
    }

    if (!config.featureDefaults || typeof config.featureDefaults !== "object") {
      errors.push("featureDefaults must be an object");
    }

    if (
      !config.themePreferences ||
      typeof config.themePreferences !== "object"
    ) {
      errors.push("themePreferences must be an object");
    }

    if (
      !config.notificationPreferences ||
      typeof config.notificationPreferences !== "object"
    ) {
      errors.push("notificationPreferences must be an object");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  createAccessibilityTestContext: (): {
    state: AccessibilityState;
    config: AccessibilityConfig;
    features: AccessibilityFeature[];
  } => {
    return {
      state: this.createMockAccessibilityState({
        isHighContrast: true,
        fontSize: "large",
        features: ["high-contrast", "screen-reader"],
      }),
      config: this.createMockAccessibilityConfig({
        defaultHighContrast: true,
        defaultFontSize: "large",
        featureDefaults: {
          "high-contrast": true,
          "screen-reader": true,
        },
      }),
      features: [
        this.createMockAccessibilityFeature({
          id: "high-contrast",
          name: "High Contrast",
          isEnabled: true,
        }),
        this.createMockAccessibilityFeature({
          id: "screen-reader",
          name: "Screen Reader",
          isEnabled: true,
        }),
      ],
    };
  },

  generatePerformanceTestData: (
    size: "small" | "medium" | "large",
  ): AccessibilityTestData => {
    const counts = { small: 5, medium: 20, large: 100 };
    const count = counts[size] || 20;

    return this.generateTestScenarios(count);
  },

  createAccessibilityServiceMock: (): ReturnType<
    AccessibilityTestUtils["createAccessibilityServiceMock"]
  > => {
    let state: AccessibilityState = this.createMockAccessibilityState();
    let preferences: any = {
      preferredContrast: "auto",
      preferredFontSize: "auto",
      preferredMotion: "auto",
      preferredScreenReader: false,
      preferredKeyboardNavigation: false,
    };

    return {
      getCurrentState: () => ({ ...state }),
      getCurrentPreferences: () => ({ ...preferences }),
      updateState: (update: Partial<AccessibilityState>) => {
        state = { ...state, ...update, lastUpdated: new Date() };
      },
      updatePreferences: (update: any) => {
        preferences = { ...preferences, ...update };
      },
      toggleHighContrast: () => {
        state = {
          ...state,
          isHighContrast: !state.isHighContrast,
          lastUpdated: new Date(),
        };
      },
      setFontSize: (size: string) => {
        state = { ...state, fontSize: size, lastUpdated: new Date() };
      },
      toggleReduceMotion: () => {
        state = {
          ...state,
          reduceMotion: !state.reduceMotion,
          lastUpdated: new Date(),
        };
      },
      toggleScreenReaderSupport: (enabled: boolean) => {
        state = {
          ...state,
          screenReaderEnabled: enabled,
          lastUpdated: new Date(),
        };
      },
      toggleKeyboardNavigation: (enabled: boolean) => {
        state = {
          ...state,
          keyboardNavigation: enabled,
          lastUpdated: new Date(),
        };
      },
      addFeature: (featureId: string) => {
        if (!state.features.includes(featureId)) {
          state = {
            ...state,
            features: [...state.features, featureId],
            lastUpdated: new Date(),
          };
        }
      },
      removeFeature: (featureId: string) => {
        state = {
          ...state,
          features: state.features.filter((f) => f !== featureId),
          lastUpdated: new Date(),
        };
      },
      resetToDefaults: () => {
        state = this.createMockAccessibilityState();
        preferences = {
          preferredContrast: "auto",
          preferredFontSize: "auto",
          preferredMotion: "auto",
          preferredScreenReader: false,
          preferredKeyboardNavigation: false,
        };
      },
      getAccessibilityStatus: () => {
        const score = this.calculateMockAccessibilityScore(state);
        if (score >= 80) {
          return {
            level: "excellent",
            message: "Excellent accessibility support",
            score,
          };
        } else if (score >= 50) {
          return {
            level: "good",
            message: "Good accessibility support",
            score,
          };
        } else if (score >= 20) {
          return {
            level: "basic",
            message: "Basic accessibility support",
            score,
          };
        } else {
          return {
            level: "minimal",
            message: "Minimal accessibility support",
            score,
          };
        }
      },
      applySystemPreferences: () => {
        // Mock system preference application
        state = {
          ...state,
          reduceMotion: true, // Simulate system prefers-reduced-motion
          lastUpdated: new Date(),
        };
      },
    };
  },

  createAccessibilityConfigServiceMock: (): ReturnType<
    AccessibilityTestUtils["createAccessibilityConfigServiceMock"]
  > => {
    let config: AccessibilityConfig = this.createMockAccessibilityConfig();

    return {
      getConfig: () => ({ ...config }),
      updateConfig: (update: Partial<AccessibilityConfig>, options?: any) => {
        if (options?.resetToDefaults) {
          config = this.createMockAccessibilityConfig(update);
        } else {
          config = { ...config, ...update };
        }
      },
      resetToDefaults: () => {
        config = this.createMockAccessibilityConfig();
      },
      getFeatureDefault: (featureId: string) => {
        return config.featureDefaults[featureId] || false;
      },
      setFeatureDefault: (featureId: string, value: boolean) => {
        config = {
          ...config,
          featureDefaults: {
            ...config.featureDefaults,
            [featureId]: value,
          },
        };
      },
      validateConfig: (configToValidate: Partial<AccessibilityConfig>) => {
        return this.validateAccessibilityConfig(
          configToValidate as AccessibilityConfig,
        );
      },
      getConfigSummary: () => {
        const enabledFeatures = Object.values(config.featureDefaults).filter(
          (v) => v,
        ).length;
        return `Accessibility Config: ${enabledFeatures} features enabled, auto-apply: ${config.autoApply}`;
      },
      exportConfig: () => {
        return JSON.stringify(config, null, 2);
      },
      importConfig: (configString: string) => {
        try {
          const parsed = JSON.parse(configString);
          const validation = this.validateAccessibilityConfig(parsed);
          if (!validation.isValid) {
            return { success: false, error: validation.errors.join(", ") };
          }
          config = parsed;
          return { success: true };
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
      getThemeCompatibility: () => {
        return {
          darkMode: config.themePreferences.darkModeCompatible,
          lightMode: config.themePreferences.lightModeCompatible,
        };
      },
      setThemeCompatibility: (darkMode: boolean, lightMode: boolean) => {
        config = {
          ...config,
          themePreferences: {
            darkModeCompatible: darkMode,
            lightModeCompatible: lightMode,
          },
        };
      },
      getNotificationPreferences: () => {
        return {
          tips: config.notificationPreferences.showAccessibilityTips,
          suggestions: config.notificationPreferences.showFeatureSuggestions,
        };
      },
      setNotificationPreferences: (tips: boolean, suggestions: boolean) => {
        config = {
          ...config,
          notificationPreferences: {
            showAccessibilityTips: tips,
            showFeatureSuggestions: suggestions,
          },
        };
      },
      applyConfigToDOM: () => {
        // Mock DOM application
        if (config.defaultHighContrast) {
          document.body.classList.add("mock-high-contrast");
        }
      },
    };
  },
};


export { accessibilityTestUtils };
