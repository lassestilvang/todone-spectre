import { PerformanceMetrics, PerformanceStatus } from '../types/performance';

interface PerformanceService {
  startMonitoring(): void;
  stopMonitoring(): void;
  getPerformanceMetrics(): PerformanceMetrics | null;
  getPerformanceStatus(): PerformanceStatus;
  updatePerformanceConfig(config: Partial<PerformanceConfig>): void;
  resetToDefaults(): void;
}

interface PerformanceConfig {
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

class PerformanceServiceImpl implements PerformanceService {
  private config: PerformanceConfig;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private metrics: PerformanceMetrics | null = null;
  private status: PerformanceStatus = 'inactive';

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

  startMonitoring(): void {
    if (this.monitoringInterval) {
      console.log('Monitoring already active');
      return;
    }

    this.status = 'monitoring';
    this.monitoringInterval = setInterval(() => {
      this.captureMetrics();
    }, this.config.samplingRate);
  }

  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      this.status = 'inactive';
    }
  }

  private captureMetrics(): void {
    try {
      const metrics: PerformanceMetrics = {
        loadTime: performance.now(),
        memoryUsage: this.getMemoryUsage(),
        cpuUsage: this.getCpuUsage(),
        fps: this.getFPS(),
        networkLatency: this.config.enableNetworkMonitoring ? this.getNetworkLatency() : 0
      };

      this.metrics = metrics;
      this.updateStatus(metrics);

      if (this.config.enableLogging) {
        console.log('Performance metrics captured:', metrics);
      }
    } catch (error) {
      console.error('Error capturing performance metrics:', error);
      this.status = 'error';
    }
  }

  private getMemoryUsage(): number {
    if (!this.config.enableMemoryTracking) return 0;
    if (typeof performance === 'undefined' || !performance.memory) return 0;

    const memory = performance.memory;
    return memory.usedJSHeapSize / (1024 * 1024);
  }

  private getCpuUsage(): number {
    // Simulated CPU usage calculation
    return Math.random() * 100;
  }

  private getFPS(): number {
    // Simulated FPS calculation
    return 60 + Math.random() * 30;
  }

  private getNetworkLatency(): number {
    // Simulated network latency
    return Math.random() * 200;
  }

  private updateStatus(metrics: PerformanceMetrics): void {
    if (metrics.memoryUsage > this.config.memoryThreshold) {
      this.status = 'critical';
    } else if (metrics.cpuUsage > this.config.alertThreshold) {
      this.status = 'warning';
    } else {
      this.status = 'optimal';
    }
  }

  getPerformanceMetrics(): PerformanceMetrics | null {
    return this.metrics;
  }

  getPerformanceStatus(): PerformanceStatus {
    return this.status;
  }

  updatePerformanceConfig(config: Partial<PerformanceConfig>): void {
    this.config = { ...this.config, ...config };

    if (this.monitoringInterval) {
      this.stopMonitoring();
      this.startMonitoring();
    }
  }

  resetToDefaults(): void {
    this.config = this.getDefaultConfig();
  }
}

export const performanceService = new PerformanceServiceImpl();