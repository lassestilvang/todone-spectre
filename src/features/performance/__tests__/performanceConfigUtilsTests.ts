import {
  validatePerformanceConfig,
  mergePerformanceConfigs,
  getDefaultPerformanceConfig,
  serializePerformanceConfig,
  deserializePerformanceConfig,
  areConfigsEqual,
} from "../../../utils/performanceConfigUtils";
import { generateMockPerformanceConfig } from "./performanceTestUtils";

describe("Performance Config Utilities", () => {
  describe("validatePerformanceConfig", () => {
    it("should validate valid config", () => {
      const config = generateMockPerformanceConfig();
      const result = validatePerformanceConfig(config);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should detect invalid sampling rate", () => {
      const config = { samplingRate: -100 };
      const result = validatePerformanceConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain("samplingRate must be a positive number");
    });

    it("should detect invalid memory threshold", () => {
      const config = { memoryThreshold: -50 };
      const result = validatePerformanceConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "memoryThreshold must be a positive number",
      );
    });

    it("should detect invalid data retention days", () => {
      const config = { dataRetentionDays: 400 };
      const result = validatePerformanceConfig(config);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "dataRetentionDays must be between 1 and 365",
      );
    });
  });

  describe("mergePerformanceConfigs", () => {
    it("should merge configs correctly", () => {
      const baseConfig = generateMockPerformanceConfig();
      const overrideConfig = { samplingRate: 500, enableLogging: true };

      const merged = mergePerformanceConfigs(baseConfig, overrideConfig);

      expect(merged.samplingRate).toBe(500);
      expect(merged.enableLogging).toBe(true);
      expect(merged.memoryThreshold).toBe(baseConfig.memoryThreshold);
    });
  });

  describe("getDefaultPerformanceConfig", () => {
    it("should return default config", () => {
      const defaultConfig = getDefaultPerformanceConfig();
      expect(defaultConfig.enableMonitoring).toBe(true);
      expect(defaultConfig.samplingRate).toBe(1000);
      expect(defaultConfig.memoryThreshold).toBe(500);
    });
  });

  describe("serializePerformanceConfig", () => {
    it("should serialize config to JSON", () => {
      const config = generateMockPerformanceConfig();
      const serialized = serializePerformanceConfig(config);
      expect(typeof serialized).toBe("string");
      expect(serialized).toContain('"enableMonitoring": true');
    });
  });

  describe("deserializePerformanceConfig", () => {
    it("should deserialize valid JSON", () => {
      const config = generateMockPerformanceConfig();
      const serialized = serializePerformanceConfig(config);
      const deserialized = deserializePerformanceConfig(serialized);

      expect(deserialized).not.toBeNull();
      expect(deserialized?.enableMonitoring).toBe(true);
    });

    it("should return null for invalid JSON", () => {
      const invalid = "invalid json";
      const result = deserializePerformanceConfig(invalid);
      expect(result).toBeNull();
    });
  });

  describe("areConfigsEqual", () => {
    it("should return true for equal configs", () => {
      const config1 = generateMockPerformanceConfig();
      const config2 = generateMockPerformanceConfig();
      expect(areConfigsEqual(config1, config2)).toBe(true);
    });

    it("should return false for different configs", () => {
      const config1 = generateMockPerformanceConfig();
      const config2 = { ...config1, samplingRate: 500 };
      expect(areConfigsEqual(config1, config2)).toBe(false);
    });
  });
});
