// @ts-nocheck
import {
  ExtensionState,
  ExtensionAction,
  ExtensionConfig,
} from "../../types/extensionTypes";
import { extensionService } from "../../services";
import { extensionConfigService } from "../../services";

/**
 * Extension State Manager - Centralized state management for browser extension
 * Handles state initialization, updates, and persistence
 */
class ExtensionStateManager {
  private static instance: ExtensionStateManager;
  private state: ExtensionState;
  private config: ExtensionConfig;
  private stateListeners: ((state: ExtensionState) => void)[];
  private configListeners: ((config: ExtensionConfig) => void)[];

  private constructor() {
    this.state = this.getDefaultState();
    this.config = this.getDefaultConfig();
    this.stateListeners = [];
    this.configListeners = [];
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ExtensionStateManager {
    if (!ExtensionStateManager.instance) {
      ExtensionStateManager.instance = new ExtensionStateManager();
    }
    return ExtensionStateManager.instance;
  }

  /**
   * Initialize state manager
   */
  public async initialize(): Promise<void> {
    try {
      // Load saved state
      const savedState = await this.loadState();
      if (savedState) {
        this.state = savedState;
      }

      // Load saved config
      const savedConfig = await this.loadConfig();
      if (savedConfig) {
        this.config = savedConfig;
      }

      // Set up event listeners
      this.setupEventListeners();
    } catch (error) {
      console.error("State manager initialization failed:", error);
      this.state = {
        ...this.state,
        status: "error",
        error: error.message,
      };
      this.notifyStateListeners();
    }
  }

  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    // Listen for extension service events
    extensionService.onMessage((message) => {
      if (message.type === "EXTENSION_STATE_UPDATE") {
        this.updateState(message.payload);
      }
    });

    // Listen for config service events
    extensionConfigService.onConfigChange((config) => {
      this.config = config;
      this.notifyConfigListeners();
    });
  }

  /**
   * Get current state
   */
  public getState(): ExtensionState {
    return { ...this.state };
  }

  /**
   * Update state
   */
  public updateState(stateUpdate: Partial<ExtensionState>): void {
    this.state = { ...this.state, ...stateUpdate };
    this.saveState();
    this.notifyStateListeners();
  }

  /**
   * Dispatch action to update state
   */
  public dispatch(action: ExtensionAction): void {
    const newState = this.reduceState(this.state, action);
    this.updateState(newState);
  }

  /**
   * State reducer function
   */
  private reduceState(
    state: ExtensionState,
    action: ExtensionAction,
  ): ExtensionState {
    switch (action.type) {
      case "INITIALIZE":
        return { ...state, status: "idle" };
      case "STARTUP":
        return { ...state, status: "ready" };
      case "SYNC_START":
        return { ...state, status: "syncing", error: undefined };
      case "SYNC_COMPLETE":
        return {
          ...state,
          status: "ready",
          lastSync: Date.now(),
          error: undefined,
        };
      case "ERROR":
        return { ...state, status: "error", error: action.payload };
      case "CONTENT_SCRIPT_READY":
        return {
          ...state,
          contentScriptsReady: true,
          activeTabUrl: action.payload?.url,
        };
      case "PAGE_INTEGRATION_COMPLETE":
        return { ...state, pageIntegrationStatus: "complete" };
      case "TAB_UPDATED":
        return {
          ...state,
          activeTabId: action.payload?.tabId,
          activeTabUrl: action.payload?.url,
        };
      case "TAB_ACTIVATED":
        return { ...state, activeTabId: action.payload?.tabId };
      case "CONFIG_UPDATED":
        return state; // Config updates don't change state directly
      case "CONFIG_RESET":
        return state; // Config reset doesn't change state directly
      case "RESTORE_STATE":
        return { ...state, ...action.payload };
      default:
        return state;
    }
  }

  /**
   * Get current config
   */
  public getConfig(): ExtensionConfig {
    return { ...this.config };
  }

  /**
   * Update config
   */
  public async updateConfig(
    configUpdate: Partial<ExtensionConfig>,
  ): Promise<void> {
    this.config = { ...this.config, ...configUpdate };
    await this.saveConfig();
    this.notifyConfigListeners();
  }

