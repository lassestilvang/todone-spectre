import React, { useState, useEffect } from 'react';
import { useOfflineStore } from '../../store/useOfflineStore';
import { OfflineStatus } from '../../types/offlineTypes';

interface OfflineIndicatorProps {
  position?: 'top' | 'bottom' | 'inline';
  showDetails?: boolean;
  onStatusChange?: (status: OfflineStatus) => void;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({
  position = 'bottom',
  showDetails = false,
  onStatusChange
}) => {
  const { isOffline, pendingChanges, lastSync, error } = useOfflineStore();
  const [status, setStatus] = useState<OfflineStatus>('online');

  useEffect(() => {
    const newStatus: OfflineStatus = isOffline ? 'offline' : 'online';
    setStatus(newStatus);
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
  }, [isOffline, onStatusChange]);

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

  const positionClasses = {
    top: 'offline-indicator-top',
    bottom: 'offline-indicator-bottom',
    inline: 'offline-indicator-inline'
  };

  return (
    <div className={`offline-indicator ${getStatusClass()} ${positionClasses[position]}`}>
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
      </div>
    </div>
  );
};