import {
  ExtensionMessage,
  ExtensionState,
  ExtensionConfig,
  QuickAction,
} from "../types/extensionTypes";

/**
 * Extension Utilities - Utility functions for browser extension functionality
 */

/**
 * Create a standard extension message
 */
export const createExtensionMessage = (
  type: string,
  payload?: any,
  sender?: "popup" | "content" | "background" | "options",
): ExtensionMessage => ({
  type,
  payload,
  sender,
  timestamp: Date.now(),
});

/**
 * Validate extension message
 */
export const validateExtensionMessage = (
  message: any,
): message is ExtensionMessage => {
  return (
    message &&
    typeof message === "object" &&
    typeof message.type === "string" &&
    (message.payload === undefined || typeof message.payload === "object") &&
    (message.sender === undefined ||
      ["popup", "content", "background", "options"].includes(message.sender)) &&
    (message.timestamp === undefined || typeof message.timestamp === "number")
  );
};

/**
 * Get default extension state
 */
export const getDefaultExtensionState = (): ExtensionState => ({
  status: "idle",
  contentScriptsReady: false,
  pageIntegrationStatus: "idle",
});

/**
 * Get default extension config
 */
export const getDefaultExtensionConfig = (): ExtensionConfig => ({
  pageIntegrationEnabled: true,
  autoSyncEnabled: true,
  syncInterval: 300000, // 5 minutes
  showNotifications: true,
  theme: "system",
  quickActions: [
    { id: "create-task", label: "Create Task", icon: "plus" },
    { id: "view-tasks", label: "View Tasks", icon: "list" },
    { id: "sync-data", label: "Sync Data", icon: "sync" },
    { id: "settings", label: "Settings", icon: "cog" },
  ],
});

/**
 * Merge extension states
 */
export const mergeExtensionStates = (
  currentState: ExtensionState,
  newState: Partial<ExtensionState>,
): ExtensionState => ({
  ...currentState,
  ...newState,
  // Preserve arrays and objects by merging
  ...(newState.status && { status: newState.status }),
  ...(newState.lastSync !== undefined && { lastSync: newState.lastSync }),
  ...(newState.error !== undefined && { error: newState.error }),
  ...(newState.activeTabId !== undefined && {
    activeTabId: newState.activeTabId,
  }),
  ...(newState.activeTabUrl !== undefined && {
    activeTabUrl: newState.activeTabUrl,
  }),
  ...(newState.contentScriptsReady !== undefined && {
    contentScriptsReady: newState.contentScriptsReady,
  }),
  ...(newState.pageIntegrationStatus !== undefined && {
    pageIntegrationStatus: newState.pageIntegrationStatus,
  }),
});

/**
 * Validate extension config
 */
export const validateExtensionConfig = (
  config: Partial<ExtensionConfig>,
): ExtensionConfig => {
  const validatedConfig = { ...getDefaultExtensionConfig(), ...config };

  // Ensure sync interval is valid
  if (
    typeof validatedConfig.syncInterval !== "number" ||
    validatedConfig.syncInterval <= 0
  ) {
    validatedConfig.syncInterval = 300000; // Default: 5 minutes
  }

  // Ensure theme is valid
  if (!["system", "light", "dark"].includes(validatedConfig.theme)) {
    validatedConfig.theme = "system";
  }

  // Ensure quick actions array is valid
  if (!Array.isArray(validatedConfig.quickActions)) {
    validatedConfig.quickActions = getDefaultExtensionConfig().quickActions;
  }

  return validatedConfig;
};

/**
 * Create quick action from config
 */
export const createQuickAction = (
  id: string,
  label: string,
  icon: string,
): QuickAction => ({
  id,
  label,
  icon,
  onClick: () => {
    // Default click handler
    console.log(`Quick action clicked: ${id}`);
  },
});

/**
 * Get quick action by ID
 */
export const getQuickActionById = (
  actions: QuickAction[],
  id: string,
): QuickAction | undefined => {
  return actions.find((action) => action.id === id);
};

/**
 * Filter quick actions by criteria
 */
