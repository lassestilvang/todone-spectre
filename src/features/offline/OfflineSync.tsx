// @ts-nocheck
import React, { useState, useEffect } from "react";
import { useOfflineStore } from "../../store/useOfflineStore";
import { useOfflineSync } from "../../hooks/useOfflineSync";

interface OfflineSyncProps {
  autoSync?: boolean;
  syncInterval?: number;
  showProgress?: boolean;
  onSyncComplete?: (success: boolean) => void;
  onSyncError?: (error: Error) => void;
}

export const OfflineSync: React.FC<OfflineSyncProps> = ({
  autoSync = true,
  syncInterval = 30000,
  showProgress = true,
  onSyncComplete,
  onSyncError,
}) => {
  const { isOffline, pendingChanges, queue } = useOfflineStore();
  const {
    syncStatus,
    lastSynced,
    syncQueue,
    error: syncError,
  } = useOfflineSync();
  const [progress, setProgress] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (autoSync && !isOffline && pendingChanges > 0) {
      const interval = setInterval(() => {
        syncQueue();
      }, syncInterval);

      return () => clearInterval(interval);
    }
  }, [autoSync, isOffline, pendingChanges, syncInterval, syncQueue]);

  useEffect(() => {
    if (syncStatus === "syncing") {
      // Simulate progress for demo purposes
      const startTime = Date.now();
      const totalTime = 5000; // 5 seconds for demo

      const progressInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const newProgress = Math.min(
          90,
          Math.floor((elapsed / totalTime) * 100),
        );
        setProgress(newProgress);
        setTimeRemaining(Math.max(0, Math.floor((totalTime - elapsed) / 1000)));
      }, 200);

      return () => clearInterval(progressInterval);
    } else if (syncStatus === "completed") {
      setProgress(100);
      setTimeout(() => setProgress(0), 1000);
    }
  }, [syncStatus]);

  useEffect(() => {
    if (syncError && onSyncError) {
      onSyncError(syncError);
    }
  }, [syncError, onSyncError]);

  useEffect(() => {
    if (syncStatus === "completed" && onSyncComplete) {
      onSyncComplete(true);
    } else if (syncStatus === "error" && onSyncComplete) {
      onSyncComplete(false);
    }
  }, [syncStatus, onSyncComplete]);

  const handleManualSync = async () => {
    await syncQueue();
  };

  const getStatusText = () => {
    switch (syncStatus) {
      case "idle":
        return "Ready to sync";
      case "syncing":
        return "Syncing...";
      case "completed":
        return "Sync completed";
      case "error":
        return "Sync failed";
      default:
        return "Unknown status";
    }
  };

  const getStatusClass = () => {
    switch (syncStatus) {
      case "idle":
        return "offline-sync-idle";
      case "syncing":
        return "offline-sync-syncing";
      case "completed":
        return "offline-sync-completed";
      case "error":
        return "offline-sync-error";
      default:
        return "offline-sync-unknown";
    }
  };

  return (
    <div className={`offline-sync ${getStatusClass()}`}>
      <h3 className="offline-sync-title">Offline Sync</h3>

      <div className="offline-sync-status">
        <span className="offline-sync-status-text">{getStatusText()}</span>
        {lastSynced && (
          <span className="offline-sync-last-synced">
            Last synced: {new Date(lastSynced).toLocaleString()}
          </span>
        )}
      </div>

      {showProgress && syncStatus === "syncing" && (
        <div className="offline-sync-progress">
          <div
            className="offline-sync-progress-bar"
            style={{ width: `${progress}%` }}
          />
          <span className="offline-sync-progress-text">
            {progress}%{" "}
            {timeRemaining !== null && `(${timeRemaining}s remaining)`}
          </span>
        </div>
      )}

      {syncError && (
        <div className="offline-sync-error">Error: {syncError.message}</div>
      )}

      <div className="offline-sync-stats">
        <div className="offline-sync-stat">
          <span className="offline-sync-stat-label">Pending Changes:</span>
          <span className="offline-sync-stat-value">{pendingChanges}</span>
        </div>
        <div className="offline-sync-stat">
          <span className="offline-sync-stat-label">Queue Length:</span>
          <span className="offline-sync-stat-value">{queue.length}</span>
        </div>
        <div className="offline-sync-stat">
          <span className="offline-sync-stat-label">Status:</span>
          <span className="offline-sync-stat-value">{getStatusText()}</span>
        </div>
      </div>

      <div className="offline-sync-controls">
        <button
          className="offline-sync-button"
          onClick={handleManualSync}
          disabled={
            syncStatus === "syncing" ||
            (pendingChanges === 0 && queue.length === 0)
          }
        >
          {syncStatus === "syncing" ? "Syncing..." : "Sync Now"}
        </button>

        {autoSync && (
          <span className="offline-sync-auto">
            Auto-sync enabled (every {syncInterval / 1000}s)
          </span>
        )}
      </div>
    </div>
  );
};
