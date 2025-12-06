// @ts-nocheck
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Dimensions,
  Animated,
} from "react-native";
import { useMobileConfig } from "../../../hooks/useMobileConfig";
import { useMobile } from "../../../hooks/useMobileConfig";
import { useNavigation } from "@react-navigation/native";
import Icon from "react-native-vector-icons/MaterialIcons";

interface ResponsiveMobileNavigationProps {
  activeTab: "tasks" | "projects" | "calendar" | "settings" | "search";
  onTabChange: (
    tab: "tasks" | "projects" | "calendar" | "settings" | "search",
  ) => void;
  showLabels?: boolean;
  compactMode?: boolean;
}

export const ResponsiveMobileNavigation: React.FC<
  ResponsiveMobileNavigationProps
> = ({ activeTab, onTabChange, showLabels = true, compactMode = false }) => {
  const { mobileConfig } = useMobileConfig();
  const { isPortrait, isLandscape, isSmallScreen } = useMobile();
  const navigation = useNavigation();
  const [animation] = useState(new Animated.Value(0));
  const [screenWidth, setScreenWidth] = useState(
    Dimensions.get("window").width,
  );

  useEffect(() => {
    const dimensionListener = Dimensions.addEventListener(
      "change",
      ({ window }) => {
        setScreenWidth(window.width);
      },
    );

    // Animate navigation bar on mount
    Animated.timing(animation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    return () => {
      dimensionListener.remove();
    };
  }, []);

  const getNavigationStyle = () => {
    const isCompact = compactMode || isSmallScreen() || screenWidth < 375;
    const shouldShowLabels = showLabels && !isCompact;

    return {
      container: {
        height: isCompact ? 56 : 64,
        paddingHorizontal: isCompact ? 8 : 12,
      },
      tabItem: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        minWidth: isCompact ? 40 : 56,
        maxWidth: isCompact ? 48 : 64,
      },
      tabContent: {
        alignItems: "center",
        justifyContent: "center",
        gap: shouldShowLabels ? 4 : 0,
      },
      tabText: {
        fontSize: isCompact ? 10 : 12,
        display: shouldShowLabels ? "flex" : "none",
      },
      icon: {
        size: isCompact ? 20 : 24,
      },
    };
  };

  const navStyles = getNavigationStyle();

  const navItems = [
    { key: "tasks", icon: "checklist", label: "Tasks" },
    { key: "projects", icon: "folder", label: "Projects" },
    { key: "calendar", icon: "calendar-today", label: "Calendar" },
    { key: "search", icon: "search", label: "Search" },
    { key: "settings", icon: "settings", label: "Settings" },
  ];

  const handleTabPress = (
    tab: "tasks" | "projects" | "calendar" | "settings" | "search",
  ) => {
    onTabChange(tab);

    // Trigger haptic feedback
    if (mobileConfig.enableHapticFeedback) {
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 0.95,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.spring(animation, {
          toValue: 1,
          friction: 3,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    }

    // Navigation logic
    if (tab === "tasks") {
      navigation.navigate("Tasks");
    } else if (tab === "projects") {
      navigation.navigate("Projects");
    } else if (tab === "calendar") {
      navigation.navigate("Calendar");
    } else if (tab === "search") {
      navigation.navigate("Search");
    } else {
      navigation.navigate("Settings");
    }
  };

  const getTabIndicatorStyle = (isActive: boolean) => {
    if (isActive) {
      return {
        backgroundColor: mobileConfig.darkMode
          ? "rgba(102, 187, 106, 0.2)"
          : "rgba(76, 175, 80, 0.1)",
        borderTopWidth: 2,
        borderTopColor: mobileConfig.primaryColor,
      };
    }
    return {};
  };

  return (
    <Animated.View
      style={[
        styles.container,
        mobileConfig.darkMode ? styles.darkContainer : styles.lightContainer,
        navStyles.container,
        { opacity: animation, transform: [{ scale: animation }] },
      ]}
    >
      {navItems.map((item) => (
        <TouchableOpacity
          key={item.key}
          style={[styles.tabItem, navStyles.tabItem]}
          onPress={() =>
            handleTabPress(
              item.key as
                | "tasks"
                | "projects"
                | "calendar"
                | "settings"
                | "search",
            )
          }
        >
          <View style={[styles.tabContent, navStyles.tabContent]}>
            <View
              style={[
                styles.tabIndicator,
                getTabIndicatorStyle(activeTab === item.key),
              ]}
            >
              <Icon
                name={item.icon}
                size={navStyles.icon.size}
                color={
                  activeTab === item.key
                    ? mobileConfig.primaryColor
                    : mobileConfig.secondaryColor
                }
              />
              <Text
                style={[
                  styles.tabText,
                  navStyles.tabText,
                  activeTab === item.key
                    ? styles.activeTabText
                    : styles.inactiveTabText,
                  mobileConfig.darkMode
                    ? styles.darkTabText
                    : styles.lightTabText,
                ]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    zIndex: 100,
  },
  darkContainer: {
    backgroundColor: "#1e1e1e",
    borderTopColor: "#333",
  },
  lightContainer: {
    backgroundColor: "#ffffff",
    borderTopColor: "#e0e0e0",
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    height: "100%",
  },
  tabContent: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  tabIndicator: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
    padding: 4,
    borderRadius: 8,
  },
  tabText: {
    fontWeight: "bold",
    textAlign: "center",
  },
  activeTabText: {
    fontWeight: "bold",
  },
  inactiveTabText: {
    opacity: 0.7,
  },
  darkTabText: {
    color: "#ffffff",
  },
  lightTabText: {
    color: "#333333",
  },
});
