import { renderHook, act } from "@testing-library/react-hooks";
import { usePerformance, usePerformanceConfig } from "../../../hooks";
import {
  createPerformanceServiceMock,
  createPerformanceConfigServiceMock,
} from "./performanceTestUtils";

jest.mock("../../../services/performanceService", () => ({
  performanceService: createPerformanceServiceMock(),
}));

jest.mock("../../../services/performanceConfigService", () => ({
  performanceConfigService: createPerformanceConfigServiceMock(),
}));

describe("Performance Hooks", () => {
  describe("usePerformance", () => {
    it("should return initial performance state", () => {
      const { result } = renderHook(() => usePerformance());

      expect(result.current.performanceMetrics).toBeNull();
      expect(result.current.performanceStatus).toBe("inactive");
      expect(result.current.isMonitoring).toBe(false);
    });

    it("should start and stop monitoring", () => {
      const { result } = renderHook(() => usePerformance());

      act(() => {
        result.current.startMonitoring();
      });
      expect(result.current.isMonitoring).toBe(true);

      act(() => {
        result.current.stopMonitoring();
      });
      expect(result.current.isMonitoring).toBe(false);
    });

    it("should update performance config", () => {
      const { result } = renderHook(() => usePerformance());

      act(() => {
        result.current.updatePerformanceConfig({ samplingRate: 500 });
      });

      expect(result.current.performanceConfig.samplingRate).toBe(500);
    });
  });

  describe("usePerformanceConfig", () => {
    it("should return initial config", () => {
      const { result } = renderHook(() => usePerformanceConfig());

      expect(result.current.config.enableMonitoring).toBe(true);
      expect(result.current.config.samplingRate).toBe(1000);
    });

    it("should update config", () => {
      const { result } = renderHook(() => usePerformanceConfig());

      act(() => {
        result.current.updateConfig({ enableLogging: true });
      });

      expect(result.current.config.enableLogging).toBe(true);
    });

    it("should reset config to defaults", () => {
      const { result } = renderHook(() => usePerformanceConfig());

      act(() => {
        result.current.updateConfig({ enableLogging: true });
      });

      act(() => {
        result.current.resetConfig();
      });

      expect(result.current.config.enableLogging).toBe(false);
      expect(result.current.config.samplingRate).toBe(1000);
    });
  });
});
