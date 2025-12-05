import React from "react";
import { usePerformance } from "../../../hooks/usePerformance";

export const PerformanceStatus: React.FC = () => {
  const { performanceStatus, performanceMetrics } = usePerformance();

  const getStatusColor = () => {
    if (!performanceStatus) return "gray";

    switch (performanceStatus) {
      case "optimal":
        return "green";
      case "warning":
        return "orange";
      case "critical":
        return "red";
      default:
        return "gray";
    }
  };

  const getStatusMessage = () => {
    if (!performanceStatus) return "Monitoring inactive";

    switch (performanceStatus) {
      case "optimal":
        return "Performance is optimal";
      case "warning":
        return "Performance needs attention";
      case "critical":
        return "Performance is critical";
      default:
        return "Monitoring inactive";
    }
  };

  return (
    <div className="performance-status">
      <div
        className="status-indicator"
        style={{ backgroundColor: getStatusColor() }}
      />
      <div className="status-message">{getStatusMessage()}</div>
      {performanceMetrics && (
        <div className="status-details">
          <span>Load: {performanceMetrics.loadTime.toFixed(2)}ms</span>
          <span>Memory: {performanceMetrics.memoryUsage.toFixed(2)}MB</span>
          <span>CPU: {performanceMetrics.cpuUsage.toFixed(2)}%</span>
        </div>
      )}
    </div>
  );
};
