import React, { useState, useEffect } from "react";
import { useExtension } from "../../../hooks/useExtension";
import { useExtensionConfig } from "../../../hooks/useExtensionConfig";

interface ExtensionOptionsProps {
  onSave?: () => void;
  onCancel?: () => void;
}

export const ExtensionOptions: React.FC<ExtensionOptionsProps> = ({
  onSave,
  onCancel,
}) => {
  const { extensionState, dispatch } = useExtension();
  const { config, updateConfig } = useExtensionConfig();
  const [formConfig, setFormConfig] = useState({ ...config });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
    "idle",
  );

  useEffect(() => {
    // Load saved configuration
    const loadConfig = async () => {
      try {
        const savedConfig = await chrome.storage.sync.get("extensionConfig");
        if (savedConfig.extensionConfig) {
          setFormConfig(savedConfig.extensionConfig);
        }
      } catch (error) {
        console.error("Failed to load configuration:", error);
        dispatch({ type: "ERROR", payload: error.message });
      }
    };

    loadConfig();
  }, [dispatch]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type, checked } = e.target;
    setFormConfig((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus("idle");

    try {
      // Validate configuration
      if (!validateConfig(formConfig)) {
        setSaveStatus("error");
        return;
      }

      // Save configuration
      await updateConfig(formConfig);
      await chrome.storage.sync.set({ extensionConfig: formConfig });

      // Update state
      dispatch({ type: "CONFIG_UPDATED", payload: formConfig });

      setSaveStatus("success");
      onSave?.();

      // Auto-close after successful save
      setTimeout(() => {
        window.close();
      }, 1000);
    } catch (error) {
      console.error("Failed to save configuration:", error);
      dispatch({ type: "ERROR", payload: error.message });
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  const validateConfig = (config: typeof formConfig) => {
    // Basic validation
    if (typeof config.syncInterval !== "number" || config.syncInterval <= 0) {
      return false;
    }
    return true;
  };

  const handleReset = async () => {
    try {
      // Reset to default configuration
      const defaultConfig = {
        pageIntegrationEnabled: true,
        autoSyncEnabled: true,
        syncInterval: 300000, // 5 minutes
        showNotifications: true,
        theme: "system",
      };

      await updateConfig(defaultConfig);
      await chrome.storage.sync.set({ extensionConfig: defaultConfig });
      setFormConfig(defaultConfig);

      dispatch({ type: "CONFIG_RESET" });
    } catch (error) {
      console.error("Failed to reset configuration:", error);
      dispatch({ type: "ERROR", payload: error.message });
    }
  };

  const handleExportConfig = async () => {
    try {
      const configData = JSON.stringify(formConfig, null, 2);
      const blob = new Blob([configData], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "todone-extension-config.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export configuration:", error);
      dispatch({ type: "ERROR", payload: error.message });
    }
  };

  const handleImportConfig = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const content = await file.text();
      const importedConfig = JSON.parse(content);

      // Validate imported config
      if (validateConfig(importedConfig)) {
        setFormConfig((prev) => ({ ...prev, ...importedConfig }));
      } else {
        dispatch({ type: "ERROR", payload: "Invalid configuration file" });
      }
    } catch (error) {
      console.error("Failed to import configuration:", error);
      dispatch({ type: "ERROR", payload: error.message });
    }
  };

  return (
    <div className="extension-options">
      <header className="options-header">
        <h1>Todone Extension Options</h1>
        <p className="options-subtitle">Configure your extension settings</p>
      </header>

      <form onSubmit={handleSubmit} className="options-form">
        <div className="form-section">
          <h2>General Settings</h2>

          <div className="form-group">
            <label htmlFor="theme">Theme</label>
            <select
              id="theme"
              name="theme"
              value={formConfig.theme}
              onChange={handleInputChange}
              className="form-control"
            >
              <option value="system">System Default</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="showNotifications">Show Notifications</label>
            <input
              type="checkbox"
              id="showNotifications"
              name="showNotifications"
              checked={formConfig.showNotifications}
              onChange={handleInputChange}
              className="form-checkbox"
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Integration Settings</h2>

          <div className="form-group">
            <label htmlFor="pageIntegrationEnabled">
              Enable Page Integration
            </label>
            <input
              type="checkbox"
              id="pageIntegrationEnabled"
              name="pageIntegrationEnabled"
              checked={formConfig.pageIntegrationEnabled}
              onChange={handleInputChange}
              className="form-checkbox"
            />
            <p className="form-description">
              Enable Todone integration elements on supported websites
            </p>
          </div>
        </div>

        <div className="form-section">
          <h2>Sync Settings</h2>

          <div className="form-group">
            <label htmlFor="autoSyncEnabled">Auto Sync</label>
            <input
              type="checkbox"
              id="autoSyncEnabled"
              name="autoSyncEnabled"
              checked={formConfig.autoSyncEnabled}
              onChange={handleInputChange}
              className="form-checkbox"
            />
          </div>

          <div className="form-group">
            <label htmlFor="syncInterval">Sync Interval (minutes)</label>
            <input
              type="number"
              id="syncInterval"
              name="syncInterval"
              value={formConfig.syncInterval / 60000} // Convert ms to minutes
              onChange={(e) => {
                const minutes = parseInt(e.target.value) || 5;
                setFormConfig((prev) => ({
                  ...prev,
                  syncInterval: minutes * 60000, // Convert back to ms
                }));
              }}
              min="1"
              max="60"
              className="form-control"
            />
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={handleReset}
            className="button-secondary"
            disabled={isSaving}
          >
            Reset to Defaults
          </button>

          <div className="import-export-group">
            <label className="import-label">
              <input
                type="file"
                accept=".json"
                onChange={handleImportConfig}
                style={{ display: "none" }}
              />
              Import Config
            </label>
            <button
              type="button"
              onClick={handleExportConfig}
              className="button-secondary"
              disabled={isSaving}
            >
              Export Config
            </button>
          </div>

          <div className="save-actions">
            <button
              type="button"
              onClick={onCancel}
              className="button-cancel"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button-primary"
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>

        {saveStatus === "success" && (
          <div className="save-success">
            <span className="success-icon">✓</span> Settings saved successfully!
          </div>
        )}

        {saveStatus === "error" && (
          <div className="save-error">
            <span className="error-icon">⚠</span> Failed to save settings
          </div>
        )}
      </form>
    </div>
  );
};
