import React from 'react';
import { usePerformanceContext } from './PerformanceProvider';
import { PerformanceStatus } from './PerformanceStatus';
import { PerformanceControls } from './PerformanceControls';

export const PerformanceContextIntegration: React.FC = () => {
  const {
    metrics,
    status,
    config,
    isMonitoring,
    startMonitoring,
    stopMonitoring
  } = usePerformanceContext();

  return (
    <div className="performance-context-integration">
      <h3>Performance Context Integration</h3>

      <div className="context-metrics">
        {metrics ? (
          <div className="metrics-summary">
            <div>Load Time: {metrics.loadTime.toFixed(2)}ms</div>
            <div>Memory: {metrics.memoryUsage.toFixed(2)}MB</div>
            <div>CPU: {metrics.cpuUsage.toFixed(2)}%</div>
            <div>FPS: {metrics.fps}</div>
          </div>
        ) : (
          <div>No metrics available</div>
        )}
      </div>

      <div className="context-status">
        <PerformanceStatus />
        <div className="status-details">
          Current Status: {status}
          {isMonitoring ? ' (Monitoring)' : ' (Inactive)'}
        </div>
      </div>

      <div className="context-controls">
        <PerformanceControls />
        <div className="monitoring-controls">
          {!isMonitoring ? (
            <button onClick={startMonitoring} className="start-button">
              Start Monitoring
            </button>
          ) : (
            <button onClick={stopMonitoring} className="stop-button">
              Stop Monitoring
            </button>
          )}
        </div>
      </div>

      <div className="context-config">
        <h4>Current Configuration</h4>
        <div>Sampling Rate: {config.samplingRate}ms</div>
        <div>Memory Threshold: {config.memoryThreshold}MB</div>
        <div>Alert Threshold: {config.alertThreshold}%</div>
      </div>
    </div>
  );
};