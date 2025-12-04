import { Platform, NetInfo, Linking, Alert, Vibration, Share } from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { mobileService } from '../services/mobileService';
import { mobileConfigService } from '../services/mobileConfigService';
import { MobileConfig, MobileDeviceInfo, MobileState } from '../types/mobileTypes';

export class MobileUtils {
  private static instance: MobileUtils;
  private configChangeListeners: Array<(config: MobileConfig) => void> = [];

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): MobileUtils {
    if (!MobileUtils.instance) {
      MobileUtils.instance = new MobileUtils();
    }
    return MobileUtils.instance;
  }

  /**
   * Initialize mobile utilities
   */
  public async initialize(): Promise<void> {
    await this.setupConfigChangeListener();
  }

  private async setupConfigChangeListener(): Promise<void> {
    // Set up listener for mobile config changes
    setInterval(async () => {
      const currentConfig = mobileConfigService.getConfig();
      this.notifyConfigChangeListeners(currentConfig);
    }, 1000); // Check for config changes every second
  }

  public addConfigChangeListener(listener: (config: MobileConfig) => void): () => void {
    this.configChangeListeners.push(listener);
    return () => {
      this.configChangeListeners = this.configChangeListeners.filter(l => l !== listener);
    };
  }

  private notifyConfigChangeListeners(config: MobileConfig): void {
    this.configChangeListeners.forEach(listener => {
      try {
        listener(config);
      } catch (error) {
        console.error('Config change listener failed:', error);
      }
    });
  }

  /**
   * Network connectivity utilities
   */
  public async checkNetworkConnectivity(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      return state.isConnected ?? false;
    } catch (error) {
      console.error('Network connectivity check failed:', error);
      return false;
    }
  }

  public async isOnline(): Promise<boolean> {
    return this.checkNetworkConnectivity();
  }

  public async openNetworkSettings(): Promise<void> {
    try {
      if (Platform.OS === 'ios') {
        await Linking.openURL('App-Prefs:root=WIFI');
      } else if (Platform.OS === 'android') {
        await Linking.openSettings();
      }
    } catch (error) {
      console.error('Failed to open network settings:', error);
      Alert.alert('Unable to open network settings');
    }
  }

  /**
   * Device information utilities
   */
  public async getDeviceInfo(): Promise<MobileDeviceInfo | null> {
    return mobileService.getDeviceInfo();
  }

  public async getDeviceId(): Promise<string> {
    const deviceInfo = await this.getDeviceInfo();
    return deviceInfo?.deviceId || 'unknown';
  }

  public async isEmulator(): Promise<boolean> {
    const deviceInfo = await this.getDeviceInfo();
    return deviceInfo?.isEmulator || false;
  }

  public async hasNotch(): Promise<boolean> {
    const deviceInfo = await this.getDeviceInfo();
    return deviceInfo?.hasNotch || false;
  }

  /**
   * Mobile state utilities
   */
  public getMobileState(): MobileState {
    return mobileService.getMobileState();
  }

  public isMobileDevice(): boolean {
    return mobileService.isMobileDevice();
  }

  public getDeviceType(): 'phone' | 'tablet' | 'unknown' {
    return mobileService.getCurrentDeviceType();
  }

  public isPortrait(): boolean {
    const state = this.getMobileState();
    return state.orientation === 'portrait';
  }

  public isLandscape(): boolean {
    const state = this.getMobileState();
    return state.orientation === 'landscape';
  }

  /**
   * Date and time formatting utilities
   */
  public formatDate(dateString: string | Date): string {
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }

      // Format based on mobile config
      const config = mobileConfigService.getConfig();

      if (config.darkMode) {
        // Use 24-hour format for dark mode
        return date.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
      } else {
        // Use 12-hour format for light mode
        return date.toLocaleString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        });
      }
    } catch (error) {
      console.error('Date formatting failed:', error);
      return 'Invalid date';
    }
  }

  public formatTime(dateString: string | Date): string {
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;

      if (isNaN(date.getTime())) {
        return '--:--';
      }

      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      });
    } catch (error) {
      console.error('Time formatting failed:', error);
      return '--:--';
    }
  }

  public formatRelativeTime(dateString: string | Date): string {
    try {
      const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffInSeconds < 60) {
        return `${diffInSeconds}s ago`;
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        return `${minutes}m ago`;
      } else if (diffInSeconds < 86400) {
        const hours = Math.floor(diffInSeconds / 3600);
        return `${hours}h ago`;
      } else if (diffInSeconds < 2592000) {
        const days = Math.floor(diffInSeconds / 86400);
        return `${days}d ago`;
      } else {
        return this.formatDate(date);
      }
    } catch (error) {
      console.error('Relative time formatting failed:', error);
      return 'Unknown time';
    }
  }

  /**
   * User interaction utilities
   */
  public async triggerHapticFeedback(type: 'selection' | 'impact' | 'notification' = 'selection'): Promise<void> {
    const config = mobileConfigService.getConfig();
    if (config.enableHapticFeedback) {
      await mobileService.triggerHapticFeedback(type);

      // Also trigger vibration as fallback
      if (type === 'impact') {
        Vibration.vibrate(20);
      } else if (type === 'notification') {
        Vibration.vibrate([0, 50, 20, 50]);
      } else {
        Vibration.vibrate(10);
      }
    }
  }

  public async shareContent(content: {
    title: string;
    message: string;
    url?: string;
  }): Promise<void> {
    try {
      await Share.share({
        title: content.title,
        message: content.url ? `${content.message}\n\n${content.url}` : content.message,
        url: content.url,
      });
    } catch (error) {
      console.error('Sharing failed:', error);
      Alert.alert('Sharing failed', 'Unable to share content');
    }
  }

  /**
   * Performance and optimization utilities
   */
  public async optimizeForPerformance(): Promise<void> {
    const state = this.getMobileState();

    if (state.batteryLevel < 0.3 || state.isLowPowerMode) {
      await mobileService.enablePerformanceMode();
    }
  }

  public async checkPerformanceConstraints(): Promise<{
    shouldReduceAnimations: boolean;
    shouldDisableHaptics: boolean;
    shouldLimitSync: boolean;
  }> {
    const state = this.getMobileState();
    const config = mobileConfigService.getConfig();

    return {
      shouldReduceAnimations: state.batteryLevel < 0.2 || state.isLowPowerMode || config.animationQuality === 'low',
      shouldDisableHaptics: state.batteryLevel < 0.15 || state.isLowPowerMode || !config.enableHapticFeedback,
      shouldLimitSync: state.batteryLevel < 0.25 || state.networkStatus === 'offline' || state.isLowPowerMode,
    };
  }

  /**
   * Navigation and deep linking utilities
   */
  public async openExternalUrl(url: string): Promise<void> {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Cannot open URL', `Unable to open: ${url}`);
      }
    } catch (error) {
      console.error('Failed to open URL:', error);
      Alert.alert('Error', 'Failed to open the link');
    }
  }

  public async getInitialUrl(): Promise<string | null> {
    try {
      const url = await Linking.getInitialURL();
      return url;
    } catch (error) {
      console.error('Failed to get initial URL:', error);
      return null;
    }
  }

  /**
   * Storage and caching utilities
   */
  public async clearMobileCache(): Promise<void> {
    try {
      // Clear various caches
      await DeviceInfo.clearCache();

      // Notify about cache clearance
      this.triggerHapticFeedback('notification');
      Alert.alert('Cache cleared', 'Mobile cache has been cleared successfully');
    } catch (error) {
      console.error('Failed to clear mobile cache:', error);
      Alert.alert('Error', 'Failed to clear cache');
    }
  }

  /**
   * Error handling and logging utilities
   */
  public logMobileError(error: Error, context: string = 'Mobile'): void {
    console.error(`[${context} Error]`, error.message, error.stack);

    // Additional mobile-specific error handling could go here
    if (error.message.includes('network') || error.message.includes('offline')) {
      // Handle network errors specifically
      this.handleNetworkError();
    }
  }

  private handleNetworkError(): void {
    // Implement network error handling
    Alert.alert(
      'Network Error',
      'Please check your internet connection and try again',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: () => this.openNetworkSettings() },
      ]
    );
  }

  /**
   * Utility functions for mobile development
   */
  public isIOS(): boolean {
    return Platform.OS === 'ios';
  }

  public isAndroid(): boolean {
    return Platform.OS === 'android';
  }

  public isWeb(): boolean {
    return Platform.OS === 'web';
  }

  public getPlatform(): 'ios' | 'android' | 'web' | 'other' {
    if (Platform.OS === 'ios') return 'ios';
    if (Platform.OS === 'android') return 'android';
    if (Platform.OS === 'web') return 'web';
    return 'other';
  }

  public async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public cleanup(): void {
    this.configChangeListeners = [];
  }
}

// Singleton instance
export const mobileUtils = MobileUtils.getInstance();