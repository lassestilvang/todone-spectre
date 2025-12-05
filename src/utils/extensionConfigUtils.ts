import { ExtensionConfig, QuickAction } from "../types/extensionTypes";

/**
 * Extension Config Utilities - Utility functions for extension configuration
 */

/**
 * Get default quick actions
 */
export const getDefaultQuickActions = (): QuickAction[] => [
  { id: "create-task", label: "Create Task", icon: "plus" },
  { id: "view-tasks", label: "View Tasks", icon: "list" },
  { id: "sync-data", label: "Sync Data", icon: "sync" },
  { id: "settings", label: "Settings", icon: "cog" },
];

/**
 * Create quick action configuration
 */
export const createQuickActionConfig = (
  action: Partial<QuickAction> & { id: string },
): QuickAction => ({
  id: action.id,
  label:
    action.label ||
    action.id.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()),
  icon: action.icon || "default",
  onClick: action.onClick,
});

/**
 * Validate quick actions array
 */
export const validateQuickActions = (actions: any): QuickAction[] => {
  if (!Array.isArray(actions)) {
    return getDefaultQuickActions();
  }

  return actions
    .map((action) => {
      if (typeof action === "object" && action.id) {
        return createQuickActionConfig(action);
      }
      return null;
    })
    .filter(Boolean) as QuickAction[];
};

/**
 * Merge extension configurations
 */
export const mergeExtensionConfigs = (
  baseConfig: ExtensionConfig,
  overrideConfig: Partial<ExtensionConfig>,
): ExtensionConfig => ({
  ...baseConfig,
  ...overrideConfig,
  // Handle special cases for merging
  quickActions: overrideConfig.quickActions
    ? validateQuickActions(overrideConfig.quickActions)
    : baseConfig.quickActions,
});

/**
 * Convert config to storage format
 */
export const configToStorageFormat = (
  config: ExtensionConfig,
): Record<string, any> => ({
  ...config,
  // Convert any special types to storage-friendly format
  quickActions: JSON.stringify(config.quickActions),
});

/**
 * Convert from storage format to config
 */
export const configFromStorageFormat = (
  storageData: Record<string, any>,
): ExtensionConfig => {
  const config: ExtensionConfig = {
    pageIntegrationEnabled: storageData.pageIntegrationEnabled ?? true,
    autoSyncEnabled: storageData.autoSyncEnabled ?? true,
    syncInterval: storageData.syncInterval ?? 300000,
    showNotifications: storageData.showNotifications ?? true,
    theme: storageData.theme ?? "system",
    quickActions: [],
  };

  // Parse quick actions if they're stored as JSON string
  if (typeof storageData.quickActions === "string") {
    try {
      config.quickActions = JSON.parse(storageData.quickActions);
    } catch (error) {
      console.error("Failed to parse quick actions:", error);
      config.quickActions = getDefaultQuickActions();
    }
  } else if (Array.isArray(storageData.quickActions)) {
    config.quickActions = storageData.quickActions;
  } else {
    config.quickActions = getDefaultQuickActions();
  }

  return config;
};

/**
 * Get config differences
 */
export const getConfigDifferences = (
  oldConfig: ExtensionConfig,
  newConfig: ExtensionConfig,
): Partial<ExtensionConfig> => {
  const differences: Partial<ExtensionConfig> = {};

  if (oldConfig.pageIntegrationEnabled !== newConfig.pageIntegrationEnabled) {
    differences.pageIntegrationEnabled = newConfig.pageIntegrationEnabled;
  }
  if (oldConfig.autoSyncEnabled !== newConfig.autoSyncEnabled) {
    differences.autoSyncEnabled = newConfig.autoSyncEnabled;
  }
  if (oldConfig.syncInterval !== newConfig.syncInterval) {
    differences.syncInterval = newConfig.syncInterval;
  }
  if (oldConfig.showNotifications !== newConfig.showNotifications) {
    differences.showNotifications = newConfig.showNotifications;
  }
  if (oldConfig.theme !== newConfig.theme) {
    differences.theme = newConfig.theme;
  }
  if (
    JSON.stringify(oldConfig.quickActions) !==
    JSON.stringify(newConfig.quickActions)
  ) {
    differences.quickActions = newConfig.quickActions;
  }

  return differences;
};

