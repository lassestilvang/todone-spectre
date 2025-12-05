/**
 * Custom hook for recurring pattern management
 * Provides comprehensive pattern configuration, validation, and generation capabilities
 */
import { useState, useCallback } from "react";
import {
  RecurringPattern,
  TaskRepeatFrequency,
  TaskRepeatEnd,
} from "../types/enums";
import { RecurringPatternConfig, RecurringInstance } from "../types/task";
import { recurringPatternService } from "../services/recurringPatternService";

/**
 * Recurring pattern hook return type
 */
export interface UseRecurringPatternsReturn {
  // State
  patterns: RecurringPatternConfig[];
  presets: Array<{ id: string; name: string; config: RecurringPatternConfig }>;
  isLoading: boolean;
  error: string | null;

  // Pattern management
  createPattern: (config: RecurringPatternConfig) => RecurringPatternConfig;
  updatePattern: (
    index: number,
    updates: Partial<RecurringPatternConfig>,
  ) => RecurringPatternConfig;
  deletePattern: (index: number) => void;
  resetPatterns: () => void;

  // Pattern generation
  generateRecurringDates: (
    startDate: Date,
    config: RecurringPatternConfig,
    maxInstances?: number,
  ) => RecurringInstance[];
  getPatternPresets: () => Array<{
    id: string;
    name: string;
    config: RecurringPatternConfig;
  }>;
  getDefaultPatternConfig: (
    pattern: RecurringPattern,
  ) => RecurringPatternConfig;

  // Pattern formatting and display
  formatRecurringPattern: (config: RecurringPatternConfig) => string;
  getEndConditionDescription: (config: RecurringPatternConfig) => string;

  // Validation
  validatePatternConfig: (config: RecurringPatternConfig) => {
    valid: boolean;
    errors: string[];
  };

  // Utility functions
  parsePatternConfigFromTask: (
    taskCustomFields: Record<string, any>,
  ) => RecurringPatternConfig;
  convertConfigToCustomFields: (
    config: RecurringPatternConfig,
  ) => Record<string, any>;

  // Pattern configuration helpers
  setPatternType: (
    config: RecurringPatternConfig,
    pattern: RecurringPattern,
  ) => RecurringPatternConfig;
  setFrequency: (
    config: RecurringPatternConfig,
    frequency: TaskRepeatFrequency,
  ) => RecurringPatternConfig;
  setEndCondition: (
    config: RecurringPatternConfig,
    endCondition: TaskRepeatEnd,
  ) => RecurringPatternConfig;
  setInterval: (
    config: RecurringPatternConfig,
    interval: number,
  ) => RecurringPatternConfig;
  setEndDate: (
    config: RecurringPatternConfig,
    endDate: Date | null,
  ) => RecurringPatternConfig;
  setMaxOccurrences: (
    config: RecurringPatternConfig,
    maxOccurrences: number | null,
  ) => RecurringPatternConfig;
}

/**
 * Custom hook for recurring pattern management
 */
