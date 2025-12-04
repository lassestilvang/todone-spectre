import React, { useState, useEffect } from 'react';
import { useOfflineStore } from '../../store/useOfflineStore';
import { useOfflineSettings } from '../../hooks/useOfflineSettings';

interface OfflineSettingsProps {
  onSettingsChange?: (settings: any) => void;
  onSave?: (settings: any) => void;
  onCancel?: () => void;
}

export const OfflineSettings: React.FC<OfflineSettingsProps> = ({
  onSettingsChange,
  onSave,
  onCancel
}) => {
  const { settings, updateSettings } = useOfflineSettings();
  const { isOffline, pendingChanges } = useOfflineStore();
  const [formSettings, setFormSettings] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    setFormSettings({
      autoSyncEnabled: settings.autoSyncEnabled,
      syncInterval: settings.syncInterval,
      maxQueueSize: settings.maxQueueSize,
      conflictResolution: settings.conflictResolution,
      offlineDataRetention: settings.offlineDataRetention,
      showOfflineIndicator: settings.showOfflineIndicator,
      syncOnReconnect: settings.syncOnReconnect
    });
  }, [settings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setFormSettings(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(newValue as string) : newValue
    }));

    if (onSettingsChange) {
      onSettingsChange({
        ...formSettings,
        [name]: newValue
      });
    }
  };

  const handleSave = async () => {
    try {
      await updateSettings(formSettings);

      if (onSave) {
        onSave(formSettings);
      }

      setIsEditing(false);
    } catch (error) {
      console.error('Failed to save offline settings:', error);
    }
  };

  const handleCancel = () => {
    setFormSettings({
      autoSyncEnabled: settings.autoSyncEnabled,
      syncInterval: settings.syncInterval,
      maxQueueSize: settings.maxQueueSize,
      conflictResolution: settings.conflictResolution,
      offlineDataRetention: settings.offlineDataRetention,
      showOfflineIndicator: settings.showOfflineIndicator,
      syncOnReconnect: settings.syncOnReconnect
    });

    if (onCancel) {
      onCancel();
    }

    setIsEditing(false);
  };

  const getConflictResolutionLabel = (value: string) => {
    switch (value) {
      case 'local-wins':
        return 'Local Changes Win';
      case 'remote-wins':
        return 'Remote Changes Win';
      case 'manual':
        return 'Manual Resolution';
      case 'timestamp':
        return 'Newest Changes Win';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="offline-settings">
      <h3 className="offline-settings-title">Offline Settings</h3>

      <div className="offline-settings-content">
        <div className="offline-settings-section">
          <h4>Sync Behavior</h4>

          <div className="offline-settings-field">
            <label htmlFor="autoSyncEnabled">
              <input
                type="checkbox"
                id="autoSyncEnabled"
                name="autoSyncEnabled"
                checked={formSettings.autoSyncEnabled || false}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
              Enable Auto-Sync
            </label>
            <span className="offline-settings-description">
              Automatically sync changes when online
            </span>
          </div>

          <div className="offline-settings-field">
            <label htmlFor="syncInterval">
              Sync Interval (seconds):
              <input
                type="number"
                id="syncInterval"
                name="syncInterval"
                value={formSettings.syncInterval || 30}
                onChange={handleInputChange}
                min={10}
                max={300}
                disabled={!isEditing}
              />
            </label>
            <span className="offline-settings-description">
              How often to attempt sync (10-300 seconds)
            </span>
          </div>

          <div className="offline-settings-field">
            <label htmlFor="syncOnReconnect">
              <input
                type="checkbox"
                id="syncOnReconnect"
                name="syncOnReconnect"
                checked={formSettings.syncOnReconnect || false}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
              Sync on Reconnect
            </label>
            <span className="offline-settings-description">
              Automatically sync when connection is restored
            </span>
          </div>
        </div>

        <div className="offline-settings-section">
          <h4>Queue Management</h4>

          <div className="offline-settings-field">
            <label htmlFor="maxQueueSize">
              Max Queue Size:
              <input
                type="number"
                id="maxQueueSize"
                name="maxQueueSize"
                value={formSettings.maxQueueSize || 100}
                onChange={handleInputChange}
                min={10}
                max={1000}
                disabled={!isEditing}
              />
            </label>
            <span className="offline-settings-description">
              Maximum number of offline operations to queue (10-1000)
            </span>
          </div>
        </div>

        <div className="offline-settings-section">
          <h4>Conflict Resolution</h4>

          <div className="offline-settings-field">
            <label htmlFor="conflictResolution">
              Conflict Strategy:
              <select
                id="conflictResolution"
                name="conflictResolution"
                value={formSettings.conflictResolution || 'timestamp'}
                onChange={handleInputChange}
                disabled={!isEditing}
              >
                <option value="timestamp">Newest Changes Win</option>
                <option value="local-wins">Local Changes Win</option>
                <option value="remote-wins">Remote Changes Win</option>
                <option value="manual">Manual Resolution</option>
              </select>
            </label>
            <span className="offline-settings-description">
              How to handle conflicts between local and remote changes
            </span>
          </div>
        </div>

        <div className="offline-settings-section">
          <h4>Data Retention</h4>

          <div className="offline-settings-field">
            <label htmlFor="offlineDataRetention">
              Data Retention (days):
              <input
                type="number"
                id="offlineDataRetention"
                name="offlineDataRetention"
                value={formSettings.offlineDataRetention || 30}
                onChange={handleInputChange}
                min={1}
                max={365}
                disabled={!isEditing}
              />
            </label>
            <span className="offline-settings-description">
              How long to keep offline data (1-365 days)
            </span>
          </div>
        </div>

        <div className="offline-settings-section">
          <h4>UI Preferences</h4>

          <div className="offline-settings-field">
            <label htmlFor="showOfflineIndicator">
              <input
                type="checkbox"
                id="showOfflineIndicator"
                name="showOfflineIndicator"
                checked={formSettings.showOfflineIndicator || true}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
              Show Offline Indicator
            </label>
            <span className="offline-settings-description">
              Display offline status indicator
            </span>
          </div>
        </div>

        <div className="offline-settings-status">
          <h4>Current Status</h4>
          <div className="offline-settings-status-item">
            <span className="offline-settings-status-label">Network Status:</span>
            <span className={`offline-settings-status-value ${isOffline ? 'offline' : 'online'}`}>
              {isOffline ? 'Offline' : 'Online'}
            </span>
          </div>
          <div className="offline-settings-status-item">
            <span className="offline-settings-status-label">Pending Changes:</span>
            <span className="offline-settings-status-value">
              {pendingChanges}
            </span>
          </div>
        </div>

        <div className="offline-settings-controls">
          {!isEditing ? (
            <button
              className="offline-settings-edit-button"
              onClick={() => setIsEditing(true)}
            >
              Edit Settings
            </button>
          ) : (
            <>
              <button
                className="offline-settings-save-button"
                onClick={handleSave}
              >
                Save Settings
              </button>
              <button
                className="offline-settings-cancel-button"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};