import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, Platform, Appearance } from "react-native";
import { mobileConfigUtils } from "../utils/mobileConfigUtils";
import {
  MobileConfig,
  MobilePreferences,
  MobileThemeConfig,
} from "../types/mobileTypes";

const STORAGE_KEYS = {
  MOBILE_CONFIG: "@todone_mobile_config",
  MOBILE_PREFERENCES: "@todone_mobile_preferences",
  MOBILE_THEME: "@todone_mobile_theme",
};

export class MobileConfigService {
  private static instance: MobileConfigService;
  private mobileConfig: MobileConfig;
  private mobilePreferences: MobilePreferences;
  private appStateListener: any = null;

  private constructor() {
    // Initialize with default configuration
    this.mobileConfig = this.getDefaultConfig();
    this.mobilePreferences = this.getDefaultPreferences();
  }

  public static getInstance(): MobileConfigService {
    if (!MobileConfigService.instance) {
      MobileConfigService.instance = new MobileConfigService();
    }
    return MobileConfigService.instance;
  }

  public async initialize(): Promise<void> {
    await this.loadStoredConfig();
    await this.loadStoredPreferences();
    await this.setupAppStateListener();
    await this.applySystemPreferences();
  }

  private getDefaultConfig(): MobileConfig {
    return {
      darkMode: Appearance.getColorScheme() === "dark",
      primaryColor: "#6200EE",
      secondaryColor: "#03DAC6",
      accentColor: "#FFC107",
      backgroundColor: "#FFFFFF",
      textColor: "#333333",
      fontSize: "medium",
      animationQuality: "high",
      enableHapticFeedback: true,
      enableSwipeGestures: true,
      enableTouchFeedback: true,
      maxTasksPerView: 20,
      defaultView: "list",
      syncFrequency: "automatic",
      offlineMode: false,
      batterySaverMode: false,
      performanceMode: "balanced",
      notificationPreferences: {
        taskReminders: true,
        projectUpdates: true,
        collaborationAlerts: true,
        soundEnabled: true,
        vibrationEnabled: true,
      },
    };
  }

  private getDefaultPreferences(): MobilePreferences {
    return {
      preferredView: "list",
      lastActiveTab: "tasks",
      tutorialCompleted: false,
      onboardingCompleted: false,
      featureFlags: {
        experimentalFeatures: false,
        betaFeatures: false,
        developerMode: false,
      },
      accessibility: {
        reducedMotion: false,
        highContrast: false,
        screenReaderEnabled: false,
        fontSizeAdjustment: "normal",
      },
      cacheSettings: {
        cacheEnabled: true,
        cacheSize: "medium",
        clearCacheOnExit: false,
      },
    };
  }

  private async loadStoredConfig(): Promise<void> {
    try {
      const storedConfig = await AsyncStorage.getItem(
        STORAGE_KEYS.MOBILE_CONFIG,
      );
      if (storedConfig) {
        const parsedConfig = JSON.parse(storedConfig);
        this.mobileConfig = mobileConfigUtils.mergeConfigs(
          this.mobileConfig,
          parsedConfig,
        );
      }
    } catch (error) {
      console.error("Failed to load mobile config:", error);
    }
  }

  private async loadStoredPreferences(): Promise<void> {
    try {
      const storedPreferences = await AsyncStorage.getItem(
        STORAGE_KEYS.MOBILE_PREFERENCES,
      );
      if (storedPreferences) {
        const parsedPreferences = JSON.parse(storedPreferences);
        this.mobilePreferences = {
          ...this.mobilePreferences,
          ...parsedPreferences,
        };
      }
    } catch (error) {
      console.error("Failed to load mobile preferences:", error);
    }
  }

  private async setupAppStateListener(): Promise<void> {
    this.appStateListener = AppState.addEventListener(
      "change",
      (nextAppState) => {
        if (nextAppState === "active") {
          this.handleAppActive();
        } else if (nextAppState === "background") {
          this.handleAppBackground();
        }
      },
    );
  }

  private handleAppActive(): void {
    // App came to foreground
    console.log("App became active - refreshing mobile config");
    this.applySystemPreferences();
  }

  private handleAppBackground(): void {
    // App went to background
    console.log("App went to background - saving mobile config");
    this.saveConfig();
    this.savePreferences();
  }

  private async applySystemPreferences(): Promise<void> {
    // Apply system theme preferences
    const systemColorScheme = Appearance.getColorScheme();
    if (this.mobilePreferences.accessibility.reducedMotion) {
      this.mobileConfig.animationQuality = "low";
    }

    // Check if we should follow system theme
    if (this.mobilePreferences.featureFlags.developerMode) {
      console.log("Developer mode enabled - additional logging active");
    }
  }

