// @ts-nocheck
import { extensionService } from "../../services";
import { extensionConfigService } from "../../services";
import { ExtensionMessage, ExtensionState } from "../../types/extensionTypes";

/**
 * Extension Integration - Handles integration between extension components and browser APIs
 */
class ExtensionIntegration {
  private static instance: ExtensionIntegration;

  private constructor() {
    // Private constructor for singleton pattern
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): ExtensionIntegration {
    if (!ExtensionIntegration.instance) {
      ExtensionIntegration.instance = new ExtensionIntegration();
    }
    return ExtensionIntegration.instance;
  }

  /**
   * Initialize extension integration
   */
  public async initialize(): Promise<void> {
    try {
      // Initialize services
      await extensionService.initialize();
      await extensionConfigService.initialize();

      // Set up message listeners
      this.setupMessageListeners();

      // Set up event listeners
      this.setupEventListeners();

      console.log("Extension integration initialized");
    } catch (error) {
      console.error("Extension integration initialization failed:", error);
      throw error;
    }
  }

  /**
   * Set up message listeners for cross-component communication
   */
  private setupMessageListeners(): void {
    // Listen for messages from popup
    chrome.runtime.onMessage.addListener(
      (message: ExtensionMessage, sender, sendResponse) => {
        this.handleMessage(message, sender);
        sendResponse({ success: true });
        return true;
      },
    );

    // Listen for port connections
    chrome.runtime.onConnect.addListener((port) => {
      this.handlePortConnection(port);
    });
  }

