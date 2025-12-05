import { PerformanceConfig } from "../types/performance";

export const validatePerformanceConfig = (
  config: Partial<PerformanceConfig>,
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (config.samplingRate !== undefined) {
    if (typeof config.samplingRate !== "number" || config.samplingRate <= 0) {
      errors.push("samplingRate must be a positive number");
    }
  }

  if (config.memoryThreshold !== undefined) {
    if (
      typeof config.memoryThreshold !== "number" ||
      config.memoryThreshold <= 0
    ) {
      errors.push("memoryThreshold must be a positive number");
    }
  }

  if (config.dataRetentionDays !== undefined) {
    if (
      typeof config.dataRetentionDays !== "number" ||
      config.dataRetentionDays < 1 ||
      config.dataRetentionDays > 365
    ) {
      errors.push("dataRetentionDays must be between 1 and 365");
    }
  }

  if (config.alertThreshold !== undefined) {
    if (
      typeof config.alertThreshold !== "number" ||
      config.alertThreshold < 1 ||
      config.alertThreshold > 100
    ) {
      errors.push("alertThreshold must be between 1 and 100");
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

export const mergePerformanceConfigs = (
  baseConfig: PerformanceConfig,
  overrideConfig: Partial<PerformanceConfig>,
): PerformanceConfig => {
  return { ...baseConfig, ...overrideConfig };
};

export const getDefaultPerformanceConfig = (): PerformanceConfig => {
  return {
    enableMonitoring: true,
    enableLogging: false,
    samplingRate: 1000,
    memoryThreshold: 500,
    enableAdvancedMonitoring: false,
    enableMemoryTracking: true,
    enableNetworkMonitoring: false,
    dataRetentionDays: 30,
    alertThreshold: 80,
  };
};

export const serializePerformanceConfig = (
  config: PerformanceConfig,
): string => {
  return JSON.stringify(config, null, 2);
};

export const deserializePerformanceConfig = (
  serialized: string,
): PerformanceConfig | null => {
  try {
    const parsed = JSON.parse(serialized);
    const validation = validatePerformanceConfig(parsed);

    if (!validation.valid) {
      console.error("Invalid performance config:", validation.errors);
      return null;
    }

    return parsed;
  } catch (error) {
    console.error("Error deserializing performance config:", error);
    return null;
  }
};

export const areConfigsEqual = (
  config1: PerformanceConfig,
  config2: PerformanceConfig,
): boolean => {
  return JSON.stringify(config1) === JSON.stringify(config2);
};
