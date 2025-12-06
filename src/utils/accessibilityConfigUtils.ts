import {
  accessibilityConfigService,
  AccessibilityConfig,
} from "../services/accessibilityConfigService";

interface AccessibilityConfigUtils {
  validateConfigStructure: (config: unknown) => {
    isValid: boolean;
    errors: string[];
  };
  mergeConfigs: (
    baseConfig: AccessibilityConfig,
    overrideConfig: Partial<AccessibilityConfig>,
  ) => AccessibilityConfig;
  generateDefaultConfig: () => AccessibilityConfig;
  compareConfigs: (
    config1: AccessibilityConfig,
    config2: AccessibilityConfig,
  ) => { differences: string[]; isEqual: boolean };
  configToString: (config: AccessibilityConfig) => string;
  stringToConfig: (configString: string) => {
    config: AccessibilityConfig | null;
    error: string | null;
  };
  getConfigDiff: (
    oldConfig: AccessibilityConfig,
    newConfig: AccessibilityConfig,
  ) => Record<string, { oldValue: unknown; newValue: unknown }>;
  applyConfigPreset: (presetName: string) => AccessibilityConfig;
  getAvailablePresets: () => string[];
  validateFeatureDefaults: (featureDefaults: Record<string, boolean>) => {
    isValid: boolean;
    errors: string[];
  };
  normalizeConfig: (
    config: Partial<AccessibilityConfig>,
  ) => AccessibilityConfig;
}

const defaultPresets: Record<string, Partial<AccessibilityConfig>> = {
  default: {
    defaultHighContrast: false,
    defaultFontSize: "medium",
    defaultReduceMotion: false,
    defaultScreenReader: false,
    defaultKeyboardNavigation: false,
  },
  "high-accessibility": {
    defaultHighContrast: true,
    defaultFontSize: "large",
    defaultReduceMotion: true,
    defaultScreenReader: true,
    defaultKeyboardNavigation: true,
    autoApply: true,
    persistSettings: true,
  },
  "visual-impairment": {
    defaultHighContrast: true,
    defaultFontSize: "xlarge",
    defaultReduceMotion: false,
    defaultScreenReader: true,
    defaultKeyboardNavigation: true,
  },
  "motion-sensitivity": {
    defaultHighContrast: false,
    defaultFontSize: "medium",
    defaultReduceMotion: true,
    defaultScreenReader: false,
    defaultKeyboardNavigation: false,
  },
  "keyboard-only": {
    defaultHighContrast: false,
    defaultFontSize: "medium",
    defaultReduceMotion: false,
    defaultScreenReader: false,
    defaultKeyboardNavigation: true,
  },
};

const accessibilityConfigUtils: AccessibilityConfigUtils = {
  validateConfigStructure: (
    config: unknown,
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const requiredFields = [
      "defaultHighContrast",
      "defaultFontSize",
      "defaultReduceMotion",
      "defaultScreenReader",
      "defaultKeyboardNavigation",
      "autoApply",
      "persistSettings",
      "featureDefaults",
      "themePreferences",
      "notificationPreferences",
    ];

    requiredFields.forEach((field) => {
      if (!(field in config)) {
        errors.push(`Missing required field: ${field}`);
      }
    });

    if (config.featureDefaults && typeof config.featureDefaults !== "object") {
      errors.push("featureDefaults must be an object");
    }

    if (
      config.themePreferences &&
      typeof config.themePreferences !== "object"
    ) {
      errors.push("themePreferences must be an object");
    }

    if (
      config.notificationPreferences &&
      typeof config.notificationPreferences !== "object"
    ) {
      errors.push("notificationPreferences must be an object");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  mergeConfigs: (
    baseConfig: AccessibilityConfig,
    overrideConfig: Partial<AccessibilityConfig>,
  ): AccessibilityConfig => {
    return {
      ...baseConfig,
      ...overrideConfig,
      featureDefaults: {
        ...baseConfig.featureDefaults,
        ...overrideConfig.featureDefaults,
      },
      themePreferences: {
        ...baseConfig.themePreferences,
        ...overrideConfig.themePreferences,
      },
      notificationPreferences: {
        ...baseConfig.notificationPreferences,
        ...overrideConfig.notificationPreferences,
      },
    };
  },

  generateDefaultConfig: (): AccessibilityConfig => {
    return accessibilityConfigService.getInstance().getConfig();
  },

  compareConfigs: (
    config1: AccessibilityConfig,
    config2: AccessibilityConfig,
  ): { differences: string[]; isEqual: boolean } => {
    const differences: string[] = [];

    Object.keys(config1).forEach((key) => {
      const typedKey = key as keyof AccessibilityConfig;
      if (
        JSON.stringify(config1[typedKey]) !== JSON.stringify(config2[typedKey])
      ) {
        differences.push(typedKey);
      }
    });

    return {
      differences,
      isEqual: differences.length === 0,
    };
  },

  configToString: (config: AccessibilityConfig): string => {
    return JSON.stringify(config, null, 2);
  },

  stringToConfig: (
    configString: string,
  ): { config: AccessibilityConfig | null; error: string | null } => {
    try {
      const parsed = JSON.parse(configString);
      const validation = this.validateConfigStructure(parsed);

      if (!validation.isValid) {
        return {
          config: null,
          error: `Invalid config structure: ${validation.errors.join(", ")}`,
        };
      }

      return {
        config: parsed,
        error: null,
      };
    } catch (error) {
      return {
        config: null,
        error: error instanceof Error ? error.message : "Unknown parsing error",
      };
    }
  },

  getConfigDiff: (
    oldConfig: AccessibilityConfig,
    newConfig: AccessibilityConfig,
  ): Record<string, { oldValue: unknown; newValue: unknown }> => {
    const diff: Record<string, { oldValue: unknown; newValue: unknown }> = {};

    Object.keys(oldConfig).forEach((key) => {
      const typedKey = key as keyof AccessibilityConfig;
      if (
        JSON.stringify(oldConfig[typedKey]) !==
        JSON.stringify(newConfig[typedKey])
      ) {
        diff[typedKey] = {
          oldValue: oldConfig[typedKey],
          newValue: newConfig[typedKey],
        };
      }
    });

    return diff;
  },

  applyConfigPreset: (presetName: string): AccessibilityConfig => {
    const preset = defaultPresets[presetName];
    if (!preset) {
      throw new Error(`Unknown preset: ${presetName}`);
    }

    const currentConfig = accessibilityConfigService.getConfig();
    return this.mergeConfigs(currentConfig, preset);
  },

  getAvailablePresets: (): string[] => {
    return Object.keys(defaultPresets);
  },

  validateFeatureDefaults: (
    featureDefaults: Record<string, boolean>,
  ): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    const validFeatures = [
      "high-contrast",
      "custom-font-size",
      "reduce-motion",
      "screen-reader",
      "keyboard-navigation",
    ];

    Object.keys(featureDefaults).forEach((feature) => {
      if (!validFeatures.includes(feature)) {
        errors.push(`Invalid feature: ${feature}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  normalizeConfig: (
    config: Partial<AccessibilityConfig>,
  ): AccessibilityConfig => {
    const defaultConfig = accessibilityConfigService.getInstance().getConfig();
    return this.mergeConfigs(defaultConfig, config);
  },
};

export { accessibilityConfigUtils };
