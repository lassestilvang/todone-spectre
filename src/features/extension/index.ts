export { ExtensionPopup } from "./ExtensionPopup";
export { ExtensionContent } from "./ExtensionContent";
export { ExtensionBackground } from "./ExtensionBackground";
export { ExtensionOptions } from "./ExtensionOptions";
export { ExtensionStatusIndicator } from "./ExtensionStatusIndicator";
export { ExtensionQuickActions } from "./ExtensionQuickActions";
export { ExtensionSyncIndicator } from "./ExtensionSyncIndicator";

// State management exports
export { default as extensionStateManager } from "./extensionStateManager";
export { getExtensionState } from "./extensionStateManager";
export { updateExtensionState } from "./extensionStateManager";
export { dispatchExtensionAction } from "./extensionStateManager";
export { getExtensionConfig } from "./extensionStateManager";
export { updateExtensionConfig } from "./extensionStateManager";
export { resetExtensionConfig } from "./extensionStateManager";

// Integration exports
export { default as extensionIntegration } from "./extensionIntegration";
export { initializeExtensionIntegration } from "./extensionIntegration";
export { sendMessageToContentScripts } from "./extensionIntegration";
export { sendMessageToBackground } from "./extensionIntegration";
export { broadcastExtensionMessage } from "./extensionIntegration";
export { getExtensionIntegrationState } from "./extensionIntegration";
export { getExtensionIntegrationConfig } from "./extensionIntegration";
export { isExtensionReady } from "./extensionIntegration";
export { isPageIntegrationSupported } from "./extensionIntegration";
