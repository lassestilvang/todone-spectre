import React, { useState, useEffect } from 'react';
import { useOfflineStore } from '../../store/useOfflineStore';
import { useOfflineSettings } from '../../hooks/useOfflineSettings';
import { OfflineSettings } from '../../types/offlineTypes';

interface OfflineSettingsEnhancedProps {
  onSettingsChange?: (settings: OfflineSettings) => void;
  onSave?: (settings: OfflineSettings) => void;
  onCancel?: () => void;
  onReset?: () => void;
  showAdvancedOptions?: boolean;
  showStorageManagement?: boolean;
  showPerformanceTuning?: boolean;
}

export const OfflineSettingsEnhanced: React.FC<OfflineSettingsEnhancedProps> = ({
  onSettingsChange,
  onSave,
  onCancel,
  onReset,
  showAdvancedOptions = true,
  showStorageManagement = true,
  showPerformanceTuning = true
}) => {
  const { settings, updateSettings, resetToDefaults } = useOfflineSettings();
  const { isOffline, pendingChanges, queue, sync, storageUsage, performanceMetrics } = useOfflineStore();
  const [formSettings, setFormSettings] = useState<Partial<OfflineSettings>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'advanced' | 'storage' | 'performance'>('general');
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    setFormSettings({
      autoSyncEnabled: settings.autoSyncEnabled,
      syncInterval: settings.syncInterval,
      maxQueueSize: settings.maxQueueSize,
      conflictResolution: settings.conflictResolution,
      offlineDataRetention: settings.offlineDataRetention,
      showOfflineIndicator: settings.showOfflineIndicator,
      syncOnReconnect: settings.syncOnReconnect,
      maxRetryAttempts: settings.maxRetryAttempts,
      retryDelay: settings.retryDelay,
      batchSize: settings.batchSize,
      enableCompression: settings.enableCompression,
      enableEncryption: settings.enableEncryption,
      syncPriority: settings.syncPriority,
      autoRetryFailedItems: settings.autoRetryFailedItems,
      retryStrategy: settings.retryStrategy
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
        ...settings,
        [name]: newValue
      });
    }
  };

  const handleSave = async () => {
    try {
      await updateSettings(formSettings as OfflineSettings);

      if (onSave) {
        onSave(formSettings as OfflineSettings);
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
      syncOnReconnect: settings.syncOnReconnect,
      maxRetryAttempts: settings.maxRetryAttempts,
      retryDelay: settings.retryDelay,
      batchSize: settings.batchSize,
      enableCompression: settings.enableCompression,
      enableEncryption: settings.enableEncryption,
      syncPriority: settings.syncPriority,
      autoRetryFailedItems: settings.autoRetryFailedItems,
      retryStrategy: settings.retryStrategy
    });

    if (onCancel) {
      onCancel();
    }

    setIsEditing(false);
  };

  const handleReset = async () => {
    try {
      await resetToDefaults();

      if (onReset) {
        onReset();
      }

      setShowResetConfirm(false);
    } catch (error) {
      console.error('Failed to reset settings:', error);
    }
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

  const getRetryStrategyLabel = (value: string) => {
    switch (value) {
      case 'linear':
        return 'Linear Backoff';
      case 'exponential':
        return 'Exponential Backoff';
      case 'immediate':
        return 'Immediate Retry';
      default:
        return 'Unknown';
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="offline-settings-enhanced">
      <h3 className="offline-settings-title">Enhanced Offline Settings</h3>

      {/* Tab Navigation */}
      <div className="settings-tabs">
        <button
          className={`tab-button ${activeTab === 'general' ? 'active' : ''}`}
          onClick={() => setActiveTab('general')}
        >
          General
        </button>
        {showAdvancedOptions && (
          <button
            className={`tab-button ${activeTab === 'advanced' ? 'active'}`}
            onClick={() => setActiveTab('advanced')}
          >
            Advanced
          </button>
        )}
        {showStorageManagement && (
          <button
            className={`tab-button ${activeTab === 'storage' ? 'active'}`}
            onClick={() => setActiveTab('storage')}
          >
            Storage
          </button>
        )}
        {showPerformanceTuning && (
          <button
            className={`tab-button ${activeTab === 'performance' ? 'active'}`}
            onClick={() => setActiveTab('performance')}
          >
            Performance
          </button>
        )}
      </div>

      <div className="offline-settings-content">
        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <>
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
          </>
        )}

        {/* Advanced Settings Tab */}
        {showAdvancedOptions && activeTab === 'advanced' && (
          <>
            <div className="offline-settings-section">
              <h4>Retry Behavior</h4>

              <div className="offline-settings-field">
                <label htmlFor="maxRetryAttempts">
                  Max Retry Attempts:
                  <input
                    type="number"
                    id="maxRetryAttempts"
                    name="maxRetryAttempts"
                    value={formSettings.maxRetryAttempts || 3}
                    onChange={handleInputChange}
                    min={1}
                    max={10}
                    disabled={!isEditing}
                  />
                </label>
                <span className="offline-settings-description">
                  Maximum number of retry attempts for failed operations (1-10)
                </span>
              </div>

              <div className="offline-settings-field">
                <label htmlFor="retryDelay">
                  Retry Delay (ms):
                  <input
                    type="number"
                    id="retryDelay"
                    name="retryDelay"
                    value={formSettings.retryDelay || 5000}
                    onChange={handleInputChange}
                    min={1000}
                    max={60000}
                    disabled={!isEditing}
                  />
                </label>
                <span className="offline-settings-description">
                  Initial delay between retry attempts (1000-60000 ms)
                </span>
              </div>

              <div className="offline-settings-field">
                <label htmlFor="retryStrategy">
                  Retry Strategy:
                  <select
                    id="retryStrategy"
                    name="retryStrategy"
                    value={formSettings.retryStrategy || 'exponential'}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  >
                    <option value="linear">Linear Backoff</option>
                    <option value="exponential">Exponential Backoff</option>
                    <option value="immediate">Immediate Retry</option>
                  </select>
                </label>
                <span className="offline-settings-description">
                  Strategy for retrying failed operations
                </span>
              </div>

              <div className="offline-settings-field">
                <label htmlFor="autoRetryFailedItems">
                  <input
                    type="checkbox"
                    id="autoRetryFailedItems"
                    name="autoRetryFailedItems"
                    checked={formSettings.autoRetryFailedItems || true}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                  Auto-Retry Failed Items
                </label>
                <span className="offline-settings-description">
                  Automatically retry failed operations
                </span>
              </div>
            </div>

            <div className="offline-settings-section">
              <h4>Batch Processing</h4>

              <div className="offline-settings-field">
                <label htmlFor="batchSize">
                  Batch Size:
                  <input
                    type="number"
                    id="batchSize"
                    name="batchSize"
                    value={formSettings.batchSize || 10}
                    onChange={handleInputChange}
                    min={1}
                    max={50}
                    disabled={!isEditing}
                  />
                </label>
                <span className="offline-settings-description">
                  Number of operations to process in each batch (1-50)
                </span>
              </div>

              <div className="offline-settings-field">
                <label htmlFor="syncPriority">
                  Default Priority:
                  <select
                    id="syncPriority"
                    name="syncPriority"
                    value={formSettings.syncPriority || 'medium'}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  >
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </label>
                <span className="offline-settings-description">
                  Default priority for new operations
                </span>
              </div>
            </div>

            <div className="offline-settings-section">
              <h4>Data Processing</h4>

              <div className="offline-settings-field">
                <label htmlFor="enableCompression">
                  <input
                    type="checkbox"
                    id="enableCompression"
                    name="enableCompression"
                    checked={formSettings.enableCompression || false}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                  Enable Data Compression
                </label>
                <span className="offline-settings-description">
                  Compress data before storage (reduces storage usage)
                </span>
              </div>

              <div className="offline-settings-field">
                <label htmlFor="enableEncryption">
                  <input
                    type="checkbox"
                    id="enableEncryption"
                    name="enableEncryption"
                    checked={formSettings.enableEncryption || false}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                  />
                  Enable Data Encryption
                </label>
                <span className="offline-settings-description">
                  Encrypt sensitive data (may impact performance)
                </span>
              </div>
            </div>
          </>
        )}

        {/* Storage Management Tab */}
        {showStorageManagement && activeTab === 'storage' && (
          <div className="storage-management-section">
            <h4>Storage Management</h4>

            <div className="storage-stats">
              <div className="storage-stat">
                <span className="stat-label">Used Storage:</span>
                <span className="stat-value">{formatBytes(storageUsage.used)}</span>
              </div>
              <div className="storage-stat">
                <span className="stat-label">Available Storage:</span>
                <span className="stat-value">{formatBytes(storageUsage.available)}</span>
              </div>
              <div className="storage-stat">
                <span className="stat-label">Usage Percentage:</span>
                <span className="stat-value">{storageUsage.percentage}%</span>
              </div>
            </div>

            <div className="storage-visualization">
              <div className="storage-bar-container">
                <div
                  className="storage-bar-used"
                  style={{ width: `${storageUsage.percentage}%` }}
                />
                <div
                  className="storage-bar-available"
                  style={{ width: `${100 - storageUsage.percentage}%` }}
                />
              </div>
            </div>

            <div className="storage-actions">
              <button className="storage-action-button" disabled={!isEditing}>
                Optimize Storage
              </button>
              <button className="storage-action-button" disabled={!isEditing}>
                Clear Cache
              </button>
              <button className="storage-action-button" disabled={!isEditing}>
                Export Data
              </button>
            </div>
          </div>
        )}

        {/* Performance Tuning Tab */}
        {showPerformanceTuning && activeTab === 'performance' && (
          <div className="performance-tuning-section">
            <h4>Performance Metrics</h4>

            <div className="performance-stats">
              <div className="performance-stat">
                <span className="stat-label">Queue Processing Time:</span>
                <span className="stat-value">{performanceMetrics.queueProcessingTime}ms</span>
              </div>
              <div className="performance-stat">
                <span className="stat-label">Sync Processing Time:</span>
                <span className="stat-value">{performanceMetrics.syncProcessingTime}ms</span>
              </div>
              <div className="performance-stat">
                <span className="stat-label">Memory Usage:</span>
                <span className="stat-value">{performanceMetrics.memoryUsage}MB</span>
              </div>
            </div>

            <div className="performance-charts">
              <div className="performance-chart">
                <h5>Sync Performance</h5>
                <div className="chart-container">
                  {/* Placeholder for performance chart */}
                  <div className="chart-placeholder">Performance chart would be displayed here</div>
                </div>
              </div>
            </div>
          </div>
        )}
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
        <div className="offline-settings-status-item">
          <span className="offline-settings-status-label">Queue Length:</span>
          <span className="offline-settings-status-value">
            {queue.totalCount}
          </span>
        </div>
        <div className="offline-settings-status-item">
          <span className="offline-settings-status-label">Sync Status:</span>
          <span className="offline-settings-status-value">
            {sync.status}
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

        {!showResetConfirm ? (
          <button
            className="offline-settings-reset-button"
            onClick={() => setShowResetConfirm(true)}
            disabled={isEditing}
          >
            Reset to Defaults
          </button>
        ) : (
          <div className="reset-confirmation">
            <span>Are you sure you want to reset all settings?</span>
            <button
              className="confirm-reset-button"
              onClick={handleReset}
            >
              Confirm Reset
            </button>
            <button
              className="cancel-reset-button"
              onClick={() => setShowResetConfirm(false)}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};