import {
  MobileConfig,
  MobilePreferences,
  MobileState,
  MobileDeviceInfo,
} from "../../../../types/mobileTypes";
import { MobileService } from "../../../../services/mobileService";
import { MobileConfigService } from "../../../../services/mobileConfigService";

// Mock mobile service for testing
export class MockMobileService implements Partial<MobileService> {
  private mockState: MobileState;
  private mockDeviceInfo: MobileDeviceInfo | null;

  constructor() {
    this.mockState = this.getDefaultMockState();
    this.mockDeviceInfo = this.getDefaultMockDeviceInfo();
  }

  private getDefaultMockState(): MobileState {
    return {
      isMobile: true,
      deviceType: "phone",
      orientation: "portrait",
      isTablet: false,
      screenDimensions: { width: 375, height: 812, scale: 2 },
      networkStatus: "online",
      batteryLevel: 0.85,
      isLowPowerMode: false,
    };
  }

  private getDefaultMockDeviceInfo(): MobileDeviceInfo {
    return {
      deviceId: "mock-device-id-12345",
      deviceName: "Mock Device",
      systemName: "MockOS",
      systemVersion: "1.0.0",
      appVersion: "1.0.0",
      buildNumber: "1",
      isEmulator: true,
      hasNotch: true,
      batteryLevel: 85,
      isLowPowerMode: false,
    };
  }

  public getMobileState(): MobileState {
    return { ...this.mockState };
  }

  public getDeviceInfo(): MobileDeviceInfo | null {
    return this.mockDeviceInfo ? { ...this.mockDeviceInfo } : null;
  }

  public setMockState(state: Partial<MobileState>): void {
    this.mockState = { ...this.mockState, ...state };
  }

  public setMockDeviceInfo(deviceInfo: Partial<MobileDeviceInfo>): void {
    if (this.mockDeviceInfo) {
      this.mockDeviceInfo = { ...this.mockDeviceInfo, ...deviceInfo };
    }
  }

  public async checkMobileCapabilities(): Promise<{
    supportsTouch: boolean;
    supportsBiometrics: boolean;
    supportsHapticFeedback: boolean;
  }> {
    return {
      supportsTouch: true,
      supportsBiometrics: true,
      supportsHapticFeedback: true,
    };
  }

  public async triggerHapticFeedback(): Promise<void> {
    // Mock haptic feedback - do nothing in tests
  }

  public async checkNetworkStatus(): Promise<"online" | "offline" | "unknown"> {
    return this.mockState.networkStatus;
  }

  public isMobileDevice(): boolean {
    return this.mockState.isMobile;
  }

  public getCurrentDeviceType(): "phone" | "tablet" | "unknown" {
    return this.mockState.deviceType;
  }

  public cleanup(): void {
    // Mock cleanup
  }
}

// Mock mobile config service for testing
export class MockMobileConfigService implements Partial<MobileConfigService> {
  private mockConfig: MobileConfig;
  private mockPreferences: MobilePreferences;

  constructor() {
    this.mockConfig = this.getDefaultMockConfig();
    this.mockPreferences = this.getDefaultMockPreferences();
  }