  public async saveConfig(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.MOBILE_CONFIG,
        JSON.stringify(this.mobileConfig),
      );
    } catch (error) {
      console.error("Failed to save mobile config:", error);
    }
  }

  public async savePreferences(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        STORAGE_KEYS.MOBILE_PREFERENCES,
        JSON.stringify(this.mobilePreferences),
      );
    } catch (error) {
      console.error("Failed to save mobile preferences:", error);
    }
  }

  public getConfig(): MobileConfig {
    return { ...this.mobileConfig };
  }

  public getPreferences(): MobilePreferences {
    return { ...this.mobilePreferences };
  }

  public async updateConfig(updates: Partial<MobileConfig>): Promise<void> {
    this.mobileConfig = { ...this.mobileConfig, ...updates };
    await this.saveConfig();

    // Apply theme changes immediately if dark mode changed
    if (updates.darkMode !== undefined) {
      this.applyThemeChanges();
    }
  }

  public async updatePreferences(
    updates: Partial<MobilePreferences>,
  ): Promise<void> {
    this.mobilePreferences = { ...this.mobilePreferences, ...updates };
    await this.savePreferences();
  }

  private applyThemeChanges(): void {
    // Apply theme changes to the app
    if (this.mobileConfig.darkMode) {
      // Apply dark theme
      this.mobileConfig.backgroundColor = "#121212";
      this.mobileConfig.textColor = "#FFFFFF";
    } else {
      // Apply light theme
      this.mobileConfig.backgroundColor = "#FFFFFF";
      this.mobileConfig.textColor = "#333333";
    }
  }

  public async toggleDarkMode(): Promise<void> {
    const newDarkMode = !this.mobileConfig.darkMode;
    await this.updateConfig({ darkMode: newDarkMode });
  }

  public async setThemeConfig(
    themeConfig: Partial<MobileThemeConfig>,
  ): Promise<void> {
    const updatedConfig = {
      primaryColor: themeConfig.primaryColor || this.mobileConfig.primaryColor,
      secondaryColor:
        themeConfig.secondaryColor || this.mobileConfig.secondaryColor,
      accentColor: themeConfig.accentColor || this.mobileConfig.accentColor,
      backgroundColor:
        themeConfig.backgroundColor || this.mobileConfig.backgroundColor,
      textColor: themeConfig.textColor || this.mobileConfig.textColor,
    };

    await this.updateConfig(updatedConfig);
  }

  public async resetToDefaultTheme(): Promise<void> {
    const defaultTheme = this.getDefaultConfig();
    await this.updateConfig({
      primaryColor: defaultTheme.primaryColor,
      secondaryColor: defaultTheme.secondaryColor,
      accentColor: defaultTheme.accentColor,
      backgroundColor: defaultTheme.backgroundColor,
      textColor: defaultTheme.textColor,
    });
  }

  public async setPerformanceMode(
    mode: "high" | "balanced" | "battery_saver",
  ): Promise<void> {
    let configUpdates: Partial<MobileConfig> = { performanceMode: mode };

    if (mode === "battery_saver") {
      configUpdates = {
        ...configUpdates,
        animationQuality: "low",
        enableHapticFeedback: false,
        batterySaverMode: true,
      };
    } else if (mode === "high") {
      configUpdates = {
        ...configUpdates,
        animationQuality: "high",
        enableHapticFeedback: true,
        batterySaverMode: false,
      };
    } else {
      // Balanced mode
      configUpdates = {
        ...configUpdates,
        animationQuality: "medium",
        enableHapticFeedback: true,
        batterySaverMode: false,
      };
    }

    await this.updateConfig(configUpdates);
  }

  public async getThemeConfig(): Promise<MobileThemeConfig> {
    return {
      primaryColor: this.mobileConfig.primaryColor,
      secondaryColor: this.mobileConfig.secondaryColor,
      accentColor: this.mobileConfig.accentColor,
      backgroundColor: this.mobileConfig.backgroundColor,
      textColor: this.mobileConfig.textColor,
    };
  }

  public async markTutorialCompleted(): Promise<void> {
    await this.updatePreferences({ tutorialCompleted: true });
  }

  public async markOnboardingCompleted(): Promise<void> {
    await this.updatePreferences({ onboardingCompleted: true });
  }

  public async enableExperimentalFeatures(enable: boolean): Promise<void> {
    await this.updatePreferences({
      featureFlags: {
        ...this.mobilePreferences.featureFlags,
        experimentalFeatures: enable,
      },
    });
  }

  public async setAccessibilityPreferences(preferences: {
    reducedMotion?: boolean;
    highContrast?: boolean;
    screenReaderEnabled?: boolean;
    fontSizeAdjustment?: "small" | "normal" | "large" | "extra_large";
  }): Promise<void> {
    const updatedAccessibility = {
      ...this.mobilePreferences.accessibility,
      ...preferences,
    };
    await this.updatePreferences({ accessibility: updatedAccessibility });

    // Apply accessibility changes
    if (preferences.reducedMotion !== undefined) {
      await this.updateConfig({
        animationQuality: preferences.reducedMotion
          ? "low"
          : this.mobileConfig.animationQuality,
      });
    }
  }

  public cleanup(): void {
    if (this.appStateListener) {
      this.appStateListener.remove();
      this.appStateListener = null;
    }
  }
}

// Singleton instance
export const mobileConfigService = MobileConfigService.getInstance();
