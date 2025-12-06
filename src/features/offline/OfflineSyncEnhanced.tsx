// @ts-nocheck
import React, { useState, useEffect } from "react";
import { useOfflineStore } from "../../../store/useOfflineStore";
import { useOfflineSync } from "../../../hooks/useOfflineSync";
import { OfflineSyncStatus } from "../../types/offlineTypes";

interface OfflineSyncEnhancedProps {
  autoSync?: boolean;
  syncInterval?: number;
  showProgress?: boolean;
  showAdvancedStats?: boolean;
  showConflictResolution?: boolean;
  showSyncHistory?: boolean;
  onSyncComplete?: (success: boolean) => void;
  onSyncError?: (error: Error) => void;
  onConflictDetected?: (conflict: any) => void;
}

export const OfflineSyncEnhanced: React.FC<OfflineSyncEnhancedProps> = ({
  autoSync = true,
  syncInterval = 30000,
  showProgress = true,
  showAdvancedStats = true,
  showConflictResolution = true,
  showSyncHistory = true,
  onSyncComplete,
  onSyncError,
  onConflictDetected,
}) => {
  const {
    isOffline,
    pendingChanges,
    queue,
    sync: {
      status: syncStatus,
      lastSynced,
      error: syncError,
      progress,
      totalItems,
      processedItems,
      failedItems,
      syncDuration,
      isSyncing,
      isPaused,
      syncStatistics,
    },
    settings: { conflictResolution },
  } = useOfflineStore();

  const {
    syncAll,
    retryFailedOperations,
    pauseSync,
    resumeSync,
    clearSyncQueue,
    getQueueStatistics,
  } = useOfflineSync();

  const [progress, setProgress] = useState<number>(0);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [syncHistory, setSyncHistory] = useState<any[]>([]);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [showConflictDetails, setShowConflictDetails] = useState(false);

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
    await syncAll();
  };

  const handleRetryFailed = async () => {
    await retryFailedOperations();
  };

  const handleClearQueue = async () => {
    await clearSyncQueue();
  };

  const handlePauseSync = () => {
    pauseSync();
  };

  const handleResumeSync = () => {
    resumeSync();
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
      case "paused":
        return "Sync paused";
      case "queued":
        return "Sync queued";
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
      case "paused":
        return "offline-sync-paused";
      case "queued":
        return "offline-sync-queued";
      default:
        return "offline-sync-unknown";
    }
  };

  const getConflictResolutionText = () => {
    switch (conflictResolution) {
      case "local-wins":
        return "Local Changes Win";
      case "remote-wins":
        return "Remote Changes Win";
      case "manual":
        return "Manual Resolution";
      case "timestamp":
        return "Newest Changes Win";
      default:
        return "Unknown";
    }
  };

  const formatDuration = (milliseconds: number | null) => {
    if (!milliseconds) return "N/A";
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  // Simulate conflict detection (for demo purposes)
  const simulateConflictDetection = () => {
    const demoConflicts = [
      {
        id: "conflict-1",
        type: "task",
        taskId: "task-123",
        localVersion: "Updated task title offline",
        remoteVersion: "Updated task title online",
        timestamp: new Date(Date.now() - 3600000),
        resolution: "pending",
      },
      {
        id: "conflict-2",
        type: "project",
        projectId: "project-456",
        localVersion: "Project renamed offline",
        remoteVersion: "Project renamed online",
        timestamp: new Date(Date.now() - 1800000),
        resolution: "pending",
      },
    ];

    setConflicts(demoConflicts);
    if (onConflictDetected) {
      demoConflicts.forEach((conflict) => onConflictDetected(conflict));
    }
  };

  const resolveConflict = (
    conflictId: string,
    resolution: "local" | "remote" | "manual",
  ) => {
    setConflicts((prev) =>
      prev.map((conflict) =>
        conflict.id === conflictId ? { ...conflict, resolution } : conflict,
      ),
    );
  };

  return (
    <div className={`offline-sync-enhanced ${getStatusClass()}`}>
      <h3 className="offline-sync-title">Enhanced Offline Sync</h3>

      <div className="offline-sync-status">
        <span className="offline-sync-status-text">{getStatusText()}</span>
        {lastSynced && (
          <span className="offline-sync-last-synced">
            Last synced: {new Date(lastSynced).toLocaleString()}
          </span>
        )}
      </div>

      {/* Conflict Resolution Section */}
      {showConflictResolution && (
        <div className="conflict-resolution-section">
          <h4>Conflict Resolution Strategy</h4>
          <div className="conflict-strategy">
            <span className="strategy-label">Current Strategy:</span>
            <span className="strategy-value">
              {getConflictResolutionText()}
            </span>

            {conflictResolution === "manual" && (
              <button
                className="detect-conflicts-button"
                onClick={simulateConflictDetection}
                disabled={isSyncing}
              >
                Detect Conflicts
              </button>
            )}
          </div>

          {/* Conflict Details */}
          {conflicts.length > 0 && (
            <div className="conflict-details">
              <button
                className="toggle-conflict-details"
                onClick={() => setShowConflictDetails(!showConflictDetails)}
              >
                {showConflictDetails ? "Hide" : "Show"} Conflict Details (
                {conflicts.length})
              </button>

              {showConflictDetails && (
                <div className="conflict-list">
                  {conflicts.map((conflict) => (
                    <div key={conflict.id} className="conflict-item">
                      <div className="conflict-header">
                        <span className="conflict-type">
                          {conflict.type} conflict
                        </span>
                        <span className="conflict-id">
                          ID: {conflict.taskId || conflict.projectId}
                        </span>
                      </div>

                      <div className="conflict-versions">
                        <div className="version local-version">
                          <h5>Local Version</h5>
                          <p>{conflict.localVersion}</p>
                          <span className="version-timestamp">
                            {conflict.timestamp.toLocaleString()}
                          </span>
                        </div>

                        <div className="version remote-version">
                          <h5>Remote Version</h5>
                          <p>{conflict.remoteVersion}</p>
                          <span className="version-timestamp">
                            {conflict.timestamp.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      <div className="conflict-resolution-controls">
                        {conflict.resolution === "pending" ? (
                          <>
                            <button
                              onClick={() =>
                                resolveConflict(conflict.id, "local")
                              }
                              className="resolve-local"
                            >
                              Keep Local
                            </button>
                            <button
                              onClick={() =>
                                resolveConflict(conflict.id, "remote")
                              }
                              className="resolve-remote"
                            >
                              Keep Remote
                            </button>
                            <button
                              onClick={() =>
                                resolveConflict(conflict.id, "manual")
                              }
                              className="resolve-manual"
                            >
                              Manual Merge
                            </button>
                          </>
                        ) : (
                          <span className="resolution-status">
                            Resolved: {conflict.resolution}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

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

      {/* Advanced Statistics */}
      {showAdvancedStats && (
        <div className="sync-advanced-stats">
          <h4>Sync Statistics</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Pending Changes:</span>
              <span className="stat-value">{pendingChanges}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Queue Length:</span>
              <span className="stat-value">{queue.totalCount}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Items:</span>
              <span className="stat-value">{totalItems}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Processed Items:</span>
              <span className="stat-value">{processedItems}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Failed Items:</span>
              <span className="stat-value">{failedItems}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Sync Duration:</span>
              <span className="stat-value">{formatDuration(syncDuration)}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Success Rate:</span>
              <span className="stat-value">
                {syncStatistics.successRate
                  ? `${Math.round(syncStatistics.successRate * 100)}%`
                  : "N/A"}
              </span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Avg Duration:</span>
              <span className="stat-value">
                {syncStatistics.averageDuration
                  ? `${Math.round(syncStatistics.averageDuration)}ms`
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Sync History */}
      {showSyncHistory && (
        <div className="sync-history-section">
          <h4>Sync History</h4>
          <div className="sync-history-controls">
            <button
              onClick={() => setSyncHistory([])}
              disabled={syncHistory.length === 0}
            >
              Clear History
            </button>
          </div>

          {syncHistory.length === 0 ? (
            <div className="sync-history-empty">No sync history available</div>
          ) : (
            <div className="sync-history-list">
              {syncHistory.map((entry, index) => (
                <div key={index} className="sync-history-item">
                  <div className="sync-history-time">
                    {entry.timestamp.toLocaleString()}
                  </div>
                  <div className="sync-history-status">{entry.status}</div>
                  <div className="sync-history-details">
                    {entry.processedItems} items processed, {entry.failedItems}{" "}
                    failed
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="offline-sync-controls">
        <button
          className="offline-sync-button"
          onClick={handleManualSync}
          disabled={
            syncStatus === "syncing" ||
            (pendingChanges === 0 && queue.totalCount === 0)
          }
        >
          {syncStatus === "syncing" ? "Syncing..." : "Sync Now"}
        </button>

        {failedItems > 0 && (
          <button
            className="offline-sync-retry-failed"
            onClick={handleRetryFailed}
            disabled={syncStatus === "syncing"}
          >
            Retry Failed ({failedItems})
          </button>
        )}

        {isPaused ? (
          <button className="offline-sync-resume" onClick={handleResumeSync}>
            Resume Sync
          </button>
        ) : (
          <button
            className="offline-sync-pause"
            onClick={handlePauseSync}
            disabled={!isSyncing}
          >
            Pause Sync
          </button>
        )}

        <button
          className="offline-sync-clear"
          onClick={handleClearQueue}
          disabled={queue.totalCount === 0}
        >
          Clear Queue
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
