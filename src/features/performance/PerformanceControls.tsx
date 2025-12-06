// @ts-nocheck
import React from "react";
import { usePerformance } from "../../../hooks/usePerformance";

export const PerformanceControls: React.FC = () => {
  const { performanceConfig, updatePerformanceConfig, resetToDefaults } =
    usePerformance();

  const handleConfigChange = (key: string, value: any) => {
    updatePerformanceConfig({ [key]: value });
  };

  return (
    <div className="performance-controls">
      <h3>Performance Controls</h3>
      <div className="control-group">
        <label>
          <input
            type="checkbox"
            checked={performanceConfig.enableMonitoring}
            onChange={(e) =>
              handleConfigChange("enableMonitoring", e.target.checked)
            }
          />
          Enable Monitoring
        </label>
      </div>

      <div className="control-group">
        <label>
          <input
            type="checkbox"
            checked={performanceConfig.enableLogging}
            onChange={(e) =>
              handleConfigChange("enableLogging", e.target.checked)
            }
          />
          Enable Logging
        </label>
      </div>

      <div className="control-group">
        <label>
          Sampling Rate:
          <select
            value={performanceConfig.samplingRate}
            onChange={(e) =>
              handleConfigChange("samplingRate", parseInt(e.target.value))
            }
          >
            <option value={1000}>1 second</option>
            <option value={500}>500ms</option>
            <option value={250}>250ms</option>
            <option value={100}>100ms</option>
          </select>
        </label>
      </div>

      <div className="control-group">
        <label>
          Memory Threshold (MB):
          <input
            type="number"
            value={performanceConfig.memoryThreshold}
            onChange={(e) =>
              handleConfigChange("memoryThreshold", parseFloat(e.target.value))
            }
            min="10"
            max="1000"
          />
        </label>
      </div>

      <button onClick={resetToDefaults} className="reset-button">
        Reset to Defaults
      </button>
    </div>
  );
};