  /**
   * Reset config to defaults
   */
  public async resetConfig(): Promise<void> {
    this.config = this.getDefaultConfig();
    await this.saveConfig();
    this.notifyConfigListeners();
  }

  /**
   * Add state listener
   */
  public onStateChange(callback: (state: ExtensionState) => void): void {
    this.stateListeners.push(callback);
  }

  /**
   * Remove state listener
   */
  public removeStateListener(callback: (state: ExtensionState) => void): void {
    this.stateListeners = this.stateListeners.filter(
      (listener) => listener !== callback,
    );
  }

  /**
   * Add config listener
   */
  public onConfigChange(callback: (config: ExtensionConfig) => void): void {
    this.configListeners.push(callback);
  }

  /**
   * Remove config listener
   */
  public removeConfigListener(
    callback: (config: ExtensionConfig) => void,
  ): void {
    this.configListeners = this.configListeners.filter(
      (listener) => listener !== callback,
    );
  }

  /**
   * Notify all state listeners
   */
  private notifyStateListeners(): void {
    this.stateListeners.forEach((listener) => {
      try {
        listener(this.state);
      } catch (error) {
        console.error("State listener error:", error);
      }
    });
  }

  /**
   * Notify all config listeners
   */
  private notifyConfigListeners(): void {
    this.configListeners.forEach((listener) => {
      try {
        listener(this.config);
      } catch (error) {
        console.error("Config listener error:", error);
      }
    });
  }

  /**
   * Load state from storage
   */
  private async loadState(): Promise<ExtensionState | null> {
    try {
      const result = await chrome.storage.local.get("extensionState");
      return result.extensionState || null;
    } catch (error) {
      console.error("Failed to load state:", error);
      return null;
    }
  }

  /**
   * Save state to storage
   */
  private async saveState(): Promise<void> {
    try {
      await chrome.storage.local.set({ extensionState: this.state });
    } catch (error) {
      console.error("Failed to save state:", error);
    }
  }

  /**
   * Load config from storage
   */
  private async loadConfig(): Promise<ExtensionConfig | null> {
    try {
      const result = await chrome.storage.sync.get("extensionConfig");
      return result.extensionConfig || null;
    } catch (error) {
      console.error("Failed to load config:", error);
      return null;
    }
  }

  /**
   * Save config to storage
   */
  private async saveConfig(): Promise<void> {
    try {
      await chrome.storage.sync.set({ extensionConfig: this.config });
    } catch (error) {
      console.error("Failed to save config:", error);
    }
  }

  /**
   * Get default state
   */
  private getDefaultState(): ExtensionState {
    return {
      status: "idle",
      contentScriptsReady: false,
      pageIntegrationStatus: "idle",
    };
  }

  /**
   * Get default config
   */
  private getDefaultConfig(): ExtensionConfig {
    return {
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
    };
  }

  /**
   * Clear all extension data
   */
  public async clearAllData(): Promise<void> {
    try {
      await chrome.storage.sync.clear();
      await chrome.storage.local.clear();
      this.state = this.getDefaultState();
      this.config = this.getDefaultConfig();
      this.notifyStateListeners();
      this.notifyConfigListeners();
    } catch (error) {
      console.error("Failed to clear all data:", error);
      throw error;
    }
  }
}

// Export singleton instance
const extensionStateManager = ExtensionStateManager.getInstance();
export default extensionStateManager;

// Export for easier access
export const getExtensionState = () => extensionStateManager.getState();
export const updateExtensionState = (stateUpdate: Partial<ExtensionState>) =>
  extensionStateManager.updateState(stateUpdate);
export const dispatchExtensionAction = (action: ExtensionAction) =>
  extensionStateManager.dispatch(action);
export const getExtensionConfig = () => extensionStateManager.getConfig();
export const updateExtensionConfig = (configUpdate: Partial<ExtensionConfig>) =>
  extensionStateManager.updateConfig(configUpdate);
export const resetExtensionConfig = () => extensionStateManager.resetConfig();
