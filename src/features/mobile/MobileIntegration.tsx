import React, { useEffect } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { useMobileState } from "./MobileStateContext";
import { useMobile } from "../../../hooks/useMobile";
import { useMobileConfig } from "../../../hooks/useMobileConfig";
import { mobileService } from "../../../services/mobileService";
import { mobileConfigService } from "../../../services/mobileConfigService";
import { mobileUtils } from "../../../utils/mobileUtils";
import { MobileStatusIndicators } from "./MobileStatusIndicators";
import { MobileUIControls } from "./MobileUIControls";

interface MobileIntegrationProps {
  children: React.ReactNode;
  showStatusIndicators?: boolean;
  showUIControls?: boolean;
  integrationMode?: "full" | "minimal" | "custom";
}

export const MobileIntegration: React.FC<MobileIntegrationProps> = ({
  children,
  showStatusIndicators = true,
  showUIControls = false,
  integrationMode = "full",
}) => {
  const { mobileState, mobileConfig, mobilePreferences } = useMobileState();
  const { isMobile, deviceType } = useMobile();
  const { triggerHapticFeedback } = useMobile();

  useEffect(() => {
    const initializeMobileIntegration = async () => {
      try {
        // Initialize all mobile services
        await mobileService.initialize();
        await mobileConfigService.initialize();
        await mobileUtils.initialize();

        // Apply mobile-specific optimizations
        await applyMobileOptimizations();

        // Set up mobile event listeners
        setupMobileEventListeners();

        console.log("Mobile integration initialized successfully");
      } catch (error) {
        console.error("Failed to initialize mobile integration:", error);
        // Could show error to user here
      }
    };

    initializeMobileIntegration();

    return () => {
      cleanupMobileIntegration();
    };
  }, []);

  const applyMobileOptimizations = async () => {
    try {
      // Apply performance optimizations based on device capabilities
      if (mobileState.batteryLevel < 0.3 || mobileState.isLowPowerMode) {
        await mobileConfigService.setPerformanceMode("battery_saver");
      }

      // Apply theme based on system preferences
      if (Platform.OS !== "web") {
        const systemTheme =
          Platform.OS === "ios"
            ? "light" // iOS default
            : "dark"; // Android default

        // Don't override user preference if already set
        if (!mobilePreferences.tutorialCompleted) {
          // Could apply system theme here if desired
        }
      }

      // Trigger haptic feedback to confirm initialization
      if (mobileConfig.enableHapticFeedback) {
        await triggerHapticFeedback("notification");
      }
    } catch (error) {
      console.error("Failed to apply mobile optimizations:", error);
    }
  };

  const setupMobileEventListeners = () => {
    try {
      // Set up battery level monitoring
      const batteryInterval = setInterval(async () => {
        const batteryStatus = await mobileService.checkNetworkStatus();
        if (
          batteryStatus === "offline" &&
          mobileConfig.notificationPreferences.taskReminders
        ) {
          // Could show offline notification here
        }
      }, 60000); // Check every minute

      // Set up network status monitoring
      const networkInterval = setInterval(async () => {
        const batteryLevel = mobileState.batteryLevel;
        if (batteryLevel < 0.2 && !mobileState.isLowPowerMode) {
          // Could trigger low battery warning
        }
      }, 30000); // Check every 30 seconds

      return () => {
        clearInterval(batteryInterval);
        clearInterval(networkInterval);
      };
    } catch (error) {
      console.error("Failed to set up mobile event listeners:", error);
    }
  };

  const cleanupMobileIntegration = () => {
    try {
      // Clean up mobile services
      mobileService.cleanup();
      mobileConfigService.cleanup();
      mobileUtils.cleanup();

      console.log("Mobile integration cleaned up");
    } catch (error) {
      console.error("Failed to clean up mobile integration:", error);
    }
  };

  const getIntegrationComponents = () => {
    switch (integrationMode) {
      case "minimal":
        return showStatusIndicators ? (
          <MobileStatusIndicators
            showNetwork={true}
            showBattery={true}
            showPerformance={false}
            showOrientation={false}
          />
        ) : null;

      case "custom":
        return (
          <>
            {showStatusIndicators && (
              <MobileStatusIndicators
                showNetwork={true}
                showBattery={true}
                showPerformance={true}
                showOrientation={true}
              />
            )}
            {showUIControls && <MobileUIControls />}
          </>
        );

      case "full":
      default:
        return (
          <>
            <MobileStatusIndicators
              showNetwork={true}
              showBattery={true}
              showPerformance={true}
              showOrientation={false}
            />
            {showUIControls && <MobileUIControls />}
          </>
        );
    }
  };

  return (
    <View
      style={[
        styles.container,
        mobileConfig.darkMode ? styles.darkContainer : styles.lightContainer,
      ]}
    >
      {getIntegrationComponents()}
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  darkContainer: {
    backgroundColor: "#121212",
  },
  lightContainer: {
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
  },
});

// Mobile Integration Helper Functions
export const useMobileIntegration = () => {
  const { mobileState, mobileConfig } = useMobileState();
  const { triggerHapticFeedback } = useMobile();

  const optimizeForCurrentConditions = async () => {
    try {
      // Check current conditions and apply optimizations
      const shouldOptimize =
        mobileState.batteryLevel < 0.25 ||
        mobileState.networkStatus === "offline" ||
        mobileState.isLowPowerMode;

      if (shouldOptimize && mobileConfig.performanceMode !== "battery_saver") {
        await mobileConfigService.setPerformanceMode("battery_saver");
        await triggerHapticFeedback("notification");
      }
    } catch (error) {
      console.error("Failed to optimize for current conditions:", error);
    }
  };

  const checkMobileCapabilities = async () => {
    try {
      const capabilities = await mobileService.checkMobileCapabilities();
      return {
        supportsTouch: capabilities.supportsTouch,
        supportsBiometrics: capabilities.supportsBiometrics,
        supportsHapticFeedback: capabilities.supportsHapticFeedback,
      };
    } catch (error) {
      console.error("Failed to check mobile capabilities:", error);
      return {
        supportsTouch: false,
        supportsBiometrics: false,
        supportsHapticFeedback: false,
      };
    }
  };

  return {
    optimizeForCurrentConditions,
    checkMobileCapabilities,
  };
};

// Mobile Integration Configuration
export interface MobileIntegrationConfig {
  enablePerformanceOptimization?: boolean;
  enableNetworkMonitoring?: boolean;
  enableBatteryMonitoring?: boolean;
  enableHapticFeedback?: boolean;
  enableStatusIndicators?: boolean;
  integrationLevel?: "basic" | "standard" | "advanced";
}

export const defaultMobileIntegrationConfig: MobileIntegrationConfig = {
  enablePerformanceOptimization: true,
  enableNetworkMonitoring: true,
  enableBatteryMonitoring: true,
  enableHapticFeedback: true,
  enableStatusIndicators: true,
  integrationLevel: "standard",
};
