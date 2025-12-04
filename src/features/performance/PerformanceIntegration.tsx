import React from 'react';
import { PerformanceMonitor } from './PerformanceMonitor';
import { PerformanceControls } from './PerformanceControls';
import { PerformanceStatus } from './PerformanceStatus';
import { usePerformance } from '../../hooks/usePerformance';

interface PerformanceIntegrationProps {
  showControls?: boolean;
  showStatus?: boolean;
  compact?: boolean;
}

export const PerformanceIntegration: React.FC<PerformanceIntegrationProps> = ({
  showControls = true,
  showStatus = true,
  compact = false
}) => {
  const { performanceStatus, isMonitoring } = usePerformance();

  return (
    <div className={`performance-integration ${compact ? 'compact' : ''}`}>
      <PerformanceMonitor />

      {showControls && (
        <div className="integration-controls">
          <PerformanceControls />
        </div>
      )}

      {showStatus && (
        <div className="integration-status">
          <PerformanceStatus />
          {isMonitoring && (
            <div className="monitoring-indicator">
              Monitoring: {performanceStatus}
            </div>
          )}
        </div>
      )}
    </div>
  );
};