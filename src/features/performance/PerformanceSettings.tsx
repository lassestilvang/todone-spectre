import React from "react";
import { usePerformanceConfig } from "../../../hooks/usePerformanceConfig";

export const PerformanceSettings: React.FC = () => {
  const { config, updateConfig, resetConfig } = usePerformanceConfig();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    updateConfig({
      [name]: type === "checkbox" ? checked : value,
    });
  };

  return (
    <div className="performance-settings">
      <h3>Performance Settings</h3>
      <form className="settings-form">
        <div className="form-group">
          <label htmlFor="enableAdvancedMonitoring">
            <input
              type="checkbox"
              id="enableAdvancedMonitoring"
              name="enableAdvancedMonitoring"
              checked={config.enableAdvancedMonitoring}
              onChange={handleInputChange}
            />
            Enable Advanced Monitoring
          </label>
        </div>

        <div className="form-group">
          <label htmlFor="enableMemoryTracking">
            <input
              type="checkbox"
              id="enableMemoryTracking"
              name="enableMemoryTracking"
              checked={config.enableMemoryTracking}
              onChange={handleInputChange}
            />
            Enable Memory Tracking
          </label>
        </div>

        <div className="form-group">
          <label htmlFor="enableNetworkMonitoring">
            <input
              type="checkbox"
              id="enableNetworkMonitoring"
              name="enableNetworkMonitoring"
              checked={config.enableNetworkMonitoring}
              onChange={handleInputChange}
            />
            Enable Network Monitoring
          </label>
        </div>

        <div className="form-group">
          <label htmlFor="dataRetentionDays">
            Data Retention (days):
            <input
              type="number"
              id="dataRetentionDays"
              name="dataRetentionDays"
              value={config.dataRetentionDays}
              onChange={handleInputChange}
              min="1"
              max="365"
            />
          </label>
        </div>

        <div className="form-group">
          <label htmlFor="alertThreshold">
            Alert Threshold (%):
            <input
              type="number"
              id="alertThreshold"
              name="alertThreshold"
              value={config.alertThreshold}
              onChange={handleInputChange}
              min="1"
              max="100"
            />
          </label>
        </div>

        <div className="form-actions">
          <button type="button" onClick={resetConfig} className="reset-button">
            Reset to Defaults
          </button>
          <button type="submit" className="save-button">
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};
