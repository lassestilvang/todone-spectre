import { useState, useEffect, useCallback } from "react";
import { useOfflineStore } from "../store/useOfflineStore";
import { OfflineSettings } from "../types/offlineTypes";

export const useOfflineSettings = () => {
  const { settings, updateSettings } = useOfflineStore();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Get current settings
   */
  const getSettings = useCallback((): OfflineSettings => {
    return settings;
  }, [settings]);

  /**
   * Update settings
   */
  const updateSettingsWrapper = useCallback(
    async (newSettings: Partial<OfflineSettings>) => {
      try {
        setIsLoading(true);
        setError(null);

        // Validate settings
        const validatedSettings = validateSettings(newSettings);

        updateSettings(validatedSettings);

        return {
          success: true,
          settings: validatedSettings,
        };
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Failed to update settings"),
        );
        return {
          success: false,
          error:
            err instanceof Error ? err : new Error("Failed to update settings"),
        };
      } finally {
        setIsLoading(false);
      }
    },
    [updateSettings],
  );

  /**
   * Reset to default settings
   */
  const resetToDefaults = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const defaultSettings: OfflineSettings = {
        autoSyncEnabled: true,
        syncInterval: 30000,
        maxQueueSize: 100,
        conflictResolution: "timestamp",
        offlineDataRetention: 30,
        showOfflineIndicator: true,
        syncOnReconnect: true,
        maxRetryAttempts: 3,
        retryDelay: 5000,
        batchSize: 10,
        enableCompression: false,
        enableEncryption: false,
        syncPriority: "medium",
        autoRetryFailedItems: true,
        retryStrategy: "exponential",
      };

      updateSettings(defaultSettings);

      return {
        success: true,
        settings: defaultSettings,
      };
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to reset settings"),
      );
      return {
        success: false,
        error:
          err instanceof Error ? err : new Error("Failed to reset settings"),
      };
    } finally {
      setIsLoading(false);
    }
  }, [updateSettings]);

  /**
   * Validate settings
   */
  const validateSettings = useCallback(
    (newSettings: Partial<OfflineSettings>): Partial<OfflineSettings> => {
      const validated: Partial<OfflineSettings> = {};

      if (newSettings.syncInterval !== undefined) {
        validated.syncInterval = Math.max(
          10000,
          Math.min(300000, newSettings.syncInterval),
        );
      }

      if (newSettings.maxQueueSize !== undefined) {
        validated.maxQueueSize = Math.max(
          10,
          Math.min(1000, newSettings.maxQueueSize),
        );
      }

      if (newSettings.offlineDataRetention !== undefined) {
        validated.offlineDataRetention = Math.max(
          1,
          Math.min(365, newSettings.offlineDataRetention),
        );
      }

      if (newSettings.conflictResolution !== undefined) {
        const validResolutions: OfflineSettings["conflictResolution"][] = [
          "local-wins",
          "remote-wins",
          "manual",
          "timestamp",
        ];
        if (validResolutions.includes(newSettings.conflictResolution)) {
          validated.conflictResolution = newSettings.conflictResolution;
        }
      }

      // Copy other settings directly if they exist
      if (newSettings.autoSyncEnabled !== undefined) {
        validated.autoSyncEnabled = newSettings.autoSyncEnabled;
      }

      if (newSettings.showOfflineIndicator !== undefined) {
        validated.showOfflineIndicator = newSettings.showOfflineIndicator;
      }

      if (newSettings.syncOnReconnect !== undefined) {
        validated.syncOnReconnect = newSettings.syncOnReconnect;
      }

      return validated;
    },
    [],
  );

  return {
    settings,
    isLoading,
    error,
    getSettings,
    updateSettings: updateSettingsWrapper,
    resetToDefaults,
    validateSettings,
  };
};
