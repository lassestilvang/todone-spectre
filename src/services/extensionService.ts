// @ts-nocheck
import {
  ExtensionState,
  ExtensionMessage,
  ExtensionAction,
  ExtensionConfig,
} from "../types/extensionTypes";

/**
 * Extension Service - Main service for browser extension functionality
 * Handles communication between extension components and browser APIs
 */
class ExtensionService {
  private state: ExtensionState;
  private messageListeners: ((message: ExtensionMessage) => void)[];
  private config: ExtensionConfig;

  constructor() {
    this.state = {
      status: "idle",
      contentScriptsReady: false,
      pageIntegrationStatus: "idle",
    };

    this.messageListeners = [];
    this.config = this.getDefaultConfig();
  }

  /**
   * Initialize the extension service
   */
  public async initialize(): Promise<void> {
    try {
      // Load saved state
      const savedState =
        await this.getStorageItem<ExtensionState>("extensionState");
      if (savedState) {
        this.state = { ...this.state, ...savedState };
      }

      // Load configuration
      const savedConfig =
        await this.getStorageItem<ExtensionConfig>("extensionConfig");
      if (savedConfig) {
        this.config = savedConfig;
      }

      // Set up message listeners
      this.setupMessageListeners();

      this.updateState({ status: "ready" });
    } catch (error) {
      console.error("Extension service initialization failed:", error);
      this.updateState({ status: "error", error: error.message });
    }
  }

