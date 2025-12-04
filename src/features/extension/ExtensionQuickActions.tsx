import React from 'react';
import { useExtensionConfig } from '../../../hooks/useExtensionConfig';
import { useExtensionService } from '../../../hooks/useExtension';

interface ExtensionQuickActionsProps {
  className?: string;
  onActionClick?: (actionId: string) => void;
}

export const ExtensionQuickActions: React.FC<ExtensionQuickActionsProps> = ({
  className = '',
  onActionClick
}) => {
  const { config } = useExtensionConfig();
  const extensionService = useExtensionService();

  const handleActionClick = async (actionId: string) => {
    try {
      // Call custom handler if provided
      if (onActionClick) {
        onActionClick(actionId);
      }

      // Handle built-in actions
      switch (actionId) {
        case 'create-task':
          await chrome.tabs.create({ url: chrome.runtime.getURL('create-task.html') });
          break;
        case 'view-tasks':
          await chrome.tabs.create({ url: chrome.runtime.getURL('view-tasks.html') });
          break;
        case 'sync-data':
          await extensionService.dispatch({ type: 'SYNC_START' });
          // Simulate sync
          setTimeout(() => {
            extensionService.dispatch({ type: 'SYNC_COMPLETE' });
          }, 2000);
          break;
        case 'settings':
          await chrome.runtime.openOptionsPage();
          break;
        default:
          console.log(`Custom action clicked: ${actionId}`);
      }
    } catch (error) {
      console.error(`Failed to execute action ${actionId}:`, error);
      extensionService.dispatch({ type: 'ERROR', payload: error.message });
    }
  };

  return (
    <div className={`extension-quick-actions ${className}`}>
      <div className="quick-actions-grid">
        {config.quickActions?.map((action) => (
          <button
            key={action.id}
            className="quick-action-button"
            onClick={() => handleActionClick(action.id)}
            title={action.label}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '12px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              width: '80px',
              height: '80px'
            }}
          >
            <span className="action-icon" style={{ fontSize: '24px', marginBottom: '6px' }}>
              {getActionIcon(action.icon)}
            </span>
            <span className="action-label" style={{ fontSize: '12px', textAlign: 'center' }}>
              {action.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Helper function to get action icons
const getActionIcon = (icon: string): string => {
  switch (icon) {
    case 'plus': return '➕';
    case 'list': return '📋';
    case 'sync': return '🔄';
    case 'cog': return '⚙️';
    case 'check': return '✓';
    case 'star': return '⭐';
    case 'calendar': return '📅';
    case 'search': return '🔍';
    case 'trash': return '🗑️';
    case 'edit': return '✏️';
    default: return icon;
  }
};