import React from "react";
import { useExtensionState } from "../../../hooks/useExtension";

interface ExtensionStatusIndicatorProps {
  className?: string;
  showLabel?: boolean;
}

export const ExtensionStatusIndicator: React.FC<
  ExtensionStatusIndicatorProps
> = ({ className = "", showLabel = true }) => {
  const extensionState = useExtensionState();

  const getStatusInfo = () => {
    switch (extensionState.status) {
      case "syncing":
        return {
          icon: "↻",
          color: "#2196F3",
          label: "Syncing",
          tooltip: "Extension is syncing data",
        };
      case "error":
        return {
          icon: "⚠",
          color: "#F44336",
          label: "Error",
          tooltip: extensionState.error || "Extension error occurred",
        };
      case "ready":
        return {
          icon: "✓",
          color: "#4CAF50",
          label: "Ready",
          tooltip: "Extension is ready",
        };
      case "idle":
      default:
        return {
          icon: "○",
          color: "#9E9E9E",
          label: "Idle",
          tooltip: "Extension is idle",
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div
      className={`extension-status-indicator ${className}`}
      title={statusInfo.tooltip}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        color: statusInfo.color,
        fontSize: "12px",
      }}
    >
      <span className="status-icon" style={{ fontSize: "14px" }}>
        {statusInfo.icon}
      </span>
      {showLabel && <span className="status-label">{statusInfo.label}</span>}
    </div>
  );
};
