import { performanceService } from "../../../services/performanceService";
import { performanceConfigService } from "../../../services/performanceConfigService";
import {
  generateMockPerformanceMetrics,
  generateMockPerformanceConfig,
} from "./performanceTestUtils";

describe("Performance Services", () => {
  beforeEach(() => {
    // Reset services before each test
    performanceService.resetToDefaults();
    performanceConfigService.resetConfig();
  });

  describe("PerformanceService", () => {
    it("should start and stop monitoring", () => {
      expect(performanceService.getPerformanceStatus()).toBe("inactive");

      performanceService.startMonitoring();
      expect(performanceService.getPerformanceStatus()).toBe("monitoring");

      performanceService.stopMonitoring();
      expect(performanceService.getPerformanceStatus()).toBe("inactive");
    });

    it("should return performance metrics", () => {
      performanceService.startMonitoring();

      // Wait a bit for metrics to be captured
      setTimeout(() => {
        const metrics = performanceService.getPerformanceMetrics();
        expect(metrics).not.toBeNull();
        if (metrics) {
          expect(metrics).toHaveProperty("loadTime");
          expect(metrics).toHaveProperty("memoryUsage");
          expect(metrics).toHaveProperty("cpuUsage");
          expect(metrics).toHaveProperty("fps");
        }
        performanceService.stopMonitoring();
      }, 1100);
    });

    it("should update and reset configuration", () => {
      const newConfig = {
        samplingRate: 500,
        memoryThreshold: 300,
      };

      performanceService.updatePerformanceConfig(newConfig);
      const config = performanceService.getConfig();
      expect(config.samplingRate).toBe(500);
      expect(config.memoryThreshold).toBe(300);

      performanceService.resetToDefaults();
      const defaultConfig = performanceService.getConfig();
      expect(defaultConfig.samplingRate).toBe(1000);
      expect(defaultConfig.memoryThreshold).toBe(500);
    });
  });

  describe("PerformanceConfigService", () => {
    it("should get and update configuration", () => {
      const initialConfig = performanceConfigService.getConfig();
      expect(initialConfig).toEqual(generateMockPerformanceConfig());

      const newConfig = {
        enableLogging: true,
        dataRetentionDays: 60,
      };

      performanceConfigService.updateConfig(newConfig);
      const updatedConfig = performanceConfigService.getConfig();
      expect(updatedConfig.enableLogging).toBe(true);
      expect(updatedConfig.dataRetentionDays).toBe(60);
    });

    it("should reset to default configuration", () => {
      performanceConfigService.updateConfig({ enableLogging: true });
      performanceConfigService.resetConfig();

      const defaultConfig = performanceConfigService.getConfig();
      expect(defaultConfig).toEqual(generateMockPerformanceConfig());
    });

    it("should notify subscribers of config changes", () => {
      const mockListener = jest.fn();
      const unsubscribe = performanceConfigService.subscribe(mockListener);

      performanceConfigService.updateConfig({ enableLogging: true });
      expect(mockListener).toHaveBeenCalled();

      unsubscribe();
      performanceConfigService.updateConfig({ enableLogging: false });
      expect(mockListener).toHaveBeenCalledTimes(1);
    });
  });
});
