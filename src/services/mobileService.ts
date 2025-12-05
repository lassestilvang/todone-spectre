import { Platform, Dimensions, NativeModules } from "react-native";
import DeviceInfo from "react-native-device-info";
import { mobileUtils } from "../utils/mobileUtils";
import { mobileConfigUtils } from "../utils/mobileConfigUtils";
import {
  MobileConfig,
  MobileDeviceInfo,
  MobileState,
} from "../types/mobileTypes";

export class MobileService {
  private static instance: MobileService;
  private mobileState: MobileState;
  private deviceInfo: MobileDeviceInfo | null = null;

  private constructor() {
    this.mobileState = {
      isMobile: Platform.OS !== "web",
      deviceType: this.detectDeviceType(),
      orientation: this.getCurrentOrientation(),
      isTablet: false,
      screenDimensions: this.getScreenDimensions(),
      networkStatus: "online",
      batteryLevel: 1.0,
      isLowPowerMode: false,
    };
  }

  public static getInstance(): MobileService {
    if (!MobileService.instance) {
      MobileService.instance = new MobileService();
    }
    return MobileService.instance;
  }

  public async initialize(): Promise<void> {
    await this.loadDeviceInfo();
    await this.setupEventListeners();
    await this.checkInitialState();
  }

  private async loadDeviceInfo(): Promise<void> {
    try {
      this.deviceInfo = {
        deviceId: await DeviceInfo.getUniqueId(),
        deviceName: await DeviceInfo.getDeviceName(),
        systemName: await DeviceInfo.getSystemName(),
        systemVersion: await DeviceInfo.getSystemVersion(),
        appVersion: await DeviceInfo.getVersion(),
        buildNumber: await DeviceInfo.getBuildNumber(),
        isEmulator: await DeviceInfo.isEmulator(),
        hasNotch: await DeviceInfo.hasNotch(),
        batteryLevel: await DeviceInfo.getBatteryLevel(),
        isLowPowerMode: await this.checkLowPowerMode(),
      };

      this.mobileState.isTablet = await DeviceInfo.isTablet();
      this.mobileState.batteryLevel = this.deviceInfo.batteryLevel / 100;
      this.mobileState.isLowPowerMode = this.deviceInfo.isLowPowerMode;
    } catch (error) {
      console.error("Failed to load device info:", error);
      this.deviceInfo = null;
    }
  }

  private async setupEventListeners(): Promise<void> {
    // Set up orientation change listener
    Dimensions.addEventListener("change", () => {
      this.mobileState.orientation = this.getCurrentOrientation();
      this.mobileState.screenDimensions = this.getScreenDimensions();
    });

    // Set up network status listener
    this.setupNetworkListener();

    // Set up battery status listener
    this.setupBatteryListener();
  }

  private setupNetworkListener(): void {
    // Network status monitoring
    const checkNetworkStatus = async () => {
      try {
        const isConnected = await mobileUtils.checkNetworkConnectivity();
        this.mobileState.networkStatus = isConnected ? "online" : "offline";
      } catch (error) {
        console.error("Network status check failed:", error);
        this.mobileState.networkStatus = "unknown";
      }
    };

    // Check initially and then set up periodic checks
    checkNetworkStatus();
    setInterval(checkNetworkStatus, 30000); // Check every 30 seconds
  }

  private setupBatteryListener(): void {
    // Battery status monitoring
    const checkBatteryStatus = async () => {
      try {
        const batteryLevel = await DeviceInfo.getBatteryLevel();
        const isLowPower = await this.checkLowPowerMode();

        this.mobileState.batteryLevel = batteryLevel / 100;
        this.mobileState.isLowPowerMode = isLowPower;

        if (
          this.mobileState.batteryLevel < 0.2 &&
          !this.mobileState.isLowPowerMode
        ) {
          // Trigger low battery warning
          this.handleLowBatteryWarning();
        }
      } catch (error) {
        console.error("Battery status check failed:", error);
      }
    };

    // Check initially and then set up periodic checks
    checkBatteryStatus();
    setInterval(checkBatteryStatus, 60000); // Check every minute
  }

  private async checkLowPowerMode(): Promise<boolean> {
    if (Platform.OS === "ios") {
      try {
        const powerMode = await NativeModules.PowerManager?.getPowerMode();
        return powerMode === "lowPower";
      } catch (error) {
        console.warn("Low power mode check not available on this device");
        return false;
      }
    } else if (Platform.OS === "android") {
      try {
        const powerSaveMode =
          await NativeModules.PowerManager?.isPowerSaveMode();
        return powerSaveMode;
      } catch (error) {
        console.warn("Power save mode check not available on this device");
        return false;
      }
    }
    return false;
  }