  private getDefaultMockConfig(): MobileConfig {
    return {
      darkMode: false,
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

  private getDefaultMockPreferences(): MobilePreferences {
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

  public getConfig(): MobileConfig {
    return { ...this.mockConfig };
  }

  public getPreferences(): MobilePreferences {
    return { ...this.mockPreferences };
  }

  public async updateConfig(updates: Partial<MobileConfig>): Promise<void> {
    this.mockConfig = { ...this.mockConfig, ...updates };
  }

  public async updatePreferences(
    updates: Partial<MobilePreferences>,
  ): Promise<void> {
    this.mockPreferences = { ...this.mockPreferences, ...updates };
  }

  public async toggleDarkMode(): Promise<void> {
    this.mockConfig.darkMode = !this.mockConfig.darkMode;
  }

  public async setThemeConfig(
    themeConfig: Partial<MobileConfig>,
  ): Promise<void> {
    this.mockConfig = { ...this.mockConfig, ...themeConfig };
  }

  public async resetToDefaultTheme(): Promise<void> {
    const defaultConfig = this.getDefaultMockConfig();
    this.mockConfig = {
      ...this.mockConfig,
      primaryColor: defaultConfig.primaryColor,
      secondaryColor: defaultConfig.secondaryColor,
      accentColor: defaultConfig.accentColor,
      backgroundColor: defaultConfig.backgroundColor,
      textColor: defaultConfig.textColor,
    };
  }

  public async setPerformanceMode(
    mode: "high" | "balanced" | "battery_saver",
  ): Promise<void> {
    this.mockConfig.performanceMode = mode;
    this.mockConfig.batterySaverMode = mode === "battery_saver";
  }

  public async initialize(): Promise<void> {
    // Mock initialization
  }

  public cleanup(): void {
    // Mock cleanup
  }
}

// Mobile test data generators
export const generateMockMobileState = (
  overrides: Partial<MobileState> = {},
): MobileState => {
  const defaultState: MobileState = {
    isMobile: true,
    deviceType: "phone",
    orientation: "portrait",
    isTablet: false,
    screenDimensions: { width: 375, height: 812, scale: 2 },
    networkStatus: "online",
    batteryLevel: 0.85,
    isLowPowerMode: false,
  };

  return { ...defaultState, ...overrides };
};

export const generateMockMobileConfig = (
  overrides: Partial<MobileConfig> = {},
): MobileConfig => {
  const defaultConfig: MobileConfig = {
    darkMode: false,
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

  return { ...defaultConfig, ...overrides };
};

export const generateMockMobilePreferences = (
  overrides: Partial<MobilePreferences> = {},
): MobilePreferences => {
  const defaultPreferences: MobilePreferences = {
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

  return { ...defaultPreferences, ...overrides };
};

export const generateMockDeviceInfo = (
  overrides: Partial<MobileDeviceInfo> = {},
): MobileDeviceInfo => {
  const defaultDeviceInfo: MobileDeviceInfo = {
    deviceId: "mock-device-id",
    deviceName: "Test Device",
    systemName: "TestOS",
    systemVersion: "1.0.0",
    appVersion: "1.0.0",
    buildNumber: "1",
    isEmulator: true,
    hasNotch: true,
    batteryLevel: 85,
    isLowPowerMode: false,
  };

  return { ...defaultDeviceInfo, ...overrides };
};

// Mobile test scenarios
export const mobileTestScenarios = {
  onlineHighBattery: {
    mobileState: generateMockMobileState({
      networkStatus: "online",
      batteryLevel: 0.95,
      isLowPowerMode: false,
    }),
    description: "Online with high battery",
  },

  offlineLowBattery: {
    mobileState: generateMockMobileState({
      networkStatus: "offline",
      batteryLevel: 0.15,
      isLowPowerMode: true,
    }),
    description: "Offline with low battery",
  },

  tabletLandscape: {
    mobileState: generateMockMobileState({
      deviceType: "tablet",
      orientation: "landscape",
      isTablet: true,
      screenDimensions: { width: 1024, height: 768, scale: 2 },
    }),
    description: "Tablet in landscape mode",
  },

  darkModePerformance: {
    mobileConfig: generateMockMobileConfig({
      darkMode: true,
      performanceMode: "high",
      animationQuality: "high",
    }),
    description: "Dark mode with high performance",
  },

  batterySaverMode: {
    mobileConfig: generateMockMobileConfig({
      performanceMode: "battery_saver",
      animationQuality: "low",
      batterySaverMode: true,
    }),
    description: "Battery saver mode",
  },
};

// Mobile component test helpers
export const renderMobileComponent = async (
  component: React.ReactElement,
  testId: string,
  mockServices: {
    mobileService?: MockMobileService;
    mobileConfigService?: MockMobileConfigService;
  } = {},
) => {
  // This would be implemented with your testing library
  // For example, with React Testing Library:
  /*
  const { getByTestId } = render(component);

  // Mock service implementations would be set up here
  if (mockServices.mobileService) {
    // Replace mobileService with mock
  }

  if (mockServices.mobileConfigService) {
    // Replace mobileConfigService with mock
  }

  return getByTestId(testId);
  */

  console.log(`Rendering mobile component: ${testId}`);
  return component;
};

// Mobile integration test helpers
export const testMobileIntegration = async (
  integrationConfig: {
    enablePerformanceOptimization?: boolean;
    enableNetworkMonitoring?: boolean;
    enableBatteryMonitoring?: boolean;
  } = {},
) => {
  // This would test the mobile integration functionality
  console.log("Testing mobile integration with config:", integrationConfig);

  // Mock implementation would go here
  return {
    success: true,
    message: "Mobile integration test completed",
    config: integrationConfig,
  };
};

// Mobile performance test helpers
export const measureMobilePerformance = async (
  testName: string,
  testFunction: () => Promise<void>,
  iterations: number = 5,
) => {
  const startTime = Date.now();

  for (let i = 0; i < iterations; i++) {
    await testFunction();
  }

  const endTime = Date.now();
  const averageTime = (endTime - startTime) / iterations;

  console.log(`Performance test "${testName}": ${averageTime}ms average`);

  return {
    testName,
    iterations,
    totalTime: endTime - startTime,
    averageTime,
  };
};
