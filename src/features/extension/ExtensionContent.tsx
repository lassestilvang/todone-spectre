// @ts-nocheck
import React, { useState, useEffect } from "react";
import { useExtension } from "../../../hooks/useExtension";
import { useExtensionConfig } from "../../../hooks/useExtensionConfig";

interface ExtensionContentProps {
  pageUrl?: string;
  onContentReady?: () => void;
}

export const ExtensionContent: React.FC<ExtensionContentProps> = ({
  pageUrl,
  onContentReady,
}) => {
  const { extensionState, dispatch } = useExtension();
  const { config, updateConfig } = useExtensionConfig();
  const [pageInfo, setPageInfo] = useState<{
    title: string;
    url: string;
    domain: string;
  } | null>(null);
  const [isContentScriptReady, setIsContentScriptReady] = useState(false);

  useEffect(() => {
    const initContentScript = async () => {
      try {
        // Get current tab information
        const [tab] = await chrome.tabs.query({
          active: true,
          currentWindow: true,
        });
        if (tab && tab.url) {
          const url = new URL(tab.url);
          setPageInfo({
            title: tab.title || "",
            url: tab.url,
            domain: url.hostname,
          });
        }

        // Notify background script that content script is ready
        await chrome.runtime.sendMessage({
          type: "CONTENT_SCRIPT_READY",
          payload: { url: pageUrl || window.location.href },
        });

        setIsContentScriptReady(true);
        onContentReady?.();
      } catch (error) {
        console.error("Content script initialization failed:", error);
        dispatch({ type: "ERROR", payload: error.message });
      }
    };

    initContentScript();

    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.type === "EXTENSION_STATE_UPDATE") {
        // Handle state updates from background
        console.log("Received state update:", message.payload);
      }
      return true;
    });

    return () => {
      // Cleanup listener if needed
    };
  }, [pageUrl, dispatch, onContentReady]);

  const handlePageIntegration = async () => {
    try {
      if (!pageInfo) return;

      // Check if page integration is enabled in config
      if (config.pageIntegrationEnabled) {
        // Inject Todone integration elements into the page
        const integrationElements = createIntegrationElements();
        document.body.appendChild(integrationElements);

        // Send integration data to background
        await chrome.runtime.sendMessage({
          type: "PAGE_INTEGRATION_COMPLETE",
          payload: {
            url: pageInfo.url,
            title: pageInfo.title,
            domain: pageInfo.domain,
          },
        });
      }
    } catch (error) {
      console.error("Page integration failed:", error);
      dispatch({ type: "ERROR", payload: error.message });
    }
  };

  const createIntegrationElements = () => {
    const container = document.createElement("div");
    container.id = "todone-integration-container";
    container.style.position = "fixed";
    container.style.bottom = "20px";
    container.style.right = "20px";
    container.style.zIndex = "9999";
    container.style.backgroundColor = "#fff";
    container.style.border = "1px solid #ddd";
    container.style.borderRadius = "8px";
    container.style.padding = "12px";
    container.style.boxShadow = "0 2px 10px rgba(0,0,0,0.1)";
    container.style.maxWidth = "300px";

    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
        <h3 style="margin: 0; font-size: 16px; color: #333;">Todone</h3>
        <button style="background: none; border: none; cursor: pointer; font-size: 18px;" onclick="this.parentElement.parentElement.style.display='none'">×</button>
      </div>
      <div style="margin-bottom: 12px;">
        <button id="todone-quick-add" style="width: 100%; padding: 8px 12px; background-color: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
          Quick Add Task
        </button>
      </div>
      <div>
        <button id="todone-view-tasks" style="width: 100%; padding: 8px 12px; background-color: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;">
          View Tasks
        </button>
      </div>
    `;

    return container;
  };

  if (!isContentScriptReady) {
    return null;
  }

  return (
    <div className="extension-content">
      {pageInfo && (
        <div className="page-integration-info">
          <p>Todone is integrated with: {pageInfo.title}</p>
          <p>Domain: {pageInfo.domain}</p>
          <button
            onClick={handlePageIntegration}
            className="integration-button"
          >
            {config.pageIntegrationEnabled
              ? "Refresh Integration"
              : "Enable Integration"}
          </button>
        </div>
      )}
    </div>
  );
};
