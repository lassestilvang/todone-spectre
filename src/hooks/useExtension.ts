import { useState, useEffect, useContext, useReducer } from 'react';
import { ExtensionState, ExtensionAction, ExtensionContextType } from '../types/extensionTypes';
import { extensionService } from '../services';
import { createContext } from 'react';

/**
 * Extension Context - Provides extension state and dispatch function
 */
export const ExtensionContext = createContext<ExtensionContextType>({
  extensionState: {
    status: 'idle',
    contentScriptsReady: false,
    pageIntegrationStatus: 'idle'
  },
  dispatch: () => {},
  service: extensionService
});

/**
 * Extension State Reducer - Handles extension state updates
 */
const extensionReducer = (state: ExtensionState, action: ExtensionAction): ExtensionState => {
  switch (action.type) {
    case 'INITIALIZE':
      return { ...state, status: 'idle' };
    case 'STARTUP':
      return { ...state, status: 'ready' };
    case 'SYNC_START':
      return { ...state, status: 'syncing', error: undefined };
    case 'SYNC_COMPLETE':
      return { ...state, status: 'ready', lastSync: Date.now(), error: undefined };
    case 'ERROR':
      return { ...state, status: 'error', error: action.payload };
    case 'CONTENT_SCRIPT_READY':
      return { ...state, contentScriptsReady: true, activeTabUrl: action.payload?.url };
    case 'PAGE_INTEGRATION_COMPLETE':
      return { ...state, pageIntegrationStatus: 'complete' };
    case 'TAB_UPDATED':
      return {
        ...state,
        activeTabId: action.payload?.tabId,
        activeTabUrl: action.payload?.url
      };
    case 'TAB_ACTIVATED':
      return { ...state, activeTabId: action.payload?.tabId };
    case 'CONFIG_UPDATED':
      return state; // Config updates don't change state directly
    case 'CONFIG_RESET':
      return state; // Config reset doesn't change state directly
    case 'RESTORE_STATE':
      return { ...state, ...action.payload };
    default:
      return state;
  }
};

/**
 * Extension Provider - Provides extension context to components
 */
export const ExtensionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [extensionState, dispatch] = useReducer(extensionReducer, {
    status: 'idle',
    contentScriptsReady: false,
    pageIntegrationStatus: 'idle'
  });

  useEffect(() => {
    // Initialize extension service
    extensionService.initialize();

    // Set up message listener
    const messageListener = (message: any) => {
      console.log('ExtensionProvider received message:', message);
      // Handle messages that affect state
      if (message.type === 'EXTENSION_STATE_UPDATE') {
        dispatch({ type: 'RESTORE_STATE', payload: message.payload });
      }
    };

    extensionService.onMessage(messageListener);

    return () => {
      extensionService.removeMessageListener(messageListener);
    };
  }, []);

  return (
    <ExtensionContext.Provider value={{ extensionState, dispatch, service: extensionService }}>
      {children}
    </ExtensionContext.Provider>
  );
};

/**
 * useExtension Hook - Custom hook for accessing extension functionality
 */
export const useExtension = (): ExtensionContextType => {
  const context = useContext(ExtensionContext);

  if (!context) {
    throw new Error('useExtension must be used within an ExtensionProvider');
  }

  return context;
};

/**
 * useExtensionState Hook - Custom hook for accessing extension state
 */
export const useExtensionState = (): ExtensionState => {
  const { extensionState } = useExtension();
  return extensionState;
};

/**
 * useExtensionDispatch Hook - Custom hook for accessing extension dispatch
 */
export const useExtensionDispatch = (): React.Dispatch<ExtensionAction> => {
  const { dispatch } = useExtension();
  return dispatch;
};

/**
 * useExtensionService Hook - Custom hook for accessing extension service
 */
export const useExtensionService = () => {
  const { service } = useExtension();
  return service;
};