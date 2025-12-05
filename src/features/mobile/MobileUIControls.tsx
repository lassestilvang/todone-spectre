import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Platform,
} from "react-native";
import { useMobileConfig } from "../../../hooks/useMobileConfig";
import { useMobile } from "../../../hooks/useMobile";
import Icon from "react-native-vector-icons/MaterialIcons";
import Slider from "@react-native-community/slider";

interface MobileUIControlsProps {
  onThemeChange?: (darkMode: boolean) => void;
  onPerformanceChange?: (mode: "high" | "balanced" | "battery_saver") => void;
  onHapticFeedbackChange?: (enabled: boolean) => void;
  onAnimationQualityChange?: (quality: "low" | "medium" | "high") => void;
}

export const MobileUIControls: React.FC<MobileUIControlsProps> = ({
  onThemeChange,
  onPerformanceChange,
  onHapticFeedbackChange,
  onAnimationQualityChange,
}) => {
  const { mobileConfig, updateConfig, toggleDarkMode, setPerformanceMode } =
    useMobileConfig();
  const { triggerHapticFeedback } = useMobile();

  const handleThemeToggle = async () => {
    await toggleDarkMode();
    if (onThemeChange) {
      onThemeChange(!mobileConfig.darkMode);
    }
    await triggerHapticFeedback("selection");
  };

  const handlePerformanceChange = async (
    mode: "high" | "balanced" | "battery_saver",
  ) => {
    await setPerformanceMode(mode);
    if (onPerformanceChange) {
      onPerformanceChange(mode);
    }
    await triggerHapticFeedback("selection");
  };

  const handleHapticToggle = async (value: boolean) => {
    await updateConfig({ enableHapticFeedback: value });
    if (onHapticFeedbackChange) {
      onHapticFeedbackChange(value);
    }
    if (value) {
      await triggerHapticFeedback("impact");
    }
  };

  const handleAnimationQualityChange = async (value: number) => {
    const qualityMap: Record<number, "low" | "medium" | "high"> = {
      0: "low",
      1: "medium",
      2: "high",
    };
    const quality = qualityMap[Math.round(value)] || "medium";
    await updateConfig({ animationQuality: quality });
    if (onAnimationQualityChange) {
      onAnimationQualityChange(quality);
    }
    await triggerHapticFeedback("selection");
  };

  const getAnimationQualityValue = () => {
    const qualityMap: Record<"low" | "medium" | "high", number> = {
      low: 0,
      medium: 1,
      high: 2,
    };
    return qualityMap[mobileConfig.animationQuality] || 1;
  };

  return (
    <View
      style={[
        styles.container,
        mobileConfig.darkMode ? styles.darkContainer : styles.lightContainer,
      ]}
    >
      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            mobileConfig.darkMode ? styles.darkText : styles.lightText,
          ]}
        >
          Theme Settings
        </Text>

        <View style={styles.controlItem}>
          <View style={styles.controlInfo}>
            <Icon
              name="dark-mode"
              size={20}
              color={mobileConfig.secondaryColor}
            />
            <Text
              style={[
                styles.controlLabel,
                mobileConfig.darkMode ? styles.darkText : styles.lightText,
              ]}
            >
              Dark Mode
            </Text>
          </View>
          <Switch
            value={mobileConfig.darkMode}
            onValueChange={handleThemeToggle}
            trackColor={{ false: "#767577", true: mobileConfig.primaryColor }}
            thumbColor={mobileConfig.darkMode ? "#f4f3f4" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            mobileConfig.darkMode ? styles.darkText : styles.lightText,
          ]}
        >
          Performance Settings
        </Text>

        <View style={styles.controlItem}>
          <View style={styles.controlInfo}>
            <Icon
              name="battery-saver"
              size={20}
              color={mobileConfig.secondaryColor}
            />
            <Text
              style={[
                styles.controlLabel,
                mobileConfig.darkMode ? styles.darkText : styles.lightText,
              ]}
            >
              Performance Mode
            </Text>
          </View>
          <View style={styles.buttonGroup}>
            {(["high", "balanced", "battery_saver"] as const).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.modeButton,
                  mobileConfig.performanceMode === mode &&
                    styles.activeModeButton,
                  mobileConfig.darkMode && styles.darkModeButton,
                ]}
                onPress={() => handlePerformanceChange(mode)}
              >
                <Text
                  style={[
                    styles.modeButtonText,
                    mobileConfig.performanceMode === mode &&
                      styles.activeModeButtonText,
                    mobileConfig.darkMode && styles.darkModeButtonText,
                  ]}
                >
                  {mode === "high"
                    ? "High"
                    : mode === "balanced"
                      ? "Balanced"
                      : "Battery Saver"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text
          style={[
            styles.sectionTitle,
            mobileConfig.darkMode ? styles.darkText : styles.lightText,
          ]}
        >
          Interaction Settings
        </Text>

        <View style={styles.controlItem}>
          <View style={styles.controlInfo}>
            <Icon
              name="vibration"
              size={20}
              color={mobileConfig.secondaryColor}
            />
            <Text
              style={[
                styles.controlLabel,
                mobileConfig.darkMode ? styles.darkText : styles.lightText,
              ]}
            >
              Haptic Feedback
            </Text>
          </View>
          <Switch
            value={mobileConfig.enableHapticFeedback}
            onValueChange={handleHapticToggle}
            trackColor={{ false: "#767577", true: mobileConfig.primaryColor }}
            thumbColor={
              mobileConfig.enableHapticFeedback ? "#f4f3f4" : "#f4f3f4"
            }
            ios_backgroundColor="#3e3e3e"
          />
        </View>

        <View style={styles.controlItem}>
          <View style={styles.controlInfo}>
            <Icon
              name="animation"
              size={20}
              color={mobileConfig.secondaryColor}
            />
            <Text
              style={[
                styles.controlLabel,
                mobileConfig.darkMode ? styles.darkText : styles.lightText,
              ]}
            >
              Animation Quality
            </Text>
          </View>
          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={2}
              step={1}
              value={getAnimationQualityValue()}
              onValueChange={handleAnimationQualityChange}
              minimumTrackTintColor={mobileConfig.primaryColor}
              maximumTrackTintColor="#767577"
              thumbTintColor={mobileConfig.primaryColor}
            />
            <View style={styles.sliderLabels}>
              <Text
                style={[
                  styles.sliderLabel,
                  mobileConfig.darkMode ? styles.darkText : styles.lightText,
                ]}
              >
                Low
              </Text>
              <Text
                style={[
                  styles.sliderLabel,
                  mobileConfig.darkMode ? styles.darkText : styles.lightText,
                ]}
              >
                Medium
              </Text>
              <Text
                style={[
                  styles.sliderLabel,
                  mobileConfig.darkMode ? styles.darkText : styles.lightText,
                ]}
              >
                High
              </Text>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  darkContainer: {
    backgroundColor: "#1e1e1e",
    borderColor: "#333",
    borderWidth: 1,
  },
  lightContainer: {
    backgroundColor: "#ffffff",
    borderColor: "#e0e0e0",
    borderWidth: 1,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  controlItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  controlInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  controlLabel: {
    fontSize: 14,
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 8,
  },
  modeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  darkModeButton: {
    borderColor: "#333",
  },
  activeModeButton: {
    backgroundColor: "rgba(76, 175, 80, 0.2)",
    borderColor: "#4CAF50",
  },
  modeButtonText: {
    fontSize: 12,
    color: "#666666",
  },
  darkModeButtonText: {
    color: "#bbbbbb",
  },
  activeModeButtonText: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  sliderContainer: {
    flex: 1,
    marginLeft: 16,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  sliderLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  sliderLabel: {
    fontSize: 10,
    flex: 1,
    textAlign: "center",
  },
  darkText: {
    color: "#ffffff",
  },
  lightText: {
    color: "#333333",
  },
});
