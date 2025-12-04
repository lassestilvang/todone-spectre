import { useState, useEffect } from 'react';
import { mobileConfigService } from '../services/mobileConfigService';
import { mobileUtils } from '../utils/mobileUtils';
import { MobileConfig, MobilePreferences } from '../types/mobileTypes';

export const useMobileConfig = () => {
  const [mobileConfig, setMobileConfig] = useState<MobileConfig>(mobileConfigService.getConfig());
  const [mobilePreferences, setMobilePreferences] = useState<MobilePreferences>(mobileConfigService.getPreferences());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        // Initialize mobile config service
        await mobileConfigService.initialize();

        // Get updated config and preferences
        const config = mobileConfigService.getConfig();
        const preferences = mobileConfigService.getPreferences();

        setMobileConfig(config);
        setMobilePreferences(preferences);
        setLoading(false);
      } catch (err) {
        console.error('Failed to initialize mobile config:', err);
        setError('Failed to load mobile configuration');
        setLoading(false);
      }
    };

    initialize();
  }, []);

  useEffect(() => {
    // Set up listener for config changes
    const configChangeListener = mobileUtils.addConfigChangeListener((newConfig) => {
      setMobileConfig(newConfig);
    });

    return () => {
      if (configChangeListener) {
        configChangeListener.remove();
      }
    };
  }, []);

  const updateConfig = async (updates: Partial<MobileConfig>): Promise<void> => {
    try {
      await mobileConfigService.updateConfig(updates);
      const updatedConfig = mobileConfigService.getConfig();
      setMobileConfig(updatedConfig);
    } catch (err) {
      console.error('Failed to update mobile config:', err);
      setError('Failed to update configuration');
    }
  };

  const updatePreferences = async (updates: Partial<MobilePreferences>): Promise<void> => {
    try {
      await mobileConfigService.updatePreferences(updates);
      const updatedPreferences = mobileConfigService.getPreferences();
      setMobilePreferences(updatedPreferences);
    } catch (err) {
      console.error('Failed to update mobile preferences:', err);
      setError('Failed to update preferences');
    }
  };

  const toggleDarkMode = async (): Promise<void> => {
    await mobileConfigService.toggleDarkMode();
    const updatedConfig = mobileConfigService.getConfig();
    setMobileConfig(updatedConfig);
  };

  const setThemeConfig = async (themeConfig: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    backgroundColor?: string;
    textColor?: string;
  }): Promise<void> => {
    await mobileConfigService.setThemeConfig(themeConfig);
    const updatedConfig = mobileConfigService.getConfig();
    setMobileConfig(updatedConfig);
  };

  const resetToDefaultTheme = async (): Promise<void> => {
    await mobileConfigService.resetToDefaultTheme();
    const updatedConfig = mobileConfigService.getConfig();
    setMobileConfig(updatedConfig);
  };

  const setPerformanceMode = async (mode: 'high' | 'balanced' | 'battery_saver'): Promise<void> => {
    await mobileConfigService.setPerformanceMode(mode);
    const updatedConfig = mobileConfigService.getConfig();
    setMobileConfig(updatedConfig);
  };

  const markTutorialCompleted = async (): Promise<void> => {
    await mobileConfigService.markTutorialCompleted();
    const updatedPreferences = mobileConfigService.getPreferences();
    setMobilePreferences(updatedPreferences);
  };

  const markOnboardingCompleted = async (): Promise<void> => {
    await mobileConfigService.markOnboardingCompleted();
    const updatedPreferences = mobileConfigService.getPreferences();
    setMobilePreferences(updatedPreferences);
  };

  const enableExperimentalFeatures = async (enable: boolean): Promise<void> => {
    await mobileConfigService.enableExperimentalFeatures(enable);
    const updatedPreferences = mobileConfigService.getPreferences();
    setMobilePreferences(updatedPreferences);
  };

  const setAccessibilityPreferences = async (preferences: {
    reducedMotion?: boolean;
    highContrast?: boolean;
    screenReaderEnabled?: boolean;
    fontSizeAdjustment?: 'small' | 'normal' | 'large' | 'extra_large';
  }): Promise<void> => {
    await mobileConfigService.setAccessibilityPreferences(preferences);
    const updatedPreferences = mobileConfigService.getPreferences();
    setMobilePreferences(updatedPreferences);

    // If reduced motion preference changed, update config accordingly
    if (preferences.reducedMotion !== undefined) {
      const updatedConfig = mobileConfigService.getConfig();
      setMobileConfig(updatedConfig);
    }
  };

  const getThemeConfig = (): {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    backgroundColor: string;
    textColor: string;
  } => {
    return {
      primaryColor: mobileConfig.primaryColor,
      secondaryColor: mobileConfig.secondaryColor,
      accentColor: mobileConfig.accentColor,
      backgroundColor: mobileConfig.backgroundColor,
      textColor: mobileConfig.textColor,
    };
  };

  const isDarkMode = (): boolean => {
    return mobileConfig.darkMode;
  };

  const isPerformanceMode = (mode: 'high' | 'balanced' | 'battery_saver'): boolean => {
    return mobileConfig.performanceMode === mode;
  };

  const isTutorialCompleted = (): boolean => {
    return mobilePreferences.tutorialCompleted;
  };

  const isOnboardingCompleted = (): boolean => {
    return mobilePreferences.onboardingCompleted;
  };

  const areExperimentalFeaturesEnabled = (): boolean => {
    return mobilePreferences.featureFlags.experimentalFeatures;
  };

  return {
    mobileConfig,
    mobilePreferences,
    loading,
    error,
    updateConfig,
    updatePreferences,
    toggleDarkMode,
    setThemeConfig,
    resetToDefaultTheme,
    setPerformanceMode,
    markTutorialCompleted,
    markOnboardingCompleted,
    enableExperimentalFeatures,
    setAccessibilityPreferences,
    getThemeConfig,
    isDarkMode,
    isPerformanceMode,
    isTutorialCompleted,
    isOnboardingCompleted,
    areExperimentalFeaturesEnabled,
  };
};