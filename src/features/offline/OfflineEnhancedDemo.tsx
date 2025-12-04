import React, { useState } from 'react';
import { OfflineIndicatorEnhanced } from './OfflineIndicatorEnhanced';
import { OfflineQueueEnhanced } from './OfflineQueueEnhanced';
import { OfflineSyncEnhanced } from './OfflineSyncEnhanced';
import { OfflineSettingsEnhanced } from './OfflineSettingsEnhanced';
import { useOfflineStore } from '../../store/useOfflineStore';
import { useOfflineSync } from '../../hooks/useOfflineSync';
import { useOfflineSettings } from '../../hooks/useOfflineSettings';

export const OfflineEnhancedDemo: React.FC = () => {
  const offlineStore = useOfflineStore();
  const { syncAll, retryFailedOperations } = useOfflineSync();
  const { settings, updateSettings } = useOfflineSettings();
  const [demoMode, setDemoMode] = useState<'basic' | 'advanced'>('basic');

  // Demo: Add sample operations to queue
  const addDemoOperations = () => {
    const demoOperations = [
      {
        operation: 'Create Task',
        type: 'create',
        data: { title: 'Demo Task 1', description: 'Created offline' },
        priority: 'high'
      },
      {
        operation: 'Update Task',
        type: 'update',
        data: { id: 'task-123', title: 'Updated Task Title' },
        priority: 'medium'
      },
      {
        operation: 'Delete Project',
        type: 'delete',
        data: { id: 'project-456' },
        priority: 'low'
      },
      {
        operation: 'Sync Calendar',
        type: 'sync',
        data: { calendarId: 'main-calendar' },
        priority: 'critical'
      }
    ];

    demoOperations.forEach(op => {
      offlineStore.addToQueue({
        operation: op.operation,
        type: op.type,
        data: op.data,
        priority: op.priority
      });
    });
  };

  // Demo: Simulate network changes
  const toggleNetworkStatus = () => {
    const newStatus = !offlineStore.status.isOffline;
    offlineStore.simulateNetworkChange(newStatus);
  };

  // Demo: Process queue
  const processDemoQueue = async () => {
    await offlineStore.processQueue();
  };

  // Demo: Clear queue
  const clearDemoQueue = () => {
    offlineStore.clearQueue();
  };

  // Demo: Update settings
  const updateDemoSettings = async () => {
    await updateSettings({
      autoSyncEnabled: !settings.autoSyncEnabled,
      syncInterval: settings.syncInterval === 30000 ? 60000 : 30000
    });
  };

  return (
    <div className="offline-enhanced-demo">
      <h1 className="demo-title">Enhanced Offline Features Demo</h1>

      <div className="demo-controls">
        <div className="control-group">
          <label>Demo Mode:</label>
          <select
            value={demoMode}
            onChange={(e) => setDemoMode(e.target.value as 'basic' | 'advanced')}
          >
            <option value="basic">Basic Features</option>
            <option value="advanced">Advanced Features</option>
          </select>
        </div>

        <div className="control-buttons">
          <button onClick={addDemoOperations} className="demo-button">
            Add Demo Operations
          </button>
          <button onClick={toggleNetworkStatus} className="demo-button">
            Toggle Network ({offlineStore.status.isOffline ? 'Offline' : 'Online'})
          </button>
          <button onClick={processDemoQueue} className="demo-button" disabled={offlineStore.status.isOffline}>
            Process Queue
          </button>
          <button onClick={clearDemoQueue} className="demo-button" disabled={offlineStore.queue.totalCount === 0}>
            Clear Queue
          </button>
          <button onClick={updateDemoSettings} className="demo-button">
            Toggle Auto-Sync
          </button>
        </div>
      </div>

      <div className="demo-content">
        {demoMode === 'basic' ? (
          <>
            <div className="demo-section">
              <h2>Basic Offline Features</h2>
              <div className="demo-components">
                <div className="demo-component">
                  <h3>Offline Indicator</h3>
                  <OfflineIndicatorEnhanced
                    position="inline"
                    showDetails={true}
                    showAdvancedStats={false}
                  />
                </div>

                <div className="demo-component">
                  <h3>Offline Queue</h3>
                  <OfflineQueueEnhanced
                    maxItems={5}
                    showControls={true}
                    showAdvancedFilters={false}
                    showBatchOperations={false}
                  />
                </div>
              </div>
            </div>

            <div className="demo-section">
              <div className="demo-components">
                <div className="demo-component">
                  <h3>Offline Sync</h3>
                  <OfflineSyncEnhanced
                    autoSync={true}
                    showProgress={true}
                    showAdvancedStats={false}
                    showConflictResolution={false}
                  />
                </div>

                <div className="demo-component">
                  <h3>Offline Settings</h3>
                  <OfflineSettingsEnhanced
                    showAdvancedOptions={false}
                    showStorageManagement={false}
                    showPerformanceTuning={false}
                  />
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="demo-section">
              <h2>Advanced Offline Features</h2>
              <div className="demo-components">
                <div className="demo-component">
                  <h3>Enhanced Offline Indicator</h3>
                  <OfflineIndicatorEnhanced
                    position="inline"
                    showDetails={true}
                    showAdvancedStats={true}
                    showConnectionHistory={true}
                  />
                </div>
              </div>
            </div>

            <div className="demo-section">
              <div className="demo-components">
                <div className="demo-component">
                  <h3>Enhanced Offline Queue</h3>
                  <OfflineQueueEnhanced
                    maxItems={10}
                    showControls={true}
                    showAdvancedFilters={true}
                    showBatchOperations={true}
                    showPriorityManagement={true}
                  />
                </div>
              </div>
            </div>

            <div className="demo-section">
              <div className="demo-components">
                <div className="demo-component">
                  <h3>Enhanced Offline Sync</h3>
                  <OfflineSyncEnhanced
                    autoSync={true}
                    showProgress={true}
                    showAdvancedStats={true}
                    showConflictResolution={true}
                    showSyncHistory={true}
                  />
                </div>
              </div>
            </div>

            <div className="demo-section">
              <div className="demo-components">
                <div className="demo-component">
                  <h3>Enhanced Offline Settings</h3>
                  <OfflineSettingsEnhanced
                    showAdvancedOptions={true}
                    showStorageManagement={true}
                    showPerformanceTuning={true}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="demo-summary">
        <h3>Offline Status Summary</h3>
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Network Status:</span>
            <span className={`summary-value ${offlineStore.status.isOffline ? 'offline' : 'online'}`}>
              {offlineStore.status.isOffline ? 'Offline' : 'Online'}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Pending Changes:</span>
            <span className="summary-value">{offlineStore.pendingChanges}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Queue Length:</span>
            <span className="summary-value">{offlineStore.queue.totalCount}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Sync Status:</span>
            <span className="summary-value">{offlineStore.sync.status}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Last Sync:</span>
            <span className="summary-value">
              {offlineStore.lastSync ? new Date(offlineStore.lastSync).toLocaleString() : 'Never'}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Auto-Sync:</span>
            <span className="summary-value">
              {settings.autoSyncEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};