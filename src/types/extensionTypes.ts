// @ts-nocheck
export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  onClick?: () => void;
}

export interface ExtensionState {
  status: "idle" | "syncing" | "error" | "ready";
  lastSync?: number;
  error?: string;
  activeTabId?: number;
  activeTabUrl?: string;
  contentScriptsReady: boolean;
  pageIntegrationStatus: "idle" | "integrating" | "complete" | "failed";
}

export interface ExtensionConfig {
  pageIntegrationEnabled: boolean;
  autoSyncEnabled: boolean;
  syncInterval: number;
  showNotifications: boolean;
  theme: "system" | "light" | "dark";
  quickActions?: QuickAction[];
}

export interface ExtensionMessage {
  type: string;
  payload?: any;
  sender?: "popup" | "content" | "background" | "options";
  timestamp?: number;
}

export interface ExtensionEvent {
  eventType: string;
  data?: any;
  timestamp: number;
}

export interface ExtensionAction {
  type:
    | "INITIALIZE"
    | "STARTUP"
    | "SYNC_START"
    | "SYNC_COMPLETE"
    | "ERROR"
    | "CONTENT_SCRIPT_READY"
    | "PAGE_INTEGRATION_COMPLETE"
    | "TAB_UPDATED"
    | "TAB_ACTIVATED"
    | "CONFIG_UPDATED"
    | "CONFIG_RESET"
    | "RESTORE_STATE";
  payload?: any;
}

export interface ExtensionStorage {
  get: <T>(key: string) => Promise<T>;
  set: <T>(key: string, value: T) => Promise<void>;
  remove: (key: string) => Promise<void>;
  clear: () => Promise<void>;
}

export interface ExtensionService {
  sendMessage: (message: ExtensionMessage) => Promise<any>;
  onMessage: (callback: (message: ExtensionMessage) => void) => void;
  getState: () => ExtensionState;
  updateState: (state: Partial<ExtensionState>) => Promise<void>;
}

export interface ExtensionContextType {
  extensionState: ExtensionState;
  dispatch: React.Dispatch<ExtensionAction>;
  service: ExtensionService;
}

export interface ExtensionConfigContextType {
  config: ExtensionConfig;
  updateConfig: (config: Partial<ExtensionConfig>) => Promise<void>;
  resetConfig: () => Promise<void>;
}

export interface ExtensionIntegrationOptions {
  autoIntegrate?: boolean;
  integrationElements?: string[];
  integrationStyles?: Record<string, string>;
  integrationScripts?: string[];
}

export interface ExtensionSyncOptions {
  force?: boolean;
  fullSync?: boolean;
  syncInterval?: number;
}

export interface ExtensionError {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
}
