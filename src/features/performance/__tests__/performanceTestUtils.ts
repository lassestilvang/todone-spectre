import {
  PerformanceMetrics,
  PerformanceStatus,
  PerformanceConfig,
} from "../../../types/performance";

export const generateMockPerformanceMetrics = (
  overrides: Partial<PerformanceMetrics> = {},
): PerformanceMetrics => {
  return {
    loadTime: 1500,
    memoryUsage: 300,
    cpuUsage: 45,
    fps: 58,
    ...overrides,
  };
};

export const generateMockPerformanceStatus = (
  status: PerformanceStatus = "optimal",
): PerformanceStatus => {
  return status;
};

export const generateMockPerformanceConfig = (
  overrides: Partial<PerformanceConfig> = {},
): PerformanceConfig => {
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
    ...overrides,
  };
};

export const createPerformanceServiceMock = () => {
  let metrics: PerformanceMetrics | null = null;
  let status: PerformanceStatus = "inactive";
  let config: PerformanceConfig = generateMockPerformanceConfig();
  let isMonitoring = false;

  return {
    startMonitoring: jest.fn(() => {
      isMonitoring = true;
      status = "monitoring";
    }),
    stopMonitoring: jest.fn(() => {
      isMonitoring = false;
      status = "inactive";
    }),
    getPerformanceMetrics: jest.fn(() => metrics),
    getPerformanceStatus: jest.fn(() => status),
    updatePerformanceConfig: jest.fn(
      (newConfig: Partial<PerformanceConfig>) => {
        config = { ...config, ...newConfig };
      },
    ),
    resetToDefaults: jest.fn(() => {
      config = generateMockPerformanceConfig();
    }),
    setMetrics: (newMetrics: PerformanceMetrics) => {
      metrics = newMetrics;
    },
    setStatus: (newStatus: PerformanceStatus) => {
      status = newStatus;
    },
    getConfig: () => config,
    subscribe: jest.fn((callback: (config: PerformanceConfig) => void) => {
      callback(config);
      return () => {};
    }),
  };
};

export const createPerformanceConfigServiceMock = () => {
  let config: PerformanceConfig = generateMockPerformanceConfig();
  const listeners: Array<(config: PerformanceConfig) => void> = [];

  return {
    getConfig: jest.fn(() => ({ ...config })),
    updateConfig: jest.fn((newConfig: Partial<PerformanceConfig>) => {
      config = { ...config, ...newConfig };
      listeners.forEach((listener) => listener(config));
    }),
    resetConfig: jest.fn(() => {
      config = generateMockPerformanceConfig();
      listeners.forEach((listener) => listener(config));
    }),
    subscribe: jest.fn((listener: (config: PerformanceConfig) => void) => {
      listeners.push(listener);
      listener(config);
      return () => {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      };
    }),
  };
};