/**
 * Validate sync interval
 */
export const validateSyncInterval = (interval: number): number => {
  // Ensure interval is within reasonable bounds (1 minute to 1 hour)
  const validatedInterval = Math.max(60000, Math.min(interval, 3600000));
  return Math.round(validatedInterval / 60000) * 60000; // Round to nearest minute
};

/**
 * Convert sync interval to human-readable format
 */
export const formatSyncInterval = (interval: number): string => {
  const minutes = interval / 60000;
  if (minutes < 60) {
    return `${Math.round(minutes)} minute${minutes !== 1 ? "s" : ""}`;
  }
  const hours = minutes / 60;
  return `${Math.round(hours)} hour${hours !== 1 ? "s" : ""}`;
};

/**
 * Get theme CSS variables
 */
export const getThemeCssVariables = (
  theme: ExtensionConfig["theme"],
): Record<string, string> => {
  switch (theme) {
    case "light":
      return {
        "--extension-bg-color": "#ffffff",
        "--extension-text-color": "#333333",
        "--extension-border-color": "#dddddd",
        "--extension-primary-color": "#4CAF50",
        "--extension-secondary-color": "#2196F3",
      };
    case "dark":
      return {
        "--extension-bg-color": "#333333",
        "--extension-text-color": "#ffffff",
        "--extension-border-color": "#555555",
        "--extension-primary-color": "#66BB6A",
        "--extension-secondary-color": "#42A5F5",
      };
    case "system":
    default:
      // Use system preferences or default to light theme
      return getThemeCssVariables("light");
  }
};

/**
 * Apply theme to element
 */
export const applyThemeToElement = (
  element: HTMLElement,
  theme: ExtensionConfig["theme"],
): void => {
  const cssVariables = getThemeCssVariables(theme);
  Object.entries(cssVariables).forEach(([property, value]) => {
    element.style.setProperty(property, value);
  });
};

/**
 * Create theme stylesheet
 */
export const createThemeStylesheet = (
  theme: ExtensionConfig["theme"],
): HTMLStyleElement => {
  const style = document.createElement("style");
  const cssVariables = getThemeCssVariables(theme);

  let cssText = ":root {\n";
  Object.entries(cssVariables).forEach(([property, value]) => {
    cssText += `  ${property}: ${value};\n`;
  });
  cssText += "}";

  style.textContent = cssText;
  return style;
};

/**
 * Get config validation errors
 */
export const getConfigValidationErrors = (
  config: Partial<ExtensionConfig>,
): string[] => {
  const errors: string[] = [];

  if (config.syncInterval !== undefined) {
    if (typeof config.syncInterval !== "number") {
      errors.push("syncInterval must be a number");
    } else if (config.syncInterval <= 0) {
      errors.push("syncInterval must be positive");
    } else if (config.syncInterval < 60000) {
      errors.push("syncInterval must be at least 1 minute (60000ms)");
    } else if (config.syncInterval > 3600000) {
      errors.push("syncInterval must be less than 1 hour (3600000ms)");
    }
  }

  if (
    config.theme !== undefined &&
    !["system", "light", "dark"].includes(config.theme)
  ) {
    errors.push("theme must be one of: system, light, dark");
  }

  return errors;
};

/**
 * Create config backup
 */
export const createConfigBackup = (config: ExtensionConfig): string => {
  return JSON.stringify(
    {
      backupDate: new Date().toISOString(),
      configVersion: "1.0",
      configData: config,
    },
    null,
    2,
  );
};

/**
 * Restore config from backup
 */
export const restoreConfigFromBackup = (
  backupData: string,
): ExtensionConfig => {
  try {
    const parsed = JSON.parse(backupData);
    if (parsed.configData) {
      return parsed.configData;
    }
    return parsed; // Fallback to entire parsed object
  } catch (error) {
    console.error("Failed to restore config from backup:", error);
    return getDefaultExtensionConfig();
  }
};

/**
 * Get default extension config (utility version)
 */
export const getDefaultExtensionConfig = (): ExtensionConfig => ({
  pageIntegrationEnabled: true,
  autoSyncEnabled: true,
  syncInterval: 300000, // 5 minutes
  showNotifications: true,
  theme: "system",
  quickActions: getDefaultQuickActions(),
});
