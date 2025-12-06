// @ts-nocheck
import React from "react";
import { useState, useEffect, useContext, useCallback } from "react";
import {
  ExtensionConfig,
  ExtensionConfigContextType,
} from "../types/extensionTypes";
import { extensionConfigService } from "../services";
import { createContext } from "react";

/**
 * Extension Config Context - Provides extension configuration and update functions
 */
export const ExtensionConfigContext = createContext<ExtensionConfigContextType>(
  {
    config: {
      pageIntegrationEnabled: true,
      autoSyncEnabled: true,
      syncInterval: 300000,
      showNotifications: true,
      theme: "system",
    },
    updateConfig: async () => {},
    resetConfig: async () => {},
  },
);

/**
 * Extension Config Provider - Provides extension config context to components
 */
export const ExtensionConfigProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [config, setConfig] = useState<ExtensionConfig>(
    extensionConfigService.getConfig(),
  );

  useEffect(() => {
    // Initialize config service
    extensionConfigService.initialize();

    // Set up config change listener
    const configListener = (updatedConfig: ExtensionConfig) => {
      setConfig(updatedConfig);
    };

    extensionConfigService.onConfigChange(configListener);

    return () => {
      extensionConfigService.removeConfigListener(configListener);
    };
  }, []);

  const updateConfig = useCallback(
    async (configUpdate: Partial<ExtensionConfig>) => {
      await extensionConfigService.updateConfig(configUpdate);
      setConfig(extensionConfigService.getConfig());
    },
    [],
  );

  const resetConfig = useCallback(async () => {
    await extensionConfigService.resetConfig();
    setConfig(extensionConfigService.getConfig());
  }, []);

  return React.createElement(
    ExtensionConfigContext.Provider,
    { value: { config, updateConfig, resetConfig } },
    children,
  );
};

/**
 * useExtensionConfig Hook - Custom hook for accessing extension configuration
 */
export const useExtensionConfig = (): ExtensionConfigContextType => {
  const context = useContext(ExtensionConfigContext);

  if (!context) {
    throw new Error(
      "useExtensionConfig must be used within an ExtensionConfigProvider",
    );
  }

  return context;
};

/**
 * useExtensionConfigValue Hook - Custom hook for accessing specific config values
 */
export const useExtensionConfigValue = <K extends keyof ExtensionConfig>(
  key: K,
): ExtensionConfig[K] => {
  const { config } = useExtensionConfig();
  return config[key];
};

/**
 * useExtensionConfigUpdate Hook - Custom hook for updating config values
 */
export const useExtensionConfigUpdate = () => {
  const { updateConfig } = useExtensionConfig();

  return {
    updateConfig,
    setConfigValue: async <K extends keyof ExtensionConfig>(
      key: K,
      value: ExtensionConfig[K],
    ) => {
      await updateConfig({ [key]: value } as Partial<ExtensionConfig>);
    },
  };
};

/**
 * usePageIntegration Hook - Custom hook for page integration functionality
 */
export const usePageIntegration = () => {
  const { config, updateConfig } = useExtensionConfig();

  const togglePageIntegration = useCallback(async () => {
    await updateConfig({
      pageIntegrationEnabled: !config.pageIntegrationEnabled,
    });
  }, [config.pageIntegrationEnabled, updateConfig]);

  return {
    isPageIntegrationEnabled: config.pageIntegrationEnabled,
    togglePageIntegration,
  };
};

/**
 * useAutoSync Hook - Custom hook for auto sync functionality
 */
export const useAutoSync = () => {
  const { config, updateConfig } = useExtensionConfig();

  const toggleAutoSync = useCallback(async () => {
    await updateConfig({
      autoSyncEnabled: !config.autoSyncEnabled,
    });
  }, [config.autoSyncEnabled, updateConfig]);

  const setSyncInterval = useCallback(
    async (interval: number) => {
      await updateConfig({
        syncInterval: interval,
      });
    },
    [updateConfig],
  );

  return {
    isAutoSyncEnabled: config.autoSyncEnabled,
    syncInterval: config.syncInterval,
    toggleAutoSync,
    setSyncInterval,
  };
};

/**
 * useExtensionTheme Hook - Custom hook for theme functionality
 */
export const useExtensionTheme = () => {
  const { config, updateConfig } = useExtensionConfig();

  const setTheme = useCallback(
    async (theme: ExtensionConfig["theme"]) => {
      await updateConfig({
        theme,
      });
    },
    [updateConfig],
  );

  return {
    currentTheme: config.theme,
    setTheme,
  };
};

/**
 * useExtensionNotifications Hook - Custom hook for notification functionality
 */
export const useExtensionNotifications = () => {
  const { config, updateConfig } = useExtensionConfig();

  const toggleNotifications = useCallback(async () => {
    await updateConfig({
      showNotifications: !config.showNotifications,
    });
  }, [config.showNotifications, updateConfig]);

  return {
    areNotificationsEnabled: config.showNotifications,
    toggleNotifications,
  };
};