  /**
   * Set up message listeners for browser extension messaging
   */
  private setupMessageListeners(): void {
    // Listen for messages from other extension components
    chrome.runtime.onMessage.addListener(
      (message: ExtensionMessage, sender, sendResponse) => {
        this.handleMessage(message);
        sendResponse({ success: true });
        return true;
      },
    );

    // Listen for connection requests
    chrome.runtime.onConnect.addListener((port) => {
      this.handlePortConnection(port);
    });
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(message: ExtensionMessage): void {
    console.log("ExtensionService received message:", message);

    try {
      switch (message.type) {
        case "CONTENT_SCRIPT_READY":
          this.handleContentScriptReady(message.payload);
          break;
        case "PAGE_INTEGRATION_COMPLETE":
          this.handlePageIntegrationComplete(message.payload);
          break;
        case "SYNC_REQUEST":
          this.handleSyncRequest(message.payload);
          break;
        case "CONFIG_UPDATE":
          this.handleConfigUpdate(message.payload);
          break;
        default:
          console.warn("Unknown message type:", message.type);
      }

      // Notify all listeners
      this.messageListeners.forEach((listener) => listener(message));
    } catch (error) {
      console.error("Error handling message:", error);
      this.updateState({ status: "error", error: error.message });
    }
  }

  /**
   * Handle port connections
   */
  private handlePortConnection(port: chrome.runtime.Port): void {
    console.log("ExtensionService connected to port:", port.name);

    port.onMessage.addListener((message: ExtensionMessage) => {
      this.handleMessage(message);
    });

    port.onDisconnect.addListener(() => {
      console.log("Port disconnected:", port.name);
    });
  }

  /**
   * Handle content script ready message
   */
  private handleContentScriptReady(payload: { url: string }): void {
    console.log("Content script ready for:", payload.url);
    this.updateState({
      contentScriptsReady: true,
      activeTabUrl: payload.url,
    });
  }

  /**
   * Handle page integration complete message
   */
  private handlePageIntegrationComplete(payload: {
    url: string;
    title: string;
    domain: string;
  }): void {
    console.log("Page integration complete:", payload);
    this.updateState({
      pageIntegrationStatus: "complete",
    });
  }

  /**
   * Handle sync request
   */
  private async handleSyncRequest(payload: { force?: boolean }): Promise<void> {
    try {
      this.updateState({ status: "syncing" });

      // Simulate sync operation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      this.updateState({
        status: "ready",
        lastSync: Date.now(),
      });
    } catch (error) {
      console.error("Sync failed:", error);
      this.updateState({
        status: "error",
        error: error.message,
      });
    }
  }

  /**
   * Handle config update
   */
  private async handleConfigUpdate(
    payload: Partial<ExtensionConfig>,
  ): Promise<void> {
    try {
      this.config = { ...this.config, ...payload };
      await this.setStorageItem("extensionConfig", this.config);
    } catch (error) {
      console.error("Config update failed:", error);
      this.updateState({
        status: "error",
        error: error.message,
      });
    }
  }

  /**
   * Get current extension state
   */
  public getState(): ExtensionState {
    return this.state;
  }

  /**
   * Update extension state
   */
  public async updateState(state: Partial<ExtensionState>): Promise<void> {
    this.state = { ...this.state, ...state };
    await this.setStorageItem("extensionState", this.state);
  }

  /**
   * Get current configuration
   */
  public getConfig(): ExtensionConfig {
    return this.config;
  }

  /**
   * Update configuration
   */
  public async updateConfig(config: Partial<ExtensionConfig>): Promise<void> {
    this.config = { ...this.config, ...config };
    await this.setStorageItem("extensionConfig", this.config);
  }

  /**
   * Send message to other extension components
   */
  public async sendMessage(message: ExtensionMessage): Promise<any> {
    try {
      // Send to all tabs with content scripts
      const tabs = await chrome.tabs.query({});
      const results = await Promise.all(
        tabs.map((tab) => {
          if (tab.id) {
            return chrome.tabs.sendMessage(tab.id, message);
          }
          return Promise.resolve(null);
        }),
      );

      return results.filter((result) => result !== null);
    } catch (error) {
      console.error("Failed to send message:", error);
      throw error;
    }
  }

  /**
   * Add message listener
   */
  public onMessage(callback: (message: ExtensionMessage) => void): void {
    this.messageListeners.push(callback);
  }

  /**
   * Remove message listener
   */
  public removeMessageListener(
    callback: (message: ExtensionMessage) => void,
  ): void {
    this.messageListeners = this.messageListeners.filter(
      (listener) => listener !== callback,
    );
  }

  /**
   * Dispatch action to update state
   */
  public dispatch(action: ExtensionAction): void {
    switch (action.type) {
      case "INITIALIZE":
        this.initialize();
        break;
      case "STARTUP":
        this.updateState({ status: "ready" });
        break;
      case "SYNC_START":
        this.updateState({ status: "syncing" });
        break;
      case "SYNC_COMPLETE":
        this.updateState({
          status: "ready",
          lastSync: Date.now(),
        });
        break;
      case "ERROR":
        this.updateState({
          status: "error",
          error: action.payload,
        });
        break;
      case "CONTENT_SCRIPT_READY":
        this.updateState({
          contentScriptsReady: true,
          activeTabUrl: action.payload?.url,
        });
        break;
      case "PAGE_INTEGRATION_COMPLETE":
        this.updateState({
          pageIntegrationStatus: "complete",
        });
        break;
      case "TAB_UPDATED":
        this.updateState({
          activeTabId: action.payload?.tabId,
          activeTabUrl: action.payload?.url,
        });
        break;
      case "TAB_ACTIVATED":
        this.updateState({
          activeTabId: action.payload?.tabId,
        });
        break;
      case "CONFIG_UPDATED":
        this.updateConfig(action.payload);
        break;
      case "CONFIG_RESET":
        this.config = this.getDefaultConfig();
        this.setStorageItem("extensionConfig", this.config);
        break;
      case "RESTORE_STATE":
        this.state = { ...this.state, ...action.payload };
        break;
      default:
        console.warn("Unknown action type:", action.type);
    }
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): ExtensionConfig {
    return {
      pageIntegrationEnabled: true,
      autoSyncEnabled: true,
      syncInterval: 300000, // 5 minutes
      showNotifications: true,
      theme: "system",
    };
  }

  /**
   * Get item from storage
   */
  private async getStorageItem<T>(key: string): Promise<T | null> {
    try {
      const result = await chrome.storage.sync.get(key);
      return result[key] || null;
    } catch (error) {
      console.error(`Failed to get storage item ${key}:`, error);
      return null;
    }
  }

  /**
   * Set item in storage
   */
  private async setStorageItem<T>(key: string, value: T): Promise<void> {
    try {
      await chrome.storage.sync.set({ [key]: value });
    } catch (error) {
      console.error(`Failed to set storage item ${key}:`, error);
      throw error;
    }
  }

  /**
   * Clear all extension data
   */
  public async clearAllData(): Promise<void> {
    try {
      await chrome.storage.sync.clear();
      await chrome.storage.local.clear();
      this.state = {
        status: "idle",
        contentScriptsReady: false,
        pageIntegrationStatus: "idle",
      };
      this.config = this.getDefaultConfig();
    } catch (error) {
      console.error("Failed to clear all data:", error);
      throw error;
    }
  }
}

// Singleton instance
const extensionServiceInstance = new ExtensionService();

export default extensionServiceInstance;
