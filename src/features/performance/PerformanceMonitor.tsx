import React from 'react';
import { usePerformance } from '../../../hooks/usePerformance';
import { PerformanceStatus } from './PerformanceStatus';

export const PerformanceMonitor: React.FC = () => {
  const { performanceMetrics, isMonitoring, startMonitoring, stopMonitoring } = usePerformance();

  return (
    <div className="performance-monitor">
      <h3>Performance Monitor</h3>
      <PerformanceStatus />
      <div className="metrics-display">
        {performanceMetrics ? (
          <div className="metrics-grid">
            <div className="metric">
              <span className="metric-label">Load Time:</span>
              <span className="metric-value">{performanceMetrics.loadTime.toFixed(2)}ms</span>
            </div>
            <div className="metric">
              <span className="metric-label">Memory Usage:</span>
              <span className="metric-value">{performanceMetrics.memoryUsage.toFixed(2)}MB</span>
            </div>
            <div className="metric">
              <span className="metric-label">CPU Usage:</span>
              <span className="metric-value">{performanceMetrics.cpuUsage.toFixed(2)}%</span>
            </div>
            <div className="metric">
              <span className="metric-label">FPS:</span>
              <span className="metric-value">{performanceMetrics.fps}</span>
            </div>
          </div>
        ) : (
          <p>No performance data available</p>
        )}
      </div>
      <div className="monitor-controls">
        {isMonitoring ? (
          <button onClick={stopMonitoring} className="stop-button">
            Stop Monitoring
          </button>
        ) : (
          <button onClick={startMonitoring} className="start-button">
            Start Monitoring
          </button>
        )}
      </div>
    </div>
  );
};