import React, { useState, useEffect } from "react";
import { useMobile } from "../../../hooks/useMobile";
import { useMobileConfig } from "../../../hooks/useMobileConfig";
import { mobileUtils } from "../../../utils/mobileUtils";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Platform,
  StatusBar,
} from "react-native";

interface MobileLayoutProps {
  children: React.ReactNode;
  title?: string;
  showNavigation?: boolean;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({
  children,
  title = "Todone",
  showNavigation = true,
}) => {
  const { isMobile, deviceType } = useMobile();
  const { mobileConfig } = useMobileConfig();
  const [layoutReady, setLayoutReady] = useState(false);

  useEffect(() => {
    const prepareLayout = async () => {
      await mobileUtils.initializeMobileEnvironment();
      setLayoutReady(true);
    };

    prepareLayout();
  }, []);

  if (!layoutReady) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading Todone Mobile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={mobileConfig.darkMode ? "light-content" : "dark-content"}
      />
      <View
        style={[
          styles.container,
          mobileConfig.darkMode ? styles.darkContainer : styles.lightContainer,
        ]}
      >
        {showNavigation && (
          <View style={styles.header}>
            <Text
              style={[
                styles.title,
                mobileConfig.darkMode ? styles.darkTitle : styles.lightTitle,
              ]}
            >
              {title}
            </Text>
          </View>
        )}
        <View style={styles.content}>{children}</View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
  },
  darkContainer: {
    backgroundColor: "#1a1a1a",
  },
  lightContainer: {
    backgroundColor: "#ffffff",
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
  },
  darkTitle: {
    color: "#ffffff",
  },
  lightTitle: {
    color: "#333333",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
