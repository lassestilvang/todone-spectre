import { useState, useEffect } from 'react';
import { Platform, Dimensions, Appearance } from 'react-native';
import { useMobileConfig } from './useMobileConfig';
import { mobileService } from '../services/mobileService';
import { mobileUtils } from '../utils/mobileUtils';

export const useMobile = () => {
  const { mobileConfig } = useMobileConfig();
  const [mobileState, setMobileState] = useState({
    isMobile: Platform.OS !== 'web',
    deviceType: 'unknown' as 'phone' | 'tablet' | 'unknown',
    orientation: 'portrait' as 'portrait' | 'landscape',
    screenDimensions: { width: 0, height: 0, scale: 1 },
    networkStatus: 'online' as 'online' | 'offline' | 'unknown',
    batteryLevel: 1.0,
    isLowPowerMode: false,
    isTablet: false,
  });

  const [deviceInfo, setDeviceInfo] = useState({
    deviceId: '',
    deviceName: '',
    systemName: '',
    systemVersion: '',
    appVersion: '',
    buildNumber: '',
    isEmulator: false,
    hasNotch: false,
  });

  const [mobileCapabilities, setMobileCapabilities] = useState({
    supportsTouch: false,
    supportsBiometrics: false,
    supportsHapticFeedback: false,
    supportsCamera: false,
    supportsLocation: false,
  });

  useEffect(() => {
    const initializeMobile = async () => {
      try {
        // Initialize mobile service
        await mobileService.initialize();

        // Get initial mobile state
        const initialState = mobileService.getMobileState();
        setMobileState(initialState);

        // Get device info
        const info = mobileService.getDeviceInfo();
        if (info) {
          setDeviceInfo({
            deviceId: info.deviceId,
            deviceName: info.deviceName,
            systemName: info.systemName,
            systemVersion: info.systemVersion,
            appVersion: info.appVersion,
            buildNumber: info.buildNumber,
            isEmulator: info.isEmulator,
            hasNotch: info.hasNotch,
          });
        }

        // Check mobile capabilities
        const capabilities = await mobileService.checkMobileCapabilities();
        setMobileCapabilities({
          supportsTouch: capabilities.supportsTouch,
          supportsBiometrics: capabilities.supportsBiometrics,
          supportsHapticFeedback: capabilities.supportsHapticFeedback,
          supportsCamera: Platform.OS !== 'web', // Simple check for camera support
          supportsLocation: Platform.OS !== 'web', // Simple check for location support
        });

        // Set up listeners
        const dimensionListener = Dimensions.addEventListener('change', () => {
          const updatedState = mobileService.getMobileState();
          setMobileState(updatedState);
        });

        return () => {
          dimensionListener.remove();
        };
      } catch (error) {
        console.error('Failed to initialize mobile hook:', error);
      }
    };

    initializeMobile();
  }, []);

  useEffect(() => {
    // Update mobile state periodically
    const interval = setInterval(() => {
      const currentState = mobileService.getMobileState();
      setMobileState(currentState);
    }, 5000); // Update every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const checkNetworkStatus = async (): Promise<'online' | 'offline' | 'unknown'> => {
    return mobileService.checkNetworkStatus();
  };

  const triggerHapticFeedback = async (type: 'selection' | 'impact' | 'notification' = 'selection') => {
    if (mobileCapabilities.supportsHapticFeedback && mobileConfig.enableHapticFeedback) {
      await mobileService.triggerHapticFeedback(type);
    }
  };

  const isPortrait = (): boolean => {
    return mobileState.orientation === 'portrait';
  };

  const isLandscape = (): boolean => {
    return mobileState.orientation === 'landscape';
  };

  const getScreenWidth = (): number => {
    return mobileState.screenDimensions.width;
  };

  const getScreenHeight = (): number => {
    return mobileState.screenDimensions.height;
  };

  const isSmallScreen = (): boolean => {
    return mobileState.screenDimensions.width < 375;
  };

  const isLargeScreen = (): boolean => {
    return mobileState.screenDimensions.width >= 414;
  };

  const supportsTouch = (): boolean => {
    return mobileCapabilities.supportsTouch;
  };

  const supportsBiometrics = (): boolean => {
    return mobileCapabilities.supportsBiometrics;
  };

  const isLowBattery = (): boolean => {
    return mobileState.batteryLevel < 0.2;
  };

  const isCriticalBattery = (): boolean => {
    return mobileState.batteryLevel < 0.1;
  };

  const getBatteryStatus = (): { level: number; isLow: boolean; isCritical: boolean } => {
    return {
      level: mobileState.batteryLevel,
      isLow: mobileState.batteryLevel < 0.2,
      isCritical: mobileState.batteryLevel < 0.1,
    };
  };

  return {
    ...mobileState,
    deviceInfo,
    mobileCapabilities,
    checkNetworkStatus,
    triggerHapticFeedback,
    isPortrait,
    isLandscape,
    getScreenWidth,
    getScreenHeight,
    isSmallScreen,
    isLargeScreen,
    supportsTouch,
    supportsBiometrics,
    isLowBattery,
    isCriticalBattery,
    getBatteryStatus,
  };
};