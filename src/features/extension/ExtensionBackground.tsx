// @ts-nocheck
import React, { useState, useEffect } from "react";
import { useExtension } from "../../../hooks/useExtension";
import { useExtensionConfig } from "../../../hooks/useExtensionConfig";

interface ExtensionBackgroundProps {
  onMessage?: (message: any) => void;
  onStateChange?: (state: any) => void;
}

export const ExtensionBackground: React.FC<ExtensionBackgroundProps> = ({
  onMessage,
  onStateChange,
}) => {
  const { extensionState, dispatch } = useExtension();
  const { config, updateConfig } = useExtensionConfig();
  const [eventListeners, setEventListeners] = useState<{ [key: string]: any }>(
    {},
  );
  const [messagePorts, setMessagePorts] = useState<{ [key: string]: any }>({});

  useEffect(() => {
    // Set up event listeners for browser extension events
    const setupEventListeners = () => {
      const listeners = {
        onInstalled: chrome.runtime.onInstalled.addListener(handleInstalled),
        onStartup: chrome.runtime.onStartup.addListener(handleStartup),
        onMessage: chrome.runtime.onMessage.addListener(handleRuntimeMessage),
        onConnect: chrome.runtime.onConnect.addListener(handleConnect),
        onTabUpdated: chrome.tabs.onUpdated.addListener(handleTabUpdated),
        onTabActivated: chrome.tabs.onActivated.addListener(handleTabActivated),
      };

      setEventListeners(listeners);
    };

    setupEventListeners();

    // Initialize background services
    initializeBackgroundServices();

    return () => {
      // Clean up event listeners
      Object.values(eventListeners).forEach((listener) => {
        if (listener && typeof listener.removeListener === "function") {
          listener.removeListener();
        }
      });
    };
  }, [dispatch]);

  const handleInstalled = (details: chrome.runtime.InstalledDetails) => {
    console.log("Extension installed/updated:", details);
    dispatch({ type: "INITIALIZE" });

    // Set up initial configuration if this is a fresh install
    if (details.reason === "install") {
      setupDefaultConfiguration();
    }
  };

  const handleStartup = () => {
    console.log("Extension startup");
    dispatch({ type: "STARTUP" });
    restoreExtensionState();
  };

  const handleRuntimeMessage = (
    message: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void,
  ) => {
    console.log("Background received message:", message);

    try {
      switch (message.type) {
        case "CONTENT_SCRIPT_READY":
          handleContentScriptReady(message.payload);
          break;
        case "PAGE_INTEGRATION_COMPLETE":
          handlePageIntegrationComplete(message.payload);
          break;
        case "SYNC_REQUEST":
          handleSyncRequest(message.payload);
          break;
        case "CONFIG_UPDATE":
          handleConfigUpdate(message.payload);
          break;
        default:
          console.warn("Unknown message type:", message.type);
      }

      sendResponse({ success: true });
      onMessage?.(message);
    } catch (error) {
      console.error("Error handling message:", error);
      sendResponse({ success: false, error: error.message });
    }

    return true; // Keep message port open for sendResponse
  };

  const handleConnect = (port: chrome.runtime.Port) => {
    console.log("Background connected to port:", port.name);

    const portId = port.name || `port-${Date.now()}`;
    setMessagePorts((prev) => ({ ...prev, [portId]: port }));

    port.onMessage.addListener((message) => {
      console.log(`Background received port message from ${portId}:`, message);
      onMessage?.({ ...message, portId });
    });

    port.onDisconnect.addListener(() => {
      console.log(`Port ${portId} disconnected`);
      setMessagePorts((prev) => {
        const newPorts = { ...prev };
        delete newPorts[portId];
        return newPorts;
      });
    });
  };

  const handleTabUpdated = (
    tabId: number,
    changeInfo: chrome.tabs.TabChangeInfo,
    tab: chrome.tabs.Tab,
  ) => {
    if (changeInfo.status === "complete" && tab.active) {
      console.log("Tab updated:", tabId, tab.url);
      dispatch({ type: "TAB_UPDATED", payload: { tabId, url: tab.url } });
    }
  };

  const handleTabActivated = (activeInfo: {
    tabId: number;
    windowId: number;
  }) => {
    console.log("Tab activated:", activeInfo.tabId);
    dispatch({ type: "TAB_ACTIVATED", payload: activeInfo });
  };

  const handleContentScriptReady = async (payload: { url: string }) => {
    console.log("Content script ready for:", payload.url);
    dispatch({ type: "CONTENT_SCRIPT_READY", payload });

    // Send current state to content script
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id!, {
          type: "EXTENSION_STATE_UPDATE",
          payload: extensionState,
        });
      }
    });
  };

  const handlePageIntegrationComplete = (payload: {
    url: string;
    title: string;
    domain: string;
  }) => {
    console.log("Page integration complete:", payload);
    dispatch({ type: "PAGE_INTEGRATION_COMPLETE", payload });
  };

  const handleSyncRequest = async (payload: { force?: boolean }) => {
    try {
      dispatch({ type: "SYNC_START" });

      // Simulate sync operation
      await new Promise((resolve) => setTimeout(resolve, 2000));

      dispatch({ type: "SYNC_COMPLETE" });
      onStateChange?.(extensionState);
    } catch (error) {
      console.error("Sync failed:", error);
      dispatch({ type: "ERROR", payload: error.message });
    }
  };

  const handleConfigUpdate = async (payload: Partial<typeof config>) => {
    try {
      await updateConfig(payload);
      dispatch({ type: "CONFIG_UPDATED", payload });
    } catch (error) {
      console.error("Config update failed:", error);
      dispatch({ type: "ERROR", payload: error.message });
    }
  };

  const initializeBackgroundServices = async () => {
    try {
      // Load saved state
      const savedState = await chrome.storage.local.get("extensionState");
      if (savedState.extensionState) {
        dispatch({ type: "RESTORE_STATE", payload: savedState.extensionState });
      }

      // Load configuration
      const savedConfig = await chrome.storage.sync.get("extensionConfig");
      if (savedConfig.extensionConfig) {
        await updateConfig(savedConfig.extensionConfig);
      }

      // Set up periodic sync
      setupPeriodicSync();
    } catch (error) {
      console.error("Background initialization failed:", error);
      dispatch({ type: "ERROR", payload: error.message });
    }
  };

  const setupPeriodicSync = () => {
    // Sync every 5 minutes
    const syncInterval = setInterval(
      async () => {
        if (extensionState.status !== "syncing") {
          await handleSyncRequest({ force: false });
        }
      },
      5 * 60 * 1000,
    );

    // Clean up on unmount
    return () => clearInterval(syncInterval);
  };

  const setupDefaultConfiguration = async () => {
    const defaultConfig = {
      pageIntegrationEnabled: true,
      autoSyncEnabled: true,
      syncInterval: 300000, // 5 minutes
      showNotifications: true,
      theme: "system",
    };

    await updateConfig(defaultConfig);
    await chrome.storage.sync.set({ extensionConfig: defaultConfig });
  };

  const restoreExtensionState = async () => {
    try {
      const savedState = await chrome.storage.local.get("extensionState");
      if (savedState.extensionState) {
        dispatch({ type: "RESTORE_STATE", payload: savedState.extensionState });
      }
    } catch (error) {
      console.error("Failed to restore extension state:", error);
    }
  };

  return (
    <div className="extension-background">
      <h2>Extension Background Services</h2>
      <div className="background-status">
        <p>Status: {extensionState.status}</p>
        <p>
          Last Sync:{" "}
          {extensionState.lastSync
            ? new Date(extensionState.lastSync).toLocaleString()
            : "Never"}
        </p>
        <p>Active Ports: {Object.keys(messagePorts).length}</p>
      </div>
    </div>
  );
};
