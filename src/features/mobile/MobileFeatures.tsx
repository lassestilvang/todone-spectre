import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { useMobileState } from "./MobileStateContext";
import { useMobile } from "../../../hooks/useMobile";
import { useMobileConfig } from "../../../hooks/useMobileConfig";
import { mobileUtils } from "../../../utils/mobileUtils";
import { mobileConfigUtils } from "../../../utils/mobileConfigUtils";
import { MobileStatusIndicators } from "./MobileStatusIndicators";
import { MobileUIControls } from "./MobileUIControls";
import Icon from "react-native-vector-icons/MaterialIcons";

interface MobileFeaturesProps {
  featureSet?: (
    | "performance"
    | "accessibility"
    | "network"
    | "battery"
    | "theme"
  )[];
  showFeatureControls?: boolean;
  onFeatureChange?: (feature: string, enabled: boolean) => void;
}

export const MobileFeatures: React.FC<MobileFeaturesProps> = ({
  featureSet = ["performance", "accessibility", "network", "battery", "theme"],
  showFeatureControls = true,
  onFeatureChange,
}) => {
  const {
    mobileState,
    mobileConfig,
    mobilePreferences,
    toggleDarkMode,
    setPerformanceMode,
    setAccessibilityPreferences,
  } = useMobileState();

  const { triggerHapticFeedback } = useMobile();
  const [activeFeatures, setActiveFeatures] = useState<string[]>(featureSet);
  const [featureStatus, setFeatureStatus] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    // Initialize feature status based on current configuration
    const initialStatus: Record<string, boolean> = {};

    if (featureSet.includes("performance")) {
      initialStatus.performance = mobileConfig.performanceMode === "high";
    }

    if (featureSet.includes("accessibility")) {
      initialStatus.accessibility =
        mobilePreferences.accessibility.reducedMotion;
    }

    if (featureSet.includes("network")) {
      initialStatus.network = mobileState.networkStatus === "online";
    }

    if (featureSet.includes("battery")) {
      initialStatus.battery = !mobileState.isLowPowerMode;
    }

    if (featureSet.includes("theme")) {
      initialStatus.theme = mobileConfig.darkMode;
    }

    setFeatureStatus(initialStatus);
  }, [mobileState, mobileConfig, mobilePreferences, featureSet]);

  const handleFeatureToggle = async (feature: string) => {
    try {
      let newStatus: boolean;

      switch (feature) {
        case "performance":
          newStatus = !featureStatus[feature];
          await setPerformanceMode(newStatus ? "high" : "balanced");
          await triggerHapticFeedback("selection");
          break;

        case "accessibility":
          newStatus = !featureStatus[feature];
          await setAccessibilityPreferences({
            reducedMotion: newStatus,
          });
          await triggerHapticFeedback("selection");
          break;

        case "theme":
          newStatus = !featureStatus[feature];
          await toggleDarkMode();
          await triggerHapticFeedback("selection");
          break;

        default:
          newStatus = !featureStatus[feature];
          await triggerHapticFeedback("selection");
      }

      setFeatureStatus((prev) => ({
        ...prev,
        [feature]: newStatus,
      }));

      if (onFeatureChange) {
        onFeatureChange(feature, newStatus);
      }
    } catch (error) {
      console.error(`Failed to toggle feature ${feature}:`, error);
      Alert.alert("Error", `Failed to update ${feature} feature`);
    }
  };

  const getFeatureInfo = (feature: string) => {
    switch (feature) {
      case "performance":
        return {
          icon: "speed",
          label: "Performance Mode",
          description:
            mobileConfig.performanceMode === "high"
              ? "High Performance"
              : "Balanced Performance",
          color:
            mobileConfig.performanceMode === "high"
              ? "#4CAF50"
              : mobileConfig.secondaryColor,
        };

      case "accessibility":
        return {
          icon: "accessibility",
          label: "Accessibility",
          description: mobilePreferences.accessibility.reducedMotion
            ? "Reduced Motion"
            : "Standard Motion",
          color: mobilePreferences.accessibility.reducedMotion
            ? "#FF9800"
            : mobileConfig.secondaryColor,
        };

      case "network":
        return {
          icon: mobileState.networkStatus === "online" ? "wifi" : "wifi-off",
          label: "Network",
          description:
            mobileState.networkStatus === "online" ? "Online" : "Offline",
          color: mobileState.networkStatus === "online" ? "#4CAF50" : "#F44336",
        };

      case "battery":
        return {
          icon: mobileState.isLowPowerMode ? "battery-saver" : "battery-full",
          label: "Battery",
          description: mobileState.isLowPowerMode
            ? "Battery Saver"
            : "Normal Power",
          color: mobileState.isLowPowerMode
            ? "#FF9800"
            : mobileConfig.secondaryColor,
        };

      case "theme":
        return {
          icon: mobileConfig.darkMode ? "dark-mode" : "light-mode",
          label: "Theme",
          description: mobileConfig.darkMode ? "Dark Mode" : "Light Mode",
          color: mobileConfig.darkMode
            ? "#BB86FC"
            : mobileConfig.secondaryColor,
        };

      default:
        return {
          icon: "help",
          label: "Unknown",
          description: "Unknown feature",
          color: mobileConfig.secondaryColor,
        };
    }
  };

  const renderFeatureItem = (feature: string) => {
    if (!activeFeatures.includes(feature)) return null;

    const { icon, label, description, color } = getFeatureInfo(feature);
    const isActive = featureStatus[feature] ?? false;

    return (
      <View key={feature} style={styles.featureItem}>
        <View style={styles.featureInfo}>
          <Icon name={icon} size={20} color={color} />
          <View style={styles.featureText}>
            <Text
              style={[
                styles.featureLabel,
                mobileConfig.darkMode ? styles.darkText : styles.lightText,
              ]}
            >
              {label}
            </Text>
            <Text
              style={[
                styles.featureDescription,
                mobileConfig.darkMode
                  ? styles.darkSubtext
                  : styles.lightSubtext,
              ]}
            >
              {description}
            </Text>
          </View>
        </View>

        {showFeatureControls && (
          <TouchableOpacity
            style={[
              styles.featureToggle,
              isActive && styles.activeFeatureToggle,
            ]}
            onPress={() => handleFeatureToggle(feature)}
            disabled={!featureSet.includes(feature)}
          >
            <Icon
              name={isActive ? "toggle-on" : "toggle-off"}
              size={24}
              color={
                isActive
                  ? mobileConfig.primaryColor
                  : mobileConfig.secondaryColor
              }
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const getMobileOptimizationScore = (): number => {
    let score = 0;

    // Performance optimization score
    if (mobileConfig.performanceMode === "high") score += 20;
    if (mobileConfig.performanceMode === "balanced") score += 10;

    // Battery optimization score
    if (!mobileState.isLowPowerMode) score += 15;
    if (mobileState.batteryLevel > 0.5) score += 10;

    // Network optimization score
    if (mobileState.networkStatus === "online") score += 15;

    // Accessibility score
    if (mobilePreferences.accessibility.reducedMotion) score += 10;

    // Theme score
    if (mobileConfig.darkMode) score += 5;

    return Math.min(100, Math.max(0, score));
  };

  const optimizationScore = getMobileOptimizationScore();
  const optimizationLevel =
    optimizationScore >= 80
      ? "Excellent"
      : optimizationScore >= 60
        ? "Good"
        : optimizationScore >= 40
          ? "Fair"
          : "Needs Improvement";

  return (
    <View
      style={[
        styles.container,
        mobileConfig.darkMode ? styles.darkContainer : styles.lightContainer,
      ]}
    >
      <View style={styles.header}>
        <Text
          style={[
            styles.title,
            mobileConfig.darkMode ? styles.darkTitle : styles.lightTitle,
          ]}
        >
          Mobile Features
        </Text>

        <View style={styles.optimizationInfo}>
          <Text
            style={[
              styles.optimizationLabel,
              mobileConfig.darkMode ? styles.darkSubtext : styles.lightSubtext,
            ]}
          >
            Optimization: {optimizationLevel}
          </Text>
          <View style={styles.scoreContainer}>
            <Text
              style={[
                styles.scoreText,
                mobileConfig.darkMode ? styles.darkText : styles.lightText,
              ]}
            >
              {optimizationScore}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.featuresList}>
        {featureSet.map((feature) => renderFeatureItem(feature))}
      </View>

      <View style={styles.statusSection}>
        <MobileStatusIndicators
          showNetwork={featureSet.includes("network")}
          showBattery={featureSet.includes("battery")}
          showPerformance={featureSet.includes("performance")}
          showOrientation={false}
        />
      </View>

      {showFeatureControls && (
        <View style={styles.controlsSection}>
          <MobileUIControls
            onThemeChange={(darkMode) => {
              if (onFeatureChange) onFeatureChange("theme", darkMode);
            }}
            onPerformanceChange={(mode) => {
              if (onFeatureChange)
                onFeatureChange("performance", mode === "high");
            }}
          />
        </View>
      )}
    </View>
  );
};

// Mobile Feature Management Hook
export const useMobileFeatures = () => {
  const { mobileState, mobileConfig, mobilePreferences } = useMobileState();
  const { triggerHapticFeedback } = useMobile();

  const getAvailableFeatures = (): string[] => {
    const features: string[] = [];

    // Always available features
    features.push("theme");

    // Performance features
    if (mobileState.deviceType !== "unknown") {
      features.push("performance");
    }

    // Accessibility features
    if (mobilePreferences.featureFlags.accessibility) {
      features.push("accessibility");
    }

    // Network features
    if (mobileState.networkStatus !== "unknown") {
      features.push("network");
    }

    // Battery features
    if (mobileState.batteryLevel !== null) {
      features.push("battery");
    }

    return features;
  };

  const optimizeAllFeatures = async (): Promise<void> => {
    try {
      // Optimize based on current conditions
      const shouldUseHighPerformance =
        mobileState.batteryLevel > 0.5 &&
        mobileState.networkStatus === "online";

      if (shouldUseHighPerformance) {
        await mobileConfigUtils.setPerformanceMode("high");
      } else {
        await mobileConfigUtils.setPerformanceMode("battery_saver");
      }

      // Enable accessibility if battery is low
      if (mobileState.batteryLevel < 0.3) {
        await mobileConfigUtils.updateAccessibilityPreferences({
          reducedMotion: true,
        });
      }

      await triggerHapticFeedback("notification");
    } catch (error) {
      console.error("Failed to optimize all features:", error);
    }
  };

  const resetAllFeatures = async (): Promise<void> => {
    try {
      await mobileConfigUtils.setPerformanceMode("balanced");
      await mobileConfigUtils.updateAccessibilityPreferences({
        reducedMotion: false,
      });

      await triggerHapticFeedback("notification");
    } catch (error) {
      console.error("Failed to reset all features:", error);
    }
  };

  return {
    getAvailableFeatures,
    optimizeAllFeatures,
    resetAllFeatures,
  };
};

// Mobile Feature Configuration
export interface MobileFeatureConfig {
  enabledFeatures?: string[];
  defaultPerformanceMode?: "high" | "balanced" | "battery_saver";
  enableAutoOptimization?: boolean;
  showFeatureIndicators?: boolean;
  showFeatureControls?: boolean;
}

export const defaultMobileFeatureConfig: MobileFeatureConfig = {
  enabledFeatures: [
    "performance",
    "accessibility",
    "network",
    "battery",
    "theme",
  ],
  defaultPerformanceMode: "balanced",
  enableAutoOptimization: true,
  showFeatureIndicators: true,
  showFeatureControls: true,
};

// Mobile Feature Status Component
export const MobileFeatureStatus: React.FC<{
  feature: string;
  onPress?: () => void;
}> = ({ feature, onPress }) => {
  const { mobileState, mobileConfig, mobilePreferences } = useMobileState();
  const { triggerHapticFeedback } = useMobile();

  const getFeatureStatus = () => {
    switch (feature) {
      case "performance":
        return {
          status: mobileConfig.performanceMode,
          icon:
            mobileConfig.performanceMode === "high"
              ? "trending-up"
              : mobileConfig.performanceMode === "battery_saver"
                ? "battery-saver"
                : "balance",
          color:
            mobileConfig.performanceMode === "high"
              ? "#4CAF50"
              : mobileConfig.performanceMode === "battery_saver"
                ? "#FF9800"
                : mobileConfig.secondaryColor,
        };

      case "accessibility":
        return {
          status: mobilePreferences.accessibility.reducedMotion
            ? "reduced_motion"
            : "standard",
          icon: mobilePreferences.accessibility.reducedMotion
            ? "accessibility"
            : "accessible",
          color: mobilePreferences.accessibility.reducedMotion
            ? "#FF9800"
            : mobileConfig.secondaryColor,
        };

      case "network":
        return {
          status: mobileState.networkStatus,
          icon:
            mobileState.networkStatus === "online"
              ? "wifi"
              : mobileState.networkStatus === "offline"
                ? "wifi-off"
                : "help",
          color:
            mobileState.networkStatus === "online"
              ? "#4CAF50"
              : mobileState.networkStatus === "offline"
                ? "#F44336"
                : mobileConfig.secondaryColor,
        };

      case "battery":
        return {
          status: mobileState.isLowPowerMode ? "battery_saver" : "normal",
          icon: mobileState.isLowPowerMode
            ? "battery-saver"
            : mobileState.batteryLevel > 0.8
              ? "battery-full"
              : mobileState.batteryLevel > 0.5
                ? "battery-60"
                : mobileState.batteryLevel > 0.3
                  ? "battery-50"
                  : "battery-30",
          color: mobileState.isLowPowerMode
            ? "#FF9800"
            : mobileState.batteryLevel < 0.2
              ? "#F44336"
              : mobileConfig.secondaryColor,
        };

      case "theme":
        return {
          status: mobileConfig.darkMode ? "dark" : "light",
          icon: mobileConfig.darkMode ? "dark-mode" : "light-mode",
          color: mobileConfig.darkMode
            ? "#BB86FC"
            : mobileConfig.secondaryColor,
        };

      default:
        return {
          status: "unknown",
          icon: "help",
          color: mobileConfig.secondaryColor,
        };
    }
  };

  const { status, icon, color } = getFeatureStatus();

  return (
    <TouchableOpacity
      style={styles.featureStatusContainer}
      onPress={async () => {
        if (onPress) {
          await onPress();
        }
        await triggerHapticFeedback("selection");
      }}
    >
      <Icon name={icon} size={16} color={color} />
      <Text style={[styles.featureStatusText, { color }]}>{status}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  darkContainer: {
    backgroundColor: "#1e1e1e",
  },
  lightContainer: {
    backgroundColor: "#ffffff",
  },
  header: {
    marginBottom: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  darkHeader: {
    borderBottomColor: "#333",
  },
  lightHeader: {
    borderBottomColor: "#e0e0e0",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  darkTitle: {
    color: "#ffffff",
  },
  lightTitle: {
    color: "#333333",
  },
  optimizationInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optimizationLabel: {
    fontSize: 14,
  },
  scoreContainer: {
    backgroundColor: "rgba(76, 175, 80, 0.2)",
    padding: 4,
    borderRadius: 12,
    minWidth: 40,
    alignItems: "center",
  },
  scoreText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  featuresList: {
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.05)",
  },
  featureInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  featureText: {
    flex: 1,
  },
  featureLabel: {
    fontSize: 14,
    fontWeight: "bold",
  },
  featureDescription: {
    fontSize: 12,
    opacity: 0.8,
  },
  featureToggle: {
    padding: 8,
  },
  activeFeatureToggle: {
    backgroundColor: "rgba(76, 175, 80, 0.1)",
    borderRadius: 20,
  },
  statusSection: {
    marginBottom: 16,
  },
  controlsSection: {
    marginTop: 16,
  },
  featureStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 8,
  },
  featureStatusText: {
    fontSize: 12,
    fontWeight: "500",
  },
  darkText: {
    color: "#ffffff",
  },
  lightText: {
    color: "#333333",
  },
  darkSubtext: {
    color: "#bbbbbb",
  },
  lightSubtext: {
    color: "#666666",
  },
});
