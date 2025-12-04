import { PerformanceConfig } from '../types/performance';

class PerformanceConfigService {
  private config: PerformanceConfig;
  private listeners: Array<(config: PerformanceConfig) => void> = [];

  constructor() {
    this.config = this.getDefaultConfig();
  }

  private getDefaultConfig(): PerformanceConfig {
    return {
      enableMonitoring: true,
      enableLogging: false,
      samplingRate: 1000,
      memoryThreshold: 500,
      enableAdvancedMonitoring: false,
      enableMemoryTracking: true,
      enableNetworkMonitoring: false,
      dataRetentionDays: 30,
      alertThreshold: 80
    };
  }

  getConfig(): PerformanceConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.notifyListeners();
  }

  resetConfig(): void {
    this.config = this.getDefaultConfig();
    this.notifyListeners();
  }

  subscribe(listener: (config: PerformanceConfig) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.config));
  }
}

export const performanceConfigService = new PerformanceConfigService();