  /**
   * Set up browser event listeners
   */
  private setupEventListeners(): void {
    // Tab events
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      this.handleTabUpdated(tabId, changeInfo, tab);
    });

    chrome.tabs.onActivated.addListener((activeInfo) => {
      this.handleTabActivated(activeInfo);
    });

    // Extension events
    chrome.runtime.onInstalled.addListener((details) => {
      this.handleInstalled(details);
    });

    chrome.runtime.onStartup.addListener(() => {
      this.handleStartup();
    });
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(
    message: ExtensionMessage,
    sender: chrome.runtime.MessageSender,
  ): void {
    console.log("Integration received message:", message, "from:", sender);

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
        case "EXTENSION_STATE_UPDATE":
          this.handleStateUpdate(message.payload);
          break;
        default:
          console.warn("Unknown message type:", message.type);
      }
    } catch (error) {
      console.error("Error handling message:", error);
      extensionService.dispatch({ type: "ERROR", payload: error.message });
    }
  }

  /**
   * Handle port connections
   */
  private handlePortConnection(port: chrome.runtime.Port): void {
    console.log("Integration connected to port:", port.name);

    port.onMessage.addListener((message: ExtensionMessage) => {
      this.handleMessage(message, {
        id: port.name,
      } as chrome.runtime.MessageSender);
    });

    port.onDisconnect.addListener(() => {
      console.log("Port disconnected:", port.name);
    });
  }

  /**
   * Handle tab updated events
   */
  private handleTabUpdated(
    tabId: number,
    changeInfo: chrome.tabs.TabChangeInfo,
    tab: chrome.tabs.Tab,
  ): void {
    if (changeInfo.status === "complete" && tab.active) {
      console.log("Tab updated:", tabId, tab.url);
      extensionService.dispatch({
        type: "TAB_UPDATED",
        payload: { tabId, url: tab.url },
      });
    }
  }

  /**
   * Handle tab activated events
   */
  private handleTabActivated(activeInfo: {
    tabId: number;
    windowId: number;
  }): void {
    console.log("Tab activated:", activeInfo.tabId);
    extensionService.dispatch({
      type: "TAB_ACTIVATED",
      payload: activeInfo,
    });
  }

  /**
   * Handle extension installed/updated events
   */
  private handleInstalled(details: chrome.runtime.InstalledDetails): void {
    console.log("Extension installed/updated:", details);
    extensionService.dispatch({ type: "INITIALIZE" });

    // Set up default configuration for fresh installs
    if (details.reason === "install") {
      this.setupDefaultConfiguration();
    }
  }

  /**
   * Handle extension startup
   */
  private handleStartup(): void {
    console.log("Extension startup");
    extensionService.dispatch({ type: "STARTUP" });
    this.restoreExtensionState();
  }

  /**
   * Handle content script ready messages
   */
  private handleContentScriptReady(payload: { url: string }): void {
    console.log("Content script ready for:", payload.url);
    extensionService.dispatch({
      type: "CONTENT_SCRIPT_READY",
      payload,
    });
  }

  /**
   * Handle page integration complete messages
   */
  private handlePageIntegrationComplete(payload: {
    url: string;
    title: string;
    domain: string;
  }): void {
    console.log("Page integration complete:", payload);
    extensionService.dispatch({
      type: "PAGE_INTEGRATION_COMPLETE",
      payload,
    });
  }

  /**
   * Handle sync requests
   */
  private async handleSyncRequest(payload: { force?: boolean }): Promise<void> {
    try {
      console.log("Handling sync request:", payload);
      extensionService.dispatch({ type: "SYNC_START" });

      // Simulate sync operation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      extensionService.dispatch({ type: "SYNC_COMPLETE" });
    } catch (error) {
      console.error("Sync failed:", error);
      extensionService.dispatch({ type: "ERROR", payload: error.message });
    }
  }

  /**
   * Handle config updates
   */
  private async handleConfigUpdate(
    payload: Partial<ExtensionState>,
  ): Promise<void> {
    try {
      console.log("Handling config update:", payload);
      await extensionConfigService.updateConfig(payload);
      extensionService.dispatch({ type: "CONFIG_UPDATED", payload });
    } catch (error) {
      console.error("Config update failed:", error);
      extensionService.dispatch({ type: "ERROR", payload: error.message });
    }
  }

  /**
   * Handle state updates
   */
  private handleStateUpdate(payload: ExtensionState): void {
    console.log("Handling state update:", payload);
    extensionService.dispatch({ type: "RESTORE_STATE", payload });
  }

  /**
   * Set up default configuration
   */
  private async setupDefaultConfiguration(): Promise<void> {
    try {
      const defaultConfig = extensionConfigService.getConfig();
      await extensionConfigService.updateConfig(defaultConfig);
      console.log("Default configuration set up");
    } catch (error) {
      console.error("Failed to set up default configuration:", error);
    }
  }

  /**
   * Restore extension state
   */
  private async restoreExtensionState(): Promise<void> {
    try {
      const savedState = await chrome.storage.local.get("extensionState");
      if (savedState.extensionState) {
        extensionService.dispatch({
          type: "RESTORE_STATE",
          payload: savedState.extensionState,
        });
      }
    } catch (error) {
      console.error("Failed to restore extension state:", error);
    }
  }

  /**
   * Send message to content scripts
   */
  public async sendMessageToContentScripts(
    message: ExtensionMessage,
  ): Promise<void> {
    try {
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
      console.error("Failed to send message to content scripts:", error);
      throw error;
    }
  }

  /**
   * Send message to background script
   */
  public async sendMessageToBackground(
    message: ExtensionMessage,
  ): Promise<any> {
    try {
      return await chrome.runtime.sendMessage(message);
    } catch (error) {
      console.error("Failed to send message to background:", error);
      throw error;
    }
  }

  /**
   * Broadcast message to all extension components
   */
  public async broadcastMessage(message: ExtensionMessage): Promise<void> {
    try {
      // Send to background
      await this.sendMessageToBackground(message);

      // Send to content scripts
      await this.sendMessageToContentScripts(message);
    } catch (error) {
      console.error("Failed to broadcast message:", error);
      throw error;
    }
  }

  /**
   * Get current extension state
   */
  public getCurrentState(): ExtensionState {
    return extensionService.getState();
  }

  /**
   * Get current configuration
   */
  public getCurrentConfig() {
    return extensionConfigService.getConfig();
  }

  /**
   * Check if extension is ready
   */
  public isExtensionReady(): boolean {
    const state = this.getCurrentState();
    return state.status === "ready" && state.contentScriptsReady;
  }

  /**
   * Check if page integration is supported for current URL
   */
  public async isPageIntegrationSupported(): Promise<boolean> {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (tab && tab.url) {
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

        const domain = new URL(tab.url).hostname;
        return supportedDomains.some((supportedDomain) =>
          domain.endsWith(supportedDomain),
        );
      }
      return false;
    } catch (error) {
      console.error("Failed to check page integration support:", error);
      return false;
    }
  }
}

// Export singleton instance
const extensionIntegration = ExtensionIntegration.getInstance();
export default extensionIntegration;

// Export convenience methods
export const initializeExtensionIntegration = () =>
  extensionIntegration.initialize();
export const sendMessageToContentScripts = (message: ExtensionMessage) =>
  extensionIntegration.sendMessageToContentScripts(message);
export const sendMessageToBackground = (message: ExtensionMessage) =>
  extensionIntegration.sendMessageToBackground(message);
export const broadcastExtensionMessage = (message: ExtensionMessage) =>
  extensionIntegration.broadcastMessage(message);
export const getExtensionIntegrationState = () =>
  extensionIntegration.getCurrentState();
export const getExtensionIntegrationConfig = () =>
  extensionIntegration.getCurrentConfig();
export const isExtensionReady = () => extensionIntegration.isExtensionReady();
export const isPageIntegrationSupported = () =>
  extensionIntegration.isPageIntegrationSupported();