export const filterQuickActions = (
  actions: QuickAction[],
  criteria: (action: QuickAction) => boolean,
): QuickAction[] => {
  return actions.filter(criteria);
};

/**
 * Send message to all extension components
 */
export const sendMessageToAllComponents = async (
  message: ExtensionMessage,
): Promise<void> => {
  try {
    // Send to background script
    await chrome.runtime.sendMessage(message);

    // Send to all content scripts
    const tabs = await chrome.tabs.query({});
    await Promise.all(
      tabs.map((tab) => {
        if (tab.id) {
          return chrome.tabs.sendMessage(tab.id, message);
        }
        return Promise.resolve();
      }),
    );
  } catch (error) {
    console.error("Failed to send message to all components:", error);
    throw error;
  }
};

/**
 * Get current tab information
 */
export const getCurrentTabInfo = async (): Promise<{
  id?: number;
  url?: string;
  title?: string;
  domain?: string;
}> => {
  try {
    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    if (tab && tab.url) {
      const url = new URL(tab.url);
      return {
        id: tab.id,
        url: tab.url,
        title: tab.title,
        domain: url.hostname,
      };
    }
    return {};
  } catch (error) {
    console.error("Failed to get current tab info:", error);
    return {};
  }
};

/**
 * Check if URL is supported for integration
 */
export const isUrlSupportedForIntegration = (url: string): boolean => {
  try {
    const supportedDomains = [
      "github.com",
      "gitlab.com",
      "bitbucket.org",
      "jira.com",
      "trello.com",
      "asana.com",
      "clickup.com",
      "notion.so",
      "google.com",
      "outlook.com",
      "office.com",
    ];

    const domain = new URL(url).hostname;
    return supportedDomains.some((supportedDomain) =>
      domain.endsWith(supportedDomain),
    );
  } catch (error) {
    console.error("Failed to check URL support:", error);
    return false;
  }
};

/**
 * Create integration elements for page
 */
export const createIntegrationElements = (options: {
  position?: "top-right" | "bottom-right" | "top-left" | "bottom-left";
  theme?: "light" | "dark";
}): HTMLElement => {
  const container = document.createElement("div");
  container.id = "todone-integration-container";
  container.style.position = "fixed";

  // Set position based on options
  switch (options.position || "bottom-right") {
    case "top-right":
      container.style.top = "20px";
      container.style.right = "20px";
      break;
    case "bottom-right":
      container.style.bottom = "20px";
      container.style.right = "20px";
      break;
    case "top-left":
      container.style.top = "20px";
      container.style.left = "20px";
      break;
    case "bottom-left":
      container.style.bottom = "20px";
      container.style.left = "20px";
      break;
  }

  container.style.zIndex = "9999";
  container.style.backgroundColor = options.theme === "dark" ? "#333" : "#fff";
  container.style.color = options.theme === "dark" ? "#fff" : "#333";
  container.style.border = "1px solid #ddd";
  container.style.borderRadius = "8px";
  container.style.padding = "12px";
  container.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
  container.style.maxWidth = "300px";
  container.style.fontFamily = "Arial, sans-serif";
  container.style.fontSize = "14px";

  return container;
};

/**
 * Format extension state for display
 */
export const formatExtensionState = (state: ExtensionState): string => {
  const parts = [];

  parts.push(`Status: ${state.status}`);
  if (state.lastSync) {
    parts.push(`Last Sync: ${new Date(state.lastSync).toLocaleString()}`);
  }
  if (state.error) {
    parts.push(`Error: ${state.error}`);
  }
  if (state.activeTabUrl) {
    parts.push(`Active Tab: ${state.activeTabUrl}`);
  }

  return parts.join(" | ");
};

/**
 * Format sync status
 */
export const formatSyncStatus = (state: ExtensionState): string => {
  if (state.status === "syncing") {
    return "Syncing...";
  }
  if (state.status === "error") {
    return `Error: ${state.error || "Unknown error"}`;
  }
  if (state.lastSync) {
    return `Last synced: ${new Date(state.lastSync).toLocaleTimeString()}`;
  }
  return "Not synced yet";
};
