import { accessibilityConfigUtils } from '../utils/accessibilityConfigUtils';

interface AccessibilityConfig {
  defaultHighContrast: boolean;
  defaultFontSize: string;
  defaultReduceMotion: boolean;
  defaultScreenReader: boolean;
  defaultKeyboardNavigation: boolean;
  autoApply: boolean;
  persistSettings: boolean;
  featureDefaults: Record<string, boolean>;
  themePreferences: {
    darkModeCompatible: boolean;
    lightModeCompatible: boolean;
  };
  notificationPreferences: {
    showAccessibilityTips: boolean;
    showFeatureSuggestions: boolean;
  };
}

interface AccessibilityConfigOptions {
  resetToDefaults?: boolean;
  mergeWithCurrent?: boolean;
}

class AccessibilityConfigService {
  private config: AccessibilityConfig;
  private storageKey: string;
  private defaultConfig: AccessibilityConfig;

  constructor() {
    this.storageKey = 'todone-accessibility-config';
    this.defaultConfig = this.getDefaultConfig();
    this.config = this.loadConfig();
  }

  private getDefaultConfig(): AccessibilityConfig {
    return {
      defaultHighContrast: false,
      defaultFontSize: 'medium',
      defaultReduceMotion: false,
      defaultScreenReader: false,
      defaultKeyboardNavigation: false,
      autoApply: true,
      persistSettings: true,
      featureDefaults: {
        'high-contrast': false,
        'custom-font-size': false,
        'reduce-motion': false,
        'screen-reader': false,
        'keyboard-navigation': false
      },
      themePreferences: {
        darkModeCompatible: true,
        lightModeCompatible: true
      },
      notificationPreferences: {
        showAccessibilityTips: true,
        showFeatureSuggestions: true
      }
    };
  }

  private loadConfig(): AccessibilityConfig {
    try {
      const savedConfig = localStorage.getItem(this.storageKey);
      if (savedConfig) {
        return { ...this.defaultConfig, ...JSON.parse(savedConfig) };
      }
    } catch (error) {
      console.error('Failed to load accessibility config:', error);
    }
    return { ...this.defaultConfig };
  }

  private saveConfig(config: AccessibilityConfig): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(config));
    } catch (error) {
      console.error('Failed to save accessibility config:', error);
    }
  }

  getConfig(): AccessibilityConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<AccessibilityConfig>, options: AccessibilityConfigOptions = {}): void {
    let updatedConfig: AccessibilityConfig;

    if (options.resetToDefaults) {
      updatedConfig = { ...this.defaultConfig, ...newConfig };
    } else if (options.mergeWithCurrent) {
      updatedConfig = { ...this.config, ...newConfig };
    } else {
      updatedConfig = { ...this.config, ...newConfig };
    }

    this.config = updatedConfig;
    this.saveConfig(updatedConfig);
  }

  resetToDefaults(): void {
    this.config = { ...this.defaultConfig };
    this.saveConfig(this.config);
  }

  getFeatureDefault(featureId: string): boolean {
    return this.config.featureDefaults[featureId] || false;
  }

  setFeatureDefault(featureId: string, value: boolean): void {
    const updatedFeatureDefaults = {
      ...this.config.featureDefaults,
      [featureId]: value
    };

    this.updateConfig({
      featureDefaults: updatedFeatureDefaults
    });
  }

  validateConfig(config: Partial<AccessibilityConfig>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const validFontSizes = ['small', 'medium', 'large', 'xlarge'];

    if (config.defaultFontSize && !validFontSizes.includes(config.defaultFontSize)) {
      errors.push(`Invalid font size: ${config.defaultFontSize}. Must be one of: ${validFontSizes.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  applyConfigToDOM(): void {
    // Apply config settings to the DOM
    if (this.config.defaultHighContrast) {
      document.body.classList.add('high-contrast-mode');
    }

    if (this.config.defaultReduceMotion) {
      document.body.classList.add('reduce-motion');
    }

    if (this.config.defaultScreenReader) {
      document.body.setAttribute('aria-live', 'polite');
      document.body.classList.add('screen-reader-enhanced');
    }

    if (this.config.defaultKeyboardNavigation) {
      document.body.classList.add('keyboard-navigation-enhanced');
    }
  }

  getConfigSummary(): string {
    const enabledFeatures = Object.entries(this.config.featureDefaults)
      .filter(([_, value]) => value)
      .map(([key]) => key);

    return `Accessibility Config: ${enabledFeatures.length} features enabled, ` +
           `auto-apply: ${this.config.autoApply}, ` +
           `persist: ${this.config.persistSettings}`;
  }

  exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  importConfig(configString: string): { success: boolean; error?: string } {
    try {
      const parsedConfig = JSON.parse(configString);
      const validation = this.validateConfig(parsedConfig);

      if (!validation.isValid) {
        return {
          success: false,
          error: `Config validation failed: ${validation.errors.join(', ')}`
        };
      }

      this.updateConfig(parsedConfig, { resetToDefaults: true });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  getThemeCompatibility(): { darkMode: boolean; lightMode: boolean } {
    return {
      darkMode: this.config.themePreferences.darkModeCompatible,
      lightMode: this.config.themePreferences.lightModeCompatible
    };
  }

  setThemeCompatibility(darkMode: boolean, lightMode: boolean): void {
    this.updateConfig({
      themePreferences: {
        darkModeCompatible: darkMode,
        lightModeCompatible: lightMode
      }
    });
  }

  getNotificationPreferences(): { tips: boolean; suggestions: boolean } {
    return {
      tips: this.config.notificationPreferences.showAccessibilityTips,
      suggestions: this.config.notificationPreferences.showFeatureSuggestions
    };
  }

  setNotificationPreferences(tips: boolean, suggestions: boolean): void {
    this.updateConfig({
      notificationPreferences: {
        showAccessibilityTips: tips,
        showFeatureSuggestions: suggestions
      }
    });
  }
}

// Singleton instance
const accessibilityConfigServiceInstance = new AccessibilityConfigService();

export const accessibilityConfigService = {
  ...accessibilityConfigServiceInstance,

  // Static methods for convenience
  getInstance: () => accessibilityConfigServiceInstance,
  initialize: () => {
    accessibilityConfigServiceInstance.applyConfigToDOM();
    return accessibilityConfigServiceInstance;
  }
};

export type { AccessibilityConfig, AccessibilityConfigOptions };