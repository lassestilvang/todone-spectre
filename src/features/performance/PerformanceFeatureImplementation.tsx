import React from "react";
import { PerformanceProvider } from "./PerformanceProvider";
import { PerformanceDashboard } from "./PerformanceDashboard";
import { PerformanceIntegration } from "./PerformanceIntegration";
import { PerformanceContextIntegration } from "./PerformanceContextIntegration";

interface PerformanceFeatureImplementationProps {
  mode?: "dashboard" | "integration" | "context";
  compact?: boolean;
}

export const PerformanceFeatureImplementation: React.FC<
  PerformanceFeatureImplementationProps
> = ({ mode = "dashboard", compact = false }) => {
  const renderContent = () => {
    switch (mode) {
      case "dashboard":
        return <PerformanceDashboard />;
      case "integration":
        return <PerformanceIntegration compact={compact} />;
      case "context":
        return <PerformanceContextIntegration />;
      default:
        return <PerformanceDashboard />;
    }
  };

  return (
    <PerformanceProvider>
      <div className="performance-feature-implementation">
        <h2>Performance Optimization Feature</h2>
        <div className="feature-description">
          <p>
            Comprehensive performance monitoring and optimization system for
            Todone application.
          </p>
          <p>
            Features include real-time metrics, configurable monitoring, and
            performance alerts.
          </p>
        </div>
        <div className="feature-content">{renderContent()}</div>
        <div className="feature-footer">
          <p>
            Performance monitoring helps optimize application responsiveness and
            resource usage.
          </p>
        </div>
      </div>
    </PerformanceProvider>
  );
};
