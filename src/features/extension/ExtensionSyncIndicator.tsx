// @ts-nocheck
import React, { useEffect, useState } from "react";
import { useExtensionState } from "../../../hooks/useExtension";

interface ExtensionSyncIndicatorProps {
  className?: string;
  showLastSync?: boolean;
}

export const ExtensionSyncIndicator: React.FC<ExtensionSyncIndicatorProps> = ({
  className = "",
  showLastSync = true,
}) => {
  const extensionState = useExtensionState();
  const [syncProgress, setSyncProgress] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (extensionState.status === "syncing") {
      setIsAnimating(true);
      setSyncProgress(0);

      // Simulate sync progress
      const progressInterval = setInterval(() => {
        setSyncProgress((prev) => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);

      return () => clearInterval(progressInterval);
    } else {
      setIsAnimating(false);
      if (extensionState.status === "ready" && extensionState.lastSync) {
        setSyncProgress(100);
      }
    }
  }, [extensionState.status, extensionState.lastSync]);

  const getSyncStatus = () => {
    if (extensionState.status === "syncing") {
      return {
        icon: isAnimating ? "🔄" : "↻",
        color: "#2196F3",
        label: "Syncing...",
        progress: syncProgress,
      };
    }

    if (extensionState.lastSync) {
      return {
        icon: "✓",
        color: "#4CAF50",
        label: `Synced ${Math.round(syncProgress)}%`,
        progress: 100,
      };
    }

    return {
      icon: "⚠",
      color: "#9E9E9E",
      label: "Not synced",
      progress: 0,
    };
  };

  const syncStatus = getSyncStatus();

  return (
    <div className={`extension-sync-indicator ${className}`}>
      <div
        className="sync-status"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: showLastSync ? "8px" : "0",
        }}
      >
        <span
          className="sync-icon"
          style={{
            fontSize: "16px",
            color: syncStatus.color,
            display: "inline-block",
            animation: isAnimating ? "spin 1s linear infinite" : "none",
          }}
        >
          {syncStatus.icon}
        </span>
        <span className="sync-label" style={{ fontSize: "14px" }}>
          {syncStatus.label}
        </span>
      </div>

      {showLastSync && extensionState.lastSync && (
        <div
          className="last-sync-time"
          style={{
            fontSize: "12px",
            color: "#666",
            marginTop: "4px",
          }}
        >
          Last sync: {new Date(extensionState.lastSync).toLocaleTimeString()}
        </div>
      )}

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};
