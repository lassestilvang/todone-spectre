import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Platform } from 'react-native';
import { useMobile } from '../../../hooks/useMobile';
import { useMobileConfig } from '../../../hooks/useMobileConfig';
import Icon from 'react-native-vector-icons/MaterialIcons';
import NetInfo from '@react-native-community/netinfo';

interface MobileStatusIndicatorsProps {
  showNetwork?: boolean;
  showBattery?: boolean;
  showPerformance?: boolean;
  showOrientation?: boolean;
  position?: 'top' | 'bottom';
}

export const MobileStatusIndicators: React.FC<MobileStatusIndicatorsProps> = ({
  showNetwork = true,
  showBattery = true,
  showPerformance = true,
  showOrientation = false,
  position = 'top',
}) => {
  const { mobileConfig } = useMobileConfig();
  const {
    networkStatus,
    batteryLevel,
    isLowPowerMode,
    isPortrait,
    isLandscape,
    getBatteryStatus,
  } = useMobile();

  const [networkInfo, setNetworkInfo] = useState({
    isConnected: networkStatus === 'online',
    connectionType: 'unknown',
  });
  const [animation] = useState(new Animated.Value(0));

  useEffect(() => {
    // Set up network monitoring
    const unsubscribe = NetInfo.addEventListener(state => {
      setNetworkInfo({
        isConnected: state.isConnected ?? false,
        connectionType: state.type ?? 'unknown',
      });
    });

    // Animate indicators on mount
    Animated.loop(
      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(animation, {
          toValue: 0.8,
          duration: 1000,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => {
      unsubscribe();
    };
  }, []);

  const getNetworkIndicator = () => {
    if (!showNetwork) return null;

    let iconName = 'wifi';
    let iconColor = mobileConfig.secondaryColor;
    let label = 'Online';

    if (!networkInfo.isConnected) {
      iconName = 'wifi-off';
      iconColor = '#F44336';
      label = 'Offline';
    } else if (networkInfo.connectionType === 'wifi') {
      iconName = 'wifi';
      iconColor = '#4CAF50';
      label = 'WiFi';
    } else if (networkInfo.connectionType === 'cellular') {
      iconName = 'signal-cellular-alt';
      iconColor = '#FF9800';
      label = 'Cellular';
    }

    return (
      <View style={styles.indicatorItem}>
        <Icon name={iconName} size={16} color={iconColor} />
        <Text style={[styles.indicatorText, mobileConfig.darkMode ? styles.darkText : styles.lightText]}>
          {label}
        </Text>
      </View>
    );
  };

  const getBatteryIndicator = () => {
    if (!showBattery) return null;

    const batteryStatus = getBatteryStatus();
    let iconName = 'battery-full';
    let iconColor = mobileConfig.secondaryColor;
    let label = `${Math.round(batteryStatus.level * 100)}%`;

    if (batteryStatus.isCritical) {
      iconName = 'battery-alert';
      iconColor = '#F44336';
    } else if (batteryStatus.isLow) {
      iconName = 'battery-20';
      iconColor = '#FF9800';
    } else if (batteryStatus.level > 0.8) {
      iconName = 'battery-full';
    } else if (batteryStatus.level > 0.5) {
      iconName = 'battery-60';
    } else if (batteryStatus.level > 0.3) {
      iconName = 'battery-50';
    } else {
      iconName = 'battery-30';
    }

    if (isLowPowerMode) {
      label += ' (Saver)';
    }

    return (
      <View style={styles.indicatorItem}>
        <Icon name={iconName} size={16} color={iconColor} />
        <Text style={[styles.indicatorText, mobileConfig.darkMode ? styles.darkText : styles.lightText]}>
          {label}
        </Text>
      </View>
    );
  };

  const getPerformanceIndicator = () => {
    if (!showPerformance) return null;

    let iconName = 'memory';
    let iconColor = mobileConfig.secondaryColor;
    let label = 'Balanced';

    if (mobileConfig.performanceMode === 'high') {
      iconName = 'speed';
      iconColor = '#4CAF50';
      label = 'High Performance';
    } else if (mobileConfig.performanceMode === 'battery_saver') {
      iconName = 'battery-saver';
      iconColor = '#FF9800';
      label = 'Battery Saver';
    }

    return (
      <View style={styles.indicatorItem}>
        <Icon name={iconName} size={16} color={iconColor} />
        <Text style={[styles.indicatorText, mobileConfig.darkMode ? styles.darkText : styles.lightText]}>
          {label}
        </Text>
      </View>
    );
  };

  const getOrientationIndicator = () => {
    if (!showOrientation) return null;

    const iconName = isPortrait() ? 'phone-android' : 'tablet-mac';
    const label = isPortrait() ? 'Portrait' : 'Landscape';

    return (
      <View style={styles.indicatorItem}>
        <Icon name={iconName} size={16} color={mobileConfig.secondaryColor} />
        <Text style={[styles.indicatorText, mobileConfig.darkMode ? styles.darkText : styles.lightText]}>
          {label}
        </Text>
      </View>
    );
  };

  const indicators = [
    getNetworkIndicator(),
    getBatteryIndicator(),
    getPerformanceIndicator(),
    getOrientationIndicator(),
  ].filter(Boolean);

  if (indicators.length === 0) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        mobileConfig.darkMode ? styles.darkContainer : styles.lightContainer,
        position === 'top' ? styles.topPosition : styles.bottomPosition,
        {
          opacity: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0.7, 1],
          }),
          transform: [
            {
              scale: animation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.95, 1],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.indicatorsContainer}>
        {indicators.map((indicator, index) => (
          <React.Fragment key={index}>{indicator}</React.Fragment>
        ))}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderRadius: 20,
    margin: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 1000,
  },
  darkContainer: {
    backgroundColor: 'rgba(30, 30, 30, 0.9)',
    borderColor: '#444',
    borderWidth: 1,
  },
  lightContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderColor: '#e0e0e0',
    borderWidth: 1,
  },
  topPosition: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    right: 8,
    alignSelf: 'flex-end',
  },
  bottomPosition: {
    position: 'absolute',
    bottom: 70,
    right: 8,
    alignSelf: 'flex-end',
  },
  indicatorsContainer: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  indicatorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  indicatorText: {
    fontSize: 12,
    fontWeight: '500',
  },
  darkText: {
    color: '#ffffff',
  },
  lightText: {
    color: '#333333',
  },
});