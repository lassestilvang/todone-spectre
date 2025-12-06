// @ts-nocheck
import {
  MobileConfig,
  MobilePreferences,
  MobileThemeConfig,
} from "../types/mobileTypes";
import { mobileConfigService } from "../services/mobileConfigService";
import { Platform, Appearance } from "react-native";

export class MobileConfigUtils {
  private static instance: MobileConfigUtils;

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): MobileConfigUtils {
    if (!MobileConfigUtils.instance) {
      MobileConfigUtils.instance = new MobileConfigUtils();
    }
    return MobileConfigUtils.instance;
  }

  /**
   * Configuration merging and management
   */
  public mergeConfigs(
    baseConfig: MobileConfig,
    newConfig: Partial<MobileConfig>,
  ): MobileConfig {
    return {
      ...baseConfig,
      ...newConfig,
      // Handle nested objects specially
      notificationPreferences: newConfig.notificationPreferences
        ? {
            ...baseConfig.notificationPreferences,
            ...newConfig.notificationPreferences,
          }
        : baseConfig.notificationPreferences,
    };
  }

  public mergePreferences(
    basePreferences: MobilePreferences,
    newPreferences: Partial<MobilePreferences>,
  ): MobilePreferences {
    return {
      ...basePreferences,
      ...newPreferences,
      // Handle nested objects specially
      featureFlags: newPreferences.featureFlags
        ? { ...basePreferences.featureFlags, ...newPreferences.featureFlags }
        : basePreferences.featureFlags,
      accessibility: newPreferences.accessibility
        ? { ...basePreferences.accessibility, ...newPreferences.accessibility }
        : basePreferences.accessibility,
      cacheSettings: newPreferences.cacheSettings
        ? { ...basePreferences.cacheSettings, ...newPreferences.cacheSettings }
        : basePreferences.cacheSettings,
    };
  }

  /**
   * Theme configuration utilities
   */
  public getDefaultThemeConfig(): MobileThemeConfig {
    return {
      primaryColor: "#6200EE",
      secondaryColor: "#03DAC6",
      accentColor: "#FFC107",
      backgroundColor:
        Appearance.getColorScheme() === "dark" ? "#121212" : "#FFFFFF",
      textColor: Appearance.getColorScheme() === "dark" ? "#FFFFFF" : "#333333",
    };
  }

  public getThemeConfigForDarkMode(): MobileThemeConfig {
    return {
      primaryColor: "#BB86FC",
      secondaryColor: "#03DAC6",
      accentColor: "#FFC107",
      backgroundColor: "#121212",
      textColor: "#FFFFFF",
    };
  }

  public getThemeConfigForLightMode(): MobileThemeConfig {
    return {
      primaryColor: "#6200EE",
      secondaryColor: "#03DAC6",
      accentColor: "#FFC107",
      backgroundColor: "#FFFFFF",
      textColor: "#333333",
    };
  }

  public async applyThemeConfig(themeConfig: MobileThemeConfig): Promise<void> {
    await mobileConfigService.setThemeConfig(themeConfig);
  }

  public async resetTheme(): Promise<void> {
    await mobileConfigService.resetToDefaultTheme();
  }

  /**
   * Animation quality management
   */
  public setAnimationQuality(quality: "low" | "medium" | "high"): void {
    const currentConfig = mobileConfigService.getConfig();
    mobileConfigService.updateConfig({ animationQuality: quality });
  }

  public getCurrentAnimationQuality(): "low" | "medium" | "high" {
    const config = mobileConfigService.getConfig();
    return config.animationQuality;
  }

  public shouldReduceAnimations(): boolean {
    const config = mobileConfigService.getConfig();
    const state = mobileConfigService.getMobileState();

    return (
      config.animationQuality === "low" ||
      state.batteryLevel < 0.2 ||
      state.isLowPowerMode
    );
  }

  /**
   * Performance mode management
   */
  public async setPerformanceMode(
    mode: "high" | "balanced" | "battery_saver",
  ): Promise<void> {
    await mobileConfigService.setPerformanceMode(mode);
  }

  public getCurrentPerformanceMode(): "high" | "balanced" | "battery_saver" {
    const config = mobileConfigService.getConfig();
    return config.performanceMode;
  }

  public isBatterySaverMode(): boolean {
    const config = mobileConfigService.getConfig();
    return (
      config.performanceMode === "battery_saver" || config.batterySaverMode
    );
  }

  /**
   * Notification preferences management
   */
  public updateNotificationPreferences(preferences: {
    taskReminders?: boolean;
    projectUpdates?: boolean;
    collaborationAlerts?: boolean;
    soundEnabled?: boolean;
    vibrationEnabled?: boolean;
  }): void {
    const currentConfig = mobileConfigService.getConfig();
    const updatedNotifications = {
      ...currentConfig.notificationPreferences,
      ...preferences,
    };

    mobileConfigService.updateConfig({
      notificationPreferences: updatedNotifications,
    });
  }

  public getNotificationPreferences(): {
    taskReminders: boolean;
    projectUpdates: boolean;
    collaborationAlerts: boolean;
    soundEnabled: boolean;
    vibrationEnabled: boolean;
  } {
    const config = mobileConfigService.getConfig();
    return config.notificationPreferences;
  }

  /**
   * Accessibility preferences management
   */
  public updateAccessibilityPreferences(preferences: {
    reducedMotion?: boolean;
    highContrast?: boolean;
    screenReaderEnabled?: boolean;
    fontSizeAdjustment?: "small" | "normal" | "large" | "extra_large";
  }): void {
    const currentPreferences = mobileConfigService.getPreferences();
    const updatedAccessibility = {
      ...currentPreferences.accessibility,
      ...preferences,
    };

    mobileConfigService.updatePreferences({
      accessibility: updatedAccessibility,
    });
  }

  public getAccessibilityPreferences(): {
    reducedMotion: boolean;
    highContrast: boolean;
    screenReaderEnabled: boolean;
    fontSizeAdjustment: "small" | "normal" | "large" | "extra_large";
  } {
    const preferences = mobileConfigService.getPreferences();
    return preferences.accessibility;
  }

  /**
   * Cache settings management
   */
  public updateCacheSettings(settings: {
    cacheEnabled?: boolean;
    cacheSize?: "small" | "medium" | "large";
    clearCacheOnExit?: boolean;
  }): void {
    const currentPreferences = mobileConfigService.getPreferences();
    const updatedCacheSettings = {
      ...currentPreferences.cacheSettings,
      ...settings,
    };

    mobileConfigService.updatePreferences({
      cacheSettings: updatedCacheSettings,
    });
  }

  public getCacheSettings(): {
    cacheEnabled: boolean;
    cacheSize: "small" | "medium" | "large";
    clearCacheOnExit: boolean;
  } {
    const preferences = mobileConfigService.getPreferences();
    return preferences.cacheSettings;
  }

  /**
   * Feature flags management
   */
  public enableExperimentalFeatures(enable: boolean): void {
    const currentPreferences = mobileConfigService.getPreferences();
    mobileConfigService.updatePreferences({
      featureFlags: {
        ...currentPreferences.featureFlags,
        experimentalFeatures: enable,
      },
    });
  }

  public enableBetaFeatures(enable: boolean): void {
    const currentPreferences = mobileConfigService.getPreferences();
    mobileConfigService.updatePreferences({
      featureFlags: {
        ...currentPreferences.featureFlags,
        betaFeatures: enable,
      },
    });
  }

  public enableDeveloperMode(enable: boolean): void {
    const currentPreferences = mobileConfigService.getPreferences();
    mobileConfigService.updatePreferences({
      featureFlags: {
        ...currentPreferences.featureFlags,
        developerMode: enable,
      },
    });
  }

  public isExperimentalFeaturesEnabled(): boolean {
    const preferences = mobileConfigService.getPreferences();
    return preferences.featureFlags.experimentalFeatures;
  }

  public isBetaFeaturesEnabled(): boolean {
    const preferences = mobileConfigService.getPreferences();
    return preferences.featureFlags.betaFeatures;
  }

  public isDeveloperModeEnabled(): boolean {
    const preferences = mobileConfigService.getPreferences();
    return preferences.featureFlags.developerMode;
  }

  /**
   * Configuration validation and utilities
   */
  public validateConfig(config: MobileConfig): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!config.primaryColor || !this.isValidColor(config.primaryColor)) {
      errors.push("Invalid primary color");
    }

    if (!config.secondaryColor || !this.isValidColor(config.secondaryColor)) {
      errors.push("Invalid secondary color");
    }

    if (!config.accentColor || !this.isValidColor(config.accentColor)) {
      errors.push("Invalid accent color");
    }

    if (
      config.fontSize &&
      !["small", "medium", "large", "extra_large"].includes(config.fontSize)
    ) {
      errors.push("Invalid font size");
    }

    if (
      config.animationQuality &&
      !["low", "medium", "high"].includes(config.animationQuality)
    ) {
      errors.push("Invalid animation quality");
    }

    if (
      config.syncFrequency &&
      !["automatic", "manual", "hourly", "daily"].includes(config.syncFrequency)
    ) {
      errors.push("Invalid sync frequency");
    }

    if (
      config.defaultView &&
      !["list", "board", "calendar", "timeline"].includes(config.defaultView)
    ) {
      errors.push("Invalid default view");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  private isValidColor(color: string): boolean {
    // Simple color validation
    return (
      /^#([0-9A-F]{3}){1,2}$/i.test(color) ||
      /^rgb\((\d{1,3},\s*){2}\d{1,3}\)$/.test(color) ||
      /^rgba\((\d{1,3},\s*){3}\d?\.?\d*\)$/.test(color)
    );
  }

  /**
   * Configuration export/import utilities
   */
  public async exportConfig(): Promise<string> {
    try {
      const config = mobileConfigService.getConfig();
      const preferences = mobileConfigService.getPreferences();

      const exportData = {
        version: "1.0",
        timestamp: new Date().toISOString(),
        config,
        preferences,
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error("Failed to export config:", error);
      throw new Error("Failed to export configuration");
    }
  }

  public async importConfig(configString: string): Promise<void> {
    try {
      const parsedData = JSON.parse(configString);

      if (parsedData.config) {
        await mobileConfigService.updateConfig(parsedData.config);
      }

      if (parsedData.preferences) {
        await mobileConfigService.updatePreferences(parsedData.preferences);
      }
    } catch (error) {
      console.error("Failed to import config:", error);
      throw new Error("Failed to import configuration");
    }
  }

  /**
   * Platform-specific configuration utilities
   */
  public getPlatformSpecificConfig(): Record<string, any> {
    const config = mobileConfigService.getConfig();
    const platformConfig: Record<string, any> = {};

    if (Platform.OS === "ios") {
      platformConfig.iosSpecific = {
        useNativeComponents: true,
        enableICloudSync: config.syncFrequency === "automatic",
      };
    } else if (Platform.OS === "android") {
      platformConfig.androidSpecific = {
        useMaterialDesign: true,
        enableGoogleDriveSync: config.syncFrequency === "automatic",
      };
    } else if (Platform.OS === "web") {
      platformConfig.webSpecific = {
        useWebComponents: true,
        enableLocalStorage: true,
      };
    }

    return platformConfig;
  }

  /**
   * Utility functions
   */
  public getConfigSummary(): string {
    const config = mobileConfigService.getConfig();
    const preferences = mobileConfigService.getPreferences();

    return `Mobile Config Summary:
- Theme: ${config.darkMode ? "Dark" : "Light"}
- Performance: ${config.performanceMode}
- Animation Quality: ${config.animationQuality}
- Font Size: ${config.fontSize}
- Tutorial Completed: ${preferences.tutorialCompleted}
- Onboarding Completed: ${preferences.onboardingCompleted}`;
  }

  public cleanup(): void {
    // Clean up any resources
  }
}

// Singleton instance
export const mobileConfigUtils = MobileConfigUtils.getInstance();