export const useRecurringPatterns = (): UseRecurringPatternsReturn => {
  const [patterns, setPatterns] = useState<RecurringPatternConfig[]>([]);
  const [presets, setPresets] = useState<
    Array<{ id: string; name: string; config: RecurringPatternConfig }>
  >([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Initialize presets on mount
   */
  const initializePresets = useCallback(() => {
    try {
      setIsLoading(true);
      const patternPresets = recurringPatternService.getPatternPresets();
      setPresets(patternPresets);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to initialize pattern presets",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create a new pattern configuration
   */
  const createPattern = useCallback(
    (config: RecurringPatternConfig): RecurringPatternConfig => {
      try {
        // Validate the configuration
        const validation = validatePatternConfig(config);
        if (!validation.valid) {
          throw new Error(
            `Invalid pattern configuration: ${validation.errors.join(", ")}`,
          );
        }

        const newPattern = { ...config };
        setPatterns((prev) => [...prev, newPattern]);
        return newPattern;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create pattern",
        );
        throw err;
      }
    },
    [],
  );

  /**
   * Update an existing pattern configuration
   */
  const updatePattern = useCallback(
    (
      index: number,
      updates: Partial<RecurringPatternConfig>,
    ): RecurringPatternConfig => {
      try {
        if (index < 0 || index >= patterns.length) {
          throw new Error("Invalid pattern index");
        }

        const updatedPattern = { ...patterns[index], ...updates };

        // Validate the updated configuration
        const validation = validatePatternConfig(updatedPattern);
        if (!validation.valid) {
          throw new Error(
            `Invalid pattern configuration: ${validation.errors.join(", ")}`,
          );
        }

        setPatterns((prev) =>
          prev.map((pattern, i) => (i === index ? updatedPattern : pattern)),
        );
        return updatedPattern;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update pattern",
        );
        throw err;
      }
    },
    [patterns],
  );

  /**
   * Delete a pattern configuration
   */
  const deletePattern = useCallback(
    (index: number): void => {
      try {
        if (index < 0 || index >= patterns.length) {
          throw new Error("Invalid pattern index");
        }

        setPatterns((prev) => prev.filter((_, i) => i !== index));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete pattern",
        );
        throw err;
      }
    },
    [patterns],
  );

  /**
   * Reset all patterns
   */
  const resetPatterns = useCallback((): void => {
    setPatterns([]);
    setError(null);
  }, []);

  /**
   * Generate recurring dates based on pattern configuration
   */
  const generateRecurringDates = useCallback(
    (
      startDate: Date,
      config: RecurringPatternConfig,
      maxInstances: number = 20,
    ): RecurringInstance[] => {
      try {
        // Validate the configuration
        const validation = validatePatternConfig(config);
        if (!validation.valid) {
          throw new Error(
            `Invalid pattern configuration: ${validation.errors.join(", ")}`,
          );
        }

        return recurringPatternService.generateRecurringDates(
          startDate,
          config,
          maxInstances,
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to generate recurring dates",
        );
        return [];
      }
    },
    [],
  );

  /**
   * Get all available pattern presets
   */
  const getPatternPresets = useCallback((): Array<{
    id: string;
    name: string;
    config: RecurringPatternConfig;
  }> => {
    try {
      return recurringPatternService.getPatternPresets();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to get pattern presets",
      );
      return [];
    }
  }, []);

  /**
   * Get default pattern configuration for a given pattern type
   */
  const getDefaultPatternConfig = useCallback(
    (pattern: RecurringPattern): RecurringPatternConfig => {
      try {
        return recurringPatternService.getDefaultPatternConfig(pattern);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to get default pattern config",
        );
        return {
          pattern: "weekly",
          frequency: "weekly",
          endCondition: "never",
          interval: 1,
        };
      }
    },
    [],
  );

  /**
   * Format recurring pattern for display
   */
  const formatRecurringPattern = useCallback(
    (config: RecurringPatternConfig): string => {
      try {
        return recurringPatternService.formatRecurringPattern(config);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to format pattern",
        );
        return "Unknown pattern";
      }
    },
    [],
  );

  /**
   * Get end condition description
   */
  const getEndConditionDescription = useCallback(
    (config: RecurringPatternConfig): string => {
      try {
        return recurringPatternService.getEndConditionDescription(config);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to get end condition",
        );
        return "Unknown end condition";
      }
    },
    [],
  );

  /**
   * Validate pattern configuration
   */
  const validatePatternConfig = useCallback(
    (config: RecurringPatternConfig): { valid: boolean; errors: string[] } => {
      try {
        return recurringPatternService.validatePatternConfig(config);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to validate pattern config",
        );
        return {
          valid: false,
          errors: ["Validation failed"],
        };
      }
    },
    [],
  );

  /**
   * Parse pattern configuration from task custom fields
   */
  const parsePatternConfigFromTask = useCallback(
    (taskCustomFields: Record<string, any>): RecurringPatternConfig => {
      try {
        return recurringPatternService.parsePatternConfigFromTask(
          taskCustomFields,
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to parse pattern config",
        );
        return {
          pattern: "weekly",
          frequency: "weekly",
          endCondition: "never",
          interval: 1,
        };
      }
    },
    [],
  );

  /**
   * Convert pattern config to task custom fields format
   */
  const convertConfigToCustomFields = useCallback(
    (config: RecurringPatternConfig): Record<string, any> => {
      try {
        return recurringPatternService.convertConfigToCustomFields(config);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to convert config to custom fields",
        );
        return {};
      }
    },
    [],
  );

  /**
   * Set pattern type
   */
  const setPatternType = useCallback(
    (
      config: RecurringPatternConfig,
      pattern: RecurringPattern,
    ): RecurringPatternConfig => {
      return {
        ...config,
        pattern,
        frequency:
          pattern === "custom" ? config.frequency || "weekly" : pattern,
      };
    },
    [],
  );

  /**
   * Set frequency
   */
  const setFrequency = useCallback(
    (
      config: RecurringPatternConfig,
      frequency: TaskRepeatFrequency,
    ): RecurringPatternConfig => {
      return {
        ...config,
        frequency,
        pattern: config.pattern === "custom" ? config.pattern : frequency,
      };
    },
    [],
  );

  /**
   * Set end condition
   */
  const setEndCondition = useCallback(
    (
      config: RecurringPatternConfig,
      endCondition: TaskRepeatEnd,
    ): RecurringPatternConfig => {
      return {
        ...config,
        endCondition,
      };
    },
    [],
  );

  /**
   * Set interval
   */
  const setInterval = useCallback(
    (
      config: RecurringPatternConfig,
      interval: number,
    ): RecurringPatternConfig => {
      if (interval < 1) {
        throw new Error("Interval must be at least 1");
      }
      return {
        ...config,
        interval,
      };
    },
    [],
  );

  /**
   * Set end date
   */
  const setEndDate = useCallback(
    (
      config: RecurringPatternConfig,
      endDate: Date | null,
    ): RecurringPatternConfig => {
      return {
        ...config,
        endDate,
      };
    },
    [],
  );

  /**
   * Set max occurrences
   */
  const setMaxOccurrences = useCallback(
    (
      config: RecurringPatternConfig,
      maxOccurrences: number | null,
    ): RecurringPatternConfig => {
      if (maxOccurrences !== null && maxOccurrences < 1) {
        throw new Error("Max occurrences must be at least 1");
      }
      return {
        ...config,
        maxOccurrences,
      };
    },
    [],
  );

  // Initialize presets on mount
  useCallback(() => {
    initializePresets();
  }, [initializePresets]);

  return {
    // State
    patterns,
    presets,
    isLoading,
    error,

    // Pattern management
    createPattern,
    updatePattern,
    deletePattern,
    resetPatterns,

    // Pattern generation
    generateRecurringDates,
    getPatternPresets,
    getDefaultPatternConfig,

    // Pattern formatting and display
    formatRecurringPattern,
    getEndConditionDescription,

    // Validation
    validatePatternConfig,

    // Utility functions
    parsePatternConfigFromTask,
    convertConfigToCustomFields,

    // Pattern configuration helpers
    setPatternType,
    setFrequency,
    setEndCondition,
    setInterval,
    setEndDate,
    setMaxOccurrences,
  };
};
