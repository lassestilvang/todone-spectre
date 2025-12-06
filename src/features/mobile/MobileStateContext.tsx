// @ts-nocheck
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useMobile } from "../../../hooks/useMobile";
import { useMobileConfig } from "../../../hooks/useMobileConfig";
import { mobileService } from "../../../services/mobileService";
import { mobileConfigService } from "../../../services/mobileConfigService";
import { mobileUtils } from "../../../utils/mobileUtils";
import {
  MobileState,
  MobileConfig,
  MobilePreferences,
  MobileDeviceInfo,
} from "../../../types/mobileTypes";

interface MobileStateContextType {
  mobileState: MobileState;
  mobileConfig: MobileConfig;
  mobilePreferences: MobilePreferences;
  deviceInfo: MobileDeviceInfo | null;
  isLoading: boolean;
  error: string | null;
  updateMobileState: (updates: Partial<MobileState>) => Promise<void>;
  updateMobileConfig: (updates: Partial<MobileConfig>) => Promise<void>;
  updateMobilePreferences: (
    updates: Partial<MobilePreferences>,
  ) => Promise<void>;
  refreshMobileState: () => Promise<void>;
  toggleDarkMode: () => Promise<void>;
  setPerformanceMode: (
    mode: "high" | "balanced" | "battery_saver",
  ) => Promise<void>;
  triggerHapticFeedback: (
    type?: "selection" | "impact" | "notification",
  ) => Promise<void>;
}

const MobileStateContext = createContext<MobileStateContextType | undefined>(
  undefined,
);

interface MobileStateProviderProps {
  children: ReactNode;
}

export const MobileStateProvider: React.FC<MobileStateProviderProps> = ({
  children,
}) => {
  const {
    mobileConfig: hookMobileConfig,
    mobilePreferences: hookMobilePreferences,
  } = useMobileConfig();
  const {
    isMobile,
    deviceType,
    isPortrait,
    isLandscape,
    getScreenWidth,
    isSmallScreen,
    isLargeScreen,
  } = useMobile();
  const [mobileState, setMobileState] = useState<MobileState>({
    isMobile: Platform.OS !== "web",
    deviceType: "unknown",
    orientation: "portrait",
    isTablet: false,
    screenDimensions: { width: 0, height: 0, scale: 1 },
    networkStatus: "online",
    batteryLevel: 1.0,
    isLowPowerMode: false,
  });
  const [deviceInfo, setDeviceInfo] = useState<MobileDeviceInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeMobileState = async () => {
      try {
        setIsLoading(true);

        // Initialize services
        await mobileService.initialize();
        await mobileConfigService.initialize();

        // Get initial state
        const initialState = mobileService.getMobileState();
        const initialDeviceInfo = mobileService.getDeviceInfo();

        setMobileState(initialState);
        setDeviceInfo(initialDeviceInfo);
        setIsLoading(false);
      } catch (err) {
        console.error("Failed to initialize mobile state:", err);
        setError("Failed to initialize mobile state");
        setIsLoading(false);
      }
    };

    initializeMobileState();

    // Set up periodic state refresh
    const interval = setInterval(async () => {
      try {
        const currentState = mobileService.getMobileState();
        setMobileState(currentState);
      } catch (err) {
        console.error("Failed to refresh mobile state:", err);
      }
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Sync with hook state changes
    setMobileState((prev) => ({
      ...prev,
      isMobile,
      deviceType,
      orientation: isPortrait() ? "portrait" : "landscape",
      screenDimensions: {
        width: getScreenWidth(),
        height: Dimensions.get("window").height,
        scale: Dimensions.get("window").scale,
      },
    }));
  }, [isMobile, deviceType, isPortrait, isLandscape, getScreenWidth]);

  const updateMobileState = async (
    updates: Partial<MobileState>,
  ): Promise<void> => {
    try {
      setMobileState((prev) => ({ ...prev, ...updates }));
    } catch (err) {
      console.error("Failed to update mobile state:", err);
      setError("Failed to update mobile state");
    }
  };

  const updateMobileConfig = async (
    updates: Partial<MobileConfig>,
  ): Promise<void> => {
    try {
      await mobileConfigService.updateConfig(updates);
      // State will be updated via the hook
    } catch (err) {
      console.error("Failed to update mobile config:", err);
      setError("Failed to update mobile config");
    }
  };

  const updateMobilePreferences = async (
    updates: Partial<MobilePreferences>,
  ): Promise<void> => {
    try {
      await mobileConfigService.updatePreferences(updates);
      // State will be updated via the hook
    } catch (err) {
      console.error("Failed to update mobile preferences:", err);
      setError("Failed to update mobile preferences");
    }
  };

  const refreshMobileState = async (): Promise<void> => {
    try {
      const currentState = mobileService.getMobileState();
      const currentDeviceInfo = mobileService.getDeviceInfo();

      setMobileState(currentState);
      setDeviceInfo(currentDeviceInfo);
    } catch (err) {
      console.error("Failed to refresh mobile state:", err);
      setError("Failed to refresh mobile state");
    }
  };

  const toggleDarkMode = async (): Promise<void> => {
    try {
      await mobileConfigService.toggleDarkMode();
      // State will be updated via the hook
    } catch (err) {
      console.error("Failed to toggle dark mode:", err);
      setError("Failed to toggle dark mode");
    }
  };

  const setPerformanceMode = async (
    mode: "high" | "balanced" | "battery_saver",
  ): Promise<void> => {
    try {
      await mobileConfigService.setPerformanceMode(mode);
      // State will be updated via the hook
    } catch (err) {
      console.error("Failed to set performance mode:", err);
      setError("Failed to set performance mode");
    }
  };

  const triggerHapticFeedback = async (
    type: "selection" | "impact" | "notification" = "selection",
  ): Promise<void> => {
    try {
      if (hookMobileConfig.enableHapticFeedback) {
        await mobileService.triggerHapticFeedback(type);
      }
    } catch (err) {
      console.error("Failed to trigger haptic feedback:", err);
    }
  };

  const value: MobileStateContextType = {
    mobileState,
    mobileConfig: hookMobileConfig,
    mobilePreferences: hookMobilePreferences,
    deviceInfo,
    isLoading,
    error,
    updateMobileState,
    updateMobileConfig,
    updateMobilePreferences,
    refreshMobileState,
    toggleDarkMode,
    setPerformanceMode,
    triggerHapticFeedback,
  };

  return (
    <MobileStateContext.Provider value={value}>
      {children}
    </MobileStateContext.Provider>
  );
};

export const useMobileState = (): MobileStateContextType => {
  const context = useContext(MobileStateContext);
  if (context === undefined) {
    throw new Error("useMobileState must be used within a MobileStateProvider");
  }
  return context;
};

// Helper hook for quick access to mobile state
export const useMobileStateValue = <T extends keyof MobileState>(
  key: T,
): MobileState[T] => {
  const { mobileState } = useMobileState();
  return mobileState[key];
};

// Helper hook for quick access to mobile config
export const useMobileConfigValue = <T extends keyof MobileConfig>(
  key: T,
): MobileConfig[T] => {
  const { mobileConfig } = useMobileState();
  return mobileConfig[key];
};

// Helper hook for quick access to mobile preferences
export const useMobilePreferencesValue = <T extends keyof MobilePreferences>(
  key: T,
): MobilePreferences[T] => {
  const { mobilePreferences } = useMobileState();
  return mobilePreferences[key];
};
