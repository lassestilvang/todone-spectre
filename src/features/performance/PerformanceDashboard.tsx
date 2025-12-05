import React from "react";
import { PerformanceMonitor } from "./PerformanceMonitor";
import { PerformanceControls } from "./PerformanceControls";
import { PerformanceSettings } from "./PerformanceSettings";
import { PerformanceStatus } from "./PerformanceStatus";

export const PerformanceDashboard: React.FC = () => {
  return (
    <div className="performance-dashboard">
      <h2>Performance Dashboard</h2>

      <div className="dashboard-grid">
        <div className="dashboard-section monitor-section">
          <PerformanceMonitor />
        </div>

        <div className="dashboard-section controls-section">
          <PerformanceControls />
        </div>

        <div className="dashboard-section settings-section">
          <PerformanceSettings />
        </div>

        <div className="dashboard-section status-section">
          <PerformanceStatus />
        </div>
      </div>
    </div>
  );
};
