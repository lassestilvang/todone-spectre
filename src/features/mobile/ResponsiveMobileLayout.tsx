import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, Platform, SafeAreaView, StatusBar } from 'react-native';
import { useMobile } from '../../../hooks/useMobile';
import { useMobileConfig } from '../../../hooks/useMobileConfig';
import { mobileUtils } from '../../../utils/mobileUtils';

interface ResponsiveMobileLayoutProps {
  children: React.ReactNode;
  title?: string;
  showNavigation?: boolean;
  headerComponent?: React.ReactNode;
  footerComponent?: React.ReactNode;
}

export const ResponsiveMobileLayout: React.FC<ResponsiveMobileLayoutProps> = ({
  children,
  title = 'Todone',
  showNavigation = true,
  headerComponent,
  footerComponent,
}) => {
  const { isMobile, deviceType, isPortrait, isLandscape, getScreenWidth, isSmallScreen, isLargeScreen } = useMobile();
  const { mobileConfig } = useMobileConfig();
  const [layoutReady, setLayoutReady] = useState(false);
  const [screenWidth, setScreenWidth] = useState(getScreenWidth());
  const [screenHeight, setScreenHeight] = useState(Dimensions.get('window').height);

  useEffect(() => {
    const prepareLayout = async () => {
      await mobileUtils.initialize();
      setLayoutReady(true);
    };

    prepareLayout();

    const dimensionListener = Dimensions.addEventListener('change', ({ window }) => {
      setScreenWidth(window.width);
      setScreenHeight(window.height);
    });

    return () => {
      dimensionListener.remove();
    };
  }, []);

  const getLayoutStyles = () => {
    const isCompact = isSmallScreen() || (isPortrait() && screenWidth < 375);
    const isRegular = (!isSmallScreen() && !isLargeScreen()) || (isPortrait() && screenWidth >= 375 && screenWidth < 414);
    const isLarge = isLargeScreen() || (isPortrait() && screenWidth >= 414);

    return {
      container: {
        paddingHorizontal: isCompact ? 12 : isRegular ? 16 : 20,
        paddingVertical: isCompact ? 8 : isRegular ? 12 : 16,
      },
      header: {
        paddingVertical: isCompact ? 10 : isRegular ? 12 : 14,
        paddingHorizontal: isCompact ? 12 : isRegular ? 16 : 20,
      },
      title: {
        fontSize: isCompact ? 18 : isRegular ? 20 : 22,
      },
      content: {
        gap: isCompact ? 12 : isRegular ? 16 : 20,
      },
    };
  };

  const getBreakpointStyles = () => {
    if (isLandscape()) {
      return {
        container: {
          flexDirection: 'row' as const,
        },
        mainContent: {
          flex: 2,
        },
        sidebar: {
          flex: 1,
          paddingLeft: 12,
        },
      };
    }

    return {
      container: {
        flexDirection: 'column' as const,
      },
      mainContent: {
        flex: 1,
      },
      sidebar: {
        width: '100%',
        marginTop: 16,
      },
    };
  };

  const layoutStyles = getLayoutStyles();
  const breakpointStyles = getBreakpointStyles();

  if (!layoutReady) {
    return (
      <View style={[styles.loadingContainer, mobileConfig.darkMode ? styles.darkLoading : styles.lightLoading]}>
        <Text style={mobileConfig.darkMode ? styles.darkLoadingText : styles.lightLoadingText}>
          Loading Todone Mobile...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, mobileConfig.darkMode ? styles.darkSafeArea : styles.lightSafeArea]}>
      <StatusBar
        barStyle={mobileConfig.darkMode ? 'light-content' : 'dark-content'}
        backgroundColor={mobileConfig.darkMode ? '#1a1a1a' : '#f5f5f5'}
      />

      <View style={[styles.outerContainer, breakpointStyles.container]}>
        {showNavigation && (
          <View style={[styles.header, layoutStyles.header, mobileConfig.darkMode ? styles.darkHeader : styles.lightHeader]}>
            {headerComponent || (
              <Text style={[styles.title, layoutStyles.title, mobileConfig.darkMode ? styles.darkTitle : styles.lightTitle]}>
                {title}
              </Text>
            )}
          </View>
        )}

        <View style={[styles.mainContent, breakpointStyles.mainContent]}>
          <View style={[styles.content, layoutStyles.content, layoutStyles.container]}>
            {children}
          </View>
        </View>

        {footerComponent && (
          <View style={[styles.footer, breakpointStyles.sidebar]}>
            {footerComponent}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  darkSafeArea: {
    backgroundColor: '#121212',
  },
  lightSafeArea: {
    backgroundColor: '#f5f5f5',
  },
  outerContainer: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  darkHeader: {
    backgroundColor: '#1e1e1e',
    borderBottomColor: '#333',
  },
  lightHeader: {
    backgroundColor: '#ffffff',
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  darkTitle: {
    color: '#ffffff',
  },
  lightTitle: {
    color: '#333333',
  },
  mainContent: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  footer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  darkLoading: {
    backgroundColor: '#121212',
  },
  lightLoading: {
    backgroundColor: '#f5f5f5',
  },
  darkLoadingText: {
    color: '#ffffff',
  },
  lightLoadingText: {
    color: '#333333',
  },
});