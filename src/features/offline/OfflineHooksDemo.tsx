import React, { useState, useEffect } from "react";
import { useOffline } from "../../hooks/useOffline";
import { useOfflineSync } from "../../hooks/useOfflineSync";
import { useOfflineSettings } from "../../hooks/useOfflineSettings";
import { OfflineQueueItem } from "../../types/offlineTypes";

/**
 * Demo component showing integration of offline hooks with existing services
 */
export const OfflineHooksDemo: React.FC = () => {
  const {
    status,
    isOffline,
    pendingChanges,
    queue,
    getOfflineState,
    enqueueOperation,
    processOfflineQueue,
    retryFailedItems,
    getQueueStats,
    simulateNetworkChange,
  } = useOffline();

  const {
    syncStatus,
    lastSynced,
    progress,
    error: syncError,
    syncQueue,
    getSyncStatus,
    isSyncNeeded,
  } = useOfflineSync();

  const { settings, getSettings, updateSettings } = useOfflineSettings();

  const [demoOperation, setDemoOperation] = useState<string>("");
  const [demoData, setDemoData] = useState<string>("");
  const [operationType, setOperationType] = useState<
    "create" | "update" | "delete" | "sync"
  >("create");

  // Demo: Simulate network changes
  const toggleNetwork = () => {
    simulateNetworkChange(!isOffline);
  };

  // Demo: Add operation to queue
  const handleAddOperation = async () => {
    if (!demoOperation.trim()) return;

    try {
      const result = await enqueueOperation(demoOperation, operationType, {
        data: demoData,
      });

      if (result.success) {
        alert(`Operation "${demoOperation}" added to queue!`);
        setDemoOperation("");
        setDemoData("");
      } else {
        alert(`Failed to add operation: ${result.error?.message}`);
      }
    } catch (error) {
      alert(
        `Error adding operation: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  // Demo: Process queue
  const handleProcessQueue = async () => {
    try {
      const result = await processOfflineQueue();
      if (result.success) {
        alert(
          `Queue processed successfully! Processed ${result.processedItems?.length || 0} items.`,
        );
      } else {
        alert(`Failed to process queue: ${result.error?.message}`);
      }
    } catch (error) {
      alert(
        `Error processing queue: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  // Demo: Retry failed items
  const handleRetryFailed = async () => {
    try {
      const result = await retryFailedItems();
      if (result.success) {
        alert(`Retried ${result.retriedCount} failed items.`);
      } else {
        alert(`Failed to retry items: ${result.error?.message}`);
      }
    } catch (error) {
      alert(
        `Error retrying items: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  // Demo: Sync queue
  const handleSyncQueue = async () => {
    try {
      await syncQueue();
      alert("Sync initiated!");
    } catch (error) {
      alert(
        `Sync error: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  // Demo: Update settings
  const handleUpdateSettings = async () => {
    try {
      const result = await updateSettings({
        autoSyncEnabled: !settings.autoSyncEnabled,
        syncInterval: settings.syncInterval + 5000,
      });

      if (result.success) {
        alert("Settings updated successfully!");
      } else {
        alert(`Failed to update settings: ${result.error?.message}`);
      }
    } catch (error) {
      alert(
        `Error updating settings: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  return (
    <div className="offline-hooks-demo">
      <h2>Offline Hooks Integration Demo</h2>

      <div className="offline-demo-section">
        <h3>Network Status</h3>
        <div className="offline-status-display">
          <span
            className={`offline-status-badge ${isOffline ? "offline" : "online"}`}
          >
            {isOffline ? "OFFLINE" : "ONLINE"}
          </span>
          <button onClick={toggleNetwork} className="offline-toggle-button">
            Toggle Network ({isOffline ? "Go Online" : "Go Offline"})
          </button>
        </div>
      </div>

      <div className="offline-demo-section">
        <h3>Current State</h3>
        <div className="offline-state-info">
          <p>Status: {status}</p>
          <p>Pending Changes: {pendingChanges}</p>
          <p>Queue Length: {queue.length}</p>
          <p>
            Last Sync:{" "}
            {lastSynced ? new Date(lastSynced).toLocaleString() : "Never"}
          </p>
          <p>Sync Status: {syncStatus}</p>
          <p>Sync Progress: {progress}%</p>
        </div>
      </div>

      <div className="offline-demo-section">
        <h3>Queue Statistics</h3>
        <div className="offline-queue-stats">
          {Object.entries(getQueueStats()).map(([key, value]) => (
            <div key={key} className="offline-stat-item">
              <span className="offline-stat-label">{key}:</span>
              <span className="offline-stat-value">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="offline-demo-section">
        <h3>Add Operation to Queue</h3>
        <div className="offline-operation-form">
          <div className="offline-form-group">
            <label>Operation Name:</label>
            <input
              type="text"
              value={demoOperation}
              onChange={(e) => setDemoOperation(e.target.value)}
              placeholder="e.g., Create Task"
            />
          </div>

          <div className="offline-form-group">
            <label>Operation Type:</label>
            <select
              value={operationType}
              onChange={(e) =>
                setOperationType(
                  e.target.value as "create" | "update" | "delete" | "sync",
                )
              }
            >
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="sync">Sync</option>
            </select>
          </div>

          <div className="offline-form-group">
            <label>Data:</label>
            <input
              type="text"
              value={demoData}
              onChange={(e) => setDemoData(e.target.value)}
              placeholder="JSON data"
            />
          </div>

          <button
            onClick={handleAddOperation}
            disabled={!isOffline && operationType !== "sync"}
            className="offline-add-operation-button"
          >
            Add Operation
          </button>
        </div>
      </div>

      <div className="offline-demo-section">
        <h3>Queue Operations</h3>
        <div className="offline-queue-actions">
          <button
            onClick={handleProcessQueue}
            disabled={isOffline || queue.length === 0}
            className="offline-process-button"
          >
            Process Queue ({queue.length} items)
          </button>

          <button
            onClick={handleRetryFailed}
            disabled={
              queue.filter((item) => item.status === "failed").length === 0
            }
            className="offline-retry-button"
          >
            Retry Failed Items
          </button>

          <button
            onClick={handleSyncQueue}
            disabled={isOffline || (!isSyncNeeded() && queue.length === 0)}
            className="offline-sync-button"
          >
            Sync Now
          </button>
        </div>
      </div>

      <div className="offline-demo-section">
        <h3>Settings Management</h3>
        <div className="offline-settings-info">
          <p>Auto Sync: {settings.autoSyncEnabled ? "Enabled" : "Disabled"}</p>
          <p>Sync Interval: {settings.syncInterval / 1000}s</p>
          <p>Max Queue Size: {settings.maxQueueSize}</p>
          <p>Conflict Resolution: {settings.conflictResolution}</p>

          <button
            onClick={handleUpdateSettings}
            className="offline-update-settings-button"
          >
            Update Settings
          </button>
        </div>
      </div>

      <div className="offline-demo-section">
        <h3>Queue Items</h3>
        {queue.length === 0 ? (
          <p>No items in queue</p>
        ) : (
          <div className="offline-queue-items">
            {queue.map((item) => (
              <div key={item.id} className="offline-queue-item">
                <div className="offline-item-info">
                  <span className="offline-item-operation">
                    {item.operation}
                  </span>
                  <span className="offline-item-type">{item.type}</span>
                  <span className={`offline-item-status ${item.status}`}>
                    {item.status}
                  </span>
                </div>
                <div className="offline-item-data">
                  <pre>{JSON.stringify(item.data, null, 2)}</pre>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
