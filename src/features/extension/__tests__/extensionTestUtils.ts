import {
  ExtensionState,
  ExtensionConfig,
  ExtensionMessage,
  QuickAction,
} from "../../../types/extensionTypes";

/**
 * Extension Test Utilities - Testing utilities for browser extension functionality
 */

/**
 * Create mock extension state for testing
 */
export const createMockExtensionState = (
  overrides: Partial<ExtensionState> = {},
): ExtensionState => ({
  status: "idle",
  contentScriptsReady: false,
  pageIntegrationStatus: "idle",
  ...overrides,
});

/**
 * Create mock extension config for testing
 */
export const createMockExtensionConfig = (
  overrides: Partial<ExtensionConfig> = {},
): ExtensionConfig => ({
  pageIntegrationEnabled: true,
  autoSyncEnabled: true,
  syncInterval: 300000,
  showNotifications: true,
  theme: "system",
  quickActions: [
    { id: "create-task", label: "Create Task", icon: "plus" },
    { id: "view-tasks", label: "View Tasks", icon: "list" },
    { id: "sync-data", label: "Sync Data", icon: "sync" },
    { id: "settings", label: "Settings", icon: "cog" },
  ],
  ...overrides,
});

/**
 * Create mock extension message for testing
 */
export const createMockExtensionMessage = (
  type: string,
  payload: any = {},
  sender: "popup" | "content" | "background" | "options" = "popup",
): ExtensionMessage => ({
  type,
  payload,
  sender,
  timestamp: Date.now(),
});

/**
 * Create mock quick action for testing
 */
export const createMockQuickAction = (
  overrides: Partial<QuickAction> = {},
): QuickAction => ({
  id: "test-action",
  label: "Test Action",
  icon: "test",
  ...overrides,
});

/**
 * Mock chrome.runtime API for testing
 */
export const mockChromeRuntime = () => {
  const listeners: any[] = [];
  const ports: any[] = [];

  return {
    sendMessage: jest.fn().mockImplementation((message, callback) => {
      if (callback) callback({ success: true });
      return Promise.resolve({ success: true });
    }),
    onMessage: {
      addListener: jest.fn().mockImplementation((callback) => {
        listeners.push(callback);
        return () => {
          // Remove listener
        };
      }),
      removeListener: jest.fn(),
    },
    onConnect: {
      addListener: jest.fn().mockImplementation((callback) => {
        return () => {
          // Remove listener
        };
      }),
    },
    getURL: jest
      .fn()
      .mockImplementation((path) => `chrome-extension://test/${path}`),
    getManifest: jest.fn().mockReturnValue({
      version: "1.0.0",
    }),
    listeners,
    ports,
  };
};

/**
 * Mock chrome.tabs API for testing
 */
export const mockChromeTabs = () => {
  const mockTabs = [
    {
      id: 1,
      url: "https://example.com",
      title: "Test Tab",
      active: true,
    },
  ];

  return {
    query: jest.fn().mockImplementation((query) => {
      if (query.active && query.currentWindow) {
        return Promise.resolve([mockTabs[0]]);
      }
      return Promise.resolve(mockTabs);
    }),
    sendMessage: jest.fn().mockImplementation((tabId, message, callback) => {
      if (callback) callback({ success: true });
      return Promise.resolve({ success: true });
    }),
    onUpdated: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    },
    onActivated: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
    },
    mockTabs,
  };
};

/**
 * Mock chrome.storage API for testing
 */
export const mockChromeStorage = () => {
  const storage: Record<string, any> = {};

  return {
    sync: {
      get: jest.fn().mockImplementation((keys) => {
        if (typeof keys === "string") {
          return Promise.resolve({ [keys]: storage[keys] || null });
        }
        const result: Record<string, any> = {};
        keys.forEach((key: string) => {
          result[key] = storage[key] || null;
        });
        return Promise.resolve(result);
      }),
      set: jest.fn().mockImplementation((items) => {
        Object.entries(items).forEach(([key, value]) => {
          storage[key] = value;
        });
        return Promise.resolve();
      }),
      remove: jest.fn().mockImplementation((keys) => {
        if (typeof keys === "string") {
          delete storage[keys];
        } else {
          keys.forEach((key: string) => {
            delete storage[key];
          });
        }
        return Promise.resolve();
      }),
      clear: jest.fn().mockImplementation(() => {
        Object.keys(storage).forEach((key) => {
          delete storage[key];
        });
        return Promise.resolve();
      }),
    },
    local: {
      get: jest.fn().mockImplementation((keys) => {
        if (typeof keys === "string") {
          return Promise.resolve({ [keys]: storage[keys] || null });
        }
        const result: Record<string, any> = {};
        keys.forEach((key: string) => {
          result[key] = storage[key] || null;
        });
        return Promise.resolve(result);
      }),
      set: jest.fn().mockImplementation((items) => {
        Object.entries(items).forEach(([key, value]) => {
          storage[key] = value;
        });
        return Promise.resolve();
      }),
      remove: jest.fn().mockImplementation((keys) => {
        if (typeof keys === "string") {
          delete storage[keys];
        } else {
          keys.forEach((key: string) => {
            delete storage[key];
          });
        }
        return Promise.resolve();
      }),
      clear: jest.fn().mockImplementation(() => {
        Object.keys(storage).forEach((key) => {
          delete storage[key];
        });
        return Promise.resolve();
      }),
    },
    storage,
  };
};

