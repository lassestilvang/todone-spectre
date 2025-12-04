export type PerformanceStatus = 'inactive' | 'monitoring' | 'optimal' | 'warning' | 'critical' | 'error';

export interface PerformanceMetrics {
  loadTime: number;
  memoryUsage: number;
  cpuUsage: number;
  fps: number;
  networkLatency?: number;
}

export interface PerformanceConfig {
  enableMonitoring: boolean;
  enableLogging: boolean;
  samplingRate: number;
  memoryThreshold: number;
  enableAdvancedMonitoring: boolean;
  enableMemoryTracking: boolean;
  enableNetworkMonitoring: boolean;
  dataRetentionDays: number;
  alertThreshold: number;
}