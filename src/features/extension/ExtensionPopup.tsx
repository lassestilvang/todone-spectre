import React, { useState, useEffect } from 'react';
import { useExtension } from '../../../hooks/useExtension';
import { useExtensionConfig } from '../../../hooks/useExtensionConfig';
import { ExtensionState, QuickAction } from '../../../types/extensionTypes';

interface ExtensionPopupProps {
  onClose?: () => void;
}

export const ExtensionPopup: React.FC<ExtensionPopupProps> = ({ onClose }) => {
  const { extensionState, dispatch } = useExtension();
  const { config, updateConfig } = useExtensionConfig();
  const [quickActions, setQuickActions] = useState<QuickAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadQuickActions = async () => {
      try {
        // Load quick actions from storage or API
        const actions = await chrome.storage.sync.get('quickActions');
        if (actions.quickActions) {
          setQuickActions(actions.quickActions);
        } else {
          // Default quick actions
          setQuickActions([
            { id: 'create-task', label: 'Create Task', icon: 'plus' },
            { id: 'view-tasks', label: 'View Tasks', icon: 'list' },
            { id: 'sync-data', label: 'Sync Data', icon: 'sync' },
            { id: 'settings', label: 'Settings', icon: 'cog' }
          ]);
        }
      } catch (error) {
        console.error('Failed to load quick actions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadQuickActions();
  }, []);

  const handleQuickAction = async (actionId: string) => {
    try {
      switch (actionId) {
        case 'create-task':
          await chrome.tabs.create({ url: chrome.runtime.getURL('create-task.html') });
          break;
        case 'view-tasks':
          await chrome.tabs.create({ url: chrome.runtime.getURL('view-tasks.html') });
          break;
        case 'sync-data':
          dispatch({ type: 'SYNC_START' });
          // Simulate sync operation
          setTimeout(() => dispatch({ type: 'SYNC_COMPLETE' }), 2000);
          break;
        case 'settings':
          await chrome.runtime.openOptionsPage();
          break;
        default:
          console.warn(`Unknown action: ${actionId}`);
      }
    } catch (error) {
      console.error(`Failed to execute action ${actionId}:`, error);
      dispatch({ type: 'ERROR', payload: error.message });
    }
  };

  if (isLoading) {
    return (
      <div className="extension-popup">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  return (
    <div className="extension-popup">
      <header className="popup-header">
        <h1 className="popup-title">Todone Extension</h1>
        <button className="close-button" onClick={onClose}>×</button>
      </header>

      <div className="popup-content">
        <div className="quick-actions">
          {quickActions.map((action) => (
            <button
              key={action.id}
              className="action-button"
              onClick={() => handleQuickAction(action.id)}
              title={action.label}
            >
              <span className={`icon icon-${action.icon}`}></span>
              <span className="action-label">{action.label}</span>
            </button>
          ))}
        </div>

        <div className="popup-status">
          {extensionState.status === 'syncing' && (
            <div className="sync-status">
              <span className="sync-icon">↻</span>
              <span>Syncing data...</span>
            </div>
          )}
          {extensionState.error && (
            <div className="error-message">
              <span className="error-icon">⚠</span>
              <span>{extensionState.error}</span>
            </div>
          )}
        </div>
      </div>

      <footer className="popup-footer">
        <div className="version-info">
          <span>v{chrome.runtime.getManifest().version}</span>
        </div>
      </footer>
    </div>
  );
};