  private handleLowBatteryWarning(): void {
    // Implement low battery warning logic
    console.warn("Low battery warning: Battery level below 20%");
    // Could trigger a notification or UI warning here
  }

  private detectDeviceType(): "phone" | "tablet" | "unknown" {
    const { width, height } = Dimensions.get("window");
    const aspectRatio = height / width;

    // Tablet detection logic
    if (Platform.isPad || (width >= 600 && height >= 900)) {
      return "tablet";
    } else if (Platform.OS === "ios" || Platform.OS === "android") {
      return "phone";
    } else {
      return "unknown";
    }
  }

  private getCurrentOrientation(): "portrait" | "landscape" {
    const { width, height } = Dimensions.get("window");
    return height >= width ? "portrait" : "landscape";
  }

  private getScreenDimensions(): {
    width: number;
    height: number;
    scale: number;
  } {
    const { width, height } = Dimensions.get("window");
    const { scale } = Dimensions.get("screen");
    return { width, height, scale };
  }

  public async checkInitialState(): Promise<void> {
    // Check initial network status
    const isConnected = await mobileUtils.checkNetworkConnectivity();
    this.mobileState.networkStatus = isConnected ? "online" : "offline";

    // Check if we should enable performance mode
    if (
      this.mobileState.batteryLevel < 0.3 ||
      this.mobileState.isLowPowerMode
    ) {
      await this.enablePerformanceMode();
    }
  }

  public async enablePerformanceMode(): Promise<void> {
    // Implement performance optimizations for mobile
    console.log("Enabling mobile performance mode");

    // Reduce animation complexity
    mobileConfigUtils.setAnimationQuality("low");

    // Enable battery saving features
    this.mobileState.isLowPowerMode = true;

    // Could add more performance optimizations here
  }

  public async disablePerformanceMode(): Promise<void> {
    // Restore normal performance settings
    console.log("Disabling mobile performance mode");

    // Restore animation quality
    mobileConfigUtils.setAnimationQuality("high");

    // Disable battery saving features
    this.mobileState.isLowPowerMode = false;
  }

  public getMobileState(): MobileState {
    return { ...this.mobileState };
  }

  public getDeviceInfo(): MobileDeviceInfo | null {
    return this.deviceInfo ? { ...this.deviceInfo } : null;
  }

  public async checkMobileCapabilities(): Promise<{
    supportsTouch: boolean;
    supportsBiometrics: boolean;
    supportsHapticFeedback: boolean;
  }> {
    return {
      supportsTouch: Platform.OS !== "web",
      supportsBiometrics: await this.checkBiometricSupport(),
      supportsHapticFeedback: await this.checkHapticSupport(),
    };
  }

  private async checkBiometricSupport(): Promise<boolean> {
    try {
      if (Platform.OS === "ios" || Platform.OS === "android") {
        // Check if biometric authentication is available
        const biometryType =
          await NativeModules.BiometricManager?.getBiometryType();
        return biometryType !== null && biometryType !== "none";
      }
      return false;
    } catch (error) {
      console.warn("Biometric support check failed:", error);
      return false;
    }
  }

  private async checkHapticSupport(): Promise<boolean> {
    try {
      if (Platform.OS === "ios" || Platform.OS === "android") {
        // Check if haptic feedback is supported
        const hasHaptic =
          await NativeModules.HapticFeedback?.hasHapticSupport();
        return hasHaptic;
      }
      return false;
    } catch (error) {
      console.warn("Haptic support check failed:", error);
      return false;
    }
  }

  public async triggerHapticFeedback(
    type: "selection" | "impact" | "notification" = "selection",
  ): Promise<void> {
    try {
      if (Platform.OS === "ios" || Platform.OS === "android") {
        await NativeModules.HapticFeedback?.trigger(type);
      }
    } catch (error) {
      console.warn("Haptic feedback failed:", error);
    }
  }

  public async checkNetworkStatus(): Promise<"online" | "offline" | "unknown"> {
    return this.mobileState.networkStatus;
  }

  public isMobileDevice(): boolean {
    return this.mobileState.isMobile;
  }

  public getCurrentDeviceType(): "phone" | "tablet" | "unknown" {
    return this.mobileState.deviceType;
  }

  public cleanup(): void {
    // Clean up event listeners
    Dimensions.removeEventListener("change", () => {});
    // Additional cleanup if needed
  }
}

// Singleton instance
export const mobileService = MobileService.getInstance();
