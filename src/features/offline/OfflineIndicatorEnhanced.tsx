import React, { useState, useEffect } from 'react';
import { useOfflineStore } from '../../store/useOfflineStore';
import { OfflineStatus } from '../../types/offlineTypes';

interface OfflineIndicatorEnhancedProps {
  position?: 'top' | 'bottom' | 'inline' | 'floating';
  showDetails?: boolean;
  showAdvancedStats?: boolean;
  showConnectionHistory?: boolean;
  onStatusChange?: (status: OfflineStatus) => void;
  onConnectionQualityChange?: (quality: string) => void;
}

export const OfflineIndicatorEnhanced: React.FC<OfflineIndicatorEnhancedProps> = ({
  position = 'bottom',
  showDetails = true,
  showAdvancedStats = false,
  showConnectionHistory = false,
  onStatusChange,
  onConnectionQualityChange
}) => {
  const {
    status: { isOffline, status, connectionQuality, networkType, offlineSince, onlineSince, connectionHistory },
    pendingChanges,
    lastSync,
    error,
    queue: { totalCount, pendingCount, failedCount },
    sync: { isSyncing, progress }
  } = useOfflineStore();

  const [status, setStatus] = useState<OfflineStatus>('online');
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const newStatus: OfflineStatus = isOffline ? 'offline' : 'online';
    setStatus(newStatus);
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
  }, [isOffline, onStatusChange]);

  useEffect(() => {
    if (onConnectionQualityChange) {
      onConnectionQualityChange(connectionQuality);
    }
  }, [connectionQuality, onConnectionQualityChange]);

  const getStatusText = () => {
    switch (status) {
      case 'offline':
        return 'You are offline. Changes will sync when you reconnect.';
      case 'online':
        return 'You are online. All changes are syncing automatically.';
      default:
        return 'Network status unknown';
    }
  };

  const getStatusClass = () => {
    switch (status) {
      case 'offline':
        return 'offline-indicator-offline';
      case 'online':
        return 'offline-indicator-online';
      default:
        return 'offline-indicator-unknown';
    }
  };

  const getConnectionQualityText = () => {
    switch (connectionQuality) {
      case 'excellent': return 'Excellent connection';
      case 'good': return 'Good connection';
      case 'fair': return 'Fair connection';
      case 'poor': return 'Poor connection';
      default: return 'Unknown connection quality';
    }
  };

  const getConnectionQualityClass = () => {
    switch (connectionQuality) {
      case 'excellent': return 'connection-quality-excellent';
      case 'good': return 'connection-quality-good';
      case 'fair': return 'connection-quality-fair';
      case 'poor': return 'connection-quality-poor';
      default: return 'connection-quality-unknown';
    }
  };

  const positionClasses = {
    top: 'offline-indicator-top',
    bottom: 'offline-indicator-bottom',
    inline: 'offline-indicator-inline',
    floating: 'offline-indicator-floating'
  };

  const formatDuration = (startTime: Date | null) => {
    if (!startTime) return 'N/A';
    const duration = Date.now() - startTime.getTime();
    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  return (
    <div className={`offline-indicator-enhanced ${getStatusClass()} ${positionClasses[position]}`}>
      <div className="offline-indicator-content">
        <div className="offline-indicator-status">
          <span className="offline-indicator-dot" />
          <span className="offline-indicator-text">{getStatusText()}</span>
        </div>

        {showDetails && (
          <div className="offline-indicator-details">
            {pendingChanges > 0 && (
              <span className="offline-indicator-changes">
                {pendingChanges} pending change{pendingChanges !== 1 ? 's' : ''}
              </span>
            )}
            {lastSync && (
              <span className="offline-indicator-sync">
                Last sync: {new Date(lastSync).toLocaleString()}
              </span>
            )}
            {error && (
              <span className="offline-indicator-error">
                Error: {error.message}
              </span>
            )}
          </div>
        )}

        {showAdvancedStats && (
          <div className="offline-indicator-advanced">
            <div className="connection-quality">
              <span className={`connection-quality-dot ${getConnectionQualityClass()}`} />
              <span className="connection-quality-text">{getConnectionQualityText()}</span>
              {networkType !== 'unknown' && (
                <span className="network-type">({networkType})</span>
              )}
            </div>

            <div className="queue-stats">
              <span className="queue-stat">Queue: {totalCount} items</span>
              <span className="queue-stat">Pending: {pendingCount}</span>
              <span className="queue-stat">Failed: {failedCount}</span>
            </div>

            {isSyncing && (
              <div className="sync-progress">
                <div className="sync-progress-bar" style={{ width: `${progress}%` }} />
                <span className="sync-progress-text">{progress}% syncing</span>
              </div>
            )}

            {isOffline && offlineSince && (
              <div className="offline-duration">
                Offline for: {formatDuration(offlineSince)}
              </div>
            )}

            {!isOffline && onlineSince && (
              <div className="online-duration">
                Online for: {formatDuration(onlineSince)}
              </div>
            )}
          </div>
        )}

        {showConnectionHistory && connectionHistory.length > 0 && (
          <div className="connection-history">
            <button
              className="connection-history-toggle"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? 'Hide' : 'Show'} Connection History ({connectionHistory.length})
            </button>

            {showHistory && (
              <div className="connection-history-items">
                {connectionHistory.slice().reverse().map((entry, index) => (
                  <div key={index} className="connection-history-item">
                    <span className="connection-history-time">
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={`connection-history-status ${entry.status}`}>
                      {entry.status}
                    </span>
                    <span className="connection-history-duration">
                      {entry.duration > 0 ? `${entry.duration}s` : 'N/A'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};