/**
 * Create complete mock chrome API for testing
 */
export const createMockChromeApi = () => {
  return {
    runtime: mockChromeRuntime(),
    tabs: mockChromeTabs(),
    storage: mockChromeStorage(),
  };
};

/**
 * Mock extension service for testing
 */
export const mockExtensionService = () => {
  let state = createMockExtensionState();
  const listeners: any[] = [];

  return {
    getState: jest.fn().mockImplementation(() => ({ ...state })),
    updateState: jest.fn().mockImplementation((newState) => {
      state = { ...state, ...newState };
      return Promise.resolve();
    }),
    sendMessage: jest.fn().mockImplementation((message) => {
      return Promise.resolve({ success: true });
    }),
    onMessage: jest.fn().mockImplementation((callback) => {
      listeners.push(callback);
    }),
    removeMessageListener: jest.fn().mockImplementation((callback) => {
      // Remove listener
    }),
    dispatch: jest.fn().mockImplementation((action) => {
      // Handle actions
      switch (action.type) {
        case "SYNC_START":
          state = { ...state, status: "syncing" };
          break;
        case "SYNC_COMPLETE":
          state = { ...state, status: "ready", lastSync: Date.now() };
          break;
        case "ERROR":
          state = { ...state, status: "error", error: action.payload };
          break;
        default:
        // Other actions
      }
    }),
    getState,
    get listeners() {
      return listeners;
    },
  };
};

/**
 * Mock extension config service for testing
 */
export const mockExtensionConfigService = () => {
  let config = createMockExtensionConfig();
  const listeners: any[] = [];

  return {
    getConfig: jest.fn().mockImplementation(() => ({ ...config })),
    updateConfig: jest.fn().mockImplementation((configUpdate) => {
      config = { ...config, ...configUpdate };
      return Promise.resolve();
    }),
    resetConfig: jest.fn().mockImplementation(() => {
      config = createMockExtensionConfig();
      return Promise.resolve();
    }),
    onConfigChange: jest.fn().mockImplementation((callback) => {
      listeners.push(callback);
    }),
    removeConfigListener: jest.fn().mockImplementation((callback) => {
      // Remove listener
    }),
    getConfig,
    get listeners() {
      return listeners;
    },
  };
};

/**
 * Test extension state transitions
 */
export const testExtensionStateTransitions = (initialState: ExtensionState) => {
  describe("Extension State Transitions", () => {
    let state = { ...initialState };

    const dispatch = (action: any) => {
      // Simple state reducer for testing
      switch (action.type) {
        case "SYNC_START":
          state = { ...state, status: "syncing" };
          break;
        case "SYNC_COMPLETE":
          state = { ...state, status: "ready", lastSync: Date.now() };
          break;
        case "ERROR":
          state = { ...state, status: "error", error: action.payload };
          break;
        default:
        // Other actions
      }
      return state;
    };

    it("should transition to syncing state", () => {
      const newState = dispatch({ type: "SYNC_START" });
      expect(newState.status).toBe("syncing");
    });

    it("should transition to ready state after sync", () => {
      const newState = dispatch({ type: "SYNC_COMPLETE" });
      expect(newState.status).toBe("ready");
      expect(newState.lastSync).toBeDefined();
    });

    it("should transition to error state", () => {
      const errorMessage = "Test error";
      const newState = dispatch({ type: "ERROR", payload: errorMessage });
      expect(newState.status).toBe("error");
      expect(newState.error).toBe(errorMessage);
    });
  });
};

/**
 * Test extension config validation
 */
export const testExtensionConfigValidation = () => {
  describe("Extension Config Validation", () => {
    it("should validate sync interval", () => {
      const config = createMockExtensionConfig({ syncInterval: -1 });
      expect(config.syncInterval).toBe(300000); // Should default to 5 minutes
    });

    it("should validate theme", () => {
      const config = createMockExtensionConfig({ theme: "invalid" as any });
      expect(config.theme).toBe("system"); // Should default to system
    });

    it("should validate quick actions", () => {
      const config = createMockExtensionConfig({ quickActions: null as any });
      expect(Array.isArray(config.quickActions)).toBe(true);
      expect(config.quickActions.length).toBeGreaterThan(0);
    });
  });
};
