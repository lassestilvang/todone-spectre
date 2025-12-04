import {
  calculatePerformanceScore,
  getPerformanceStatusFromMetrics,
  formatPerformanceMetrics,
  generatePerformanceReport,
  isPerformanceCritical,
  shouldAlertUser,
} from "../../../utils/performanceUtils";
import { generateMockPerformanceMetrics } from "./performanceTestUtils";

describe("Performance Utilities", () => {
  describe("calculatePerformanceScore", () => {
    it("should calculate performance score correctly", () => {
      const metrics = generateMockPerformanceMetrics({
        loadTime: 1000,
        memoryUsage: 200,
        cpuUsage: 30,
        fps: 60,
      });

      const score = calculatePerformanceScore(metrics);
      expect(score).toBeGreaterThan(80);
      expect(score).toBeLessThanOrEqual(100);
    });

    it("should handle poor performance metrics", () => {
      const metrics = generateMockPerformanceMetrics({
        loadTime: 3000,
        memoryUsage: 800,
        cpuUsage: 90,
        fps: 30,
      });

      const score = calculatePerformanceScore(metrics);
      expect(score).toBeLessThan(50);
    });
  });

  describe("getPerformanceStatusFromMetrics", () => {
    it("should return optimal status for good metrics", () => {
      const metrics = generateMockPerformanceMetrics({
        memoryUsage: 200,
        cpuUsage: 30,
      });

      const status = getPerformanceStatusFromMetrics(metrics, {
        memoryThreshold: 500,
        cpuThreshold: 80,
      });

      expect(status).toBe("optimal");
    });

    it("should return critical status for high memory usage", () => {
      const metrics = generateMockPerformanceMetrics({
        memoryUsage: 600,
        cpuUsage: 30,
      });

      const status = getPerformanceStatusFromMetrics(metrics, {
        memoryThreshold: 500,
        cpuThreshold: 80,
      });

      expect(status).toBe("critical");
    });
  });

  describe("formatPerformanceMetrics", () => {
    it("should format metrics correctly", () => {
      const metrics = generateMockPerformanceMetrics();
      const formatted = formatPerformanceMetrics(metrics);

      expect(formatted).toContain("Load:");
      expect(formatted).toContain("Memory:");
      expect(formatted).toContain("CPU:");
      expect(formatted).toContain("FPS:");
    });
  });

  describe("generatePerformanceReport", () => {
    it("should generate a performance report", () => {
      const metrics = generateMockPerformanceMetrics();
      const report = generatePerformanceReport(metrics, "optimal");

      expect(report).toContain("Performance Report");
      expect(report).toContain("Status: optimal");
      expect(report).toContain("Score:");
    });
  });

  describe("isPerformanceCritical", () => {
    it("should return true for critical status", () => {
      expect(isPerformanceCritical("critical")).toBe(true);
      expect(isPerformanceCritical("error")).toBe(true);
    });

    it("should return false for non-critical status", () => {
      expect(isPerformanceCritical("optimal")).toBe(false);
      expect(isPerformanceCritical("warning")).toBe(false);
    });
  });

  describe("shouldAlertUser", () => {
    it("should alert when status changes to critical", () => {
      expect(shouldAlertUser("critical", "optimal")).toBe(true);
      expect(shouldAlertUser("warning", "optimal")).toBe(true);
    });

    it("should not alert when status is the same", () => {
      expect(shouldAlertUser("critical", "critical")).toBe(false);
      expect(shouldAlertUser("warning", "warning")).toBe(false);
    });
  });
});
