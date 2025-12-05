import { useState, useEffect, useCallback } from "react";
import { accessibilityConfigService } from "../services/accessibilityConfigService";
import {
  AccessibilityConfig,
  AccessibilityConfigOptions,
} from "../services/accessibilityConfigService";

interface UseAccessibilityConfigReturn {
  accessibilityConfig: AccessibilityConfig;
  updateAccessibilityConfig: (
    configUpdate: Partial<AccessibilityConfig>,
    options?: AccessibilityConfigOptions,
  ) => void;
  resetConfigToDefaults: () => void;
  getFeatureDefault: (featureId: string) => boolean;
  setFeatureDefault: (featureId: string, value: boolean) => void;
  validateConfig: (config: Partial<AccessibilityConfig>) => {
    isValid: boolean;
    errors: string[];
  };
  getConfigSummary: () => string;
  exportConfig: () => string;
  importConfig: (configString: string) => { success: boolean; error?: string };
  getThemeCompatibility: () => { darkMode: boolean; lightMode: boolean };
  setThemeCompatibility: (darkMode: boolean, lightMode: boolean) => void;
  getNotificationPreferences: () => { tips: boolean; suggestions: boolean };
  setNotificationPreferences: (tips: boolean, suggestions: boolean) => void;
  applyConfigToDOM: () => void;
}

export const useAccessibilityConfig = (): UseAccessibilityConfigReturn => {
  const [accessibilityConfig, setAccessibilityConfig] = useState(
    accessibilityConfigService.getConfig(),
  );

  useEffect(() => {
    // Sync with service config
    const updateConfig = () => {
      setAccessibilityConfig(accessibilityConfigService.getConfig());
    };

    updateConfig();
  }, []);

  const updateAccessibilityConfig = useCallback(
    (
      configUpdate: Partial<AccessibilityConfig>,
      options?: AccessibilityConfigOptions,
    ) => {
      accessibilityConfigService.updateConfig(configUpdate, options);
      setAccessibilityConfig(accessibilityConfigService.getConfig());
    },
    [],
  );

  const resetConfigToDefaults = useCallback(() => {
    accessibilityConfigService.resetToDefaults();
    setAccessibilityConfig(accessibilityConfigService.getConfig());
  }, []);

  const getFeatureDefault = useCallback((featureId: string) => {
    return accessibilityConfigService.getFeatureDefault(featureId);
  }, []);

  const setFeatureDefault = useCallback((featureId: string, value: boolean) => {
    accessibilityConfigService.setFeatureDefault(featureId, value);
    setAccessibilityConfig(accessibilityConfigService.getConfig());
  }, []);

  const validateConfig = useCallback((config: Partial<AccessibilityConfig>) => {
    return accessibilityConfigService.validateConfig(config);
  }, []);

  const getConfigSummary = useCallback(() => {
    return accessibilityConfigService.getConfigSummary();
  }, []);

  const exportConfig = useCallback(() => {
    return accessibilityConfigService.exportConfig();
  }, []);

  const importConfig = useCallback((configString: string) => {
    return accessibilityConfigService.importConfig(configString);
  }, []);

  const getThemeCompatibility = useCallback(() => {
    return accessibilityConfigService.getThemeCompatibility();
  }, []);

  const setThemeCompatibility = useCallback(
    (darkMode: boolean, lightMode: boolean) => {
      accessibilityConfigService.setThemeCompatibility(darkMode, lightMode);
      setAccessibilityConfig(accessibilityConfigService.getConfig());
    },
    [],
  );

  const getNotificationPreferences = useCallback(() => {
    return accessibilityConfigService.getNotificationPreferences();
  }, []);

  const setNotificationPreferences = useCallback(
    (tips: boolean, suggestions: boolean) => {
      accessibilityConfigService.setNotificationPreferences(tips, suggestions);
      setAccessibilityConfig(accessibilityConfigService.getConfig());
    },
    [],
  );

  const applyConfigToDOM = useCallback(() => {
    accessibilityConfigService.applyConfigToDOM();
  }, []);

  return {
    accessibilityConfig,
    updateAccessibilityConfig,
    resetConfigToDefaults,
    getFeatureDefault,
    setFeatureDefault,
    validateConfig,
    getConfigSummary,
    exportConfig,
    importConfig,
    getThemeCompatibility,
    setThemeCompatibility,
    getNotificationPreferences,
    setNotificationPreferences,
    applyConfigToDOM,
  };
};
